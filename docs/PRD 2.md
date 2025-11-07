# Product Requirements Document (PRD)
## AI Study Companion

**Version:** 1.2  
**Date:** November 2025  
**Status:** Draft - Updated with Comprehensive OpenAI AI Implementation Plan

---

## 1. Executive Summary

### 1.1 Overview
The AI Study Companion is a persistent, intelligent tutoring assistant designed to bridge the gap between human tutoring sessions. It maintains continuity across sessions, provides adaptive practice, answers questions conversationally, and strategically guides students back to human tutors when needed.

### 1.2 Problem Statement
Current tutoring platforms face significant challenges:
- **52% churn rate** when students complete their primary learning goal
- Lack of continuity between tutoring sessions
- No adaptive practice assignments between sessions
- Limited progress tracking across multiple subjects/goals
- Students lose momentum after achieving initial objectives

### 1.3 Solution
An AI-powered companion that integrates with existing tutoring session transcripts (from Read.ai, meeting transcripts, or similar text-based sources) to:
- Review and analyze tutoring session transcripts to extract key learning points
- Remember previous lessons and context across sessions
- Provide adaptive practice exercises between tutoring sessions
- Engage in conversational Q&A based on session content
- Proactively suggest related subjects to prevent churn
- Track multi-goal progress
- Intelligently route students back to human tutors when appropriate

### 1.4 Success Metrics
- Reduce churn rate from 52% to <30% for goal-completed students
- Increase average sessions per student from 3 to 8+ sessions
- Achieve 80%+ student engagement rate (active use between sessions)
- Generate measurable learning improvements (10%+ improvement in test scores/practice performance)
- Maintain 70%+ student satisfaction score

---

## 2. Product Goals & Objectives

### 2.1 Primary Goals
1. **Retention Enhancement**: Reduce churn by 42%+ through proactive subject suggestions and engagement
2. **Learning Continuity**: Maintain 90%+ context retention across sessions
3. **Adaptive Learning**: Deliver personalized practice that adapts to student performance
4. **Seamless Integration**: Integrate with existing session transcript sources (Read.ai, meeting transcripts, etc.)
5. **Measurable Outcomes**: Generate quantifiable learning improvements

### 2.2 Secondary Goals
- Improve student engagement between sessions
- Increase tutor utilization through intelligent routing
- Provide actionable insights to tutors and students
- Scale personalized learning support cost-effectively

---

## 3. User Personas

### 3.1 Primary Persona: High School Student (Sarah)
- **Age**: 16-18
- **Goals**: SAT prep, AP exam preparation, college readiness
- **Pain Points**: Forgets concepts between sessions, needs practice but doesn't know what to focus on
- **Behavior**: Uses mobile device frequently, prefers quick interactions

### 3.2 Secondary Persona: Middle School Student (Alex)
- **Age**: 12-14
- **Goals**: Subject-specific improvement (Chemistry, Math)
- **Pain Points**: Loses motivation after initial success, needs encouragement
- **Behavior**: Requires gamification and progress visualization

### 3.3 Tertiary Persona: Parent/Guardian
- **Age**: 35-50
- **Goals**: Track child's progress, ensure value from tutoring investment
- **Pain Points**: Lack of visibility into progress between sessions
- **Behavior**: Reviews progress reports weekly

---

## 4. Core Features & Requirements

### 4.1 Persistent Memory System

#### 4.1.1 Requirements
- **R-001**: System must store and retrieve conversation history across all sessions
- **R-002**: System must remember lesson topics, concepts covered, and student performance
- **R-003**: System must maintain context for at least 90 days per student
- **R-004**: System must ingest session transcripts from existing sources (Read.ai, meeting transcripts, etc.)
- **R-005**: System must extract key learning points, concepts, and action items from session transcripts using AI

#### 4.1.2 Technical Specifications
- Vector database for semantic search (e.g., Pinecone, Weaviate, or AWS OpenSearch)
- LLM with long-context window (e.g., Claude 3.5 Sonnet, GPT-4 Turbo)
- Text processing and analysis pipeline for session transcripts
- Embedding model for semantic search (e.g., OpenAI text-embedding-3-large)
- Transcript parsing and normalization (handle various transcript formats)

### 4.2 Adaptive Practice Assignment

#### 4.2.1 Requirements
- **R-006**: System must generate practice problems based on previous lesson content
- **R-007**: System must adapt difficulty based on student performance (correct/incorrect answers)
- **R-008**: System must assign practice within 24 hours of tutoring session
- **R-009**: System must provide immediate feedback on practice attempts
- **R-010**: System must track practice completion rates

#### 4.2.2 Technical Specifications
- Problem generation using LLM (e.g., GPT-4, Claude)
- Difficulty scoring algorithm based on Bloom's Taxonomy
- Spaced repetition system for concept reinforcement
- Practice analytics dashboard

### 4.3 Conversational Q&A

#### 4.3.1 Requirements
- **R-011**: System must answer questions in natural, conversational language
- **R-012**: System must reference previous lessons when relevant
- **R-013**: System must admit when it doesn't know and suggest human tutor session
- **R-014**: System must support multi-turn conversations
- **R-015**: System must respond within 3 seconds for 95% of queries

#### 4.3.2 Technical Specifications
- RAG (Retrieval-Augmented Generation) architecture
- Real-time response generation
- Context window management for long conversations
- Fallback to human tutor routing logic

### 4.4 Intelligent Tutor Routing

#### 4.3.1 Requirements
- **R-016**: System must identify when student needs human intervention
- **R-017**: System must detect frustration signals (repeated incorrect answers, negative sentiment)
- **R-018**: System must suggest booking a tutor session with specific topic focus
- **R-019**: System must provide context summary to tutor before session
- **R-020**: System must route based on tutor availability and expertise

#### 4.3.2 Technical Specifications
- Sentiment analysis API (e.g., AWS Comprehend, Google Cloud NLP)
- Rule-based routing logic with ML enhancement
- Tutor matching algorithm
- Session booking integration

---

## 5. Retention Enhancement Features

### 5.1 Related Subject Suggestions

#### 5.1.1 Requirements
- **R-021**: When student completes primary goal, system MUST suggest 3-5 related subjects
- **R-022**: Suggestions must be contextually relevant (e.g., SAT → College Essays, Study Skills, AP Prep)
- **R-023**: Suggestions must be personalized based on student's academic profile
- **R-024**: System must track suggestion acceptance rate
- **R-025**: System must surface suggestions within 24 hours of goal completion

