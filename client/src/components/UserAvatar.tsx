import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useStore } from "@/store/store";
import { Loader2 } from "lucide-react";

interface UserAvatarProps {
  className?: string;
  fallbackClassName?: string;
  fallback?: string;
  profilePicture?: string | null;
}

const REFRESH_INTERVAL = 45 * 60 * 1000; // 45 minutes

export function UserAvatar({ className, fallback, profilePicture, fallbackClassName }: UserAvatarProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isUrlLoading, setIsUrlLoading] = useState(false);
  const { token, name } = useStore(state => ({
    token: state.token,
    name: state.name
  }));

  useEffect(() => {
    if (!profilePicture || !token) {
      setImageUrl(null);
      return;
    }

    const fetchPresignedUrl = async () => {
      setIsFetching(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/user/presigned-url`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ key: profilePicture }),
        });

        if (!response.ok) throw new Error('Failed to fetch presigned URL');

        const { url } = await response.json();
        if (url) {
          setImageUrl(url);
          setIsUrlLoading(true); // Start loading state for image
        }
      } catch (error) {
        console.error('Error fetching presigned URL:', error);
        setImageUrl(null);
      } finally {
        setIsFetching(false);
      }
    };

    // Fetch immediately
    fetchPresignedUrl();

    // Set up periodic refresh
    const intervalId = setInterval(fetchPresignedUrl, REFRESH_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [profilePicture, token]);

  const handleImageLoad = () => {
    setIsUrlLoading(false);
  };

  const handleImageError = () => {
    setIsUrlLoading(false);
    setImageUrl(null);
  };

  return (
    <Avatar className={className}>
      <AvatarImage
        src={imageUrl || undefined}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      <AvatarFallback className={fallbackClassName}>
        {isFetching || isUrlLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          fallback || name?.[0]?.toUpperCase()
        )}
      </AvatarFallback>
    </Avatar>
  );
}
