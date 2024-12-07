import { Message } from "@/types/message";
import { useStore } from "@/store/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessagesLoading } from "../loading/MessageSkeleton";
import { forwardRef } from "react";

type MessageListProps = {
  messages: Message[];
  loading: boolean;
};

export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
  ({ messages, loading }, ref) => {
    const userId = useStore(state => state.userId);

    return (
      <ScrollArea className="flex-1 relative">
        {loading ? (
          <MessagesLoading />
        ) : (
          <div className="p-4">
            {messages.map((message) => (
              <div
                key={`${message.id}-${message.createdAt}`}
                className={`flex ${
                  message.senderId === userId ? "justify-end" : "justify-start"
                } mb-4`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.senderId === userId
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
            <div ref={ref} />
          </div>
        )}
      </ScrollArea>
    );
  }
);

MessageList.displayName = "MessageList";