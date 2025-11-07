# Backend Product Requirements Document (PRD)
## AI Study Companion - Backend Architecture

**Version:** 1.0  
**Date:** November 2025  
**Status:** Draft  
**Hosting Platform:** Vercel (Serverless)

---

## 1. Executive Summary

### 1.1 Overview
This document specifies the backend architecture, APIs, data models, and infrastructure for the AI Study Companion application. The backend is designed to run on **Vercel's serverless platform**, leveraging Next.js API routes, serverless functions, and external services for persistent storage and AI processing.

### 1.2 Vercel Compatibility Assessment

#### ✅ **Compatible Features**
- REST API endpoints (Next.js API routes)
- Serverless functions for request handling
- OpenAI API integration (external calls)
- Vector database queries (Pinecone/Weaviate)
- Real-time chat via WebSockets (Vercel supports)
- Authentication (NextAuth.js, Clerk, etc.)
- Edge functions for low-latency responses

#### ⚠️ **Considerations & Solutions**
- **Long-running transcript analysis**: Vercel functions have 10s (free) / 60s (pro) timeout
  - **Solution**: Use background job queue (Inngest, Trigger.dev, or Vercel Cron + separate worker)
- **Database connections**: Serverless functions need connection pooling
  - **Solution**: Use serverless-optimized databases (Neon, Supabase, PlanetScale)
- **File storage**: Need persistent storage for transcripts
  - **Solution**: Vercel Blob Storage or AWS S3
- **Scheduled tasks**: Need cron jobs for nudges, analytics
  - **Solution**: Vercel Cron Jobs or Inngest scheduled functions

#### ✅ **Recommended Architecture**
```
Vercel (Next.js)
├── API Routes (Serverless Functions)
│   ├── /api/transcripts (ingestion)
│   ├── /api/chat (Q&A)
│   ├── /api/practice (generation)
│   └── /api/analytics
├── Background Jobs (Inngest/Trigger.dev)
│   ├── Transcript analysis
│   ├── Practice generation
│   └── Engagement nudges
└── External Services
    ├── Database (Neon/Supabase)
    ├── Vector DB (Pinecone)
    ├── OpenAI API
    └── Storage (Vercel Blob)
```

---

## 2. Backend Architecture

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel Platform                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Next.js Application                      │   │
│  │  ┌──────────────┐  ┌──────────────┐            │   │
│  │  │   Frontend   │  │  API Routes  │            │   │
│  │  │   (React)    │  │ (Serverless) │            │   │
│  │  └──────────────┘  └──────┬───────┘            │   │
│  └───────────────────────────┼──────────────────────┘   │
│                              │                           │
│  ┌───────────────────────────┴──────────────────────┐   │
│  │      Background Job Queue (Inngest)               │   │
│  │  - Transcript Analysis                            │   │
│  │  - Practice Generation                            │   │
│  │  - Engagement Nudges                              │   │
│  └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Database   │  │  Vector DB   │  │   Storage    │
│  (Neon/      │  │  (Pinecone)  │  │ (Vercel Blob)│
│  Supabase)   │  │              │  │              │
└──────┬───────┘  └──────┬───────┘  └──────────────┘
       │                 │
       └─────────┬───────┘
                 │
                 ▼
         ┌──────────────┐
         │  OpenAI API  │
         │  (External)  │
         └──────────────┘
