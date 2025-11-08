"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useChatStore } from "@/lib/stores/chatStore";
import { chatApi } from "@/lib/api/chat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/lib/stores/uiStore";
import { handleApiError } from "@/lib/api/errorHandler";
import { Send, Bot, User as UserIcon, UserCheck, X } from "lucide-react";
import { Message } from "@/types";
import { TutorBookingModal } from "@/components/tutor/TutorBookingModal";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const { user } = useAuthStore();
  const { messages, addMessage, setLoading, isLoading } = useChatStore();
  const { addNotification } = useUIStore();
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showTutorModal, setShowTutorModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-20 z-50"
        onClick={onClose}
      />
      
      {/* Chat Modal positioned at bottom right */}
      <div className="fixed bottom-20 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-6rem)] flex flex-col animate-in slide-in-from-bottom-2 duration-300">
        <Card className="w-full h-full flex flex-col shadow-2xl border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <CardTitle className="text-base">AI Study Companion</CardTitle>
                  <p className="text-xs text-secondary-500">Ask me anything!</p>
                </div>
              </div>
              <Button variant="ghost" onClick={onClose} size="sm" className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
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
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
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
            <div className="border-t border-secondary-200 p-3">
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
                  className="flex-1 text-sm h-9"
                />
                <Button
                  variant="outline"
                  onClick={handleRequestTutor}
                  title="Request tutor help"
                  size="sm"
                  className="h-9 w-9 p-0"
                >
                  <UserCheck className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={handleSend} 
                  disabled={!input.trim() || isLoading} 
                  size="sm"
                  className="h-9 w-9 p-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
    </>
  );
}

