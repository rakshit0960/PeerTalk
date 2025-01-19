import { StateCreator } from "zustand";
import { User } from "@/utils/tokenUtils";
import { jwtDecode } from "jwt-decode";
import { tokenPayloadSchema } from "@/utils/tokenUtils";

export type UserState = User & {
  isInitialized: boolean;
  token: string | null;
  isGuest: boolean;
  tutorialComplete: boolean;
  isLoggedIn: boolean;
  bio: string;
  profilePicture: string;
};

type UserAction = {
  setToken: (token: string) => void;
  setName: (username: string) => void;
  setEmail: (email: string) => void;
  setUserId: (userId: number) => void;
  setIsInitialized: (value: boolean) => void;
  setIsGuest: (value: boolean) => void;
  initialize: () => void;
  logout: () => Promise<void>;
  setTutorialComplete: () => void;
  setIsLoggedIn: (value: boolean) => void;
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
  bio: "",
  profilePicture: "",
  isInitialized: false,
  isGuest: false,
  tutorialComplete: false,
  isLoggedIn: false,

  initialize: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const parsedToken = tokenPayloadSchema.parse(decodedToken);
        if (parsedToken.userId === null) throw new Error("invalid userId");

        console.log("token", token);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/is-token-valid`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("token check response", await response.text());
        if (!response.ok) throw new Error("Token is invalid");

        set((state) => {
          state.token = token;
          state.userId = parsedToken.userId;
          state.name = parsedToken.name;
          state.email = parsedToken.email;
          state.bio = parsedToken.bio;
          state.profilePicture = parsedToken.profilePicture;
          state.isInitialized = true;
          state.isLoggedIn = true;
          state.tutorialComplete = localStorage.getItem("tutorialComplete") === "true";
        });
      } catch (error) {
        console.error("Token verification failed:", error);
        localStorage.removeItem('token');
        set((state) => {
          state.isLoggedIn = false;
          state.isInitialized = true;
        });
      }
    } else {
      set((state) => {
        state.isInitialized = true;
        state.isLoggedIn = false;
      });
    }
  },

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
    localStorage.setItem("token", token);
  },
  setIsGuest: (value) =>
    set((state) => {
      state.isGuest = value;
    }),
  setTutorialComplete: () =>
    set((state) => {
      state.tutorialComplete = true;
      localStorage.setItem("tutorialComplete", "true");
    }),
  logout: async () => {
    const token = get().token;
    const isGuest = get().isGuest;

    if (isGuest && token) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/auth/guest`, {
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
      state.isLoggedIn = false;
    });
    localStorage.removeItem('token');
  },
  setIsLoggedIn: (value) =>
    set((state) => {
      state.isLoggedIn = value;
    }),
});
