"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useChatStore } from "@/lib/stores/chatStore";
import { chatApi } from "@/lib/api/chat";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/lib/stores/uiStore";
import { handleApiError } from "@/lib/api/errorHandler";
import { Send, Bot, User as UserIcon, UserCheck } from "lucide-react";
import { Message } from "@/types";
import { TutorBookingModal } from "@/components/tutor/TutorBookingModal";

export default function ChatPage() {
  const { user } = useAuthStore();
  const { messages, addMessage, setLoading, isLoading } = useChatStore();
  const { addNotification } = useUIStore();
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showTutorModal, setShowTutorModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;

    const questionText = input.trim();
    setCurrentQuestion(questionText);

    const userMessage: Message = {
      id: Math.random().toString(36).substring(7),
      role: "user",
      content: questionText,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInput("");
    setLoading(true);

    try {
      const response = await chatApi.sendMessage({
        conversationId: conversationId || undefined,
        message: questionText,
      });

      if (!conversationId) {
        setConversationId(response.data.conversationId);
      }

      addMessage(response.data.message);
    } catch (error) {
      addNotification({
        type: "error",
        message: handleApiError(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestTutor = () => {
    setShowTutorModal(true);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-secondary-900">AI Study Companion</h1>
        <p className="text-secondary-600 mt-1">Ask me anything about your studies!</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <Bot className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                <p className="text-secondary-600">
                  Start a conversation by asking a question about your studies!
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-primary-600" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-primary-600 text-white"
                      : "bg-secondary-100 text-secondary-900"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-secondary-200">
                      <p className="text-xs font-medium mb-1">Sources:</p>
                      {message.sources.map((source, idx) => (
                        <Badge key={idx} variant="info" className="mr-1 mb-1">
                          Session {source.sessionId.slice(0, 8)}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {message.suggestTutor && (
                    <div className="mt-2 pt-2 border-t border-secondary-200">
                      <p className="text-xs italic mb-2">
                        💡 This might be a great topic for your next tutor session!
                      </p>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setCurrentQuestion(message.content);
                          setShowTutorModal(true);
                        }}
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Book Tutor Session
                      </Button>
                    </div>
                  )}
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                {message.role === "user" && (
                  <div className="h-8 w-8 rounded-full bg-secondary-200 flex items-center justify-center flex-shrink-0">
                    <UserIcon className="h-5 w-5 text-secondary-600" />
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary-600" />
              </div>
              <div className="bg-secondary-100 rounded-lg px-4 py-2">
                <LoadingSpinner size="sm" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-secondary-200 p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask a question..."
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={handleRequestTutor}
              title="Request tutor help"
            >
              <UserCheck className="h-4 w-4" />
            </Button>
            <Button onClick={handleSend} disabled={!input.trim() || isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Tutor Booking Modal */}
      <TutorBookingModal
        isOpen={showTutorModal}
        onClose={() => {
          setShowTutorModal(false);
          setCurrentQuestion(undefined);
        }}
        currentQuestion={currentQuestion}
        onBookingComplete={() => {
          addNotification({
            type: "success",
            message: "Tutor session requested! We'll contact you soon.",
          });
        }}
      />
    </div>
  );
}

