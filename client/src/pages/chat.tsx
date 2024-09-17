import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStore } from "@/store/store";
import {
  Mic,
  MoreVertical,
  Paperclip,
  Search,
  Send,
  Smile,
} from "lucide-react";
import { useEffect, useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

type Chat = {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
};

type Message = {
  id: number;
  senderId: number;
  text: string;
  timestamp: string;
};

export default function Chat() {
  const navigate = useNavigate();

  const { name, userId, isInitialized } = useStore(
    useShallow((state) => ({
      userId: state.userId,
      name: state.name,
      isInitialized: state.isInitialized,
    }))
  );

  const { socket, isConnected, connect } = useStore((state) => ({
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
  }, []);

  const [chats, setChats] = useState<Chat[]>([
    {
      id: 1,
      name: "Alice",
      avatar: "/placeholder.svg?height=32&width=32",
      lastMessage: "Hey there!",
      time: "10:30 AM",
      unreadCount: 2,
    },
    {
      id: 2,
      name: "Bob",
      avatar: "/placeholder.svg?height=32&width=32",
      lastMessage: "How's it going?",
      time: "Yesterday",
    },
    {
      id: 3,
      name: "Charlie",
      avatar: "/placeholder.svg?height=32&width=32",
      lastMessage: "See you later!",
      time: "Tuesday",
    },
    {
      id: 4,
      name: "David",
      avatar: "/placeholder.svg?height=32&width=32",
      lastMessage: "Thanks for the help!",
      time: "Monday",
    },
    {
      id: 5,
      name: "Eva",
      avatar: "/placeholder.svg?height=32&width=32",
      lastMessage: "Let's meet tomorrow",
      time: "Last week",
    },
  ]);

  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, senderId: 1, text: "Hey there!", timestamp: "11:50 PM" },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = () => {
    if (inputMessage.trim() && selectedChat) {
      const newMessage: Message = {
        id: messages.length + 1,
        senderId: 0,
        text: inputMessage,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages([...messages, newMessage]);
      setInputMessage("");

      setChats(
        chats.map((chat) =>
          chat.id === selectedChat.id
            ? { ...chat, lastMessage: inputMessage, time: "Just now" }
            : chat
        )
      );
    }
  };

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

            <div onClick={() => console.log(socket)}>
              {isConnected ? (
                <div className="text-green-600">connected</div>
              ) : (
                <div className="text-red-600">disconnected</div>
              )}
            </div>

            <div className="flex space-x-2">
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              <Input className="pl-9" placeholder="Search or start new chat" />
            </div>
          </div>
          <ScrollArea className="h-[calc(600px-120px)">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-900 ${
                  selectedChat?.id === chat.id ? "" : ""
                }`}
                onClick={() => setSelectedChat(chat)}
              >
                <Avatar>
                  <AvatarImage src={chat.avatar} alt={chat.name} />
                  <AvatarFallback>{chat.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-medium">{chat.name}</h3>
                    <span className="text-xs text-gray-500">{chat.time}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {chat.lastMessage}
                  </p>
                </div>
                {chat.unreadCount && (
                  <div className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            ))}
          </ScrollArea>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel className="flex-1 flex flex-col bg-[url('/whatsapp-bg.png')] bg-repeat">
          {selectedChat ? (
            <>
              <div className="flex items-center justify-between p-4 ">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={selectedChat.avatar}
                      alt={selectedChat.name}
                    />
                    <AvatarFallback>{selectedChat.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-medium">{selectedChat.name}</h2>
                    <p className="text-xs text-gray-500">online</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon">
                    <Search className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <ScrollArea className="flex-1 p-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderId === 0 ? "justify-end" : "justify-start"
                    } mb-4`}
                  >
                    <div
                      className={`max-w-[70%] p-3 ${
                        message.senderId === 0 ? "bg-blue-950" : "bg-gray-900"
                      }`}
                    >
                      <p>{message.text}</p>
                      <span className="text-xs text-gray-500 mt-1 block">
                        {message.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </ScrollArea>
              <div className="p-4 ">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <Button variant="ghost" size="icon">
                    <Smile className="h-6 w-6" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Paperclip className="h-6 w-6" />
                  </Button>
                  <Input
                    className="flex-1"
                    type="text"
                    placeholder="Type a message"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                  />
                  {inputMessage ? (
                    <Button type="submit" size="icon" className="rounded-full">
                      <Send className="h-6 w-6" />
                      <span className="sr-only">Send</span>
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon">
                      <Mic className="h-6 w-6" />
                    </Button>
                  )}
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Select a chat to start messaging</p>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
