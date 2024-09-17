import { StateCreator } from "zustand";
import { User } from "@/utils/tokenUtils";

export type UserState = User & {
  isInitialized: boolean;
  token: string | null;
};

type UserAction = {
  setToken: (token: string) => void;
  setName: (username: string) => void;
  setEmail: (email: string) => void;
  setUserId: (userId: number) => void;
  setIsInitialized: (value: boolean) => void;
};

export type UserSlice = UserState & UserAction;

export const createUserSlice: StateCreator<
  UserSlice,
  [["zustand/immer", never]],
  [],
  UserSlice
> = (set) => ({
  token: null,
  userId: 0,
  name: "",
  email: "",
  isInitialized: false,
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
});