#### 5.1.2 Subject Mapping Logic
- **SAT Complete** → College Essays, Study Skills, AP Prep, ACT Prep, College Application Support
- **Chemistry Complete** → Physics, Biology, STEM Subjects, Advanced Chemistry
- **Math Complete** → Advanced Math, Physics, Statistics, Test Prep
- **English Complete** → Writing Skills, Literature Analysis, College Essays

#### 5.1.3 Technical Specifications
- Knowledge graph of subject relationships
- Collaborative filtering for subject recommendations
- A/B testing framework for suggestion strategies

### 5.2 Early Engagement Nudges

#### 5.2.1 Requirements
- **R-026**: System must identify students with <3 sessions by Day 7
- **R-027**: System must send personalized nudge to book next session
- **R-028**: Nudges must include specific value proposition (e.g., "Continue your momentum in Chemistry")
- **R-029**: System must track nudge effectiveness (booking conversion rate)
- **R-030**: System must respect student preferences (opt-out, frequency limits)

#### 5.2.2 Technical Specifications
- Automated email/SMS notification system
- Student segmentation logic
- Engagement scoring algorithm
- Notification preference management

### 5.3 Multi-Goal Progress Tracking

#### 5.3.1 Requirements
- **R-031**: System must track progress across multiple subjects/goals simultaneously
- **R-032**: System must display progress dashboard showing all active goals
- **R-033**: System must show progress metrics (sessions completed, practice completed, improvement rate)
- **R-034**: System must highlight goals nearing completion
- **R-035**: System must celebrate milestones across all goals

#### 5.3.2 Technical Specifications
- Multi-dimensional progress tracking database schema
- Progress visualization components (charts, graphs)
- Milestone detection and notification system
- Goal relationship mapping

---

## 6. Integration Requirements

### 6.1 Session Transcript Integration

#### 6.1.1 Requirements
- **R-036**: System must ingest session transcripts from existing sources (Read.ai exports, meeting transcripts, text files, etc.)
- **R-037**: System must support multiple transcript formats (plain text, JSON, CSV, markdown)
- **R-038**: System must extract key learning points, concepts, and action items from transcripts
- **R-039**: System must identify topics covered, difficulty level, and student performance indicators
- **R-040**: System must store extracted data in searchable format (vector database)
- **R-041**: System must handle speaker identification (student vs. tutor) when available in transcript
- **R-042**: System must support manual transcript upload and automated import from external sources

#### 6.1.2 Technical Specifications
- Text parsing and normalization pipeline (handle various formats)
- LLM-based extraction pipeline for key concepts and learning points
- Integration API/webhook for Read.ai and similar services
- Manual upload interface (file upload, copy-paste)
- Data synchronization mechanism (scheduled imports, real-time webhooks)
- Transcript format detection and conversion utilities

### 6.2 Learning Analytics Integration

#### 6.2.1 Requirements
- **R-043**: System must track learning improvements (test scores, practice performance)
- **R-044**: System must generate learning improvement reports
- **R-045**: System must compare performance before/after AI companion usage
- **R-046**: System must provide insights to tutors and students
- **R-047**: System must export data for analysis

#### 6.2.2 Technical Specifications
- Analytics data pipeline
- Statistical analysis tools
- Reporting dashboard
- Data export functionality (CSV, JSON)

---

## 7. Technical Architecture

### 7.1 System Architecture Overview
```
┌─────────────────┐
│   Web/Mobile    │
│     Client      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   API Gateway   │
│   (REST/GraphQL)│
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────────┐
│  Auth  │ │  AI Service  │
│ Service│ │   (LLM API)  │
└────────┘ └──────┬───────┘
                  │
         ┌────────┴────────┐
         │                 │
         ▼                 ▼
┌──────────────┐  ┌──────────────┐
│   Vector DB  │  │  Relational  │
│  (Memory)    │  │     DB       │
└──────────────┘  └──────────────┘
         │                 │
         └────────┬────────┘
                  │
                  ▼
         ┌──────────────┐
         │ Session      │
         │ Transcript   │
         │ Integration  │
         │ (Read.ai,    │
         │  Manual, API)│
         └──────────────┘
```

### 7.2 Technology Stack

#### 7.2.1 Frontend
- **Framework**: Next.js 14+ (React) or React Native for mobile
- **UI Library**: Tailwind CSS, shadcn/ui
- **State Management**: Zustand or Redux Toolkit
- **Real-time**: WebSockets for live chat

#### 7.2.2 Backend
- **Runtime**: Node.js (TypeScript) or Python (FastAPI)
- **API Framework**: Express.js or FastAPI
- **Database**: PostgreSQL (primary), Redis (caching)
- **Vector Database**: Pinecone, Weaviate, or AWS OpenSearch
- **Message Queue**: AWS SQS or RabbitMQ

#### 7.2.3 AI/ML Services
- **LLM**: OpenAI GPT-4 Turbo (primary), GPT-3.5 Turbo (fallback)
- **Embeddings**: OpenAI text-embedding-3-large (primary), text-embedding-3-small (cost optimization)
- **Text Processing**: Custom NLP pipeline for transcript analysis
- **Sentiment Analysis**: GPT-4 Turbo via prompt engineering (no separate API needed)
- **API Provider**: OpenAI exclusively (API key provided)

#### 7.2.4 Infrastructure
- **Hosting**: AWS (EC2, ECS, Lambda) or Vercel
- **Storage**: AWS S3 for transcript storage (optional), RDS for database
- **CDN**: CloudFront or Vercel Edge Network
- **Monitoring**: Datadog, New Relic, or AWS CloudWatch

### 7.3 Data Models

