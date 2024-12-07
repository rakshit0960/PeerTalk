import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Paperclip, Send, Smile } from "lucide-react";

type MessageInputProps = {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  sendMessage: () => void;
  onTyping: (isTyping: boolean) => void;
};

export function MessageInput({ inputMessage, setInputMessage, sendMessage, onTyping }: MessageInputProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    onTyping(e.target.value.length > 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
    onTyping(false);
  };

  return (
    <div className="p-4 border-t">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2"
      >
        <Button type="button" variant="ghost" size="icon">
          <Smile className="h-6 w-6" />
        </Button>
        <Button type="button" variant="ghost" size="icon">
          <Paperclip className="h-6 w-6" />
        </Button>
        <Input
          className="flex-1"
          type="text"
          placeholder="Type a message"
          value={inputMessage}
          onChange={handleInputChange}
          onBlur={() => onTyping(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
              onTyping(false);
            }
          }}
        />
        {inputMessage ? (
          <Button
            type="submit"
            size="icon"
            className="rounded-full"
          >
            <Send className="h-6 w-6" />
            <span className="sr-only">Send</span>
          </Button>
        ) : (
          <Button type="button" variant="ghost" size="icon">
            <Mic className="h-6 w-6" />
          </Button>
        )}
      </form>
    </div>
  );
}