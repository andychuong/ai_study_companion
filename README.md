# AI Study Companion

A comprehensive learning platform that bridges tutoring sessions with an AI companion, providing adaptive practice, conversational Q&A, and intelligent retention features.

## Features

### Core Features
- **Persistent AI Companion**: Remembers previous lessons and provides contextual help between sessions
- **Adaptive Practice**: Automatically generates practice problems based on student mastery levels
- **Conversational Q&A**: Natural language interface for asking questions about past lessons
- **Smart Tutor Routing**: Intelligently routes complex questions to human tutors
- **Session Analysis**: Automatically analyzes tutor session transcripts and extracts insights

### Retention Features
- **Goal Completion Suggestions**: Automatically suggests related subjects when goals are completed
- **Engagement Nudges**: Proactively nudges students with <3 sessions in their first week
- **Multi-Goal Progress Tracking**: Track progress across multiple goals simultaneously
- **Measurable Learning Improvements**: Data-driven analytics showing learning progress

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: Neon PostgreSQL (via Drizzle ORM)
- **Vector DB**: Pinecone (for RAG)
- **AI**: OpenAI (GPT-4 Turbo, GPT-3.5 Turbo, text-embedding-3-large)
- **Background Jobs**: Inngest
- **Authentication**: Custom JWT-based auth
- **Storage**: Vercel Blob Storage
- **Caching**: Vercel KV (Redis)
- **Rate Limiting**: Upstash Redis

## Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- Pinecone account
- OpenAI API key
- Vercel account (for deployment)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-study-companion
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables in `.env.local`:
   ```env
   # Database
   DATABASE_URL=postgresql://...
   
   # OpenAI
   OPENAI_API_KEY=sk-...
   
   # Pinecone
   PINECONE_API_KEY=...
   PINECONE_INDEX_NAME=study-companion
   
   # Inngest (optional for local dev)
   INNGEST_EVENT_KEY=...
   
   # Auth
   JWT_SECRET=...
   NEXTAUTH_SECRET=...
   NEXTAUTH_URL=http://localhost:3000
   
   # Vercel (optional)
   BLOB_READ_WRITE_TOKEN=...
   UPSTASH_REDIS_REST_URL=...
   UPSTASH_REDIS_REST_TOKEN=...
   ```

4. **Run database migrations**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. **Seed test data (optional)**
   ```bash
   npm run seed:comprehensive
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

## Project Structure

```
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (dashboard)/     # Dashboard pages
│   ├── api/             # API routes
│   │   ├── auth/        # Authentication endpoints
│   │   ├── chat/        # Chat API
│   │   ├── goals/       # Goals management
│   │   ├── practice/    # Practice problems
│   │   ├── progress/    # Progress tracking
│   │   ├── suggestions/ # Subject suggestions
│   │   └── transcripts/ # Transcript management
│   └── layout.tsx
├── components/           # React components
│   ├── chat/            # Chat components
│   ├── goals/           # Goal components
│   ├── sessions/        # Session components
│   └── ui/              # UI components
├── lib/
│   ├── db/              # Database client and schema
│   ├── openai/          # OpenAI client
│   ├── pinecone/        # Pinecone client
│   ├── inngest/         # Inngest functions
│   ├── auth/            # Authentication utilities
│   └── utils/           # Utility functions
├── scripts/             # Utility scripts
├── types/               # TypeScript types
└── drizzle/             # Database migrations
```

## Key Features Implementation

### AI Companion with RAG
- Session transcripts are analyzed and stored in Pinecone
- Chat queries relevant context using vector search
- Provides contextual answers based on previous sessions

### Adaptive Practice
- Practice problems generated based on student mastery levels
- Difficulty adjusts automatically as student improves
- Problems reinforce concepts from recent sessions

### Retention Features
- **Goal Completion Suggestions**: Triggers on goal completion, generates 5 related subject suggestions
- **Engagement Nudges**: Daily cron job identifies students with <3 sessions in first week
- **Multi-Goal Tracking**: Dashboard shows progress for all active goals

## API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh token

### Chat
- `POST /api/chat/message` - Send message to AI companion
- `GET /api/chat/conversation/:conversationId` - Get conversation history

### Practice
- `POST /api/practice/generate` - Generate practice problems
- `GET /api/practice/:practiceId` - Get practice problems
- `POST /api/practice/:practiceId/submit` - Submit practice answers

### Goals & Progress
- `GET /api/goals/student/:studentId` - Get student goals
- `POST /api/goals` - Create new goal
- `PUT /api/goals/:goalId/complete` - Mark goal as completed
- `GET /api/progress/student/:studentId` - Get progress dashboard

### Subject Suggestions
- `GET /api/suggestions/student/:studentId` - Get subject suggestions
- `POST /api/suggestions/:suggestionId/accept` - Accept suggestion

## Background Jobs (Inngest)

- **analyze-transcript**: Analyzes uploaded transcripts and extracts insights
- **generate-practice**: Generates adaptive practice problems
- **subject-suggestions**: Generates subject suggestions after goal completion
- **send-engagement-nudges**: Daily nudge for students with <3 sessions

## Development

### Running Locally
```bash
npm run dev
```

### Database Migrations
```bash
# Generate migration
npm run db:generate

# Run migration
npm run db:migrate

# Open Drizzle Studio
npm run db:studio
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

### Seeding Data
```bash
# Comprehensive seed (includes notifications)
npm run seed:comprehensive

# Basic seed
npm run seed
```

## Deployment

### Vercel Deployment

1. **Connect your repository to Vercel**
2. **Set environment variables** in Vercel dashboard
3. **Deploy**

```bash
vercel
```

### Required Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key
- `PINECONE_API_KEY` - Pinecone API key
- `PINECONE_INDEX_NAME` - Pinecone index name
- `JWT_SECRET` - JWT secret for authentication
- `NEXTAUTH_SECRET` - NextAuth secret
- `NEXTAUTH_URL` - Application URL

### Optional Environment Variables

- `INNGEST_EVENT_KEY` - Inngest event key (for background jobs)
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage token
- `UPSTASH_REDIS_REST_URL` - Upstash Redis URL (for rate limiting)
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) - System architecture
- [Contributing](./CONTRIBUTING.md) - Contribution guidelines

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## License

Private - All Rights Reserved

## Acknowledgments

Built with Next.js, OpenAI, Pinecone, and Inngest.