#### 7.3.1 Core Entities
```typescript
// Student
interface Student {
  id: string;
  name: string;
  email: string;
  grade: number;
  goals: Goal[];
  sessions: Session[];
  preferences: StudentPreferences;
}

// Goal
interface Goal {
  id: string;
  studentId: string;
  subject: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  createdAt: Date;
  completedAt?: Date;
  progress: number; // 0-100
}

// Session
interface Session {
  id: string;
  studentId: string;
  tutorId: string;
  date: Date;
  duration: number;
  transcript: string; // Required - text transcript from Read.ai or similar
  transcriptSource: 'read_ai' | 'manual_upload' | 'api_import' | 'other';
  transcriptFormat: 'plain_text' | 'json' | 'csv' | 'markdown';
  topics: string[];
  concepts: Concept[];
  extractedAt: Date; // When AI analysis was performed
}

// Concept
interface Concept {
  id: string;
  name: string;
  subject: string;
  difficulty: number;
  masteryLevel: number; // 0-100
  lastPracticed?: Date;
}

// Practice
interface Practice {
  id: string;
  studentId: string;
  conceptId: string;
  questions: Question[];
  assignedAt: Date;
  completedAt?: Date;
  score?: number;
}

// Conversation
interface Conversation {
  id: string;
  studentId: string;
  messages: Message[];
  context: ConversationContext;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 8. AI Tools & Prompting Strategies

### 8.1 AI Tools Used

#### 8.1.1 Large Language Models
- **Primary**: OpenAI GPT-4 Turbo (all complex tasks: Q&A, practice generation, transcript analysis)
- **Fallback**: GPT-3.5 Turbo (cost-effective for simple queries and feedback generation)
- **Provider**: OpenAI exclusively (API key provided)

#### 8.1.2 Embedding Models
- **Primary**: OpenAI text-embedding-3-large (1536 dimensions) - for RAG and semantic search
- **Cost Optimization**: OpenAI text-embedding-3-small (for non-critical use cases)
- **Provider**: OpenAI exclusively

#### 8.1.3 Specialized Services
- **Text Processing**: Custom NLP pipeline for transcript parsing and normalization
- **Sentiment Analysis**: GPT-4 Turbo via prompt engineering (no separate API needed)
- **Text-to-Speech**: AWS Polly (optional, for accessibility) - not part of core AI stack

### 8.2 Prompting Strategies

#### 8.2.1 Conversational Q&A Prompt Template
```
You are an AI Study Companion helping [STUDENT_NAME], a [GRADE]-grade student.

Context from previous sessions:
[RELEVANT_SESSION_CONTEXT]

Current conversation:
[CONVERSATION_HISTORY]

Student's active goals:
[ACTIVE_GOALS]

Student's current question: [QUESTION]

Instructions:
1. Answer the question conversationally and at an appropriate level
2. Reference previous lessons when relevant
3. If the question requires deep explanation or the student seems confused, suggest booking a tutor session
4. Keep responses concise (2-3 paragraphs max)
5. Use examples relevant to the student's grade level

Response:
```

#### 8.2.2 Practice Generation Prompt Template
```
Generate adaptive practice problems for [STUDENT_NAME] based on the following:

Concepts covered in recent session:
[CONCEPTS]

Student's current mastery level: [MASTERY_LEVEL]
Previous practice performance: [PERFORMANCE_HISTORY]
Difficulty target: [DIFFICULTY] (1-10 scale)

Generate [NUMBER] practice problems that:
1. Reinforce concepts from the session
2. Match the student's current ability level
3. Include varied question types (multiple choice, short answer, problem-solving)
4. Progress from easier to more challenging
5. Include answer explanations

Format: JSON array with fields: question, type, difficulty, correct_answer, explanation
```

#### 8.2.3 Subject Suggestion Prompt Template
```
[STUDENT_NAME] has just completed their goal: [COMPLETED_GOAL]

Student profile:
- Grade: [GRADE]
- Completed subjects: [COMPLETED_SUBJECTS]
- Interests: [INTERESTS]
- Academic strengths: [STRENGTHS]

Generate 5 related subject suggestions that:
1. Build on the completed goal naturally
2. Align with the student's academic level
3. Address potential future needs (e.g., college prep)
4. Include compelling value propositions
5. Are ranked by relevance

Format: JSON array with fields: subject, description, relevance_score, value_proposition
```

#### 8.2.4 Session Summary Extraction Prompt Template
```
Extract key information from this tutoring session transcript:

Transcript: [TRANSCRIPT]

Extract:
1. Topics covered (list)
2. Key concepts taught (with difficulty levels)
3. Student's strengths identified
4. Areas needing improvement
5. Action items for practice
6. Suggested follow-up topics

