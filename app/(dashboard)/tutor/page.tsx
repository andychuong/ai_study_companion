"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import { tutorApi } from "@/lib/api/tutor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/skeleton";
import { User, Users, Calendar, BookOpen, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function TutorDashboardPage() {
  const { user } = useAuthStore();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Get tutor's students
  const { data: studentsData, isLoading } = useQuery({
    queryKey: ["tutor-students", user?.id],
    queryFn: async () => {
      const response = await tutorApi.getTutorStudents();
      return response.data;
    },
    enabled: !!user?.id && user?.role === "tutor",
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-9 w-64 bg-secondary-200 rounded animate-pulse mb-2" />
            <div className="h-5 w-96 bg-secondary-200 rounded animate-pulse" />
          </div>
        </div>
        <CardSkeleton count={3} />
      </div>
    );
  }

  const students = studentsData?.students || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Tutor Dashboard</h1>
        <p className="text-secondary-600 mt-1">Manage your students and view their progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600">Total Students</p>
                <p className="text-2xl font-bold text-secondary-900">{students.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600">Total Sessions</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {students.reduce((sum, s) => sum + s.totalSessions, 0)}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600">Active Students</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {students.filter((s) => {
                    const daysSinceLastSession = s.lastSessionDate
                      ? Math.floor(
                          (Date.now() - new Date(s.lastSessionDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      : Infinity;
                    return daysSinceLastSession <= 30;
                  }).length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      <div>
        <h2 className="text-xl font-semibold text-secondary-900 mb-4">Your Students</h2>
        {students.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
              <p className="text-secondary-600 mb-2">No students yet</p>
              <p className="text-sm text-secondary-500">
                Students will appear here once they book a session with you
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
              <Card
                key={student.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedStudentId(student.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{student.name}</CardTitle>
                        <p className="text-sm text-secondary-500">{student.email}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {student.grade && (
                    <div>
                      <p className="text-xs text-secondary-600">Grade</p>
                      <p className="text-sm font-medium text-secondary-900">Grade {student.grade}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-secondary-600">Total Sessions</p>
                    <p className="text-sm font-medium text-secondary-900">
                      {student.totalSessions} session{student.totalSessions !== 1 ? "s" : ""}
                    </p>
                  </div>
                  {student.lastSessionDate && (
                    <div>
                      <p className="text-xs text-secondary-600">Last Session</p>
                      <p className="text-sm font-medium text-secondary-900">
                        {format(new Date(student.lastSessionDate), "MMM d, yyyy")}
                      </p>
                    </div>
                  )}
                  {student.recentSessions.length > 0 && (
                    <div>
                      <p className="text-xs text-secondary-600 mb-2">Recent Sessions</p>
                      <div className="space-y-1">
                        {student.recentSessions.slice(0, 3).map((session) => (
                          <div
                            key={session.id}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="text-secondary-600">
                              {format(new Date(session.sessionDate), "MMM d")}
                            </span>
                            <Badge
                              variant={
                                session.analysisStatus === "completed"
                                  ? "success"
                                  : session.analysisStatus === "processing"
                                  ? "info"
                                  : "default"
                              }
                              className="text-xs"
                            >
                              {session.analysisStatus}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="pt-2 border-t border-secondary-200">
                    <Link href={`/tutor/students/${student.id}`}>
                      <Button variant="outline" className="w-full" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

