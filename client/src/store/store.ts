import { create } from "zustand";
import { Store } from "../types/store";
import { createUserSlice } from "./user-slice";
import { immer } from "zustand/middleware/immer";


export const useStore = create<Store>()(immer((...a) => ({
  ...createUserSlice(...a)
})))