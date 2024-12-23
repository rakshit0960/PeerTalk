import { StateCreator } from "zustand";
import { User } from "@/utils/tokenUtils";

export type UserState = User & {
  isInitialized: boolean;
  token: string | null;
  isGuest: boolean;
};

type UserAction = {
  setToken: (token: string) => void;
  setName: (username: string) => void;
  setEmail: (email: string) => void;
  setUserId: (userId: number) => void;
  setIsInitialized: (value: boolean) => void;
  setIsGuest: (value: boolean) => void;
  logout: () => Promise<void>;
};

export type UserSlice = UserState & UserAction;

export const createUserSlice: StateCreator<
  UserSlice,
  [["zustand/immer", never]],
  [],
  UserSlice
> = (set, get) => ({
  token: null,
  userId: 0,
  name: "",
  email: "",
  isInitialized: false,
  isGuest: false,
  setName: (username) =>
    set((state) => {
      state.name = username;
    }),
  setEmail: (email) =>
    set((state) => {
      state.email = email;
    }),
  setUserId: (userId) =>
    set((state) => {
      state.userId = userId;
    }),
  setIsInitialized: (value) =>
    set((state) => {
      state.isInitialized = value;
    }),
  setToken: (token) => {
    set((state) => {
      state.token = token;
    });
  },
  setIsGuest: (value) =>
    set((state) => {
      state.isGuest = value;
    }),
  logout: async () => {
    const token = get().token;
    const isGuest = get().isGuest;

    if (isGuest && token) {
      try {
        await fetch('http://localhost:3000/auth/guest', {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Error deleting guest account:', error);
      }
    }

    set((state) => {
      state.token = null;
      state.userId = 0;
      state.name = '';
      state.email = '';
      state.isInitialized = false;
      state.isGuest = false;
      // Clear stored data
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('name');
      localStorage.removeItem('email');
    });
  },
});
