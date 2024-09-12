import { StateCreator } from "zustand";

type UserState = {
  username: string;
  email: string;
};

type UserAction = {
  setUsername: (username: string) => void;
  setEmail: (email: string) => void;
};

export type UserSlice = UserState & UserAction;

export const createUserSlice: StateCreator<
  UserSlice,
  [["zustand/immer", never]],
  [],
  UserSlice
> = (set) => ({
  username: "",
  email: "",
  setUsername: (username) =>
    set((state) => {
      state.username = username;
    }),
  setEmail: (email) =>
    set((state) => {
      state.email = email;
    }),
});
