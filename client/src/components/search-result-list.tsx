import { useToast } from '@/hooks/use-toast';
import { useStore } from "@/store/store";
import { UserSearchResult } from "@/types/user-search";
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Toaster } from './ui/toaster';
import { UserAvatar } from './UserAvatar';

export default function SearchResultList({
  searchResultList,
}: {
  searchResultList: UserSearchResult[];
}) {
  const navigation = useNavigate();
  const [loading, setLoading] = useState<number | null>(null);
  const token = useStore(state => state.token);
  const { toast } = useToast();

  const startConversation = async (id: number) => {
    setLoading(id);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/chat/conversations/start/`,
        {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id }),
        }
      );
      const data = await response.json();
      console.log('start conversation:', data);
      if (!response.ok) throw new Error(data.error || "An error occurred");
      if (!data.conversation) throw new Error("No conversation data received");

      toast({
        title: "Conversation started",
        description: "You can now start chatting!",
      });

      navigation(`/chat/${data.conversation.id}`);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="border bg-gray-950 w-full">
      {searchResultList.map((user) => (
        <div
          onClick={() => startConversation(user.id)}
          key={user.id}
          className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-900 ${loading === user.id ? 'opacity-50' : ''}`}
        >
          <UserAvatar
            fallback={user.name[0].toUpperCase()}
            profilePicture={user.profilePicture}
            className="h-10 w-10"
          />
          <div className="flex-1">
            <div className="flex justify-between items-baseline">
              <div>
                <h3 className="font-medium">{user.name}</h3>
                <h3 className="font-xs text-gray-400">{user.email}</h3>
              </div>
            </div>
          </div>
          {loading === user.id && <span className="loading loading-spinner loading-sm"></span>}
        </div>
      ))}
      <Toaster />
    </div>
  );
}