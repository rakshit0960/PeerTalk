import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Store } from "../types/store";
import { createUserSlice } from "./slices/user-slice";
import { createSocketSlice } from "./slices/socket-slice";
import { createChatSlice } from "./slices/chat-slice";


export const useStore = create<Store>()(immer((...a) => ({
  ...createUserSlice(...a),
  ...createSocketSlice(...a),
  ...createChatSlice(...a)
})))