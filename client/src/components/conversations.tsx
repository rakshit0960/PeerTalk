import { ScrollArea } from "@/components/ui/scroll-area";
import { Conversation } from "@/store/slices/chat-slice";
import { useStore } from "@/store/store";
import { Message } from "@/types/message";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ConversationsLoading } from "./loading/ConversationSkeleton";
import { UserAvatar } from "./UserAvatar";
import { MessageCircle } from "lucide-react";

type ConversationWithLastMessage = Conversation & {
  lastMessage?: Message;
  newMessagesCount: number;
};

export default function Conversations() {
  const { id } = useParams();
  const [conversationsWithMessages, setConversationsWithMessages] = useState<ConversationWithLastMessage[]>([]);
  const { userId, token, socket } = useStore((state) => ({
    userId: state.userId,
    token: state.token,
    socket: state.socket
  }));
  const [loading, setLoading] = useState(true);

  // Fetch conversations and their messages
  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const conversations = await response.json();

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
            lastMessage: messages[messages.length - 1],
            newMessagesCount: messages.filter(
              (m: Message) => m.senderId !== userId && !m.read
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

  // Initial fetch
  useEffect(() => {
    if (token) {
      fetchConversations();
    }
  }, [token, userId]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      setConversationsWithMessages(prevConversations => {
        // Find the conversation that received the message
        const conversationIndex = prevConversations.findIndex(
          conv => conv.id === message.conversationId
        );

        if (conversationIndex === -1) return prevConversations;

        // Create a new array with the updated conversation at the beginning
        const updatedConversations = [...prevConversations];
        const conversation = updatedConversations[conversationIndex];

        // Remove the conversation from its current position
        updatedConversations.splice(conversationIndex, 1);

        // Add the updated conversation at the beginning
        updatedConversations.unshift({
          ...conversation,
          lastMessage: message,
          newMessagesCount: message.senderId !== userId
            ? conversation.newMessagesCount + 1
            : conversation.newMessagesCount
        });

        return updatedConversations;
      });
    };

    const handleNewConversation = (conversation: Conversation) => {
      setConversationsWithMessages(prevConversations => {
        // Check if conversation already exists
        if (prevConversations.some(conv => conv.id === conversation.id)) {
          return prevConversations;
        }

        // Add new conversation at the beginning
        return [{
          ...conversation,
          lastMessage: undefined,
          newMessagesCount: 0
        }, ...prevConversations];
      });
    };

    // Register event listeners
    socket.on('get-new-message', handleNewMessage);
    socket.on('conversation-created', handleNewConversation);

    // Cleanup
    return () => {
      socket.off('get-new-message', handleNewMessage);
      socket.off('conversation-created', handleNewConversation);
    };
  }, [socket, userId]); // Only depend on socket and userId

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

        setConversationsWithMessages(prevConversations => {
          return prevConversations.map(conversation => {
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
      <div className="space-y-2 p-3">
        {conversationsWithMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs mt-1">Start chatting with someone!</p>
          </div>
        ) : (
          conversationsWithMessages.map((conversation) => {
            const otherParticipant = getOtherParticipant(conversation);
            const isActive = id === conversation.id.toString();

            return (
              <Link to={`/chat/${conversation.id}`} key={conversation.id}>
                <div
                  className={`flex items-center gap-4 rounded-xl p-3 transition-all duration-200
                    ${isActive ? 'bg-accent shadow-sm' : 'hover:bg-accent/50'}`}
                >
                  <UserAvatar
                    className="h-12 w-12 border-2 border-primary/10 transition-transform duration-200 hover:scale-105"
                    fallbackClassName="text-base font-medium"
                    fallback={otherParticipant?.name[0]}
                    profilePicture={otherParticipant?.profilePicture}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-medium leading-none truncate">
                        {otherParticipant?.name}
                      </p>
                      {conversation.newMessagesCount > 0 && !isActive && (
                        <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs font-medium animate-pulse">
                          {conversation.newMessagesCount}
                        </span>
                      )}
                    </div>
                    {conversation.lastMessage && (
                      <div className="flex justify-between items-baseline mt-1.5">
                        <p className="text-sm text-muted-foreground/80 truncate max-w-[200px]">
                          {conversation.lastMessage.content || (conversation.lastMessage.image ? "Sent an image" : "")}
                        </p>
                        <span className="text-[11px] text-muted-foreground/60 ml-2 tabular-nums">
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
          })
        )}
      </div>
    </ScrollArea>
  );
}
