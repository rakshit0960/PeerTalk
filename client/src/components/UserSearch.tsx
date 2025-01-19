import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDebounce } from "@/hooks/useDebounce";
import { useStore } from "@/store/store";
import { Search, MessageCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { UserAvatar } from "@/components/UserAvatar";

type User = {
  id: number;
  name: string;
  email: string;
  profilePicture?: string | null;
};

export default function UserSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [startingConversation, setStartingConversation] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const token = useStore(state => state.token);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/search/${encodeURIComponent(debouncedSearch)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, token]);

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open, debouncedSearch, fetchUsers]);

  const startConversation = useCallback(async (userId: number) => {
    try {
      setStartingConversation(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ participantId: userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start conversation');
      }

      const data = await response.json();

      if (data.id) {
        useStore.getState().addConversation(data);
        console.log('Conversation data:', data);
        console.log('userId', userId);

        const socket = useStore.getState().socket;
        if (socket && socket.connected) {
          socket.emit("conversation-started", {
            conversation: data
          });
        }

        setOpen(false);
        navigate(`/chat/${data.id}`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
    } finally {
      setStartingConversation(false);
    }
  }, [navigate, token]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-primary/10 transition-colors"
        >
          <Search className="h-5 w-5 text-primary" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">Start a New Conversation</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2 px-3 border-2 rounded-lg focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all duration-200">
            <Search className="h-4 w-4 text-primary" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 focus-visible:ring-0 placeholder:text-muted-foreground/60"
            />
          </div>
          <ScrollArea className="h-[300px] px-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="sm" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground/80">
                {searchTerm ? "No users found" : "Type to search users"}
              </div>
            ) : startingConversation ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <LoadingSpinner size="sm" />
                <p className="text-sm text-muted-foreground/80">Starting conversation...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 hover:bg-accent/50 rounded-lg transition-all duration-200 cursor-pointer group"
                    onClick={() => startConversation(user.id)}
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        profilePicture={user.profilePicture}
                        fallback={user.name[0].toUpperCase()}
                        className="border-2 border-primary/10"
                      />
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-muted-foreground/80">{user.email}</p>
                      </div>
                    </div>
                    <MessageCircle className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}