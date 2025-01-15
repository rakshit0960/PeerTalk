import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Conversation } from "@/store/slices/chat-slice";
import { useStore } from "@/store/store";
import { Message } from "@/types/message";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ConversationsLoading } from "./loading/ConversationSkeleton";

type ConversationWithLastMessage = Conversation & {
  lastMessage?: Message;
  newMessagesCount: number;
};

export default function Conversations() {
  const { id } = useParams();
  const [conversationsWithMessages, setConversationsWithMessages] = useState<ConversationWithLastMessage[]>([]);
  const { userId, token } = useStore((state) => ({
    userId: state.userId,
    token: state.token
  }));
  const socket = useStore(state => state.socket);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * Fetches all conversations for the current user and their associated last messages.
     * This function performs two operations:
     * 1. Fetches all conversations the user is part of
     * 2. For each conversation, fetches all messages to determine the last message and unread count
     */
    const fetchConversations = async () => {
      setLoading(true);
      try {
        // Fetch all conversations for the current user
        const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/conversations`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch conversations');
        const conversations = await response.json();

        // For each conversation, fetch its messages and extract relevant information
        const withMessages = await Promise.all(
          conversations.map(async (conversation: Conversation) => {
            const messagesResponse = await fetch(
              `${import.meta.env.VITE_API_URL}/chat/${conversation.id}/messages`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            const messages = await messagesResponse.json();
            return {
              ...conversation,
              lastMessage: messages[messages.length - 1], // Get the most recent message
              newMessagesCount: messages.filter(
                (m: Message) => m.senderId !== userId && !m.read // Count unread messages from other users
              ).length,
            };
          })
        );
        setConversationsWithMessages(withMessages);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch conversations if user is authenticated
    if (token) {
      fetchConversations();
    }
  }, [token, userId]);



  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      setConversationsWithMessages(prevConversation => {
        return prevConversation.map(conversation => {
          if (conversation.id === message.conversationId) {
            return {
              ...conversation,
              lastMessage: message,
              newMessagesCount: message.senderId !== userId ? conversation.newMessagesCount + 1 : conversation.newMessagesCount
            };
          }
          return conversation;
        });
      });
    };

    socket.on('get-new-message', handleNewMessage);
    return () => {
      socket.off('get-new-message', handleNewMessage);
    };
  }, [socket, userId]);



  // Mark messages as read when entering a conversation
  useEffect(() => {
    if (!id) return;

    const markMessagesAsRead = async () => {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/chat/${id}/read`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Update local state
        setConversationsWithMessages(prevConversation => {
          return prevConversation.map(conversation => {
            if (conversation.id === parseInt(id)) {
              return {
                ...conversation,
                newMessagesCount: 0
              };
            }
            return conversation;
          });
        });
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    };

    markMessagesAsRead();
  }, [id, token]);

  // Listen for new conversations
  useEffect(() => {
    if (!socket) return;

    const handleNewConversation = (conversation: Conversation) => {
      setConversationsWithMessages(prevConversations => {

        // Check if conversation already exists
        if (prevConversations.some(conversation => conversation.id === conversation.id)) {
          return prevConversations;
        }

        // Add new conversation to the beginning
        return [{
          ...conversation,
          lastMessage: undefined,
          newMessagesCount: 0
        }, ...prevConversations];
      });
    };

    socket.on('conversation-created', handleNewConversation);
    return () => {
      socket.off('conversation-created', handleNewConversation);
    };
  }, [socket]);

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(
      (participant) => participant.id !== userId
    );
  };


  if (loading) {
    return <ConversationsLoading />;
  }

  return (
    <ScrollArea className="h-[calc(100vh-180px)]">
      <div className="space-y-4 p-2">
        {conversationsWithMessages.map((conversation) => {
          const otherParticipant = getOtherParticipant(conversation);
          const isActive = id === conversation.id.toString();

          return (
            <Link to={`/chat/${conversation.id}`} key={conversation.id}>
              <div
                className={`flex items-center gap-3 rounded-lg p-2 transition-colors
                  ${isActive ? 'bg-accent' : 'hover:bg-accent/50'}`}
              >
                <Avatar>
                  <AvatarImage src="" />
                  <AvatarFallback>{otherParticipant?.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium leading-none truncate">
                      {otherParticipant?.name}
                    </p>
                    {conversation.newMessagesCount > 0 && !isActive && (
                      <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {conversation.newMessagesCount}
                      </span>
                    )}
                  </div>
                  {conversation.lastMessage && (
                    <div className="flex justify-between items-baseline mt-1">
                      <p className="text-sm text-muted-foreground truncate max-w-[180px]">
                        {conversation.lastMessage.content}
                      </p>
                      <span className="text-xs text-muted-foreground ml-2">
                        {new Date(conversation.lastMessage.createdAt || '').toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </ScrollArea>
  );
}