Format as JSON with structured fields.
```

### 8.3 RAG (Retrieval-Augmented Generation) Strategy

#### 8.3.1 Vector Store Structure
- **Collection 1**: Session transcripts and summaries
- **Collection 2**: Concept explanations and examples
- **Collection 3**: Practice problems and solutions
- **Collection 4**: Student-specific learning history

#### 8.3.2 Retrieval Strategy
1. **Semantic Search**: Query vector DB with question embedding
2. **Relevance Filtering**: Filter by student ID, subject, recency
3. **Context Assembly**: Retrieve top 5-10 relevant chunks
4. **LLM Generation**: Pass context + question to LLM with RAG prompt

---

## 8.4 Comprehensive AI Implementation Plan

### 8.4.1 Overview
This section provides a detailed technical implementation plan for building the AI Study Companion using **OpenAI APIs** exclusively, leveraging **RAG (Retrieval-Augmented Generation)** architecture and **context management strategies** (similar to MCP - Model Context Protocol) to meet all product requirements.

### 8.4.2 Core AI Architecture

#### Architecture Components
```
┌─────────────────────────────────────────────────────────┐
│                    OpenAI API Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ GPT-4 Turbo │  │ GPT-3.5 Turbo│  │ Embeddings   │  │
│  │ (Primary)   │  │ (Fallback)   │  │ (text-embed- │  │
│  │             │  │              │  │  3-large)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   RAG Engine │ │ Context Mgr  │ │  Prompt      │
│   (Vector DB)│ │  (Session    │ │  Orchestrator│
│              │ │   Memory)    │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
```

### 8.4.3 OpenAI API Strategy

#### Model Selection Matrix
| Use Case | Primary Model | Fallback Model | Rationale |
|----------|---------------|-----------------|-----------|
| Conversational Q&A | GPT-4 Turbo | GPT-3.5 Turbo | GPT-4 for accuracy, GPT-3.5 for cost |
| Practice Generation | GPT-4 Turbo | GPT-3.5 Turbo | GPT-4 for quality, fallback for simple problems |
| Transcript Analysis | GPT-4 Turbo | GPT-3.5 Turbo | Complex reasoning requires GPT-4 |
| Subject Suggestions | GPT-4 Turbo | GPT-3.5 Turbo | Personalization needs GPT-4 |
| Sentiment Analysis | GPT-4 Turbo (via prompt) | Rule-based | Cost-effective alternative to separate API |
| Embeddings | text-embedding-3-large | text-embedding-3-small | Large for quality, small for cost optimization |

#### API Configuration
- **API Key Management**: Environment variables, secure key storage
- **Rate Limiting**: Implement exponential backoff, request queuing
- **Cost Monitoring**: Track tokens per request, set budget alerts
- **Response Caching**: Cache similar queries to reduce API calls

### 8.4.4 RAG Implementation Architecture

#### Vector Database Structure (Using OpenAI Embeddings)

**Collection 1: Session Transcripts**
- **Chunking Strategy**: Split transcripts into 500-token chunks with 50-token overlap
- **Metadata**: `studentId`, `sessionId`, `date`, `subject`, `topics[]`, `concepts[]`
- **Embedding**: OpenAI `text-embedding-3-large` (1536 dimensions)
- **Storage**: Pinecone (recommended) or Weaviate

**Collection 2: Concept Knowledge Base**
- **Content**: Pre-populated educational content, explanations, examples
- **Chunking**: By concept (each concept = 1-3 chunks)
- **Metadata**: `conceptId`, `subject`, `difficulty`, `gradeLevel`
- **Embedding**: Same as Collection 1

**Collection 3: Practice Problems**
- **Content**: Generated practice problems and solutions
- **Chunking**: One problem per chunk
- **Metadata**: `conceptId`, `difficulty`, `questionType`, `studentId`
- **Embedding**: Same as Collection 1

**Collection 4: Student Learning History**
- **Content**: Student-specific learning patterns, mistakes, strengths
- **Chunking**: By learning event (session, practice, Q&A)
- **Metadata**: `studentId`, `eventType`, `timestamp`, `subject`
- **Embedding**: Same as Collection 1

#### RAG Query Flow
```
1. User Question → Embedding (text-embedding-3-large)
2. Vector Search → Top K chunks (K=5-10) from relevant collections
3. Relevance Filtering → Filter by studentId, recency, subject
4. Context Assembly → Combine chunks with metadata
5. Prompt Construction → Build RAG prompt with context
6. LLM Call → GPT-4 Turbo with context
7. Response Generation → Return answer + confidence score
8. Cache Result → Store for similar future queries
```

### 8.4.5 Context Management Strategy (MCP-like Approach)

#### Multi-Layer Context System

**Layer 1: Session Context (Short-term)**
- **Storage**: Redis (in-memory, TTL: 24 hours)
- **Content**: Current conversation history, active session topics
- **Purpose**: Maintain conversation continuity
- **Size**: Last 10 messages per conversation

**Layer 2: Student Context (Medium-term)**
- **Storage**: PostgreSQL (structured data)
- **Content**: Student profile, active goals, recent sessions, practice history
- **Purpose**: Personalize responses and recommendations
- **Retention**: 90 days active, archived after

**Layer 3: Learning Context (Long-term)**
- **Storage**: Vector Database (semantic search)
- **Content**: All session transcripts, extracted concepts, learning patterns
- **Purpose**: RAG retrieval for relevant historical context
- **Retention**: Indefinite (with data retention policies)

**Layer 4: Knowledge Context (Static)**
- **Storage**: Vector Database (pre-populated)
- **Content**: Educational content, concept explanations, examples
- **Purpose**: Provide accurate educational information
- **Updates**: Periodic updates as curriculum changes

#### Context Assembly Algorithm
```python
def assemble_context(student_id, question, conversation_history):
    # Layer 1: Get conversation context
    conversation_context = get_conversation_history(student_id, limit=10)
    
    # Layer 2: Get student profile and recent activity
    student_profile = get_student_profile(student_id)
    recent_sessions = get_recent_sessions(student_id, days=30)
    
    # Layer 3: RAG retrieval from vector DB
    question_embedding = get_embedding(question)
    relevant_chunks = vector_db.query(
        embedding=question_embedding,
        filter={"studentId": student_id},
        top_k=5
    )
    
    # Layer 4: Get relevant knowledge base content
    knowledge_chunks = vector_db.query(
        embedding=question_embedding,
        filter={"type": "knowledge_base"},
        top_k=3
    )
    
    # Assemble final context
    context = {
        "conversation": conversation_context,
        "student": student_profile,
        "recent_sessions": recent_sessions,
        "relevant_history": relevant_chunks,
        "knowledge_base": knowledge_chunks
    }
    
    return context
