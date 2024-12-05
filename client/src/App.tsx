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
import { initializeStore } from "./utils/storeUtils";
import { ToastProvider } from "@/components/ui/toast-provider";

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
    ],
  },
  {
    path: "chat",
    element: <ChatLayout />,
    children: [
      {
        index: true,
        path: ":id",
        element: <ChatId />,
      },
    ],
  },
]);

export default function App() {
  useLayoutEffect(() => {
    if (!useStore.getState().isInitialized) initializeStore();
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <ToastProvider />
    </>
  );
}
