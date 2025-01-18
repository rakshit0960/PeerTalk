import { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useStore } from "@/store/store";

interface MessageImageViewerProps {
  imageKey: string;
}

export default function MessageImageViewer({ imageKey }: MessageImageViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const token = useStore((state) => state.token);

  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/user/presigned-url`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ key: imageKey }),
        });

        if (!response.ok) throw new Error('Failed to fetch image URL');

        const { url } = await response.json();
        setImageUrl(url);
      } catch (error) {
        console.error('Error fetching image URL:', error);
        setImageError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (imageKey) {
      fetchImageUrl();
    }
  }, [imageKey, token]);

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-muted/30 rounded-lg backdrop-blur-sm">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading image...</span>
        </div>
      </div>
    );
  }

  if (!imageUrl || imageError) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-muted/30 rounded-lg backdrop-blur-sm border border-destructive/20">
        <div className="flex flex-col items-center gap-2">
          <X className="h-6 w-6 text-destructive" />
          <p className="text-sm text-destructive">Failed to load image</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-full overflow-hidden">
        <img
          src={imageUrl}
          alt="Message attachment"
          className="max-h-[250px] w-auto rounded-lg object-contain bg-black/5 cursor-zoom-in hover:opacity-95 transition-all shadow-sm hover:shadow-md"
          loading="lazy"
          onClick={() => setIsOpen(true)}
          onError={handleImageError}
        />
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95svw] max-h-[95svh] p-0 bg-transparent backdrop-blur-lg border-0">
          <DialogTitle className="sr-only">Image Viewer</DialogTitle>
          <DialogDescription className="sr-only">
            Full size view of the message attachment
          </DialogDescription>
          <div className="w-full h-[95vh] flex items-center justify-center relative">
            <DialogClose asChild>
              <button
                className="absolute right-4 top-4 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-all focus:outline-none focus:ring-2 focus:ring-white/30 z-50 group backdrop-blur-sm"
                aria-label="Close image viewer"
              >
                <X className="h-5 w-5 text-white opacity-90 group-hover:opacity-100 transition-opacity" />
              </button>
            </DialogClose>
            <img
              src={imageUrl}
              alt="Message attachment"
              className="max-w-full max-h-full object-contain p-6 select-none animate-in fade-in-0 zoom-in-95 duration-300"
              onError={handleImageError}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}