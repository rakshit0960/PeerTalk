import Conversations from "@/components/conversations";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import UserSearch from "@/components/UserSearch";
import { useStore } from "@/store/store";
import { LogOut, Wifi } from "lucide-react";
import { useEffect, useLayoutEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function ChatLayout() {
  const location = useLocation();
  const isChatOpen = location.pathname !== '/chat';
  const navigate = useNavigate();
  const logout = useStore(state => state.logout);

  const { name, userId, isInitialized } = useStore(
    useShallow((state) => ({
      userId: state.userId,
      name: state.name,
      isInitialized: state.isInitialized,
    }))
  );

  const { socket, isConnected, connect, disconnect } = useStore((state) => ({
    socket: state.socket,
    isConnected: state.isConnected,
    connect: state.connect,
    disconnect: state.disconnect,
  }));

  useLayoutEffect(() => {
    if (!isInitialized) navigate("/login");
    else navigate("/chat");
  }, [userId, navigate, isInitialized]);

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
    <div className="flex h-screen mx-auto overflow-hidden">
      <ResizablePanelGroup
        direction="horizontal"
        className="flex h-screen mx-auto overflow-hidden"
      >
        <ResizablePanel
          className={`border-r md:block ${isChatOpen ? 'hidden' : 'w-full'}`}
          defaultSize={30}
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage
                  src="/placeholder.svg?height=40&width=40"
                  alt="User"
                />
                <AvatarFallback>{name.toUpperCase()[0]}</AvatarFallback>
              </Avatar>
              <div className="text-lg">{name}</div>
            </div>

            <div className="flex items-center gap-2">
              <ConnectionIndicator />
              <UserSearch />
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <Separator />
          <Conversations />
        </ResizablePanel>

        <ResizableHandle className="invisible md:visible" withHandle />

        <ResizablePanel
          className={`flex-1 flex flex-col bg-[url('/whatsapp-bg.png')] bg-repeat ${!isChatOpen ? 'hidden md:flex' : 'w-full'
            }`}
        >
          <Outlet />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
