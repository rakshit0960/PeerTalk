import { useLayoutEffect } from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import "./index.css";
import ChatId from "./pages/ChatId";
import ChatLayout from "./pages/ChatLayout";
import Home from "./pages/home";
import Layout from "./pages/layout";
import Login from "./pages/login";
import Register from "./pages/register";
import { useStore } from "./store/store";
import { ToastProvider } from "@/components/ui/toast-provider";
import Settings from "./pages/settings";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { OAuthCallback } from "./pages/OAuthCallback";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Navigate to="/home" />,
      },
      {
        path: "home",
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "oauth/google/callback",
        element: <OAuthCallback />,
      },

    ],
  },
  {
    path: "settings",
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
  },
  {
    path: "chat",
    element: (
      <ProtectedRoute>
        <ChatLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        path: ":id",
        element: (
          <ProtectedRoute>
            <ChatId />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default function App() {
  const isInitialized = useStore(state => state.isInitialized);

  useLayoutEffect(() => {
    if (!isInitialized) {
      useStore.getState().initialize();
    }
  }, [isInitialized]);

  // Don't render until initialized
  if (!isInitialized) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground animate-pulse">
            Initializing...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <RouterProvider router={router} />
      <ToastProvider />
    </>
  );
}
