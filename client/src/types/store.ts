import { SocketSlice } from "@/store/socket-slice";
import { UserSlice } from "../store/user-slice";
import { ChatSlice } from "@/store/chat-slice";

export type Store = UserSlice & SocketSlice & ChatSlice;