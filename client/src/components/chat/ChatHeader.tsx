import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MoreVertical, Search } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useNavigate } from "react-router-dom";

type ChatHeaderProps = {
  participant: {
    name: string;
    email: string;
  } | null;
  loading?: boolean;
};

export function ChatHeader({ participant, loading }: ChatHeaderProps) {
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
        <Avatar>
          <AvatarImage src="" alt={participant?.name} />
          <AvatarFallback>
            {participant?.name?.[0]?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-medium">{participant?.name || 'Loading...'}</h2>
          <p className="text-xs text-gray-500">
            {participant?.email || 'Loading...'}
          </p>
        </div>
      </div>
      <div className="flex space-x-2">
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