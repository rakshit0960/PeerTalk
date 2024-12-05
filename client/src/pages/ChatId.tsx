import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToastAction } from "@/components/ui/toast";
import { toast } from "@/hooks/use-toast";
import { useStore } from "@/store/store";
import { Message, messageSchema } from "@/types/message";
import { z } from "zod";
import {
  Mic,
  MoreVertical,
  Paperclip,
  Search,
  Send,
  Smile,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

const conversationSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  isGroup: z.boolean(),
  participants: z.array(z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
  })),
});

type ConversationResponse = z.infer<typeof conversationSchema>;

export default function ChatId() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [otherParticipant, setOtherParticipant] = useState<{
    id: number;
    name: string;
    email: string;
  } | null>(null);

  const socket = useStore(store => store.socket);
  const userId = useStore(store => store.userId);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversation details and set other participant
  useEffect(() => {
    const fetchConversationDetails = async () => {
      if (!id) return;

      try {
        const response = await fetch(`http://localhost:3000/chat/conversations`, {
          headers: {
            Authorization: `Bearer ${useStore.getState().token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch conversation');

        const data = await response.json();
        const conversations = z.array(conversationSchema).parse(data);

        const currentConversation = conversations.find(
          (conv: ConversationResponse) => conv.id === parseInt(id)
        );

        if (currentConversation) {
          const other = currentConversation.participants.find(
            (p) => p.id !== userId
          );
          if (other) {
            setOtherParticipant(other);
          }
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
  }, [id, userId]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:3000/chat/${id}/messages`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${useStore.getState().token}`,
          },
        });
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    if (id) {
      fetchMessages();
      socket?.emit('join-conversation', { id });
    }
  }, [id, socket]);

  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      console.log('get-new-message', message);
      if (!id) return;

      if (message.conversationId !== parseInt(id)) {
        // Show notification for messages in other conversations
        const conversation = useStore.getState().conversations.find(
          c => c.id === message.conversationId
        );
        const sender = message.sender || conversation?.participants.find(
          p => p.id === message.senderId
        );

        toast({
          title: sender?.name || "New message",
          description: message.content,
          action: (
            <ToastAction altText="Go to conversation" onClick={() => navigate(`/chat/${message.conversationId}`)}>
              View
            </ToastAction>
          ),
        });

        useStore.getState().incrementUnread(message.conversationId);
      } else {
        setMessages(prev => {
          const messageExists = prev.some(m => m.id === message.id);
          if (messageExists) return prev;
          const newMessages = [...prev, message];
          setTimeout(scrollToBottom, 100);
          return newMessages;
        });
      }
    };

    if (socket) {
      socket.on('get-new-message', handleNewMessage);

      return () => {
        socket.off('get-new-message', handleNewMessage);
      };
    }
  }, [socket, id, navigate]);

  // Clear unread messages when entering a conversation
  useEffect(() => {
    if (id) {
      useStore.getState().clearUnread(parseInt(id));
    }
  }, [id]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || !id) return;

    try {
      const response = await fetch(`http://localhost:3000/chat/${id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${useStore.getState().token}`,
        },
        body: JSON.stringify({ content: inputMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      const parsedData = messageSchema.parse(data);

      // Update local messages immediately
      setMessages(prev => [...prev, parsedData]);

      // Emit to socket
      socket?.emit('new-message', parsedData);
      setInputMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message",
      });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 ">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="" alt={otherParticipant?.name} />
            <AvatarFallback>
              {otherParticipant?.name?.[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-medium">{otherParticipant?.name || 'Loading...'}</h2>
            <p className="text-xs text-gray-500">
              {otherParticipant?.email || 'Loading...'}
            </p>
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
            key={`${message.id}-${message.createdAt}`}
            className={`flex ${
              message.senderId === useStore.getState().userId ? "justify-end" : "justify-start"
            } mb-4`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                message.senderId === useStore.getState().userId
                  ? "bg-blue-950 ml-auto"
                  : "bg-gray-900"
              }`}
            >
              <p>{message.content}</p>
              <span className="text-xs text-gray-500 mt-1 block">
                {new Date(message.createdAt || '').toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </ScrollArea>
      <div className="p-4 ">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // handleSendMessage();
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
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />
          {inputMessage ? (
            <Button
              type="submit"
              size="icon"
              className="rounded-full"
              onClick={sendMessage}
            >
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
  );
}