```

### 8.4.6 Feature-by-Feature Implementation Plan

#### Feature 1: Persistent Memory System (R-001 to R-005)

**Implementation:**
1. **Transcript Ingestion**
   - Accept transcript via API endpoint
   - Parse and normalize format (handle Read.ai, plain text, JSON)
   - Extract speaker labels if available

2. **AI-Powered Extraction**
   ```python
   def extract_session_insights(transcript):
       prompt = f"""
       Extract key information from this tutoring session transcript:
       
       {transcript}
       
       Extract and return JSON with:
       - topics_covered: [list of topics]
       - concepts_taught: [list of concepts with difficulty 1-10]
       - student_strengths: [identified strengths]
       - areas_for_improvement: [areas needing work]
       - action_items: [practice recommendations]
       - suggested_follow_up: [next session topics]
       """
       
       response = openai.ChatCompletion.create(
           model="gpt-4-turbo-preview",
           messages=[{"role": "user", "content": prompt}],
           response_format={"type": "json_object"}
       )
       return json.loads(response.choices[0].message.content)
   ```

3. **Vector Storage**
   - Chunk transcript into semantic segments
   - Generate embeddings for each chunk
   - Store in Pinecone with metadata (studentId, sessionId, concepts, topics)
   - Store extracted insights in PostgreSQL

4. **Retrieval System**
   - When student asks question, query vector DB with question embedding
   - Filter by studentId to get personalized context
   - Return top 5-10 most relevant chunks

**OpenAI API Usage:**
- GPT-4 Turbo: ~1 call per transcript (extraction)
- Embeddings: ~10-20 embeddings per transcript (chunking)
- Cost: ~$0.10-0.20 per transcript analysis

#### Feature 2: Adaptive Practice Assignment (R-006 to R-010)

**Implementation:**
1. **Practice Generation**
   ```python
   def generate_practice(student_id, session_id):
       # Get session context
       session_data = get_session_data(session_id)
       student_profile = get_student_profile(student_id)
       previous_practice = get_recent_practice(student_id)
       
       prompt = f"""
       Generate adaptive practice problems for {student_profile['name']}, 
       a {student_profile['grade']}-grade student.
       
       Concepts covered in recent session:
       {session_data['concepts']}
       
       Student's current mastery level: {student_profile['mastery_level']}
       Previous practice performance: {previous_practice['performance']}
       Difficulty target: {calculate_difficulty(student_profile)}
       
       Generate 5 practice problems that:
       1. Reinforce concepts from the session
       2. Match student's ability level
       3. Include varied question types
       4. Progress from easier to challenging
       5. Include detailed answer explanations
       
       Return JSON array with: question, type, difficulty, correct_answer, explanation
       """
       
       response = openai.ChatCompletion.create(
           model="gpt-4-turbo-preview",
           messages=[{"role": "user", "content": prompt}],
           response_format={"type": "json_object"}
       )
       return json.loads(response.choices[0].message.content)
   ```

2. **Difficulty Adaptation**
   - Track student performance on each practice
   - Adjust difficulty based on success rate
   - Use spaced repetition algorithm for concept reinforcement

3. **Feedback Generation**
   ```python
   def generate_feedback(student_answer, correct_answer, question):
       prompt = f"""
       Student answered: {student_answer}
       Correct answer: {correct_answer}
       Question: {question}
       
       Provide constructive feedback:
       1. If correct: celebrate and explain why it's right
       2. If incorrect: explain the mistake gently and guide to correct answer
       3. Reference related concepts from previous sessions if relevant
       
       Keep feedback encouraging and educational.
       """
       return openai.ChatCompletion.create(...)
   ```

**OpenAI API Usage:**
- GPT-4 Turbo: ~1 call per practice generation (5 problems)
- GPT-3.5 Turbo: ~1 call per feedback (can use cheaper model)
- Cost: ~$0.05-0.10 per practice assignment

#### Feature 3: Conversational Q&A (R-011 to R-015)

**Implementation:**
1. **RAG-Enhanced Q&A**
   ```python
   def answer_question(student_id, question, conversation_history):
       # Assemble context using multi-layer system
       context = assemble_context(student_id, question, conversation_history)
       
       # Build RAG prompt
       prompt = f"""
       You are an AI Study Companion helping {context['student']['name']}, 
       a {context['student']['grade']}-grade student.
       
       Context from previous sessions:
       {format_relevant_history(context['relevant_history'])}
       
       Current conversation:
       {format_conversation(context['conversation'])}
       
       Student's active goals:
       {context['student']['active_goals']}
       
       Student's question: {question}
       
       Instructions:
       1. Answer conversationally at appropriate grade level
       2. Reference previous lessons when relevant
       3. If question requires deep explanation or student seems confused, 
          suggest booking a tutor session
       4. Keep responses concise (2-3 paragraphs max)
       5. Use examples relevant to student's grade level
       
       Response:
       """
       
       response = openai.ChatCompletion.create(
           model="gpt-4-turbo-preview",
           messages=[{"role": "user", "content": prompt}],
           temperature=0.7,
           max_tokens=500
       )
       
       answer = response.choices[0].message.content
       
       # Check if tutor routing needed
       if should_route_to_tutor(answer, question):
           answer += "\n\nI think this would be a great topic for your next tutor session!"
       
       return answer
   ```

2. **Tutor Routing Logic**
   ```python
   def should_route_to_tutor(answer, question, conversation_history):
       # Use GPT-4 to analyze if tutor needed
       prompt = f"""
       Analyze if this student question requires human tutor intervention:
       
       Question: {question}
       AI Answer: {answer}
       Conversation history: {conversation_history}
       
       Route to tutor if:
       - Question is too complex for AI
       - Student seems confused or frustrated
       - Requires hands-on demonstration
       - Student asks for tutor explicitly
       
       Return JSON: {{"route_to_tutor": true/false, "reason": "..."}}
       """
       # Implementation...
   ```

**OpenAI API Usage:**
- GPT-4 Turbo: ~1 call per question (primary)
- GPT-3.5 Turbo: ~1 call per question (fallback for simple queries)
- Embeddings: ~1 embedding per question (for RAG)
- Cost: ~$0.01-0.03 per Q&A interaction

#### Feature 4: Intelligent Tutor Routing (R-016 to R-020)

**Implementation:**
1. **Sentiment Analysis** (Using GPT-4, no separate API needed)
   ```python
   def analyze_sentiment(conversation_history, practice_results):
       prompt = f"""
       Analyze student sentiment and frustration signals:
       
       Recent conversation: {conversation_history}
       Practice results: {practice_results}
       
       Detect:
       - Frustration indicators (repeated failures, negative language)
       - Confusion signals (asking same question multiple times)
       - Engagement level (high/medium/low)
       
       Return JSON: {{
           "sentiment": "positive/neutral/negative/frustrated",
           "frustration_score": 0-10,
           "should_route": true/false,
           "recommended_topic": "..."
       }}
       """
       return openai.ChatCompletion.create(...)
   ```

2. **Context Summary for Tutor**
   ```python
   def generate_tutor_context(student_id, topic):
       # Retrieve relevant context
       context = assemble_context(student_id, topic, [])
       
       prompt = f"""
       Generate a concise context summary for the tutor:
       
       Student: {context['student']}
       Topic focus: {topic}
       Recent sessions: {context['recent_sessions']}
       Student's progress: {context['learning_history']}
       Areas of difficulty: {context['weaknesses']}
       
       Create a 1-page summary highlighting:
       - What student has learned
       - Current challenges
       - Recommended focus areas
       - Suggested teaching approach
       """
       return openai.ChatCompletion.create(...)
   ```

**OpenAI API Usage:**
- GPT-4 Turbo: ~1 call per sentiment analysis
- GPT-4 Turbo: ~1 call per tutor context generation
- Cost: ~$0.02-0.05 per routing decision

#### Feature 5: Related Subject Suggestions (R-021 to R-025)

**Implementation:**
```python
def suggest_related_subjects(student_id, completed_goal):
    student_profile = get_student_profile(student_id)
    learning_history = get_learning_history(student_id)
    
    prompt = f"""
    {student_profile['name']} has just completed: {completed_goal}
    
    Student profile:
    - Grade: {student_profile['grade']}
    - Completed subjects: {learning_history['completed_subjects']}
    - Interests: {student_profile['interests']}
    - Academic strengths: {student_profile['strengths']}
    - Learning style: {student_profile['learning_style']}
    
    Generate 5 related subject suggestions that:
    1. Build on completed goal naturally
    2. Align with student's academic level
    3. Address future needs (college prep, career paths)
    4. Include compelling value propositions
    5. Are ranked by relevance
    
    Use subject mapping logic:
    - SAT Complete → College Essays, Study Skills, AP Prep, ACT Prep
    - Chemistry → Physics, Biology, STEM Subjects
    - Math → Advanced Math, Physics, Statistics
    - English → Writing Skills, Literature Analysis
    
    Return JSON array: [{{"subject": "...", "description": "...", 
                         "relevance_score": 0-10, "value_proposition": "..."}}]
    """
    
    response = openai.ChatCompletion.create(
        model="gpt-4-turbo-preview",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)