```

### 2.2 Technology Stack

#### Core Platform
- **Hosting**: Vercel (Serverless)
- **Framework**: Next.js 14+ (App Router)
- **Runtime**: Node.js 18+ (Vercel Edge Runtime for low-latency)
- **Language**: TypeScript

#### Database & Storage
- **Primary Database**: Neon PostgreSQL (serverless-optimized) or Supabase
- **Caching**: Vercel KV (Redis) or Upstash Redis
- **Vector Database**: Pinecone (recommended) or Weaviate
- **File Storage**: Vercel Blob Storage or AWS S3
- **Connection Pooling**: PgBouncer (via Neon) or Supabase connection pooler

#### Background Jobs
- **Job Queue**: Inngest (Vercel-native) or Trigger.dev
- **Alternative**: Vercel Cron Jobs + separate worker service

#### AI Services
- **LLM**: OpenAI GPT-4 Turbo / GPT-3.5 Turbo
- **Embeddings**: OpenAI text-embedding-3-large
- **API Client**: OpenAI Node.js SDK

#### Authentication & Security
- **Auth**: NextAuth.js v5 or Clerk
- **API Security**: API keys, JWT tokens
- **Rate Limiting**: Vercel Edge Config + Upstash Rate Limit

#### Monitoring & Logging
- **Logging**: Vercel Logs
- **Monitoring**: Vercel Analytics + Sentry
- **Error Tracking**: Sentry
- **Metrics**: Vercel Analytics

---

## 3. API Endpoints Specification

### 3.1 Authentication Endpoints

#### POST `/api/auth/login`
- **Purpose**: Student/tutor login
- **Method**: POST
- **Request Body**:
  ```json
  {
    "email": "student@example.com",
    "password": "password"
  }
  ```
- **Response**:
  ```json
  {
    "token": "jwt_token",
    "user": {
      "id": "user_id",
      "email": "student@example.com",
      "role": "student"
    }
  }
  ```

#### POST `/api/auth/register`
- **Purpose**: New user registration
- **Method**: POST
- **Request Body**:
  ```json
  {
    "email": "student@example.com",
    "password": "password",
    "name": "John Doe",
    "role": "student",
    "grade": 10
  }
  ```

#### POST `/api/auth/refresh`
- **Purpose**: Refresh authentication token
- **Method**: POST

### 3.2 Transcript Management Endpoints

#### POST `/api/transcripts/upload`
- **Purpose**: Upload session transcript
- **Method**: POST
- **Request Body**:
  ```json
  {
    "studentId": "student_id",
    "tutorId": "tutor_id",
    "sessionDate": "2025-11-15T10:00:00Z",
    "duration": 3600,
    "transcript": "Full transcript text...",
    "transcriptSource": "read_ai",
    "transcriptFormat": "plain_text"
  }
  ```
- **Response**:
  ```json
  {
    "sessionId": "session_id",
    "status": "processing",
    "message": "Transcript uploaded, analysis in progress"
  }
  ```
- **Background Job**: Triggers transcript analysis job

#### GET `/api/transcripts/:sessionId`
- **Purpose**: Get session transcript and analysis
- **Method**: GET
- **Response**:
  ```json
  {
    "sessionId": "session_id",
    "transcript": "Full transcript...",
    "analysis": {
      "topics": ["Chemistry", "Acid-Base Reactions"],
      "concepts": [
        {
          "name": "pH Scale",
          "difficulty": 7,
          "masteryLevel": 65
        }
      ],
      "studentStrengths": ["Problem-solving"],
      "areasForImprovement": ["Conceptual understanding"],
      "actionItems": ["Practice pH calculations"]
    },
    "status": "completed"
  }
  ```

#### GET `/api/transcripts/student/:studentId`
- **Purpose**: Get all transcripts for a student
- **Method**: GET
- **Query Parameters**: `?limit=10&offset=0`
- **Response**:
  ```json
  {
    "sessions": [
      {
        "sessionId": "session_id",
        "date": "2025-11-15T10:00:00Z",
        "subject": "Chemistry",
        "topics": ["Acid-Base Reactions"],
        "status": "completed"
      }
    ],
    "total": 25,
    "limit": 10,
    "offset": 0
  }
  ```

### 3.3 Conversational Q&A Endpoints

#### POST `/api/chat/message`
- **Purpose**: Send message to AI companion
- **Method**: POST
- **Request Body**:
  ```json
  {
    "studentId": "student_id",
    "message": "What is pH?",
    "conversationId": "conversation_id" // optional, for multi-turn
  }
  ```
- **Response**:
  ```json
  {
    "messageId": "message_id",
    "response": "pH is a measure of how acidic or basic a solution is...",
    "conversationId": "conversation_id",
    "suggestTutor": false,
    "confidence": 0.95,
    "sources": [
      {
        "sessionId": "session_id",
        "relevance": 0.92,
        "excerpt": "We discussed pH in your Chemistry session..."
      }
    ]
  }
  ```
- **Processing**: RAG query → OpenAI API → Response generation

#### GET `/api/chat/conversation/:conversationId`
- **Purpose**: Get conversation history
- **Method**: GET
- **Response**:
  ```json
  {
    "conversationId": "conversation_id",
    "studentId": "student_id",
    "messages": [
      {
        "role": "user",
        "content": "What is pH?",
        "timestamp": "2025-11-15T10:00:00Z"
      },
      {
        "role": "assistant",
        "content": "pH is a measure...",
        "timestamp": "2025-11-15T10:00:01Z"
      }
    ],
    "createdAt": "2025-11-15T10:00:00Z",
    "updatedAt": "2025-11-15T10:05:00Z"
  }
  ```

#### POST `/api/chat/conversation`
- **Purpose**: Create new conversation
- **Method**: POST
- **Request Body**:
  ```json
  {
    "studentId": "student_id"
  }
  ```

### 3.4 Practice Management Endpoints

#### POST `/api/practice/generate`
- **Purpose**: Generate practice problems for a session
- **Method**: POST
- **Request Body**:
  ```json
  {
    "studentId": "student_id",
    "sessionId": "session_id",
    "conceptIds": ["concept_id_1", "concept_id_2"] // optional
  }
  ```
- **Response**:
  ```json
  {
    "practiceId": "practice_id",
    "status": "generating",
    "message": "Practice problems are being generated"
  }
  ```
- **Background Job**: Triggers practice generation job

#### GET `/api/practice/:practiceId`
- **Purpose**: Get practice problems
- **Method**: GET
- **Response**:
  ```json
  {
    "practiceId": "practice_id",
    "studentId": "student_id",
    "sessionId": "session_id",
    "status": "ready",
    "questions": [
      {
        "questionId": "q1",
        "question": "What is the pH of a solution with [H+] = 0.001 M?",
        "type": "multiple_choice",
        "options": ["1", "2", "3", "4"],
        "difficulty": 5,
        "conceptId": "concept_id"
      }
    ],
    "assignedAt": "2025-11-15T10:00:00Z",
    "dueAt": "2025-11-16T10:00:00Z"
  }
  ```

#### POST `/api/practice/:practiceId/submit`
- **Purpose**: Submit practice answers
- **Method**: POST
- **Request Body**:
  ```json
  {
    "answers": [
      {
        "questionId": "q1",
        "answer": "3"
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "practiceId": "practice_id",
    "score": 80,
    "totalQuestions": 5,
    "correctAnswers": 4,
    "feedback": [
      {
        "questionId": "q1",
        "correct": true,
        "feedback": "Great job! You correctly identified..."
      }
    ],
    "masteryUpdate": {
      "conceptId": "concept_id",
      "newMasteryLevel": 75
    }
  }
  ```

#### GET `/api/practice/student/:studentId`
- **Purpose**: Get all practices for a student
- **Method**: GET
- **Query Parameters**: `?status=assigned|completed&limit=10`

### 3.5 Goal & Progress Endpoints

#### GET `/api/goals/student/:studentId`
- **Purpose**: Get student goals
- **Method**: GET
- **Response**:
  ```json
  {
    "goals": [
      {
        "goalId": "goal_id",
        "subject": "Chemistry",
        "description": "Master acid-base reactions",
        "status": "active",
        "progress": 65,
        "createdAt": "2025-10-01T00:00:00Z",
        "targetDate": "2025-12-31T00:00:00Z"
      }
    ]
  }
  ```

#### POST `/api/goals`
- **Purpose**: Create new goal
- **Method**: POST
- **Request Body**:
  ```json
  {
    "studentId": "student_id",
    "subject": "Chemistry",
    "description": "Master acid-base reactions",
    "targetDate": "2025-12-31T00:00:00Z"
  }
  ```

#### PUT `/api/goals/:goalId/complete`
- **Purpose**: Mark goal as completed
- **Method**: PUT
- **Background Job**: Triggers subject suggestion generation

#### GET `/api/progress/student/:studentId`
- **Purpose**: Get comprehensive progress dashboard
- **Method**: GET
- **Response**:
  ```json
  {
    "studentId": "student_id",
    "overallProgress": {
      "sessionsCompleted": 12,
      "practicesCompleted": 45,
      "averageScore": 78,
      "improvementRate": 15
    },
    "goals": [
      {
        "goalId": "goal_id",
        "progress": 65,
        "status": "active"
      }
    ],
    "concepts": [
      {
        "conceptId": "concept_id",
        "name": "pH Scale",
        "masteryLevel": 75,
        "lastPracticed": "2025-11-15T10:00:00Z"
      }
    ],
    "recentActivity": [
      {
        "type": "practice",
        "date": "2025-11-15T10:00:00Z",
        "score": 85
      }
    ]
  }
  ```

### 3.6 Subject Suggestions Endpoints

#### GET `/api/suggestions/student/:studentId`
- **Purpose**: Get subject suggestions (after goal completion)
- **Method**: GET
- **Response**:
  ```json
  {
    "suggestions": [
      {
        "subject": "Physics",
        "description": "Build on your Chemistry knowledge",
        "relevanceScore": 9.2,
        "valueProposition": "Physics complements Chemistry and opens doors to STEM careers",
        "relatedConcepts": ["Energy", "Forces"]
      }
    ],
    "triggeredBy": {
      "completedGoal": "Chemistry Mastery",
      "completedAt": "2025-11-15T10:00:00Z"
    }
  }
  ```

#### POST `/api/suggestions/:suggestionId/accept`
- **Purpose**: Accept a subject suggestion (creates new goal)
- **Method**: POST

### 3.7 Tutor Routing Endpoints

#### POST `/api/tutor/routing/analyze`
- **Purpose**: Analyze if student needs tutor session
- **Method**: POST
- **Request Body**:
  ```json
  {
    "studentId": "student_id",
    "context": {
      "recentConversations": ["conversation_id"],
      "practiceResults": ["practice_id"],
      "currentQuestion": "What is pH?" // optional
    }
  }
  ```
- **Response**:
  ```json
  {
    "shouldRoute": true,
    "reason": "Student showing frustration with repeated incorrect answers",
    "recommendedTopic": "pH Scale and Acid-Base Reactions",
    "urgency": "medium",
    "tutorContext": {
      "summary": "Student has been struggling with pH calculations...",
      "focusAreas": ["pH calculations", "Acid-base theory"],
      "studentStrengths": ["Problem-solving approach"]
    }
  }
  ```

#### GET `/api/tutor/context/:studentId`
- **Purpose**: Get context summary for tutor before session
- **Method**: GET
- **Query Parameters**: `?topic=Chemistry`
- **Response**:
  ```json
  {
    "studentId": "student_id",
    "studentProfile": {
      "name": "John Doe",
      "grade": 10,
      "learningStyle": "visual"
    },
    "recentSessions": [...],
    "currentChallenges": ["pH calculations"],
    "recommendedFocus": ["Acid-base reactions", "pH scale"],
    "studentStrengths": ["Problem-solving"],
    "practiceHistory": [...]
  }
  ```

### 3.8 Engagement & Notifications Endpoints

#### GET `/api/engagement/nudges/pending`
- **Purpose**: Get pending engagement nudges (for cron job)
- **Method**: GET
- **Query Parameters**: `?date=2025-11-15`
- **Response**:
  ```json
  {
    "nudges": [
      {
        "studentId": "student_id",
        "type": "early_engagement",
        "message": "Continue your momentum in Chemistry!",
        "urgency": "medium"
      }
    ]
  }
  ```

#### POST `/api/engagement/nudges/send`
- **Purpose**: Send engagement nudge (internal, called by cron)
- **Method**: POST
- **Request Body**:
  ```json
  {
    "studentId": "student_id",
    "type": "early_engagement"
  }
  ```

### 3.9 Analytics Endpoints

#### GET `/api/analytics/learning-improvements/:studentId`
- **Purpose**: Get learning improvement metrics
- **Method**: GET
- **Query Parameters**: `?startDate=2025-10-01&endDate=2025-11-15`
- **Response**:
  ```json
  {
    "studentId": "student_id",
    "period": {
      "start": "2025-10-01",
      "end": "2025-11-15"
    },
    "metrics": {
      "averagePracticeScore": {
        "before": 65,
        "after": 78,
        "improvement": 20
      },
      "sessionsCompleted": 12,
      "conceptsMastered": 8,
      "engagementRate": 85
    },
    "trends": {
      "practiceScores": [65, 68, 72, 75, 78],
      "dates": ["2025-10-01", "2025-10-15", "2025-11-01", "2025-11-08", "2025-11-15"]
    }
  }
  ```

#### GET `/api/analytics/dashboard`
- **Purpose**: Get admin dashboard analytics
- **Method**: GET
- **Query Parameters**: `?startDate=2025-10-01&endDate=2025-11-15`
- **Response**:
  ```json
  {
    "overview": {
      "totalStudents": 1250,
      "activeStudents": 980,
      "totalSessions": 5420,
      "averageSessionsPerStudent": 4.3
    },
    "engagement": {
      "dailyActiveUsers": 450,
      "weeklyActiveUsers": 980,
      "practiceCompletionRate": 72
    },
    "retention": {
      "churnRate": 28,
      "goalCompletionRate": 65,
      "subjectSuggestionAcceptance": 32
    }
  }
  ```

---

## 4. Data Models

### 4.1 Database Schema (PostgreSQL)

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'tutor', 'admin')),
  grade INTEGER, -- for students
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

#### Students Table (Extended Profile)
```sql
CREATE TABLE students (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  grade INTEGER,
  learning_style VARCHAR(50),
  interests TEXT[],
  strengths TEXT[],
  preferences JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Sessions Table
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  tutor_id UUID NOT NULL REFERENCES users(id),
  session_date TIMESTAMP NOT NULL,
  duration INTEGER NOT NULL, -- seconds
  transcript TEXT NOT NULL,
  transcript_source VARCHAR(50) NOT NULL,
  transcript_format VARCHAR(50) NOT NULL,
  analysis_status VARCHAR(50) DEFAULT 'pending',
  analysis_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_student_id ON sessions(student_id);
CREATE INDEX idx_sessions_tutor_id ON sessions(tutor_id);
CREATE INDEX idx_sessions_date ON sessions(session_date);
CREATE INDEX idx_sessions_status ON sessions(analysis_status);
```

#### Concepts Table
```sql
CREATE TABLE concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  description TEXT,
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 10),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_concepts_subject ON concepts(subject);
```

#### Student Concepts (Mastery Tracking)
```sql
CREATE TABLE student_concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  concept_id UUID NOT NULL REFERENCES concepts(id),
  mastery_level INTEGER DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 100),
  last_practiced TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, concept_id)
);

