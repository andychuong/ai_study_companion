"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import { transcriptApi } from "@/lib/api/transcripts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/skeleton";
import { History, Upload, Calendar as CalendarIcon } from "lucide-react";
import { Session } from "@/types";
import { SessionCard } from "@/components/sessions/SessionCard";
import { SessionDetailModal } from "@/components/sessions/SessionDetailModal";
import { UploadForm } from "@/components/sessions/UploadForm";
import * as Tabs from "@radix-ui/react-tabs";
import Link from "next/link";

export default function SessionsPage() {
  const { user } = useAuthStore();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [activeTab, setActiveTab] = useState("history");

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
          <h1 className="text-3xl font-bold text-secondary-900">Sessions</h1>
          <p className="text-secondary-600 mt-1">Book new sessions or view your session history</p>
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

      {/* Tabs */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <Tabs.List className="flex gap-2 border-b border-secondary-200">
          <Tabs.Trigger
            value="book"
            className="px-4 py-2 text-sm font-medium text-secondary-600 data-[state=active]:text-primary-600 data-[state=active]:border-b-2 data-[state=active]:border-primary-600 transition-colors"
          >
            <CalendarIcon className="h-4 w-4 inline mr-2" />
            Book Session
          </Tabs.Trigger>
          <Tabs.Trigger
            value="history"
            className="px-4 py-2 text-sm font-medium text-secondary-600 data-[state=active]:text-primary-600 data-[state=active]:border-b-2 data-[state=active]:border-primary-600 transition-colors"
          >
            <History className="h-4 w-4 inline mr-2" />
            History
          </Tabs.Trigger>
        </Tabs.List>

        {/* Book Session Tab */}
        <Tabs.Content value="book" className="mt-6">
          <Card>
            <CardContent className="py-12 text-center">
              <CalendarIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                Book a New Session
              </h3>
              <p className="text-secondary-600 mb-6">
                Select a date and time to schedule your tutoring session
              </p>
              <Link href="/sessions/book">
                <Button variant="primary" size="lg">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Open Booking Calendar
                </Button>
              </Link>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* History Tab */}
        <Tabs.Content value="history" className="mt-6">
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
        </Tabs.Content>
      </Tabs.Root>

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

