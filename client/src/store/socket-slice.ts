import { Socket, io } from "socket.io-client";
import { StateCreator } from "zustand";
import { useStore } from "./store";

type SocketState = {
  socket: Socket | null;
  isConnected: boolean;
};

type SocketAction = {
  connect: () => void;
  disconnect: () => void;
};

export type SocketSlice = SocketState & SocketAction;

export const createSocketSlice: StateCreator<
  SocketSlice,
  [["zustand/immer", never]],
  [],
  SocketSlice
> = (set, get) => ({
  socket: null,
  isConnected: false,
  connect: () => {
    if (!get().socket) {
      const token = useStore.getState().token;
      console.log("socket connecting...", "http://localhost:3000");

      const socket = io('http://localhost:3000', {
        extraHeaders: {
          authorization: `${token}`
        }
      });

      socket.on("connect", () => {
        console.log("Socket connected successfully");
        set((state) => {
          state.isConnected = true;
        });
      });

      socket.on('connect_error', (err) => {
        console.error('Connection Error:', err);
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected");
        set((state) => {
          state.isConnected = false;
          state.socket = null;
        });
      });

      set({ socket });
    }
  },
  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set((state) => {
        state.isConnected = false;
        state.socket = null;
      });
    }
  },
});
