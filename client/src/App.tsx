import { useLayoutEffect } from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import "./index.css";
import Chat from "./pages/Chat";
import Home from "./pages/home";
import Layout from "./pages/layout";
import Login from "./pages/login";
import Register from "./pages/register";
import { initializeStore } from "./utils/storeUtils";
import { useStore } from "./store/store";

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
    path: "/chat",
    element: <Chat />,
  },
]);

export default function App() {
  useLayoutEffect(() => {
    if (!useStore.getState().isInitialized) initializeStore();
  }, []);

  return <RouterProvider router={router} />;
}
