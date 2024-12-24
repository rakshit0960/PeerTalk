import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useEffect, useRef } from "react";

interface MessageInputProps {
  inputMessage: string;
  setInputMessage: (value: string) => void;
  sendMessage: () => void;
  onTyping: (isTyping: boolean) => void;
}

export function MessageInput({
  inputMessage,
  setInputMessage,
  sendMessage,
  onTyping,
}: MessageInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isTyping = useRef(false);

  useEffect(() => {
    if (inputMessage && !isTyping.current) {
      isTyping.current = true;
      onTyping(true);
    } else if (!inputMessage && isTyping.current) {
      isTyping.current = false;
      onTyping(false);
    }
  }, [inputMessage, onTyping]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="p-4 flex items-center gap-2 bg-card/50">
      <Input
        ref={inputRef}
        placeholder="Type a message..."
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-background/50 backdrop-blur-sm focus-visible:ring-primary/20 rounded-xl"
      />
      <Button
        size="icon"
        onClick={sendMessage}
        disabled={!inputMessage.trim()}
        className="shrink-0 bg-primary/20 hover:bg-primary/30 text-primary rounded-xl"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}