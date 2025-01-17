import { useStore } from "@/store/store";
import { Navigate } from "react-router-dom";
import { LoadingSpinner } from "./ui/loading-spinner";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isInitialized } = useStore(state => ({
    isLoggedIn: state.isLoggedIn,
    isInitialized: state.isInitialized
  }));

  // Wait for initialization
  if (!isInitialized) {
    // show a loading spinner until the app is initialized
    return <LoadingSpinner />;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}