"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import { transcriptApi } from "@/lib/api/transcripts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/skeleton";
import { History, Upload } from "lucide-react";
import { Session } from "@/types";
import { SessionCard } from "@/components/sessions/SessionCard";
import { SessionDetailModal } from "@/components/sessions/SessionDetailModal";
import { UploadForm } from "@/components/sessions/UploadForm";

export default function SessionsPage() {
  const { user } = useAuthStore();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Get sessions
  const { data: sessions, isLoading } = useQuery({
    queryKey: ["sessions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await transcriptApi.getStudentSessions(user.id);
      return response.data;
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-9 w-64 bg-secondary-200 rounded animate-pulse mb-2" />
            <div className="h-5 w-96 bg-secondary-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-40 bg-secondary-200 rounded animate-pulse" />
        </div>
        <CardSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Session History</h1>
          <p className="text-secondary-600 mt-1">View your past tutoring sessions</p>
        </div>
        <Button onClick={() => setShowUploadForm(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Session
        </Button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <UploadForm 
          onClose={() => setShowUploadForm(false)} 
          studentId={user?.id}
        />
      )}

      {!sessions || sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <History className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
            <p className="text-secondary-600 mb-4">No sessions found</p>
            <p className="text-sm text-secondary-500">
              Sessions will appear here after you complete tutoring sessions
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onClick={() => setSelectedSession(session)}
            />
          ))}
        </div>
      )}

      {/* Session Detail Modal */}
      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
}