CREATE INDEX idx_student_concepts_student ON student_concepts(student_id);
CREATE INDEX idx_student_concepts_concept ON student_concepts(concept_id);
```

#### Goals Table
```sql
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  subject VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  target_date TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_goals_student ON goals(student_id);
CREATE INDEX idx_goals_status ON goals(status);
```

#### Practices Table
```sql
CREATE TABLE practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  session_id UUID REFERENCES sessions(id),
  status VARCHAR(50) DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed')),
  questions JSONB NOT NULL,
  answers JSONB,
  score INTEGER,
  assigned_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  due_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_practices_student ON practices(student_id);
CREATE INDEX idx_practices_status ON practices(status);
CREATE INDEX idx_practices_due ON practices(due_at);
```

#### Conversations Table
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversations_student ON conversations(student_id);
```

#### Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at);
```

#### Subject Suggestions Table
```sql
CREATE TABLE subject_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  completed_goal_id UUID REFERENCES goals(id),
  subject VARCHAR(100) NOT NULL,
  description TEXT,
  relevance_score DECIMAL(3,1),
  value_proposition TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'dismissed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_suggestions_student ON subject_suggestions(student_id);
CREATE INDEX idx_suggestions_status ON subject_suggestions(status);
```

### 4.2 Vector Database Schema (Pinecone)

#### Collection: `session-transcripts`
- **Dimensions**: 1536 (text-embedding-3-large)
- **Metadata**:
  - `studentId`: string
  - `sessionId`: string
  - `date`: timestamp
  - `subject`: string
  - `topics`: string[]
  - `concepts`: string[]

#### Collection: `concept-knowledge`
- **Dimensions**: 1536
- **Metadata**:
  - `conceptId`: string
  - `subject`: string
  - `difficulty`: number
  - `gradeLevel`: number

#### Collection: `practice-problems`
- **Dimensions**: 1536
- **Metadata**:
  - `practiceId`: string
  - `conceptId`: string
  - `difficulty`: number
  - `questionType`: string
  - `studentId`: string

#### Collection: `student-history`
- **Dimensions**: 1536
- **Metadata**:
  - `studentId`: string
  - `eventType`: string (session, practice, qa)
  - `timestamp`: timestamp
  - `subject`: string

---

## 5. Background Jobs Specification

### 5.1 Job: Transcript Analysis

#### Trigger
- Event: `transcript.uploaded`
- Source: POST `/api/transcripts/upload`

#### Processing Steps
1. Parse and normalize transcript format
2. Chunk transcript into 500-token segments
3. Generate embeddings for each chunk (OpenAI)
4. Store chunks in Pinecone vector DB
5. Extract insights using GPT-4 Turbo:
   - Topics covered
   - Concepts taught
   - Student strengths/weaknesses
   - Action items
6. Store extracted data in PostgreSQL
7. Update student concept mastery levels
8. Trigger practice generation job

#### Implementation (Inngest)
```typescript
import { inngest } from "@/lib/inngest";

