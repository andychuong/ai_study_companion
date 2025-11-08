# AI Study Companion - System Architecture

**Document Version:** 1.0  
**Last Updated:** November 7, 2025  
**Status:** Production Ready

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Principles](#architecture-principles)
3. [Technology Stack](#technology-stack)
4. [System Architecture](#system-architecture)
5. [Database Architecture](#database-architecture)
6. [API Architecture](#api-architecture)
7. [Frontend Architecture](#frontend-architecture)
8. [Background Job Processing](#background-job-processing)
9. [Authentication & Authorization](#authentication--authorization)
10. [AI/ML Integration](#aiml-integration)
11. [Data Flow Diagrams](#data-flow-diagrams)
12. [Component Architecture](#component-architecture)
13. [Deployment Architecture](#deployment-architecture)
14. [Security Architecture](#security-architecture)
15. [Performance Considerations](#performance-considerations)
16. [Scalability Strategy](#scalability-strategy)

---

## System Overview

### Purpose
AI Study Companion is a full-stack educational platform that provides personalized learning experiences through AI-powered tutoring, practice generation, progress tracking, and intelligent routing to human tutors when needed.

### Core Capabilities
1. **Session Analysis** - Automated transcript analysis with concept extraction
2. **AI Chat Companion** - Conversational learning assistant
3. **Adaptive Practice** - GPT-4 generated practice problems
4. **Progress Tracking** - Multi-goal progress visualization
5. **Subject Suggestions** - AI-powered curriculum recommendations
6. **Engagement Nudges** - Proactive retention notifications
7. **Tutor Routing** - Intelligent human tutor intervention

### Architecture Style
- **Type:** Monolithic Full-Stack Application with Microservices-style Background Jobs
- **Pattern:** Model-View-Controller (MVC) + Event-Driven Architecture
- **Deployment:** Serverless (Vercel) + Background Workers (Inngest)

---

## Architecture Principles

### 1. Separation of Concerns
- Clear separation between frontend (UI), backend (API), and background jobs
- Modular component design with single responsibility
- Feature-based folder organization

### 2. Event-Driven Design
- Asynchronous processing for long-running tasks
- Event-based communication between services
- Non-blocking user experience

### 3. API-First Development
- RESTful API design
- Consistent error handling
- Type-safe data contracts

### 4. Security by Design
- JWT-based authentication
- Role-based access control (RBAC)
- Secure environment variable management

### 5. Scalability & Performance
- Serverless architecture for auto-scaling
- Database query optimization
- Client-side caching with React Query

---

## Technology Stack

### Frontend
```
├── Framework: Next.js 14 (App Router)
├── Language: TypeScript
├── UI Library: React 18
├── State Management: Zustand
├── Data Fetching: React Query (TanStack Query)
├── Forms: React Hook Form + Zod
├── Styling: Tailwind CSS
└── Icons: Lucide React
```

### Backend
```
├── Runtime: Node.js 20
├── Framework: Next.js API Routes
├── Language: TypeScript
├── Database: PostgreSQL (Neon)
├── ORM: Drizzle ORM
├── Authentication: JWT (jsonwebtoken)
└── Validation: Zod
```

### Background Jobs
```
├── Platform: Inngest
├── Functions: TypeScript
├── Execution: Event-driven
└── Scheduling: Cron + Event triggers
```

### AI/ML Services
```
├── Primary: OpenAI GPT-4 Turbo
├── Use Cases:
│   ├── Transcript Analysis
│   ├── Practice Problem Generation
│   ├── Subject Suggestions
│   ├── Engagement Nudges
│   └── Tutor Routing Analysis
```

### Development Tools
```
├── Package Manager: npm
├── Type Checking: TypeScript
├── Database Tools: Drizzle Kit
├── API Client: Axios
└── Date Handling: date-fns
```

### Deployment
```
├── Hosting: Vercel (Frontend + API)
├── Database: Neon (Serverless Postgres)
├── Background Jobs: Inngest Cloud
└── Environment: Production + Development
```

---

## System Architecture

### High-Level Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Next.js Frontend (React + TypeScript)                   │  │
│  │  - Pages (App Router)                                    │  │
│  │  - Components (UI + Feature)                             │  │
│  │  - State Management (Zustand)                            │  │
│  │  - Data Layer (React Query)                              │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                              ↓ HTTP/HTTPS
┌────────────────────────────────────────────────────────────────┐
│                       API GATEWAY LAYER                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Next.js API Routes                                      │  │
│  │  - RESTful Endpoints                                     │  │
│  │  - Authentication Middleware                             │  │
│  │  - Request Validation                                    │  │
│  │  - Error Handling                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                    ↓                           ↓
┌─────────────────────────────┐  ┌──────────────────────────────┐
│     DATABASE LAYER          │  │   BACKGROUND JOB LAYER       │
│  ┌────────────────────────┐ │  │  ┌─────────────────────────┐ │
│  │  PostgreSQL (Neon)     │ │  │  │  Inngest Functions      │ │
│  │  - Users               │ │  │  │  - Transcript Analysis  │ │
│  │  - Sessions            │ │  │  │  - Practice Generation  │ │
│  │  - Transcripts         │ │  │  │  - Engagement Nudges    │ │
│  │  - Goals               │ │  │  │  - Subject Suggestions  │ │
│  │  - Concepts            │ │  │  └─────────────────────────┘ │
│  │  - Practices           │ │  └──────────────────────────────┘
│  │  - Notifications       │ │                ↓
│  │  - Suggestions         │ │  ┌──────────────────────────────┐
│  └────────────────────────┘ │  │   EXTERNAL SERVICES          │
└─────────────────────────────┘  │  ┌─────────────────────────┐ │
                                 │  │  OpenAI GPT-4 API       │ │
                                 │  │  - Chat Completions     │ │
                                 │  │  - JSON Mode            │ │
                                 │  └─────────────────────────┘ │
                                 └──────────────────────────────┘
```

### Request Flow Patterns

#### 1. Synchronous API Request (e.g., Get Sessions)
```
Client → API Route → Database → API Route → Client
  (1)      (2)         (3)         (4)        (5)
```

#### 2. Asynchronous Background Job (e.g., Transcript Analysis)
```
Client → API Route → Inngest Event → Background Worker → Database
  (1)      (2)          (3)              (4)               (5)
                                           ↓
                                    OpenAI API (6)
```

#### 3. AI Chat Interaction
```
Client → API Route → OpenAI API → API Route → Client
  (1)      (2)         (3)           (4)        (5)
```

---

## Database Architecture

### Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    Users    │←──────┤ │  Sessions    │├──────→ │ Transcripts │
│             │  1:N    │              │   1:1   │             │
│ - id        │         │ - id         │         │ - id        │
│ - email     │         │ - studentId  │         │ - sessionId │
│ - name      │         │ - tutorId    │         │ - content   │
│ - role      │         │ - date       │         │ - source    │
│ - grade     │         │ - duration   │         │ - status    │
└─────────────┘         └──────────────┘         └─────────────┘
       │                       │
       │ 1:N                   │ 1:N
       │                       │
       ↓                       ↓
┌─────────────┐         ┌──────────────┐
│    Goals    │         │  Concepts    │
│             │         │              │
│ - id        │         │ - id         │
│ - studentId │         │ - sessionId  │
│ - subject   │         │ - name       │
│ - progress  │         │ - mastery    │
│ - status    │         │ - difficulty │
└─────────────┘         └──────────────┘
       │                       │
       │ 1:N                   │ N:M
       │                       │
       ↓                       ↓
┌─────────────┐         ┌──────────────┐
│ Suggestions │         │  Practices   │
│             │         │              │
│ - id        │         │ - id         │
│ - studentId │         │ - sessionId  │
│ - subject   │         │ - status     │
│ - status    │         │ - problems   │
└─────────────┘         └──────────────┘
       │
       │ 1:N
       │
       ↓
┌──────────────┐
│Notifications │
│              │
│ - id         │
│ - studentId  │
│ - type       │
│ - message    │
│ - read       │
└──────────────┘
```

### Database Schema Details

#### Core Tables

**users**
- Primary user table for students and tutors
- Supports role-based access control (student/tutor/admin)
- Tracks student-specific data (grade, preferences)

**sessions**
- Links students to tutors for learning sessions
- Tracks temporal data (date, duration)
- Central entity for transcript and practice relationships

**transcripts**
- Stores raw session recordings
- Tracks processing status (pending/processing/completed/failed)
- Maintains source information for auditing

**concepts**
- Extracted learning concepts from sessions
- Tracks mastery levels (0-100)
- Includes difficulty ratings for adaptive learning

**goals**
- Student-defined learning objectives
- Progress tracking (0-100%)
- Status management (active/completed/abandoned)

**practices**
- AI-generated practice problem sets
- JSON-based problem storage
- Tracks completion and scoring

**subjectSuggestions**
- AI-recommended next learning paths
- Relevance scoring
- Value proposition for student engagement

**notifications**
- In-app notification system
- Supports multiple notification types
- Urgency levels (low/medium/high)

### Data Relationships

- **Student → Sessions** (1:N) - One student has many sessions
- **Tutor → Sessions** (1:N) - One tutor conducts many sessions
- **Session → Transcript** (1:1) - Each session has one transcript
- **Session → Concepts** (1:N) - Session extracts multiple concepts
- **Student → Goals** (1:N) - Student tracks multiple goals
- **Goal → Suggestions** (1:N) - Completed goals generate suggestions
- **Student → Notifications** (1:N) - Student receives many notifications
- **Session → Practices** (1:N) - Session can have multiple practice sets
- **Concepts ↔ Practices** (N:M) - Practices target multiple concepts

### Indexing Strategy

```sql
-- Performance-critical indexes
CREATE INDEX idx_sessions_student ON sessions(student_id);
CREATE INDEX idx_sessions_tutor ON sessions(tutor_id);
CREATE INDEX idx_sessions_date ON sessions(date);
CREATE INDEX idx_transcripts_status ON transcripts(analysis_status);
CREATE INDEX idx_goals_student_status ON goals(student_id, status);
CREATE INDEX idx_notifications_student_read ON notifications(student_id, read);
CREATE INDEX idx_concepts_session ON concepts(session_id);
CREATE INDEX idx_practices_session ON practices(session_id);
```

---

## API Architecture

### API Route Structure

```
/api
├── /auth
│   ├── /login                 POST   - User authentication
│   ├── /register             POST   - User registration
│   └── /refresh              POST   - Token refresh
├── /transcripts
│   ├── /upload               POST   - Upload session transcript
│   ├── /student/[id]         GET    - Get student's sessions
│   └── /[id]                 GET    - Get specific session
├── /practice
│   ├── /generate             POST   - Generate practice problems
│   ├── /[id]                 GET    - Get practice details
│   └── /[id]/submit          POST   - Submit practice answers
├── /goals
│   ├── /student/[id]         GET    - Get student goals
│   ├── /create               POST   - Create new goal
│   └── /[id]/complete        POST   - Mark goal complete
├── /suggestions
│   ├── /student/[id]         GET    - Get student suggestions
│   ├── /[id]/accept          POST   - Accept suggestion
│   └── /[id]/dismiss         POST   - Dismiss suggestion
├── /notifications
│   ├── /student/[id]         GET    - Get notifications
│   ├── /[id]/read            POST   - Mark as read
│   └── /student/[id]/read-all POST  - Mark all as read
├── /tutor
│   ├── /routing/analyze      POST   - Analyze routing needs
│   ├── /context/student/[id] GET    - Get student context
│   └── /list                 GET    - Get available tutors
├── /progress
│   └── /student/[id]         GET    - Get student progress
├── /chat
│   └── /message              POST   - Send chat message
└── /inngest                  GET/POST/PUT - Inngest webhook
```

### API Design Patterns

#### 1. RESTful Conventions
- **GET** - Retrieve resources
- **POST** - Create resources or trigger actions
- **PUT** - Update resources (full replacement)
- **PATCH** - Update resources (partial)
- **DELETE** - Remove resources

#### 2. Response Format
```typescript
// Success Response
{
  data: T,
  message?: string,
  metadata?: {
    page?: number,
    limit?: number,
    total?: number
  }
}

// Error Response
{
  error: string,
  details?: Record<string, any>,
  code?: string
}
```

#### 3. HTTP Status Codes
- **200** - OK (successful GET, PUT, PATCH)
- **201** - Created (successful POST)
- **204** - No Content (successful DELETE)
- **400** - Bad Request (validation error)
- **401** - Unauthorized (missing/invalid auth)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found (resource doesn't exist)
- **500** - Internal Server Error (unexpected error)

#### 4. Authentication Flow
```typescript
// All protected routes use middleware
requireAuth(req) → JWT validation → User context
requireStudent(req) → requireAuth → Role check (student)
requireTutor(req) → requireAuth → Role check (tutor)
```

#### 5. Error Handling Pattern
```typescript
// Centralized error handler
createApiHandler((req, res, context) => {
  // Route logic
  throw new NotFoundError('Resource');
  throw new ForbiddenError('Action');
  throw new ValidationError('Field');
}) → Error middleware → Formatted response
```

---

## Frontend Architecture

### Page Structure

```
app/
├── (auth)/
│   └── login/
│       └── page.tsx           - Login page (public)
├── (dashboard)/
│   ├── layout.tsx             - Authenticated layout
│   ├── dashboard/
│   │   └── page.tsx           - Main dashboard
│   ├── chat/
│   │   └── page.tsx           - AI chat interface
│   ├── sessions/
│   │   └── page.tsx           - Session history
│   ├── goals/
│   │   └── page.tsx           - Goal management
│   ├── suggestions/
│   │   └── page.tsx           - Subject suggestions
│   ├── notifications/
│   │   └── page.tsx           - Notification center
│   └── practice/
│       └── [id]/
│           └── page.tsx       - Practice problems
└── api/                       - API routes (see above)
```

### Component Structure

```
components/
├── ui/                        - Base UI components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── badge.tsx
│   ├── progress.tsx
│   └── skeleton.tsx
├── sessions/                  - Session feature
│   ├── SessionCard.tsx
│   ├── SessionDetailModal.tsx
│   └── UploadForm.tsx
├── goals/                     - Goals feature
│   ├── GoalCard.tsx
│   ├── CreateGoalForm.tsx
│   └── SuggestionsModal.tsx
├── tutor/                     - Tutor routing
│   └── TutorBookingModal.tsx
└── notifications/             - Notifications
    └── NotificationBell.tsx
```

### State Management Architecture

#### 1. Global State (Zustand)
```typescript
// Auth Store
- user: User | null
- isAuthenticated: boolean
- login(), logout()

// UI Store
- notifications: Notification[]
- addNotification()
- removeNotification()
```

#### 2. Server State (React Query)
```typescript
// Query Keys
['sessions', userId]
['goals', userId]
['suggestions', userId]
['notifications', userId]
['progress', userId]
['practices', practiceId]

// Mutations
useCreateGoal()
useCompleteGoal()
useUploadTranscript()
useGeneratePractice()
```

#### 3. Form State (React Hook Form)
```typescript
// Form validation with Zod
const schema = z.object({...})
const { register, handleSubmit } = useForm({
  resolver: zodResolver(schema)
})
```

### Data Flow Architecture

```
User Interaction
       ↓
Component Event Handler
       ↓
React Query Mutation / Zustand Action
       ↓
API Client (Axios)
       ↓
API Route
       ↓
Database / Inngest
       ↓
Response
       ↓
React Query Cache Update
       ↓
Component Re-render
```

---

## Background Job Processing

### Inngest Architecture

#### Event-Driven Job System
```
API Route → Inngest.send() → Event Bus → Worker Function → Execution
```

#### Job Functions

**1. Transcript Analysis**
- **Trigger:** `transcript.uploaded`
- **Purpose:** Extract concepts and calculate mastery
- **Steps:**
  1. Fetch transcript from database
  2. Send to GPT-4 for analysis
  3. Parse structured JSON response
  4. Store concepts in database
  5. Update transcript status

**2. Practice Generation**
- **Trigger:** `practice.generate`
- **Purpose:** Create adaptive practice problems
- **Steps:**
  1. Fetch session and concept data
  2. Determine difficulty levels
  3. Generate problems with GPT-4
  4. Store in database with answers
  5. Notify student

**3. Engagement Nudges**
- **Trigger:** Cron schedule (daily)
- **Purpose:** Re-engage inactive students
- **Steps:**
  1. Query students with <3 sessions
  2. Analyze activity patterns
  3. Generate personalized message with GPT-4
  4. Create notification with CTA
  5. Track engagement metrics

**4. Subject Suggestions**
- **Trigger:** `goal.completed`
- **Purpose:** Recommend next learning paths
- **Steps:**
  1. Fetch student's completed goals
  2. Analyze learning patterns
  3. Generate 5 related suggestions with GPT-4
  4. Score by relevance
  5. Store suggestions

### Job Configuration

```typescript
// Retry Strategy
{
  attempts: 3,
  backoff: {
    type: 'exponential',
    base: 2000 // 2s, 4s, 8s
  }
}

// Concurrency
{
  limit: 10 // Max parallel executions
}

// Timeout
{
  maxDuration: 300000 // 5 minutes
}
```

### Event Schema

```typescript
// transcript.uploaded
{
  data: {
    transcriptId: string,
    sessionId: string,
    studentId: string
  }
}

// practice.generate
{
  data: {
    sessionId: string,
    conceptIds: string[],
    difficulty: 'easy' | 'medium' | 'hard'
  }
}

// goal.completed
{
  data: {
    goalId: string,
    studentId: string,
    subject: string
  }
}
```

---

## Authentication & Authorization

### Authentication Flow

```
┌─────────┐                  ┌─────────┐                   ┌──────────┐
│ Client  │                  │   API   │                   │ Database │
└────┬────┘                  └────┬────┘                   └─────┬────┘
     │                            │                              │
     │ POST /api/auth/login       │                              │
     │ { email, password }        │                              │
     ├───────────────────────────→│                              │
     │                            │                              │
     │                            │ Validate credentials         │
     │                            ├─────────────────────────────→│
     │                            │                              │
     │                            │ User data                    │
     │                            │←─────────────────────────────┤
     │                            │                              │
     │                            │ Generate JWT                 │
     │                            │ (userId, role, exp)          │
     │                            │                              │
     │ { token, user }            │                              │
     │←───────────────────────────┤                              │
     │                            │                              │
     │ Store token in localStorage│                              │
     │                            │                              │
     │ GET /api/sessions/123      │                              │
     │ Authorization: Bearer token│                              │
     ├───────────────────────────→│                              │
     │                            │                              │
     │                            │ Verify JWT                   │
     │                            │ Extract userId               │
     │                            │                              │
     │                            │ Check permissions            │
     │                            │                              │
     │                            │ Fetch session data           │
     │                            ├─────────────────────────────→│
     │                            │                              │
     │                            │ Session data                 │
     │                            │←─────────────────────────────┤
     │                            │                              │
     │ Session data               │                              │
     │←───────────────────────────┤                              │
```

### JWT Token Structure

```typescript
{
  // Header
  alg: 'HS256',
  typ: 'JWT',
  
  // Payload
  userId: string,
  email: string,
  role: 'student' | 'tutor' | 'admin',
  iat: number,  // Issued at
  exp: number   // Expiration (7 days)
}
```

### Authorization Middleware

```typescript
// requireAuth - Base authentication
export async function requireAuth(req: NextRequest) {
  const token = extractToken(req);
  const user = verifyToken(token);
  return user;
}

// requireStudent - Student-only access
export async function requireStudent(req: NextRequest) {
  const user = await requireAuth(req);
  if (user.role !== 'student') {
    throw new ForbiddenError();
  }
  return user;
}

// requireTutor - Tutor-only access
export async function requireTutor(req: NextRequest) {
  const user = await requireAuth(req);
  if (user.role !== 'tutor') {
    throw new ForbiddenError();
  }
  return user;
}
```

### Permission Matrix

| Resource | Public | Student | Tutor | Admin |
|----------|--------|---------|-------|-------|
| Login | Yes | Yes | Yes | Yes |
| Own Sessions | No | Yes | Yes | Yes |
| All Sessions | No | No | No | Yes |
| Upload Transcript | No | Yes | Yes | Yes |
| Own Goals | No | Yes | No | Yes |
| Own Practices | No | Yes | No | Yes |
| Student Context | No | No | Yes | Yes |
| Generate Practice | No | Yes | Yes | Yes |
| AI Chat | No | Yes | No | Yes |

---

## AI/ML Integration

### OpenAI Integration Architecture

```
Application Layer
       ↓
OpenAI Client (lib/openai/client.ts)
       ↓
GPT-4 Turbo API
       ↓
Response Processing
       ↓
Database Storage
```

### AI Functions

#### 1. Transcript Analysis
```typescript
// Input: Raw transcript text
// Output: Structured concept data
{
  concepts: [
    {
      name: string,
      description: string,
      mastery_level: number,
      difficulty: string,
      key_points: string[]
    }
  ],
  topics: string[],
  summary: string
}
```

#### 2. Practice Generation
```typescript
// Input: Concepts, difficulty level
// Output: Practice problems
{
  problems: [
    {
      question: string,
      type: 'multiple_choice' | 'short_answer' | 'problem_solving',
      options?: string[],
      correctAnswer: string,
      explanation: string,
      difficulty: string,
      conceptId: string
    }
  ]
}
```

#### 3. Subject Suggestions
```typescript
// Input: Completed goal, student history
// Output: Related subjects
{
  suggestions: [
    {
      subject: string,
      description: string,
      relevance_score: number,
      value_proposition: string,
      related_concepts: string[]
    }
  ]
}
```

#### 4. Engagement Nudges
```typescript
// Input: Student activity data
// Output: Personalized message
{
  message: string,
  subject: string,
  call_to_action: string,
  urgency: 'low' | 'medium' | 'high'
}
```

#### 5. Tutor Routing Analysis
```typescript
// Input: Chat history, practice results
// Output: Routing decision
{
  shouldRoute: boolean,
  reason: string,
  urgency: 'low' | 'medium' | 'high',
  recommendedTopic: string,
  estimatedDuration: number
}
```

### AI Prompt Engineering Patterns

#### 1. System Role Definition
```typescript
const systemPrompt = `You are an expert educational AI assistant...`;
```

#### 2. Structured Output (JSON Mode)
```typescript
const completion = await chatCompletion(
  messages,
  {
    responseFormat: { type: 'json_object' },
    model: 'gpt-4-turbo-preview'
  }
);
```

#### 3. Context Window Management
- Limit context to recent interactions (last 10 messages)
- Summarize older conversations
- Include relevant student data

#### 4. Temperature Control
- **Analysis tasks:** 0.3 (deterministic)
- **Content generation:** 0.7 (creative)
- **Chat responses:** 0.5 (balanced)

---

## Data Flow Diagrams

### 1. Session Upload & Analysis Flow

```
Student uploads transcript
         ↓
API validates and stores transcript
         ↓
Inngest event triggered: transcript.uploaded
         ↓
Background worker starts
         ↓
Fetch transcript from database
         ↓
Send to GPT-4 for analysis
         ↓
Parse structured response
         ↓
Store concepts in database
         ↓
Update transcript status: completed
         ↓
Student sees analyzed session
```

### 2. Practice Generation Flow

```
Student clicks "Generate Practice"
         ↓
API validates session/concepts
         ↓
Inngest event triggered: practice.generate
         ↓
Background worker starts
         ↓
Fetch session + concept data
         ↓
Generate problems with GPT-4
         ↓
Store practice set in database
         ↓
Create notification for student
         ↓
Student receives notification
         ↓
Student views practice problems
```

### 3. Goal Completion & Suggestion Flow

```
Student marks goal complete
         ↓
API updates goal status
         ↓
Inngest event triggered: goal.completed
         ↓
Background worker starts
         ↓
Fetch student's learning history
         ↓
Generate 5 suggestions with GPT-4
         ↓
Store suggestions in database
         ↓
Check for pending suggestions
         ↓
Show suggestions modal
         ↓
Student accepts/dismisses
         ↓
Create new goal (if accepted)
```

### 4. AI Chat Flow

```
Student types message
         ↓
Frontend sends to /api/chat/message
         ↓
Backend fetches conversation history
         ↓
Add student's message to context
         ↓
Send to GPT-4 Chat Completion API
         ↓
Receive AI response
         ↓
Store both messages in context
         ↓
Return response to frontend
         ↓
Display in chat UI
         ↓
Check if tutor routing needed
```

---

## Component Architecture

### Design System Hierarchy

```
Atoms (Base UI)
  ├── Button
  ├── Input
  ├── Badge
  ├── Card
  └── Progress

Molecules (Composite UI)
  ├── CardHeader
  ├── CardContent
  ├── FormField
  └── LoadingSkeleton

Organisms (Feature Components)
  ├── SessionCard
  ├── GoalCard
  ├── NotificationBell
  └── UploadForm

Templates (Page Layouts)
  ├── DashboardLayout
  └── AuthLayout

Pages (Complete Views)
  ├── DashboardPage
  ├── SessionsPage
  ├── GoalsPage
  └── ChatPage
```

### Component Patterns

#### 1. Compound Components
```typescript
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

#### 2. Render Props
```typescript
<LoadingWrapper
  isLoading={isLoading}
  fallback={<Spinner />}
>
  {data => <Content data={data} />}
</LoadingWrapper>
```

#### 3. Higher-Order Components (HOCs)
```typescript
const withAuth = (Component) => {
  return (props) => {
    const { user } = useAuthStore();
    if (!user) return <Redirect />;
    return <Component {...props} />;
  };
};
```

#### 4. Custom Hooks
```typescript
// Data fetching
useGoals(studentId)
useSessions(studentId)
useNotifications(studentId)

// Mutations
useCreateGoal()
useCompleteGoal()
useUploadTranscript()

// UI state
useUIStore()
useAuthStore()
```

---

## Deployment Architecture

### Vercel Deployment

```
GitHub Repository (main branch)
         ↓
Automatic deployment trigger
         ↓
Vercel Build Process
  ├── Install dependencies (npm ci)
  ├── Type checking (tsc)
  ├── Build Next.js app (npm run build)
  └── Generate static assets
         ↓
Deploy to Vercel Edge Network
  ├── Serverless Functions (API routes)
  ├── Static Assets (CDN)
  └── Edge Functions (middleware)
         ↓
Production URL: https://your-app.vercel.app
```

### Environment Variables

#### Required (Production)
```env
# Database
DATABASE_URL=postgresql://...

# Authentication
JWT_SECRET=...

# OpenAI
OPENAI_API_KEY=sk-...

# Inngest
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...

# App
NEXT_PUBLIC_API_URL=https://your-app.vercel.app
NODE_ENV=production
```

#### Optional
```env
# Development
INNGEST_DEV_SERVER_URL=http://localhost:8288

# Monitoring
SENTRY_DSN=...
LOG_LEVEL=info
```

### Database Deployment (Neon)

```
Drizzle Schema Changes
         ↓
Generate migration
  $ npm run db:generate
         ↓
Review migration SQL
         ↓
Apply to staging database
  $ npm run db:migrate
         ↓
Test in staging environment
         ↓
Apply to production database
         ↓
Monitor for errors
```

### Inngest Deployment

```
Code changes to Inngest functions
         ↓
Deploy to Vercel
         ↓
Inngest auto-discovers functions
  via /api/inngest endpoint
         ↓
Functions registered in Inngest Cloud
         ↓
Ready to process events
```

---

## Security Architecture

### Security Layers

#### 1. Network Security
- **HTTPS Only** - All traffic encrypted with TLS
- **CORS Configuration** - Restricted origins
- **Rate Limiting** - API endpoint protection

#### 2. Authentication Security
- **JWT Tokens** - Short-lived (7 days)
- **Secure Storage** - HttpOnly cookies (production)
- **Token Validation** - Signature verification
- **Password Hashing** - bcrypt with salt

#### 3. Authorization Security
- **Role-Based Access Control (RBAC)**
- **Resource-Level Permissions**
- **Middleware Enforcement**

#### 4. Data Security
- **Input Validation** - Zod schema validation
- **SQL Injection Prevention** - Parameterized queries (Drizzle)
- **XSS Prevention** - React auto-escaping
- **Sensitive Data Encryption** - Environment variables

#### 5. API Security
- **Authentication Required** - Protected routes
- **Request Validation** - Input sanitization
- **Error Handling** - No stack traces in production
- **Logging** - Audit trail for sensitive operations

### Security Best Practices

1. **Never log sensitive data** (passwords, tokens)
2. **Validate all user inputs** (client + server)
3. **Use environment variables** for secrets
4. **Implement rate limiting** on public endpoints
5. **Regular dependency updates** (npm audit)
6. **Database backups** (automated via Neon)
7. **Error monitoring** (Sentry or similar)

---

## Performance Considerations

### Frontend Performance

#### 1. Code Splitting
- Automatic route-based splitting (Next.js)
- Dynamic imports for heavy components
- Lazy loading for modals and dialogs

#### 2. Caching Strategy
```typescript
// React Query cache configuration
{
  staleTime: 5 * 60 * 1000,  // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: false
}
```

#### 3. Image Optimization
- Next.js Image component
- Automatic WebP conversion
- Responsive image loading

#### 4. Bundle Optimization
- Tree shaking (automatic)
- Minification (production)
- Compression (gzip/brotli)

### Backend Performance

#### 1. Database Optimization
```sql
-- Index on frequently queried columns
CREATE INDEX idx_sessions_student ON sessions(student_id);

-- Avoid N+1 queries with proper joins
SELECT sessions.*, transcripts.content
FROM sessions
LEFT JOIN transcripts ON sessions.id = transcripts.session_id;
```

#### 2. Query Optimization
- Use `SELECT` specific columns (not `*`)
- Implement pagination
- Use database-level aggregations

#### 3. Caching
- React Query client-side cache
- Consider Redis for session data (future)

#### 4. API Optimization
- Minimize response payload size
- Use compression middleware
- Implement request debouncing

### Background Job Performance

#### 1. Concurrency Control
```typescript
{
  concurrency: {
    limit: 10, // Max parallel executions
    scope: 'account' // or 'function'
  }
}
```

#### 2. Batching
- Process multiple items in one execution
- Reduce API calls to OpenAI

#### 3. Error Handling
- Automatic retries with exponential backoff
- Dead letter queue for failed jobs

---

## Scalability Strategy

### Current Architecture (MVP)
- **Serverless functions** - Auto-scaling API routes
- **Managed database** - Neon serverless Postgres
- **Background jobs** - Inngest managed workers

### Scaling Considerations

#### Horizontal Scaling
- **API layer** - Automatic (Vercel serverless)
- **Background jobs** - Automatic (Inngest)
- **Database** - Neon connection pooling (requires configuration)

#### Vertical Scaling
- Database: Upgrade Neon plan for more resources
- API: Optimize code and queries
- Jobs: Increase concurrency limits

### Future Scaling Strategies

#### 1. Database Scaling
- **Read replicas** for read-heavy queries
- **Connection pooling** (PgBouncer)
- **Sharding** by student ID (if needed)

#### 2. Caching Layer
- **Redis** for session data
- **CDN** for static assets (already via Vercel)
- **Application-level** caching for expensive queries

#### 3. Microservices (Future)
- **AI Service** - Dedicated GPT-4 interaction service
- **Analytics Service** - Separate data warehouse
- **Notification Service** - Email/SMS integration

#### 4. Monitoring & Observability
- **Application Performance Monitoring (APM)**
- **Database query monitoring**
- **Error tracking** (Sentry)
- **Usage analytics**

### Load Estimates

| Metric | Current | 100 Users | 1,000 Users | 10,000 Users |
|--------|---------|-----------|-------------|--------------|
| API Requests/day | ~100 | ~10K | ~100K | ~1M |
| Database Queries/day | ~500 | ~50K | ~500K | ~5M |
| Background Jobs/day | ~10 | ~1K | ~10K | ~100K |
| OpenAI API Calls/day | ~20 | ~2K | ~20K | ~200K |

### Cost Optimization

1. **Optimize OpenAI usage**
   - Cache common responses
   - Reduce token usage
   - Batch similar requests

2. **Database efficiency**
   - Regular index maintenance
   - Archive old data
   - Optimize queries

3. **Serverless optimization**
   - Reduce cold starts
   - Optimize function size
   - Use edge functions where possible

---

## Appendix

### Glossary

- **Serverless** - Cloud computing execution model where cloud provider manages infrastructure
- **ORM** - Object-Relational Mapping, translates between database and application objects
- **JWT** - JSON Web Token, secure authentication token
- **RBAC** - Role-Based Access Control, permissions by user role
- **SSR** - Server-Side Rendering
- **API Route** - Next.js server-side endpoint handler

### Technology Documentation Links

- [Next.js](https://nextjs.org/docs)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Inngest](https://www.inngest.com/docs)
- [OpenAI API](https://platform.openai.com/docs)
- [Vercel](https://vercel.com/docs)
- [Neon](https://neon.tech/docs)

### Architecture Decision Records (ADRs)

#### ADR-001: Why Next.js?
- Full-stack framework with excellent DX
- Built-in API routes eliminate need for separate backend
- Automatic code splitting and optimization
- Strong TypeScript support

#### ADR-002: Why Inngest for Background Jobs?
- Event-driven architecture fits async workflows
- Built-in retry and error handling
- Easy integration with serverless
- Visual debugging and monitoring

#### ADR-003: Why Zustand over Redux?
- Simpler API and less boilerplate
- Better TypeScript support
- Smaller bundle size
- Sufficient for our use case

#### ADR-004: Why React Query?
- Excellent server state management
- Built-in caching and refetching
- Optimistic updates support
- DevTools for debugging

---

**Document Maintenance:**
- Review architecture quarterly
- Update with major changes
- Document new patterns
- Archive deprecated approaches

**Last Reviewed:** November 7, 2025  
**Next Review:** February 7, 2026

