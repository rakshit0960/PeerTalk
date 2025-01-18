import Conversations from "@/components/conversations";
import { Tutorial } from "@/components/Tutorial";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/UserAvatar";
import UserSearch from "@/components/UserSearch";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/store";
import { motion } from "framer-motion";
import { LogOut, Settings, Wifi } from "lucide-react";
import { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

export default function ChatLayout() {
  const location = useLocation();
  const isChatOpen = location.pathname !== '/chat';
  const navigate = useNavigate();
  const logout = useStore(state => state.logout);

  const { name, tutorialComplete, profilePicture } = useStore(
    useShallow((state) => ({
      name: state.name,
      tutorialComplete: state.tutorialComplete,
      profilePicture: state.profilePicture
    }))
  );

  const { socket, isConnected, connect, disconnect } = useStore((state) => ({
    socket: state.socket,
    isConnected: state.isConnected,
    connect: state.connect,
    disconnect: state.disconnect,
  }));

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const ConnectionIndicator = () => (
    <motion.div
      initial={{ opacity: 0.7 }}
      animate={{ opacity: 1 }}
      transition={{
        repeat: Infinity,
        repeatType: "reverse",
        duration: 2,
        ease: "easeInOut",
      }}
      className="flex items-center"
    >
      <Wifi
        className={cn(
          "w-4 h-4 transition-colors duration-300",
          socket && isConnected
            ? "text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]"
            : "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
        )}
      />
    </motion.div>
  );

  return (
    <div className="flex h-screen mx-auto overflow-hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <ResizablePanelGroup
        direction="horizontal"
        className="flex h-screen mx-auto overflow-hidden rounded-lg border shadow-2xl"
      >
        <ResizablePanel
          className={`border-r md:block ${isChatOpen ? 'hidden' : 'w-full'}`}
          defaultSize={30}
        >
          <div className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <UserAvatar
                className="h-10 w-10 border-2 border-primary/20"
                fallbackClassName="bg-primary/10"
                profilePicture={profilePicture}
              />
              <div>
                <div className="text-lg font-medium">{name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <ConnectionIndicator />
                  {socket && isConnected ? "Connected" : "Disconnected"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <UserSearch />
              <Link to="/settings">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/10 hover:text-primary"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <Separator />
          <Conversations />
        </ResizablePanel>

        <ResizableHandle className="invisible md:visible bg-border/50 hover:bg-border" withHandle />

        <ResizablePanel
          className={`flex-1 flex flex-col bg-[url('/whatsapp-bg.png')] bg-repeat bg-opacity-5 ${!isChatOpen ? 'hidden md:flex' : 'w-full'
            }`}
        >
          <Outlet />
        </ResizablePanel>
      </ResizablePanelGroup>
      {!tutorialComplete && <Tutorial />}
    </div>
  );
}
