import { useStore } from "@/store/store";
import { AnimatePresence, motion } from "framer-motion";
import {
  Mic,
  MicOff,
  SignalHigh,
  SignalLow,
  Video,
  VideoOff,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

interface VideoCallProps {
  isOpen: boolean;
  onClose: () => void;
  participantName: string;
  otherParticipant: {
    id: number;
    name: string;
  };
}

export function VideoCall({
  isOpen,
  onClose,
  participantName,
  otherParticipant,
}: VideoCallProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<
    "connecting" | "good" | "poor"
  >("connecting");

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const socket = useStore((state) => state.socket);

  const cleanupCall = useCallback(() => {
    // Stop all tracks in local stream
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      setLocalStream(null);
    }

    // Stop all tracks in remote stream
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      setRemoteStream(null);
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // Reset states
    setIsConnecting(true);
    setConnectionQuality("connecting");
    setIsMuted(false);
    setIsVideoOff(false);
  }, []);

  const handleClose = useCallback(() => {
    cleanupCall();
    socket?.emit("video-call-ended", {
      targetUserId: otherParticipant.id,
      conversationId: otherParticipant.id,
    });
    onClose();
  }, [cleanupCall, onClose, otherParticipant.id, socket]);

  useEffect(() => {
    const initializeMedia = async () => {
      try {

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Initialize WebRTC peer connection
        const configuration = {
          // turn servers form https://www.metered.ca/tools/openrelay/
          iceServers: [
            {
              urls: "stun:stun.relay.metered.ca:80",
            },
            {
              urls: "turn:global.relay.metered.ca:80",
              username: "03be128269d49a3569f1bf19",
              credential: "X5pk3rtP/Uj2F+rC",
            },
            {
              urls: "turn:global.relay.metered.ca:80?transport=tcp",
              username: "03be128269d49a3569f1bf19",
              credential: "X5pk3rtP/Uj2F+rC",
            },
            {
              urls: "turn:global.relay.metered.ca:443",
              username: "03be128269d49a3569f1bf19",
              credential: "X5pk3rtP/Uj2F+rC",
            },
            {
              urls: "turns:global.relay.metered.ca:443?transport=tcp",
              username: "03be128269d49a3569f1bf19",
              credential: "X5pk3rtP/Uj2F+rC",
            },
          ],
}

        const peerConnection = new RTCPeerConnection(configuration);
        peerConnectionRef.current = peerConnection;

        // Monitor connection quality
        peerConnection.onconnectionstatechange = () => {
          switch (peerConnection.connectionState) {
            case "connected":
              setConnectionQuality("good");
              break;
            case "disconnected":
            case "failed":
              setConnectionQuality("poor");
              break;
            default:
              setConnectionQuality("connecting");
          }
        };

        // Add local stream tracks to peer connection
        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });

        // Handle incoming remote stream
        peerConnection.ontrack = (event) => {
          setRemoteStream(event.streams[0]);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
          setIsConnecting(false);
        };

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            socket?.emit("ice-candidate", {
              candidate: event.candidate,
              targetUserId: otherParticipant.id,
            });
          }
        };

        // Create and send offer if initiator
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket?.emit("video-offer", {
          offer,
          targetUserId: otherParticipant.id,
        });
      } catch (error) {
        console.error("Error accessing media devices:", error);
        handleClose();
      }
    };

    if (isOpen) {
      initializeMedia();
    }

    return () => {
      cleanupCall();
    };
  }, [isOpen, otherParticipant.id, socket, cleanupCall, handleClose]);

  useEffect(() => {
    if (!socket) return;

    // Handle incoming video offer
    const handleVideoOffer = async ({
      offer,
      fromUserId,
    }: {
      offer: RTCSessionDescriptionInit;
      fromUserId: number;
    }) => {

      try {
        await peerConnectionRef.current?.setRemoteDescription(
          new RTCSessionDescription(offer)
        );
        const answer = await peerConnectionRef.current?.createAnswer();
        await peerConnectionRef.current?.setLocalDescription(answer);

        socket.emit("video-answer", {
          answer,
          targetUserId: fromUserId,
        });
      } catch (error) {
        console.error("Error handling video offer:", error);
      }
    };

    // Handle incoming video answer
    const handleVideoAnswer = async ({
      answer,
    }: {
      answer: RTCSessionDescriptionInit;
    }) => {
      try {
        if (peerConnectionRef.current?.signalingState === "stable") {
          console.warn("Connection already stable, skipping setRemoteDescription");
          return;
        }
        await peerConnectionRef.current?.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      } catch (error) {
        console.error("Error handling video answer:", error);
      }
    };

    // Handle incoming ICE candidates
    const handleIceCandidate = async ({
      candidate,
    }: {
      candidate: RTCIceCandidateInit;
    }) => {
      try {
        await peerConnectionRef.current?.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (error) {
        console.error("Error handling ICE candidate:", error);
      }
    };

    // Add handler for video call end
    const handleVideoCallEnded = () => {
      cleanupCall();
      onClose();
    };

    // Add handler for video call accepted
    const handleVideoCallAccepted = () => { };

    socket.on("video-offer", handleVideoOffer);
    socket.on("video-answer", handleVideoAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("video-call-ended", handleVideoCallEnded);
    socket.on("video-call-accepted", handleVideoCallAccepted);
    socket.on("disconnect", handleVideoCallEnded);

    return () => {
      socket.off("video-offer", handleVideoOffer);
      socket.off("video-answer", handleVideoAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("video-call-ended", handleVideoCallEnded);
      socket.off("video-call-accepted", handleVideoCallAccepted);
      socket.off("disconnect", handleVideoCallEnded);
      cleanupCall();
    };
  }, [socket, cleanupCall, onClose]);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-50">
      <Card className="absolute inset-4 lg:inset-8 shadow-2xl bg-gradient-to-b from-background/50 to-background/80 backdrop-blur-sm border-muted/20 border-2">
        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 bg-gradient-to-b from-background/80 to-background/20 backdrop-blur-sm border-b border-border/50">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  Call with {participantName}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  {connectionQuality === "connecting" && (
                    <div className="flex items-center gap-1.5 text-yellow-500/90">
                      <SignalLow className="h-3.5 w-3.5 animate-pulse" />
                      <span className="text-xs font-medium">Connecting...</span>
                    </div>
                  )}
                  {connectionQuality === "good" && (
                    <div className="flex items-center gap-1.5 text-emerald-500/90">
                      <SignalHigh className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">Connected</span>
                    </div>
                  )}
                  {connectionQuality === "poor" && (
                    <div className="flex items-center gap-1.5 text-red-500/90">
                      <SignalLow className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">
                        Poor Connection
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="rounded-full hover:bg-red-500/10 hover:text-red-500"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Video container */}
          <div
            ref={containerRef}
            className="relative flex-1 bg-black/95 overflow-hidden"
          >
            {/* Remote video */}
            <div className="absolute inset-0 flex items-center justify-center">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-contain transition-all duration-300
                           ${isVideoOff
                    ? "opacity-0 scale-95"
                    : "opacity-100 scale-100"
                  }`}
              />

              {/* Video off overlay */}
              {isVideoOff && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/90"
                >
                  <div className="text-center">
                    <VideoOff className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground/70">
                      Video turned off
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Local video (draggable picture-in-picture) */}
            <AnimatePresence>
              <motion.div
                drag
                dragConstraints={containerRef}
                dragElastic={0.1}
                dragMomentum={false}
                dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
                whileDrag={{ scale: 1.05, zIndex: 50 }}
                whileHover={{ scale: 1.02 }}
                initial={{
                  scale: 0.8,
                  opacity: 0,
                  right: 24,
                  bottom: 24,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  transition: { type: "spring", stiffness: 300, damping: 25 },
                }}
                exit={{ scale: 0, opacity: 0 }}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                className={`absolute w-[160px] aspect-video rounded-xl overflow-hidden shadow-2xl cursor-move
                           bg-black ring-1 ring-white/10
                           hover:ring-2 hover:ring-primary/50
                           sm:w-[180px] md:w-[220px] lg:w-[260px]
                           ${isDragging ? "shadow-xl ring-primary/50" : ""}`}
              >
                <motion.div className="relative w-full h-full">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-white/90 font-medium">
                    You
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Connecting overlay */}
            {isConnecting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm"
              >
                <div className="text-center">
                  <div className="relative w-12 h-12 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-dashed animate-spin-slow" />
                    <div className="absolute inset-2 rounded-full border-2 border-t-primary border-primary/20 animate-spin" />
                  </div>
                  <p className="text-sm text-muted-foreground/70">
                    Connecting to {participantName}...
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Controls */}
          <div className="relative mt-auto border-t border-border/50">
            <div className="absolute inset-x-0 -top-20 h-20  from-background to-transparent pointer-events-none" />
            <div className="p-4 md:p-6 from-background/90 to-background/50 backdrop-blur-sm">
              <div className="mx-auto flex items-center justify-center gap-4 md:gap-6">
                <Button
                  variant={isMuted ? "destructive" : "outline"}
                  size="icon"
                  onClick={toggleMute}
                  className="h-12 w-12 md:h-14 md:w-14 rounded-full shadow-lg hover:shadow-xl
                           transition-all duration-300 hover:scale-105 active:scale-95
                           bg-background/50 backdrop-blur-sm"
                >
                  {isMuted ? (
                    <MicOff className="h-5 w-5 md:h-6 md:w-6" />
                  ) : (
                    <Mic className="h-5 w-5 md:h-6 md:w-6" />
                  )}
                </Button>

                <Button
                  variant="destructive"
                  onClick={handleClose}
                  className="px-8 h-12 md:h-14 md:px-10 rounded-full font-medium shadow-lg
                           hover:shadow-xl transition-all duration-300 hover:scale-105
                           active:scale-95 bg-red-500/90 hover:bg-red-500"
                >
                  End Call
                </Button>

                <Button
                  variant={isVideoOff ? "destructive" : "outline"}
                  size="icon"
                  onClick={toggleVideo}
                  className="h-12 w-12 md:h-14 md:w-14 rounded-full shadow-lg hover:shadow-xl
                           transition-all duration-300 hover:scale-105 active:scale-95
                           bg-background/50 backdrop-blur-sm"
                >
                  {isVideoOff ? (
                    <VideoOff className="h-5 w-5 md:h-6 md:w-6" />
                  ) : (
                    <Video className="h-5 w-5 md:h-6 md:w-6" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