export const analyzeTranscript = inngest.createFunction(
  { id: "analyze-transcript" },
  { event: "transcript.uploaded" },
  async ({ event, step }) => {
    const { sessionId, transcript } = event.data;
    
    // Step 1: Parse transcript
    const parsed = await step.run("parse-transcript", async () => {
      return parseTranscript(transcript);
    });
    
    // Step 2: Generate embeddings
    const embeddings = await step.run("generate-embeddings", async () => {
      return generateEmbeddings(parsed.chunks);
    });
    
    // Step 3: Store in vector DB
    await step.run("store-vectors", async () => {
      return storeInPinecone(embeddings, sessionId);
    });
    
    // Step 4: Extract insights
    const insights = await step.run("extract-insights", async () => {
      return extractInsightsWithGPT4(transcript);
    });
    
    // Step 5: Store in database
    await step.run("store-insights", async () => {
      return storeInsights(sessionId, insights);
    });
    
    // Step 6: Trigger practice generation
    await step.sendEvent("practice.generate", {
      name: "practice.generate",
      data: { sessionId, studentId: event.data.studentId }
    });
  }
);
```

### 5.2 Job: Practice Generation

#### Trigger
- Event: `practice.generate`
- Source: After transcript analysis or manual request

#### Processing Steps
1. Retrieve session data and concepts
2. Get student profile and mastery levels
3. Calculate target difficulty
4. Generate practice problems using GPT-4 Turbo
5. Store practice in PostgreSQL
6. Send notification to student

#### Implementation
```typescript
export const generatePractice = inngest.createFunction(
  { id: "generate-practice" },
  { event: "practice.generate" },
  async ({ event, step }) => {
    const { sessionId, studentId } = event.data;
    
    const session = await step.run("get-session", async () => {
      return getSession(sessionId);
    });
    
    const student = await step.run("get-student", async () => {
      return getStudentProfile(studentId);
    });
    
    const practice = await step.run("generate-practice", async () => {
      return generatePracticeWithGPT4(session, student);
    });
    
    await step.run("store-practice", async () => {
      return storePractice(practice);
    });
    
    await step.run("notify-student", async () => {
      return sendNotification(studentId, "Practice assigned!");
    });
  }
);
```

### 5.3 Job: Engagement Nudges

#### Trigger
- Schedule: Daily at 9 AM (Vercel Cron or Inngest schedule)
- Logic: Find students with <3 sessions by Day 7

#### Processing Steps
1. Query students matching criteria
2. Generate personalized nudge message (GPT-4)
3. Send notification (email/SMS)
4. Track nudge in database

#### Implementation
```typescript
export const sendEngagementNudges = inngest.createFunction(
  { id: "send-engagement-nudges" },
  { cron: "0 9 * * *" }, // Daily at 9 AM
  async ({ step }) => {
    const students = await step.run("find-students", async () => {
      return findStudentsNeedingNudge();
    });
    
    for (const student of students) {
      await step.run(`nudge-${student.id}`, async () => {
        const message = await generateNudgeMessage(student);
        await sendNotification(student.id, message);
        await trackNudge(student.id);
      });
    }
  }
);
```

### 5.4 Job: Subject Suggestions

#### Trigger
- Event: `goal.completed`
- Source: PUT `/api/goals/:goalId/complete`

#### Processing Steps
1. Get completed goal details
2. Retrieve student profile and history
3. Generate suggestions using GPT-4 Turbo
4. Store suggestions in database
5. Send notification to student

---

## 6. Integration Specifications

### 6.1 OpenAI API Integration

#### Configuration
- **API Key**: Stored in Vercel Environment Variables
- **Client**: OpenAI Node.js SDK
- **Models**:
  - GPT-4 Turbo: Complex tasks
  - GPT-3.5 Turbo: Simple tasks, fallback
  - text-embedding-3-large: Embeddings

#### Implementation
```typescript
// lib/openai.ts
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: text,
  });
  return response.data[0].embedding;
}

