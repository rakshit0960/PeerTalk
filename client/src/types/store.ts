import { SocketSlice } from "@/store/slices/socket-slice";
import { UserSlice } from "../store/slices/user-slice";
import { ChatSlice } from "@/store/slices/chat-slice";

export type Store = UserSlice & SocketSlice & ChatSlice;