```

**OpenAI API Usage:**
- GPT-4 Turbo: ~1 call per goal completion
- Cost: ~$0.02-0.05 per suggestion generation

#### Feature 6: Early Engagement Nudges (R-026 to R-030)

**Implementation:**
```python
def generate_engagement_nudge(student_id):
    student_data = get_student_data(student_id)
    
    # Check if nudge needed
    if not should_nudge(student_data):
        return None
    
    prompt = f"""
    Generate a personalized engagement nudge for {student_data['name']}:
    
    Student context:
    - Sessions completed: {student_data['session_count']}
    - Days since first session: {student_data['days_since_first']}
    - Current subject: {student_data['active_subject']}
    - Last session date: {student_data['last_session_date']}
    
    Create a personalized message that:
    1. Acknowledges their progress
    2. Highlights value of continuing
    3. Includes specific value proposition
    4. Encourages booking next session
    5. Keeps tone friendly and supportive
    
    Return JSON: {{"message": "...", "cta": "...", "urgency": "low/medium/high"}}
    """
    
    return openai.ChatCompletion.create(...)
```

**OpenAI API Usage:**
- GPT-4 Turbo: ~1 call per nudge (can batch process)
- Cost: ~$0.01-0.02 per nudge

### 8.4.7 Cost Optimization Strategies

#### 1. Intelligent Model Selection
- **Simple queries**: Use GPT-3.5 Turbo (10x cheaper)
- **Complex reasoning**: Use GPT-4 Turbo
- **Decision logic**: Implement query complexity scoring

#### 2. Response Caching
- Cache similar questions/responses
- Use semantic similarity to find cached answers
- Cache hit rate target: 30-40%

#### 3. Batch Processing
- Batch transcript analysis (process multiple at once)
- Batch practice generation for multiple students
- Process during off-peak hours

#### 4. Token Optimization
- Pre-process transcripts (remove filler words, normalize)
- Use concise prompts (optimize prompt templates)
- Set appropriate max_tokens limits
- Use streaming for long responses

#### 5. Embedding Optimization
- Cache embeddings for similar content
- Use text-embedding-3-small for non-critical use cases
- Batch embedding generation

### 8.4.8 Error Handling & Fallbacks

#### Fallback Strategy
1. **Primary**: GPT-4 Turbo
2. **Fallback 1**: GPT-3.5 Turbo (if GPT-4 fails or rate limited)
3. **Fallback 2**: Cached responses (if API unavailable)
4. **Fallback 3**: Rule-based responses (for common questions)

#### Error Handling
```python
def safe_llm_call(prompt, model="gpt-4-turbo-preview", fallback_model="gpt-3.5-turbo"):
    try:
        response = openai.ChatCompletion.create(model=model, ...)
        return response
    except openai.RateLimitError:
        # Wait and retry with exponential backoff
        time.sleep(calculate_backoff())
        return safe_llm_call(prompt, model, fallback_model)
    except openai.APIError:
        # Try fallback model
        if model != fallback_model:
            return safe_llm_call(prompt, fallback_model, fallback_model)
        # Try cached response
        cached = get_cached_response(prompt)
        if cached:
            return cached
        # Last resort: generic response
        return {"content": "I'm having trouble right now. Please try again or book a tutor session."}
