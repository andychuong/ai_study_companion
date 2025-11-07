"use client";

import { useAuthStore } from "@/lib/stores/authStore";
import { useProgress } from "@/lib/hooks/useProgress";
import { GoalProgress } from "@/types";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading";
import { StatCardSkeleton } from "@/components/ui/skeleton";
import { ProgressBar } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Target, 
  Calendar, 
  BookOpen, 
  TrendingUp,
  MessageSquare,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: progress, isLoading } = useProgress(user?.id || "");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <StatCardSkeleton count={5} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-lg border border-secondary-200 p-6 space-y-4">
            <div className="h-6 w-48 bg-secondary-200 rounded animate-pulse" />
            <div className="h-64 bg-secondary-200 rounded animate-pulse" />
          </div>
          <div className="rounded-lg border border-secondary-200 p-6 space-y-4">
            <div className="h-6 w-48 bg-secondary-200 rounded animate-pulse" />
            <div className="h-64 bg-secondary-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="rounded-lg border border-secondary-200 p-6 space-y-4">
          <div className="h-6 w-48 bg-secondary-200 rounded animate-pulse" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 w-32 bg-secondary-200 rounded animate-pulse" />
                <div className="h-6 w-16 bg-secondary-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-600">No progress data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Dashboard</h1>
        <p className="text-secondary-600 mt-1">Welcome back, {user?.name}!</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-secondary-600">
              Active Goals
            </CardTitle>
            <Target className="h-4 w-4 text-primary-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.activeGoals}</div>
            <p className="text-xs text-secondary-500 mt-1">
              {progress.activeGoals > 0 ? "Keep going!" : "Set a new goal"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-secondary-600">
              Sessions This Month
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.sessionsThisMonth}</div>
            <p className="text-xs text-secondary-500 mt-1">Total sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-secondary-600">
              Practices Completed
            </CardTitle>
            <BookOpen className="h-4 w-4 text-primary-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.practicesCompleted}</div>
            <p className="text-xs text-secondary-500 mt-1">
              Avg score: {progress.averageScore}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-secondary-600">
              Improvement Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.improvementRate}%</div>
            <p className="text-xs text-secondary-500 mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/practice">
          <Button variant="outline" className="w-full h-auto py-6 flex flex-col items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <span>Start Practice</span>
          </Button>
        </Link>
        <Link href="/chat">
          <Button variant="outline" className="w-full h-auto py-6 flex flex-col items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            <span>Chat with AI</span>
          </Button>
        </Link>
        <Link href="/sessions">
          <Button variant="outline" className="w-full h-auto py-6 flex flex-col items-center gap-2">
            <Calendar className="h-6 w-6" />
            <span>View Sessions</span>
          </Button>
        </Link>
        <Link href="/goals">
          <Button variant="outline" className="w-full h-auto py-6 flex flex-col items-center gap-2">
            <Plus className="h-6 w-6" />
            <span>Set New Goal</span>
          </Button>
        </Link>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Learning Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progress.learningProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subject Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={progress.subjectDistribution}
                  dataKey="count"
                  nameKey="subject"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {progress.subjectDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Multi-Goal Progress */}
      {progress.goalsProgress && progress.goalsProgress.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Multi-Goal Progress</CardTitle>
              <Link href="/goals">
                <Button variant="outline" size="sm">
                  View All Goals
                </Button>
              </Link>
            </div>
            <p className="text-sm text-secondary-600 mt-1">
              Track your progress across all active goals
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {progress.goalsProgress
                .filter((g) => g.status === "active")
                .map((goal) => (
                  <GoalProgressCard key={goal.goalId} goal={goal} />
                ))}
              {progress.goalsProgress.filter((g) => g.status === "active").length === 0 && (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
                  <p className="text-secondary-600 mb-4">No active goals</p>
                  <Link href="/goals">
                    <Button variant="primary">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Goal
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goal Completion Milestones */}
      {progress.goalsProgress && progress.goalsProgress.some((g) => g.status === "completed") && (
        <Card className="border-success-200 bg-success-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success-600" />
              <CardTitle className="text-success-900">Recent Achievements</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {progress.goalsProgress
                .filter((g) => g.status === "completed")
                .slice(0, 3)
                .map((goal) => (
                  <div
                    key={goal.goalId}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-success-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-success-100 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-success-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900">{goal.subject}</p>
                        <p className="text-xs text-secondary-600">
                          Completed {goal.completedAt ? format(new Date(goal.completedAt), "MMM d, yyyy") : "recently"}
                        </p>
                      </div>
                    </div>
                    <Badge variant="success">100%</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Concept Mastery */}
      <Card>
        <CardHeader>
          <CardTitle>Concept Mastery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {progress.conceptMastery.slice(0, 5).map((concept, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{concept.concept}</span>
                  <Badge variant={concept.masteryLevel >= 80 ? "success" : concept.masteryLevel >= 60 ? "warning" : "error"}>
                    {concept.masteryLevel}%
                  </Badge>
                </div>
                <ProgressBar
                  value={concept.masteryLevel}
                  variant={concept.masteryLevel >= 80 ? "success" : concept.masteryLevel >= 60 ? "warning" : "error"}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface GoalProgressCardProps {
  goal: GoalProgress;
}

function GoalProgressCard({ goal }: GoalProgressCardProps) {
  const getProgressVariant = (progress: number) => {
    if (progress >= 80) return "success";
    if (progress >= 50) return "warning";
    return "error";
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${
      goal.isNearingCompletion 
        ? "border-primary-300 bg-primary-50" 
        : "border-secondary-200 bg-white"
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-secondary-900">{goal.subject}</h3>
            {goal.isNearingCompletion && (
              <Badge variant="warning" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Almost there!
              </Badge>
            )}
          </div>
          <p className="text-sm text-secondary-600">{goal.description}</p>
        </div>
        <Badge variant={getProgressVariant(goal.progress)}>
          {goal.progress}%
        </Badge>
      </div>

      <ProgressBar
        value={goal.progress}
        variant={getProgressVariant(goal.progress)}
        className="mb-3"
      />

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-secondary-500">Sessions</p>
          <p className="font-semibold text-secondary-900">{goal.sessionsCount}</p>
        </div>
        <div>
          <p className="text-secondary-500">Practices</p>
          <p className="font-semibold text-secondary-900">{goal.practicesCount}</p>
        </div>
        <div>
          <p className="text-secondary-500">Avg Score</p>
          <p className="font-semibold text-secondary-900">{goal.averageScore}%</p>
        </div>
      </div>

      {goal.targetDate && goal.daysUntilTarget !== null && (
        <div className="mt-3 pt-3 border-t border-secondary-200 flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-secondary-400" />
          <span className="text-secondary-600">
            {goal.daysUntilTarget > 0 
              ? `${goal.daysUntilTarget} days until target`
              : goal.daysUntilTarget === 0
              ? "Target date is today!"
              : `${Math.abs(goal.daysUntilTarget)} days past target`
            }
          </span>
        </div>
      )}
    </div>
  );
}

