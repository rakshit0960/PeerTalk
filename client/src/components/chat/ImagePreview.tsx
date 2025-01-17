import { X } from "lucide-react";
import { Button } from "../ui/button";

interface ImagePreviewProps {
  file: File;
  onRemove: () => void;
}

export function ImagePreview({ file, onRemove }: ImagePreviewProps) {
  return (
    <div className="relative group">
      <img
        src={URL.createObjectURL(file)}
        alt="Preview"
        className="max-h-[200px] rounded-lg object-contain"
      />
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2 xl:opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}