```

### 8.4.9 Implementation Phases

#### Phase 1: Foundation (Week 1-2)
- Set up OpenAI API integration
- Implement basic RAG with Pinecone
- Create embedding pipeline
- Build context management system

#### Phase 2: Core Features (Week 3-4)
- Implement transcript analysis
- Build conversational Q&A with RAG
- Create practice generation system
- Add tutor routing logic

#### Phase 3: Retention Features (Week 5-6)
- Implement subject suggestions
- Build engagement nudge system
- Add multi-goal tracking
- Create notification system

#### Phase 4: Optimization (Week 7-8)
- Implement caching layer
- Add cost monitoring
- Optimize prompts and token usage
- Performance tuning

### 8.4.10 Monitoring & Analytics

#### Key Metrics to Track
- **API Usage**: Tokens per request, cost per feature
- **Response Quality**: User satisfaction, tutor routing accuracy
- **Performance**: Response time, cache hit rate
- **Cost**: Daily/monthly spend, cost per student

#### Monitoring Dashboard
- Real-time API usage and costs
- Response time percentiles
- Error rates and fallback usage
- Cache hit rates
- Feature usage statistics

### 8.4.11 Security & Compliance

#### API Key Security
- Store keys in environment variables
- Use secret management service (AWS Secrets Manager, etc.)
- Rotate keys regularly
- Never expose keys in client-side code

#### Data Privacy
- All student data encrypted at rest and in transit
- OpenAI API calls include no PII in prompts (use IDs)
- Comply with COPPA, FERPA, GDPR
- Implement data retention policies

---

## 9. User Flows

### 9.1 Post-Session Flow
1. Session transcript uploaded to system (from Read.ai, manual upload, or API import)
2. System parses and normalizes transcript format
3. AI analyzes transcript and extracts key concepts, topics, and learning points
4. Extracted information stored in vector database for future reference
5. Practice problems generated based on session content (within 24 hours)
6. Student receives notification: "Practice assigned based on your Chemistry session"
7. Student completes practice
8. AI provides feedback and adjusts difficulty for future practice

### 9.2 Conversational Q&A Flow
1. Student asks question via chat interface
2. System retrieves relevant context from memory
3. AI generates contextualized answer
4. If answer quality is low or student seems confused → suggest tutor session
5. Conversation history stored for future reference

### 9.3 Goal Completion Flow
1. Student completes primary goal (e.g., SAT prep)
2. System detects goal completion
3. AI generates related subject suggestions
4. Student receives notification with suggestions
5. Student selects new goal or system tracks if no action taken
6. System monitors engagement and sends follow-up if needed

### 9.4 Early Engagement Nudge Flow
1. System checks: Student has <3 sessions AND Day 7 since first session
2. AI generates personalized nudge message
3. Student receives notification/email
4. System tracks click-through and booking conversion
5. If no action after 3 days → escalate to human outreach

---

## 10. Non-Functional Requirements

### 10.1 Performance
- **Response Time**: <3 seconds for 95% of conversational queries
- **Practice Generation**: <30 seconds for practice assignment generation
- **Uptime**: 99.9% availability (excluding planned maintenance)
- **Concurrent Users**: Support 10,000+ concurrent students

### 10.2 Security & Privacy
- **Data Encryption**: All data encrypted at rest and in transit
- **PII Protection**: Comply with COPPA, FERPA, GDPR
- **Access Control**: Role-based access control (RBAC)
- **Audit Logging**: Log all data access and modifications
- **Data Retention**: Configurable retention policies

### 10.3 Scalability
- **Horizontal Scaling**: Support auto-scaling based on load
- **Database**: Support read replicas for high read volume
- **Caching**: Redis caching for frequently accessed data
- **CDN**: Static assets served via CDN

### 10.4 Usability
- **Mobile Responsive**: Full functionality on mobile devices
- **Accessibility**: WCAG 2.1 AA compliance
- **Multi-language**: Support English initially, expandable
- **Offline Mode**: Basic functionality available offline (future)

---

## 11. Deliverables

### 11.1 Working Prototype
- **Deployment**: Cloud-hosted (AWS or Vercel)
- **Scope**: Core features functional (memory, Q&A, practice assignment)
- **Integration**: Basic session transcript integration (manual upload + Read.ai import)
- **Timeline**: 4-6 weeks

### 11.2 Documentation
- **AI Tools Documentation**: List of all AI services used, API keys, configuration
- **Prompting Strategies**: Documented prompt templates and strategies
- **Architecture Documentation**: System design, data models, API specifications
- **User Guide**: Student and tutor user guides
- **Developer Guide**: Setup, deployment, contribution guidelines

### 11.3 Demo Video
- **Duration**: 5 minutes
- **Content**:
  - Overview of problem and solution
  - Live demo of core features
  - Retention enhancement features
  - Integration with session transcripts (Read.ai import, manual upload)
  - Learning analytics dashboard
- **Format**: Screen recording with voiceover

### 11.4 Cost Analysis
- **Infrastructure Costs**: AWS/Vercel hosting, database, storage
- **AI Service Costs**: LLM API calls, embedding generation, text processing
- **Per-Student Cost**: Estimated monthly cost per active student
- **Scaling Projections**: Cost at 1K, 10K, 100K students
- **Optimization Strategies**: Cost reduction techniques

### 11.5 90-Day Roadmap
- **Phase 1 (Days 1-30)**: Core MVP development
- **Phase 2 (Days 31-60)**: Retention features and integrations
- **Phase 3 (Days 61-90)**: Polish, testing, and production readiness

---

## 12. Success Criteria & KPIs

### 12.1 Primary Metrics
- **Churn Reduction**: Reduce goal-completion churn from 52% to <30%
- **Session Retention**: Increase average sessions per student from 3 to 8+
- **Engagement Rate**: 80%+ of students actively use companion between sessions
- **Learning Improvement**: 10%+ improvement in test scores/practice performance
- **Student Satisfaction**: 70%+ satisfaction score (NPS or CSAT)

### 12.2 Secondary Metrics
- **Practice Completion Rate**: 60%+ of assigned practices completed
- **Q&A Usage**: Average 5+ questions per student per week
- **Tutor Routing Conversion**: 30%+ of suggested tutor sessions booked
- **Subject Suggestion Acceptance**: 25%+ of suggestions lead to new goal
- **Early Nudge Effectiveness**: 20%+ booking conversion from Day 7 nudges

### 12.3 Technical Metrics
- **API Response Time**: P95 <3 seconds
- **System Uptime**: 99.9%
- **Error Rate**: <0.1% of requests
- **Data Accuracy**: 95%+ accuracy in concept extraction

---

## 13. Risks & Mitigations

### 13.1 Technical Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| LLM API downtime | High | Medium | Multi-provider fallback, caching |
| Vector DB performance issues | Medium | Low | Optimize queries, caching layer |
| Transcript format incompatibility | Medium | Medium | Robust parsing, format detection, manual correction |
| Cost overruns | Medium | High | Cost monitoring, usage limits, optimization |

### 13.2 Product Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Low student engagement | High | Medium | Gamification, personalized nudges |
| AI provides incorrect answers | High | Low | Human review, tutor routing logic |
| Privacy concerns | High | Low | Transparent privacy policy, compliance |
| Tutor resistance | Medium | Medium | Show value, provide tutor dashboard |

### 13.3 Business Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Insufficient ROI | High | Medium | Clear metrics, iterative improvement |
| Competitive response | Medium | Medium | Focus on unique value prop |
| Regulatory changes | Medium | Low | Compliance monitoring, legal review |

---

## 14. Timeline & Milestones

### 14.1 Phase 1: MVP Development (Days 1-30)
**Week 1-2: Foundation**
- Set up infrastructure (AWS/Vercel)
- Database schema design and implementation
- Basic API endpoints
- Authentication and authorization

**Week 3-4: Core Features**
- Session transcript integration (Read.ai, manual upload, API)
- Transcript parsing and normalization
- Basic memory system (vector DB setup)
- Conversational Q&A (RAG implementation)
- Practice generation (basic)

**Deliverable**: Functional prototype with core features

### 14.2 Phase 2: Retention Features (Days 31-60)
**Week 5-6: Retention Logic**
- Subject suggestion system
- Early engagement nudge system
- Multi-goal progress tracking
- Notification system

**Week 7-8: Integration & Polish**
- Enhanced session transcript analysis
- Learning analytics dashboard
- Tutor routing logic
- UI/UX improvements

**Deliverable**: Full-featured prototype with retention enhancements

### 14.3 Phase 3: Production Readiness (Days 61-90)
**Week 9-10: Testing & Optimization**
- Load testing
- Cost optimization
- Performance tuning
- Security audit

**Week 11-12: Documentation & Demo**
- Complete documentation
- Demo video production
- Cost analysis report
- Production deployment

**Deliverable**: Production-ready system with full documentation

---

## 15. Cost Analysis Framework

### 15.1 Infrastructure Costs (Monthly)

#### AWS Option
- **Compute**: EC2/ECS instances: $200-500/month
- **Database**: RDS PostgreSQL: $150-300/month
- **Vector DB**: OpenSearch: $200-400/month
- **Storage**: S3 for transcripts: $10-50/month (text files are much smaller)
- **CDN**: CloudFront: $50-100/month
- **Total Infrastructure**: ~$610-1,350/month

#### Vercel Option
- **Hosting**: Vercel Pro: $20/user/month (team)
- **Database**: Supabase/Neon: $25-100/month
- **Vector DB**: Pinecone: $70-700/month (based on usage)
- **Storage**: Vercel Blob: $0.15/GB
- **Total Infrastructure**: ~$115-820/month (varies by scale)

### 15.2 AI Service Costs (Per 1,000 Students/Month)

#### LLM API Calls (OpenAI)
- **Conversational Q&A**: ~50K requests/month
  - GPT-4 Turbo (70%): ~$350-700/month
  - GPT-3.5 Turbo (30% fallback): ~$15-30/month
- **Practice Generation**: ~10K generations/month
  - GPT-4 Turbo: ~$200-400/month
- **Session Transcript Analysis**: ~5K analyses/month
  - GPT-4 Turbo: ~$200-400/month
- **Subject Suggestions**: ~500 requests/month
  - GPT-4 Turbo: ~$10-20/month
- **Engagement Nudges**: ~1K requests/month
  - GPT-4 Turbo: ~$5-10/month
- **Tutor Routing & Sentiment**: ~2K requests/month
  - GPT-4 Turbo: ~$10-20/month

#### Embeddings (OpenAI)
- **Text Embeddings**: ~100K embeddings/month
  - text-embedding-3-large (80%): ~$20-40/month
  - text-embedding-3-small (20%): ~$2-5/month

**Total OpenAI API Costs**: ~$812-1,625/month per 1,000 students
*(Note: All-in-one OpenAI solution - no separate transcription or sentiment APIs needed)*

### 15.3 Total Cost per Student
- **Infrastructure**: $0.61-1.35/student/month
- **OpenAI API Services**: $0.81-1.63/student/month
- **Total**: ~$1.42-2.98/student/month
*(OpenAI-only solution simplifies architecture and reduces integration complexity)*

### 15.4 Scaling Projections

| Students | Monthly Infrastructure | Monthly OpenAI Costs | Total Monthly | Per Student |
|----------|----------------------|----------------------|---------------|-------------|
| 1,000    | $610-1,350           | $812-1,625           | $1,422-2,975  | $1.42-2.98 |
| 10,000   | $2,000-5,000         | $8,120-16,250        | $10,120-21,250| $1.01-2.13 |
| 100,000  | $10,000-30,000       | $81,200-162,500      | $91,200-192,500| $0.91-1.93 |

### 15.5 Cost Optimization Strategies
1. **Caching**: Cache frequent queries to reduce LLM calls (30-50% reduction)
2. **Model Selection**: Use GPT-3.5 for simple queries, GPT-4 for complex (40% cost reduction)
3. **Batch Processing**: Batch transcript analysis during off-peak hours
4. **Embedding Reuse**: Cache embeddings for similar content
5. **Usage Limits**: Implement rate limiting to prevent abuse
6. **Text Processing Efficiency**: Pre-process transcripts to reduce token count (remove filler words, normalize format)

---

## 16. Open Questions & Assumptions

### 16.1 Open Questions
1. What is the source of session transcripts? (Read.ai? Other meeting transcription tools? Manual upload?)
2. What format are transcripts in? (Plain text? JSON? Structured format with speaker labels?)
3. What is the current tutor booking system? (Integration requirements?)
4. What are the specific learning improvement metrics? (Test scores? Practice performance?)
5. What is the target student demographic? (Age range, subjects?)
6. What is the budget for AI services? (Cost constraints?)
7. Do transcripts include speaker identification (student vs. tutor)? (Important for context extraction)

### 16.2 Assumptions
1. Session transcripts are available in text format (from Read.ai, meeting tools, or manual upload)
2. Transcripts contain sufficient detail to extract learning concepts and topics
3. Students have access to mobile/web devices
4. Internet connectivity is reliable for real-time interactions
5. Tutors are available for booking (no capacity constraints)
6. Transcripts may include speaker identification (student vs. tutor) which enhances context extraction
7. Transcript format can be normalized/standardized for processing

---

## 17. Appendix

### 17.1 Glossary
- **RAG**: Retrieval-Augmented Generation
- **LLM**: Large Language Model
- **Vector DB**: Vector database for semantic search
- **Churn**: Student disengagement/leaving platform
- **Mastery Level**: Student's proficiency in a concept (0-100%)

### 17.2 References
- OpenAI API Documentation
- AWS AI Services Documentation
- COPPA Compliance Guidelines
- FERPA Compliance Guidelines

### 17.3 Change Log
| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0     | November 2025 | Initial PRD | TBD |
| 1.1     | November 2025 | Updated for text transcript input (Read.ai, meeting transcripts) - removed transcription services, updated costs | TBD |
| 1.2     | November 2025 | Added comprehensive OpenAI AI implementation plan with RAG architecture, context management, and feature-by-feature implementation details | TBD |

---

## 18. Approval & Sign-off

**Product Manager**: _________________ Date: _______

**Engineering Lead**: _________________ Date: _______

**Design Lead**: _________________ Date: _______

**Stakeholder**: _________________ Date: _______

---

**Document Status**: Draft - Pending Review

