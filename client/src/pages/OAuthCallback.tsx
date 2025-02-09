import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/store/store";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();

    const handleCallback = async () => {
      try {
        setIsLoading(true);
        const error = searchParams.get("error");
        const code = searchParams.get("code");

        if (error) {
          throw new Error(decodeURIComponent(error));
        }

        if (!code) {
          throw new Error("No authorization code received");
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google/callback?code=${code}`, {
          signal: abortController.signal
        });

        const result = await response.json();
        console.log('Server response:', result);

        if (!response.ok || result.error) {
          throw new Error(result.error || "Authentication failed");
        }

        if (!result.token) {
          console.error('Invalid response structure:', result);
          throw new Error("Invalid server response format");
        }

        localStorage.setItem("token", result.token);
        setIsLoading(true);
        await useStore.getState().initialize();
        navigate("/chat", { replace: true });
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;


        console.error("OAuth callback error:", error);
        localStorage.removeItem("token");
        useStore.getState().logout();

        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: error instanceof Error ? error.message : "Failed to authenticate",
        });
        navigate("/login", {replace: true});
      } finally {
        if (!window.location.pathname.includes("/chat")) {
          setIsLoading(false);
        }
      }
    };

    handleCallback();
    return () => abortController.abort();
  }, [navigate, searchParams, toast]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      {isLoading ? "" : ""}
        <>
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground animate-pulse">
            Completing authentication...
          </p>
        </>
    </div>
  );
}