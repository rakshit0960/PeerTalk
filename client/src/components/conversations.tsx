import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Conversation } from "@/store/chat-slice";
import { useStore } from "@/store/store";
import { Message } from "@/types/message";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

type ConversationWithLastMessage = Conversation & {
  lastMessage?: Message;
  newMessagesCount: number;
};

export default function Conversations() {
  const { id } = useParams();
  const [conversationsWithMessages, setConversationsWithMessages] = useState<ConversationWithLastMessage[]>([]);
  const { userId } = useStore((state) => ({
    userId: state.userId,
  }));
  const socket = useStore(state => state.socket);

  useEffect(() => {
    fetchConversations();
  }, []);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      setConversationsWithMessages(prevConvs => {
        return prevConvs.map(conv => {
          if (conv.id === message.conversationId) {
            return {
              ...conv,
              lastMessage: message,
              newMessagesCount: message.senderId !== userId ? conv.newMessagesCount + 1 : conv.newMessagesCount
            };
          }
          return conv;
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
        await fetch(`http://localhost:3000/chat/${id}/read`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${useStore.getState().token}`,
          },
        });

        // Update local state
        setConversationsWithMessages(prevConvs => {
          return prevConvs.map(conv => {
            if (conv.id === parseInt(id)) {
              return {
                ...conv,
                newMessagesCount: 0
              };
            }
            return conv;
          });
        });
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    };

    markMessagesAsRead();
  }, [id]);

  const fetchConversations = async () => {
    try {
      const response = await fetch("http://localhost:3000/chat/conversations", {
        headers: {
          Authorization: `Bearer ${useStore.getState().token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const data = await response.json();

      // Fetch last messages for each conversation
      const withMessages = await Promise.all(
        data.map(async (conv: Conversation) => {
          const messagesResponse = await fetch(
            `http://localhost:3000/chat/${conv.id}/messages`,
            {
              headers: {
                Authorization: `Bearer ${useStore.getState().token}`,
              },
            }
          );
          const messages = await messagesResponse.json();
          return {
            ...conv,
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
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(
      (participant) => participant.id !== userId
    );
  };

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