export async function chatCompletion(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  options?: { model?: string; temperature?: number; maxTokens?: number }
) {
  return openai.chat.completions.create({
    model: options?.model || "gpt-4-turbo-preview",
    messages,
    temperature: options?.temperature || 0.7,
    max_tokens: options?.maxTokens || 500,
  });
}
```

### 6.2 Pinecone Integration

#### Configuration
- **API Key**: Vercel Environment Variables
- **Environment**: Production index
- **Dimension**: 1536

#### Implementation
```typescript
// lib/pinecone.ts
import { Pinecone } from "@pinecone-database/pinecone";

export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export const index = pinecone.index("study-companion");

export async function upsertVectors(
  vectors: Array<{
    id: string;
    values: number[];
    metadata: Record<string, any>;
  }>
) {
  await index.upsert(vectors);
}

export async function queryVectors(
  embedding: number[],
  topK: number = 5,
  filter?: Record<string, any>
) {
  return index.query({
    vector: embedding,
    topK,
    includeMetadata: true,
    filter,
  });
}
```

### 6.3 Database Integration (Neon/Supabase)

#### Connection Pooling
- Use serverless-optimized connection pooler
- Neon: Built-in connection pooling
- Supabase: Supabase connection pooler

#### Implementation
```typescript
// lib/db.ts
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1, // Serverless-friendly: 1 connection per function
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
  getClient: () => pool.connect(),
};
```

### 6.4 Vercel Blob Storage

#### Implementation
```typescript
// lib/storage.ts
import { put, get, del } from "@vercel/blob";

