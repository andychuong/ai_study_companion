import { create } from "zustand";
import { Message } from "@/types";

interface ChatStore {
  currentConversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  setConversation: (id: string) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  currentConversationId: null,
  messages: [],
  isLoading: false,

  setConversation: (id: string) =>
    set({ currentConversationId: id, messages: [] }),

  addMessage: (message: Message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  clearMessages: () => set({ messages: [] }),

  setLoading: (isLoading: boolean) => set({ isLoading }),
}));

