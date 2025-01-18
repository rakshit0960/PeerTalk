import { StateCreator } from "zustand";

export interface Conversation {
  id: number;
  name: string | null;
  isGroup: boolean;
  participants: {
    id: number;
    name: string;
    email: string;
    profilePicture?: string;
  }[];
}

type ChatState = {
  conversations: Conversation[];
  unreadMessages: { [conversationId: number]: number };
};

type ChatActions = {
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  incrementUnread: (conversationId: number) => void;
  clearUnread: (conversationId: number) => void;
};

export type ChatSlice = ChatState & ChatActions;

export const createChatSlice: StateCreator<
  ChatSlice,
  [["zustand/immer", never]],
  [],
  ChatSlice
> = (set) => ({
  conversations: [],
  unreadMessages: {},
  setConversations: (conversations) =>
    set((state) => {
      state.conversations = conversations;
    }),
  addConversation: (conversation) =>
    set((state) => {
      state.conversations = [conversation, ...state.conversations];
    }),
  incrementUnread: (conversationId) =>
    set((state) => {
      state.unreadMessages[conversationId] = (state.unreadMessages[conversationId] || 0) + 1;
    }),
  clearUnread: (conversationId) =>
    set((state) => {
      state.unreadMessages[conversationId] = 0;
    }),
});