export async function storeTranscript(
  sessionId: string,
  transcript: string
): Promise<string> {
  const blob = await put(`transcripts/${sessionId}.txt`, transcript, {
    access: "private",
  });
  return blob.url;
}

export async function getTranscript(url: string): Promise<string> {
  const blob = await get(url);
  return await blob.text();
}
```

---

## 7. Security & Authentication

### 7.1 Authentication Strategy

#### Option 1: NextAuth.js v5
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        // Verify credentials against database
        const user = await verifyUser(credentials);
        return user;
      },
    }),
  ],
  session: { strategy: "jwt" },
};

export default NextAuth(authOptions);
```

#### Option 2: Clerk (Recommended for Vercel)
- Managed authentication service
- Built-in user management
- Easy integration with Vercel

### 7.2 API Security

#### Rate Limiting
```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

export async function rateLimit(identifier: string) {
  const { success } = await ratelimit.limit(identifier);
  return success;
}
```

#### API Key Validation
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey || !validateApiKey(apiKey)) {
    return new Response("Unauthorized", { status: 401 });
  }
}
```

### 7.3 Data Privacy

#### PII Handling
- Never include PII in OpenAI prompts (use IDs)
- Encrypt sensitive data at rest
- Use environment variables for secrets
- Implement data retention policies

---

## 8. Performance Optimization

### 8.1 Caching Strategy

#### Vercel KV (Redis) Caching
```typescript
// lib/cache.ts
import { kv } from "@vercel/kv";

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  const cached = await kv.get<T>(key);
  if (cached) return cached;
  
  const data = await fetcher();
  await kv.set(key, data, { ex: ttl });
  return data;
}
```

#### Cache Keys
- `student:${studentId}` - Student profile (TTL: 1 hour)
- `session:${sessionId}` - Session data (TTL: 24 hours)
- `practice:${practiceId}` - Practice problems (TTL: 1 hour)
- `conversation:${conversationId}` - Conversation history (TTL: 1 hour)

### 8.2 Database Query Optimization

#### Indexes
- All foreign keys indexed
- Frequently queried fields indexed
- Composite indexes for common query patterns

#### Query Patterns
- Use prepared statements
- Limit result sets with pagination
- Use SELECT only needed columns

### 8.3 API Response Optimization

#### Response Compression
- Enable gzip compression (Vercel automatic)
- Use JSON streaming for large responses
- Implement pagination for list endpoints

#### Edge Functions
- Use Vercel Edge Runtime for low-latency endpoints
- Cache responses at edge when possible

---

## 9. Monitoring & Logging

### 9.1 Logging Strategy

#### Vercel Logs
- Automatic logging for all API routes
- Structured logging with metadata
- Error tracking with stack traces

#### Implementation
```typescript
// lib/logger.ts
export function log(level: string, message: string, metadata?: any) {
  console.log(JSON.stringify({
    level,
    message,
    timestamp: new Date().toISOString(),
    ...metadata,
  }));
}
```

### 9.2 Error Tracking

#### Sentry Integration
```typescript
// lib/sentry.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV,
});
```

### 9.3 Metrics & Analytics

#### Vercel Analytics
- Automatic API route analytics
- Response time tracking
- Error rate monitoring

#### Custom Metrics
- Track OpenAI API usage and costs
- Monitor vector DB query performance
- Track background job success rates

---

## 10. Deployment & CI/CD

### 10.1 Vercel Deployment

#### Configuration (`vercel.json`)
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "DATABASE_URL": "@database-url",
    "OPENAI_API_KEY": "@openai-api-key",
    "PINECONE_API_KEY": "@pinecone-api-key"
  },
  "crons": [
    {
      "path": "/api/cron/engagement-nudges",
      "schedule": "0 9 * * *"
    }
  ]
}
```

#### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key
- `PINECONE_API_KEY` - Pinecone API key
- `NEXTAUTH_SECRET` - NextAuth secret
- `NEXTAUTH_URL` - Application URL
- `VERCEL_KV_REST_API_URL` - Vercel KV URL
- `VERCEL_KV_REST_API_TOKEN` - Vercel KV token

### 10.2 CI/CD Pipeline

#### GitHub Actions
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 11. Cost Estimation

### 11.1 Vercel Costs

#### Hobby Plan (Free)
- ✅ Unlimited serverless function executions
- ✅ 100GB bandwidth
- ✅ Edge Network
- ❌ Limited to 10s function timeout
- ❌ No cron jobs

#### Pro Plan ($20/user/month)
- ✅ 60s function timeout
- ✅ Cron jobs
- ✅ Unlimited bandwidth
- ✅ Team collaboration

#### Enterprise Plan (Custom)
- ✅ Custom timeouts
- ✅ Dedicated support
- ✅ SLA guarantees

### 11.2 Backend Infrastructure Costs

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| Vercel Pro | Per user | $20/user |
| Neon PostgreSQL | Starter | $0-19 (free tier available) |
| Pinecone | Starter | $70-700 (usage-based) |
| Vercel KV | Included | $0 (up to 256MB) |
| Vercel Blob | Included | $0.15/GB |
| Inngest | Free tier | $0 (up to 25K events) |
| **Total** | | **$90-800/month** |

