"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { tutorApi } from "@/lib/api/tutor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/skeleton";
import { ArrowLeft, User, Calendar, BookOpen, TrendingUp, Target } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/lib/stores/uiStore";
import { handleApiError } from "@/lib/api/errorHandler";

export default function TutorStudentDetailPage() {
  const params = useParams();
  const studentId = params.studentId as string;
  const { addNotification } = useUIStore();

  // Get student context
  const { data: context, isLoading } = useQuery({
    queryKey: ["tutor-context", studentId],
    queryFn: async () => {
      try {
        const response = await tutorApi.getTutorContext(studentId);
        return response.data;
      } catch (error) {
        addNotification({
          type: "error",
          message: handleApiError(error),
        });
        throw error;
      }
    },
    enabled: !!studentId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-secondary-200 rounded animate-pulse" />
          <div>
            <div className="h-9 w-64 bg-secondary-200 rounded animate-pulse mb-2" />
            <div className="h-5 w-96 bg-secondary-200 rounded animate-pulse" />
          </div>
        </div>
        <CardSkeleton count={3} />
      </div>
    );
  }

  if (!context) {
    return (
      <div className="space-y-6">
        <Link href="/tutor">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-secondary-600">Student not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/tutor">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">{context.studentProfile.name}</h1>
          <p className="text-secondary-600 mt-1">Student Profile & Progress</p>
        </div>
      </div>

      {/* Student Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <CardTitle>{context.studentProfile.name}</CardTitle>
              <p className="text-sm text-secondary-600">
                {context.studentProfile.grade ? `Grade ${context.studentProfile.grade}` : "No grade specified"}
                {context.studentProfile.learningStyle && ` • ${context.studentProfile.learningStyle}`}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Strengths */}
          {context.studentStrengths.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-secondary-900 mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success-600" />
                Strengths
              </h3>
              <div className="flex flex-wrap gap-2">
                {context.studentStrengths.map((strength, idx) => (
                  <Badge key={idx} variant="success">
                    {strength}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Challenges */}
          {context.currentChallenges.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-secondary-900 mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-warning-600" />
                Areas for Improvement
              </h3>
              <div className="flex flex-wrap gap-2">
                {context.currentChallenges.map((challenge, idx) => (
                  <Badge key={idx} variant="default">
                    {challenge}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Focus */}
          {context.recommendedFocus.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-secondary-900 mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary-600" />
                Recommended Focus
              </h3>
              <div className="flex flex-wrap gap-2">
                {context.recommendedFocus.map((focus, idx) => (
                  <Badge key={idx} variant="info">
                    {focus}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <div>
        <h2 className="text-xl font-semibold text-secondary-900 mb-4">Recent Sessions</h2>
        {context.recentSessions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
              <p className="text-secondary-600">No sessions yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {context.recentSessions.map((session) => (
              <Card key={session.sessionId}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {format(new Date(session.date), "MMMM d, yyyy")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {session.topics.length > 0 && (
                    <div>
                      <p className="text-xs text-secondary-600 mb-2">Topics Covered</p>
                      <div className="flex flex-wrap gap-2">
                        {session.topics.map((topic, idx) => (
                          <Badge key={idx} variant="info">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Practice History */}
      {context.practiceHistory.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">Practice History</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {context.practiceHistory.map((practice) => (
              <Card key={practice.practiceId}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-secondary-600">Score</p>
                    {practice.score !== null && (
                      <Badge variant={practice.score >= 80 ? "success" : practice.score >= 60 ? "info" : "default"}>
                        {practice.score}%
                      </Badge>
                    )}
                  </div>
                  {practice.completedAt && (
                    <p className="text-xs text-secondary-500">
                      {format(new Date(practice.completedAt), "MMM d, yyyy")}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

