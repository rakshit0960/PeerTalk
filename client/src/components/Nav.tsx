import { Button } from "@/components/ui/button";
import { Github, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "@/store/store";

export default function Nav() {
  const isInitialized = useStore(state => state.isInitialized);

  return (
    <nav className="fixed top-0 flex border-b w-full justify-between px-[10%] items-center py-2 backdrop-blur-sm z-[100]">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
          <MessageCircle className="h-5 w-5 text-primary" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
          PeerTalk
        </span>
      </Link>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="hover:bg-primary/10 hover:text-primary"
        >
          <a
            href="https://github.com/rakshit0960/chatApp"
            target="_blank"
            rel="noopener noreferrer"
            title="View source code"
          >
            <Github className="h-5 w-5" />
          </a>
        </Button>

        {!isInitialized && (
          <Link to="/login">
            <Button variant="ghost">Login</Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
