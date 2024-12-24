import { toast } from "@/hooks/use-toast";
import { useStore } from "@/store/store";
import { Message, messageSchema } from "@/types/message";
import { z } from "zod";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { ToastAction } from "@/components/ui/toast";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { useCallback, useMemo } from "react";
import debounce from "lodash/debounce";
import { SendingIndicator } from "@/components/chat/SendingIndicator";

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
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<Map<number, string>>(new Map());
  const [isSending, setIsSending] = useState(false);

  const socket = useStore(store => store.socket);
  const userId = useStore(store => store.userId);
  const token = useStore(store => store.token);
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
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch conversation');

        const data = await response.json();
        const conversations = z.array(conversationSchema).parse(data);

        const currentConversation = conversations.find(
          (conv: ConversationResponse) => conv.id === parseInt(id)
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

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3000/chat/${id}/messages`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
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
      socket?.emit('join-conversation', { id });
    }
  }, [id, socket, token]);

  const markMessagesAsRead = useCallback(async () => {
    if (!id || !token) return;

    try {
      await fetch(`http://localhost:3000/chat/${id}/read`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Update local unread count
      useStore.getState().clearUnread(parseInt(id));
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }, [id, token]);

  // Listen for new messages
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
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
          markMessagesAsRead();
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
  }, [socket, id, navigate, markMessagesAsRead]);

  // Clear unread messages when entering a conversation
  useEffect(() => {
    if (id) {
      useStore.getState().clearUnread(parseInt(id));
    }
  }, [id]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || !id) return;

    const messageContent = inputMessage;
    setInputMessage("");
    setIsSending(true);

    try {
      const response = await fetch(`http://localhost:3000/chat/${id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: messageContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      const parsedData = messageSchema.parse(data);

      setMessages(prev => [...prev, parsedData]);

      socket?.emit('new-message', parsedData);
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

  useEffect(() => {
    if (!socket) return;

    const handleUserTyping = ({ userId, userName }: { userId: number; userName: string }) => {
      if (userId !== useStore.getState().userId) {
        setTypingUsers(prev => new Map(prev).set(userId, userName));
      }
    };

    const handleUserStopTyping = ({ userId }: { userId: number }) => {
      if (userId !== useStore.getState().userId) {
        setTypingUsers(prev => {
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
  }, [socket]);

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

  return (
    <>
      <ChatHeader participant={otherParticipant} loading={loading} />
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 to-background/30 pointer-events-none" />
        <MessageList
          ref={messagesEndRef}
          messages={messages}
          loading={loading}
        />
      </div>
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
    </>
  );
}
