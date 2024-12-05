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
import { MoreVertical } from "lucide-react";
import { useEffect, useLayoutEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

export default function ChatLayout() {
  const navigate = useNavigate();

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

  return (
    <div className="flex h-screen mx-auto overflow-hidden">
      <ResizablePanelGroup
        direction="horizontal"
        className="flex h-screen mx-auto overflow-hidden"
      >
        <ResizablePanel className="w-1/3 border-r p-2" defaultSize={30}>
          <div className="flex items-center justify-between p-4 ">
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
              <div onClick={() => console.log(socket)}>
                {(socket && isConnected) ? (
                  <div className="text-green-600">connected</div>
                ) : (
                  <div className="text-red-600">disconnected</div>
                )}
              </div>
              <UserSearch />
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <Separator />
          <Conversations />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel className="flex-1 flex flex-col bg-[url('/whatsapp-bg.png')] bg-repeat">
          <Outlet />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
