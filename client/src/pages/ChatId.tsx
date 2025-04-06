import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageInput } from "@/components/chat/MessageInput";
import { MessageList } from "@/components/chat/MessageList";
import { SendingIndicator } from "@/components/chat/SendingIndicator";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { VideoCall } from "@/components/chat/VideoCall";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToastAction } from "@/components/ui/toast";
import { toast } from "@/hooks/use-toast";
import { useStore } from "@/store/store";
import { Message, messageSchema } from "@/types/message";
import debounce from "lodash/debounce";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { z } from "zod";

const conversationSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  isGroup: z.boolean(),
  participants: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      email: z.string(),
      profilePicture: z.string().nullable(),
    })
  ),
});

type ConversationResponse = z.infer<typeof conversationSchema>;

export default function ChatId() {
  const { id } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [otherParticipant, setOtherParticipant] = useState<{
    id: number;
    name: string;
    email: string;
    profilePicture: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<Map<number, string>>(
    new Map()
  );
  const [isSending, setIsSending] = useState(false);
  const [isInVideoCall, setIsInVideoCall] = useState(false);

  const socket = useStore((store) => store.socket);
  const userId = useStore((store) => store.userId);
  const token = useStore((store) => store.token);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversation details and set other participant
  useEffect(() => {
    const fetchConversationDetails = async () => {
      if (!id) return;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/chat/conversations`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch conversation");

        const data = await response.json();
        const conversations = z.array(conversationSchema).parse(data);

        const currentConversation = conversations.find(
          (conversation: ConversationResponse) => conversation.id === parseInt(id)
        );

        if (!currentConversation) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Conversation not found",
          });
          return;
        }

        const other = currentConversation.participants.find(
          (p) => p.id !== userId
        );

        if (other) {
          setOtherParticipant(other);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to find conversation participant",
          });
        }
      } catch (error) {
        console.error("Error fetching conversation details:", error);
        if (error instanceof z.ZodError) {
          console.error("Validation error:", error.errors);
        }
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load conversation details",
        });
      }
    };

    fetchConversationDetails();
  }, [id, userId, token]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/chat/${id}/messages`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMessages();
      socket?.emit("join-conversation", { id });
    }
  }, [id, socket, token]);

  // Mark all messages in the conversation as read
  const markConversationAsRead = useCallback(() => {
    if (!id || !socket) return;

    // Emit socket event to mark entire conversation as read
    socket.emit("conversation-read", {
      conversationId: parseInt(id),
    });

    // Update local state to show messages as read
    setMessages(prevMessages =>
      prevMessages.map(message =>
        message.senderId !== userId && !message.read
          ? { ...message, read: true }
          : message
      )
    );

    // Update unread count in store
    useStore.getState().clearUnread(parseInt(id));
  }, [id, socket, userId]);

  // Mark messages as read when viewing a conversation
  useEffect(() => {
    if (messages.length && id && !loading) {
      markConversationAsRead();
    }

    // Also mark messages as read when window gets focus
    const handleFocus = () => markConversationAsRead();
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [messages.length, id, loading, markConversationAsRead]);

  // Listen for read receipts
  useEffect(() => {
    if (!socket) return;

    const handleReadReceipt = ({
      conversationId,
      messageIds,
    }: {
      conversationId: number;
      messageIds: number[];
    }) => {
      if (id && parseInt(id) === conversationId) {
        setMessages(prevMessages =>
          prevMessages.map(message =>
            messageIds.includes(message.id)
              ? { ...message, read: true }
              : message
          )
        );
      }
    };

    socket.on("messages-read-receipt", handleReadReceipt);

    return () => {
      socket.off("messages-read-receipt", handleReadReceipt);
    };
  }, [socket, id]);

  // Listen for new messages
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      if (!id) return;

      // Only handle messages for the current conversation
      if (message.conversationId !== parseInt(id)) return;

      setMessages((prev) => {
        const messageExists = prev.some((m) => m.id === message.id);
        if (messageExists) return prev;
        const newMessages = [...prev, message];
        setTimeout(scrollToBottom, 100);

        // If the message is from the other user, mark the conversation as read
        if (message.senderId !== userId) {
          markConversationAsRead();
        }

        return newMessages;
      });
    };

    if (socket) {
      socket.on("get-new-message", handleNewMessage);
      return () => {
        socket.off("get-new-message", handleNewMessage);
      };
    }
  }, [socket, id, userId, markConversationAsRead]);

  // Clear unread messages when entering a conversation
  useEffect(() => {
    if (id) {
      useStore.getState().clearUnread(parseInt(id));
    }
  }, [id]);

  const sendImageMessage = async (image: File) => {
    if (!id) return;
    setIsSending(true);

    try {
      const formData = new FormData();
      formData.append('image', image);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/chat/${id}/messages/image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send image");
      }

      const data = await response.json();
      const parsedData = messageSchema.parse(data);

      setMessages((prev) => [...prev, parsedData]);
      socket?.emit("new-message", parsedData);

    } catch (error) {
      console.error("Error sending image:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send image"
      });
    } finally {
      setIsSending(false);
    }
  };

  const sendMessage = async (image?: File) => {
    if (image) {
      return sendImageMessage(image);
    }

    if (!inputMessage.trim() || !id) return;

    const messageContent = inputMessage;
    setInputMessage("");
    setIsSending(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/chat/${id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: messageContent }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      const parsedData = messageSchema.parse(data);

      setMessages((prev) => [...prev, parsedData]);

      socket?.emit("new-message", parsedData);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message",
      });
      setInputMessage(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  // Listen for typing events
  useEffect(() => {
    if (!socket) return;

    const handleUserTyping = ({
      conversationId,
      userId,
      userName,
    }: {
      conversationId: number;
      userId: number;
      userName: string;
    }) => {
      if (id && userId !== useStore.getState().userId && conversationId === parseInt(id)) {
        setTypingUsers((prev) => new Map(prev).set(userId, userName));
      }
    };

    const handleUserStopTyping = ({ userId, conversationId }: { userId: number, conversationId: number }) => {
      if (id && userId !== useStore.getState().userId && conversationId === parseInt(id)) {
        setTypingUsers((prev) => {
          const newMap = new Map(prev);
          newMap.delete(userId);
          return newMap;
        });
      }
    };

    socket.on("user-typing", handleUserTyping);
    socket.on("user-stop-typing", handleUserStopTyping);

    return () => {
      socket.off("user-typing", handleUserTyping);
      socket.off("user-stop-typing", handleUserStopTyping);
    };
  }, [id, socket]);

  const emitTyping = useMemo(
    () =>
      debounce((isTyping: boolean) => {
        if (!socket || !id) return;

        const eventName = isTyping ? "typing-start" : "typing-stop";
        socket.emit(eventName, {
          conversationId: parseInt(id),
          userId,
          userName: useStore.getState().name,
        });
      }, 300),
    [socket, id, userId]
  );

  const handleVideoCall = useCallback(() => {
    if (!socket || !otherParticipant) return;

    setIsInVideoCall(true);
    // Emit video call request
    socket.emit("video-call-request", {
      targetUserId: otherParticipant.id,
      conversationId: parseInt(id || "0"),
    });

    toast({
      title: "Video Call",
      description: `Initiating video call with ${otherParticipant.name}...`,
    });
  }, [socket, otherParticipant, id]);

  const handleEndCall = useCallback(() => {
    setIsInVideoCall(false);
    if (socket && otherParticipant) {
      socket.emit("video-call-ended", {
        targetUserId: otherParticipant.id,
        conversationId: parseInt(id || "0"),
      });
    }
  }, [socket, otherParticipant, id]);

  // Listen for video call requests
  useEffect(() => {
    if (!socket) return;

    const handleVideoCallRequest = ({ fromUserId, fromUserName }: { fromUserId: number, fromUserName: string }) => {
      toast({
        title: "Incoming Video Call",
        description: `${fromUserName} is calling...`,
        action: (
          <ToastAction altText="Accept call" onClick={() => {
            setIsInVideoCall(true);
            // Handle accepting video call
            socket.emit("video-call-accepted", {
              targetUserId: fromUserId,
              conversationId: parseInt(id || "0"),
            });
          }}>
            Accept
          </ToastAction>
        ),
      });
    };

    const handleVideoCallEnded = () => {
      setIsInVideoCall(false);
      toast({
        title: "Call Ended",
        description: "The video call has ended",
      });
    };

    socket.on("video-call-request", handleVideoCallRequest);
    socket.on("video-call-ended", handleVideoCallEnded);

    return () => {
      socket.off("video-call-request", handleVideoCallRequest);
      socket.off("video-call-ended", handleVideoCallEnded);
    };
  }, [socket, id]);

  return (
    <>
      <ChatHeader
        participant={otherParticipant}
        loading={loading}
        onVideoCall={handleVideoCall}
      />
      <ScrollArea className="flex-1 p-4">
        <div className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 to-background/30 pointer-events-none" />
          <MessageList
            ref={messagesEndRef}
            messages={messages}
            loading={loading}
          />
        </div>
      </ScrollArea>
      <div className="relative border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <TypingIndicator
          typingUsers={Array.from(typingUsers.values())}
          isGroup={false}
        />
        <SendingIndicator isSending={isSending} />
        <MessageInput
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          sendMessage={sendMessage}
          onTyping={(isTyping) => emitTyping(isTyping)}
        />
      </div>
      {otherParticipant && otherParticipant.id && otherParticipant.name && isInVideoCall && (
        <VideoCall
          isOpen={isInVideoCall}
          onClose={handleEndCall}
          participantName={otherParticipant.name}
          otherParticipant={{
            id: otherParticipant.id,
            name: otherParticipant.name
          }}
        />
      )}
    </>
  );
}
