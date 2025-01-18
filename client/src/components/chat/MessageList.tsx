import { cn } from "@/lib/utils";
import { useStore } from "@/store/store";
import { Message } from "@/types/message";
import { forwardRef } from "react";
import { MessageSkeleton } from "../loading/MessageSkeleton";
import MessageImageViewer from "./MessageImageViewer";

interface MessageListProps {
  messages: Message[];
  loading?: boolean;
}

export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
  ({ messages, loading }, ref) => {
    const userId = useStore((state) => state.userId);

    if (loading) {
      return <MessageSkeleton />;
    }

    return (
      <div className="space-y-4">
        {messages.map((message) => {
          const isOwn = message.senderId === userId;

          return (
            <div
              key={message.id}
              className={cn("flex", isOwn ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] shadow-lg transition-all space-y-2",
                  message.image ? "bg-transparent" : cn(
                    "rounded-2xl px-4 py-2.5",
                    isOwn
                      ? "bg-gradient-to-br from-emerald-600/95 to-emerald-700/95 text-white"
                      : "bg-gradient-to-br from-zinc-800/95 to-zinc-900/95 backdrop-blur-sm border border-zinc-800/50"
                  )
                )}
              >
                {message.image && (
                  <div className="space-y-2">
                    <MessageImageViewer imageKey={message.image} />
                    {message.content && (
                      <div className={cn(
                        "rounded-2xl px-4 py-2.5",
                        isOwn
                          ? "bg-gradient-to-br from-emerald-600/95 to-emerald-700/95 text-white"
                          : "bg-gradient-to-br from-zinc-800/95 to-zinc-900/95 backdrop-blur-sm border border-zinc-800/50"
                      )}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                    )}
                  </div>
                )}
                {!message.image && message.content && (
                  <p className="text-sm leading-relaxed">{message.content}</p>
                )}
                <div
                  className={cn(
                    "text-[10px] mt-1.5",
                    isOwn ? "text-white/80" : "text-zinc-400",
                    message.image && !message.content && "px-1"
                  )}
                >
                  {new Date(message.createdAt || '').toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={ref} />
      </div>
    );
  }
);

MessageList.displayName = "MessageList";