### 11.3 OpenAI API Costs
- Same as main PRD: $812-1,625/month per 1,000 students

---

## 12. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Set up Next.js project with TypeScript
- [ ] Configure Vercel deployment
- [ ] Set up database (Neon/Supabase)
- [ ] Set up Pinecone vector DB
- [ ] Configure OpenAI API client
- [ ] Set up authentication (NextAuth/Clerk)
- [ ] Create database schema and migrations

### Phase 2: Core APIs (Week 3-4)
- [ ] Implement transcript upload endpoint
- [ ] Build transcript analysis background job
- [ ] Create conversational Q&A endpoint
- [ ] Implement RAG query system
- [ ] Build practice generation endpoint
- [ ] Create practice submission endpoint

### Phase 3: Advanced Features (Week 5-6)
- [ ] Implement goal management APIs
- [ ] Build progress tracking endpoints
- [ ] Create subject suggestion system
- [ ] Implement tutor routing logic
- [ ] Build engagement nudge system
- [ ] Create analytics endpoints

### Phase 4: Optimization & Polish (Week 7-8)
- [ ] Implement caching layer
- [ ] Add rate limiting
- [ ] Set up monitoring and logging
- [ ] Performance optimization
- [ ] Error handling improvements
- [ ] API documentation

---

## 13. Testing Strategy

### 13.1 Unit Tests
- Test individual API route handlers
- Test utility functions
- Test data transformation logic

### 13.2 Integration Tests
- Test API endpoints end-to-end
- Test database operations
- Test OpenAI API integration
- Test vector DB operations

### 13.3 E2E Tests
- Test complete user flows
- Test background job processing
- Test error scenarios

---

## 14. API Documentation

### 14.1 OpenAPI Specification
- Generate OpenAPI/Swagger docs
- Use tools like `swagger-jsdoc` or `next-swagger-doc`

### 14.2 Postman Collection
- Create Postman collection for all endpoints
- Include example requests/responses
- Add authentication setup

---

## 15. Appendix

### 15.1 Environment Variables Checklist
```
DATABASE_URL=
OPENAI_API_KEY=
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
VERCEL_KV_REST_API_URL=
VERCEL_KV_REST_API_TOKEN=
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
SENTRY_DSN=
```

### 15.2 Useful Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Inngest Documentation](https://www.inngest.com/docs)
- [Pinecone Documentation](https://docs.pinecone.io)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)

---

**Document Status**: Draft - Ready for Review

