import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ImagePreview } from "./ImagePreview";

interface MessageInputProps {
  inputMessage: string;
  setInputMessage: (value: string) => void;
  sendMessage: (image?: File) => void;
  onTyping: (isTyping: boolean) => void;
}

// TODO: Add image upload functionality use s3 to store images
export function MessageInput({
  inputMessage,
  setInputMessage,
  sendMessage,
  onTyping,
}: MessageInputProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      handleSend();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
    }
    e.target.value = ''; // Reset input
  };

  const handleSend = () => {
    if (selectedImage || inputMessage.trim()) {
      sendMessage(selectedImage || undefined);
      setSelectedImage(null);
      setInputMessage('');
    }
  };

  return (
    <div className="p-4 space-y-4">
      {selectedImage && (
        <div className="p-4 bg-muted/50 rounded-lg">
          <ImagePreview
            file={selectedImage}
            onRemove={() => setSelectedImage(null)}
          />
        </div>
      )}
      <div className="flex items-center gap-2 bg-card/50">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageSelect}
        />
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="h-5 w-5" />
        </Button>
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
          onClick={handleSend}
          disabled={!inputMessage.trim() && !selectedImage}
          className="shrink-0 bg-primary/20 hover:bg-primary/30 text-primary rounded-xl"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}