"use client";

import { useState } from "react";
import { Bot, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatModal } from "@/components/chat/ChatModal";

export function DashboardFooter() {
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  return (
    <>
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-secondary-200 shadow-sm lg:left-64">
        <div className="flex items-center justify-end gap-4 px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsChatModalOpen(true)}
            className="flex items-center gap-2 hover:bg-secondary-100"
          >
            <Bot className="h-4 w-4" />
            <span>Chat Bot</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // TODO: Implement help page or modal
              alert("Help feature coming soon!");
            }}
            className="flex items-center gap-2 hover:bg-secondary-100"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Help</span>
          </Button>
        </div>
      </footer>
      
      <ChatModal 
        isOpen={isChatModalOpen} 
        onClose={() => setIsChatModalOpen(false)} 
      />
    </>
  );
}

