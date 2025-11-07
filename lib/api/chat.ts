import apiClient from "./client";
import { Conversation, Message } from "@/types";

export interface SendMessageData {
  conversationId?: string;
  message: string;
}

export interface SendMessageResponse {
  message: Message;
  conversationId: string;
}

export const chatApi = {
  sendMessage: (data: SendMessageData) =>
    apiClient.post<SendMessageResponse>("/chat/message", data),

  getConversation: (conversationId: string) =>
    apiClient.get<Conversation>(`/chat/conversation/${conversationId}`),

  createConversation: () =>
    apiClient.post<Conversation>("/chat/conversation", {}),
};

