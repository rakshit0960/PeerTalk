import { Button } from "@/components/ui/button";
import { ChevronLeft, MoreVertical, Search, Video } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useNavigate } from "react-router";
import { UserAvatar } from "../UserAvatar";

type ChatHeaderProps = {
  participant: {
    name: string;
    email: string;
    profilePicture: string | null;
  } | null;
  loading?: boolean;
  onVideoCall?: () => void;
};

export function ChatHeader({ participant, loading, onVideoCall }: ChatHeaderProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-3 w-[160px]" />
          </div>
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/chat')}
          className="md:hidden"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <UserAvatar
          fallback={participant?.name?.[0]?.toUpperCase() || '?'}
          profilePicture={participant?.profilePicture}
          className="h-10 w-10"
        />
        <div>
          <h2 className="font-medium">{participant?.name || 'Loading...'}</h2>
          <p className="text-xs text-gray-500">
            {participant?.email || 'Loading...'}
          </p>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button variant="ghost" size="icon" onClick={onVideoCall} className="hover:bg-primary/10 hover:text-primary">
          <Video className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Search className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}