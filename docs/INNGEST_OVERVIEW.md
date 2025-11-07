# What Inngest Adds to AI Study Companion

**Inngest** is a background job processing system that enables long-running, asynchronous tasks that would otherwise timeout or block API requests. Here's what it adds to the application:

---

## 🎯 Core Problem It Solves

**Vercel serverless functions have time limits:**
- Free tier: **10 seconds** max execution time
- Pro tier: **60 seconds** max execution time

**Without Inngest:**
- ❌ Transcript analysis (can take 30-60+ seconds) would timeout
- ❌ Practice generation (can take 20-40 seconds) would timeout
- ❌ Long-running AI operations would fail
- ❌ Users would see errors instead of results

**With Inngest:**
- ✅ Jobs run asynchronously in the background
- ✅ No timeout limits (can run for minutes/hours)
- ✅ Automatic retries on failure
- ✅ Step-by-step progress tracking
- ✅ Reliable job execution

---

## 🚀 What Inngest Adds: 4 Background Jobs

### 1. **Transcript Analysis** (`analyze-transcript.ts`)

**Trigger:** When a session transcript is uploaded

**What it does:**
1. **Extracts insights** using GPT-4:
   - Topics covered in the session
   - Concepts taught (with difficulty & mastery levels)
   - Student strengths identified
   - Areas for improvement
   - Action items for next steps

2. **Generates embeddings** for RAG (Retrieval-Augmented Generation):
   - Chunks the transcript into manageable pieces
   - Creates vector embeddings using OpenAI
   - Stores embeddings in Pinecone vector database
   - Enables AI chat to reference past sessions

3. **Updates database**:
   - Saves analysis results to the session record
   - Creates/updates concept records
   - Updates student concept mastery levels
   - Tracks learning progress

4. **Triggers practice generation** automatically

**Without Inngest:** ❌ Upload would timeout, no analysis, no embeddings, no progress tracking  
**With Inngest:** ✅ Full analysis completes in background, everything updates automatically

---

### 2. **Practice Problem Generation** (`generate-practice.ts`)

**Trigger:** After transcript analysis OR manual request from student

**What it does:**
1. **Analyzes student context**:
   - Retrieves session data and concepts covered
   - Gets student profile (grade, learning style)
   - Calculates current mastery levels
   - Determines target difficulty

2. **Generates adaptive practice problems** using GPT-4:
   - Creates 5 practice problems tailored to the student
   - Matches difficulty to student's ability level
   - Includes multiple question types (multiple choice, short answer, problem solving)
   - Provides detailed explanations for each answer
   - Links questions to specific concepts

3. **Stores practice**:
   - Saves questions to database
   - Sets due date (7 days from generation)
   - Marks as "assigned" status

**Without Inngest:** ❌ Practice generation would timeout, students couldn't get practice problems  
**With Inngest:** ✅ Practice problems generated automatically after each session

---

### 3. **Engagement Nudges** (`engagement-nudges.ts`)

**Trigger:** Daily at 9 AM (cron schedule)

**What it does:**
1. **Identifies students needing encouragement**:
   - Finds students in their first 7 days
   - Checks if they've completed fewer than 3 sessions
   - Identifies at-risk students early

2. **Generates personalized messages** using GPT-4:
   - Creates friendly, supportive messages
   - Acknowledges their progress
   - Highlights value of continuing
   - Includes specific call-to-action
   - Adjusts urgency based on engagement level

3. **Sends notifications** (when email/SMS integrated):
   - Delivers personalized nudge messages
   - Encourages booking next session
   - Reduces student churn

**Without Inngest:** ❌ No automated engagement, higher churn rate  
**With Inngest:** ✅ Proactive student engagement, better retention

---

### 4. **Subject Suggestions** (`subject-suggestions.ts`)

**Trigger:** When a student completes a goal

**What it does:**
1. **Analyzes completed goal**:
   - Retrieves goal details and subject
   - Gets student's learning history
   - Reviews completed subjects

2. **Generates personalized suggestions** using GPT-4:
   - Creates 5 related subject suggestions
   - Builds on completed goal naturally
   - Aligns with student's academic level
   - Includes compelling value propositions
   - Ranks by relevance score

3. **Stores suggestions**:
   - Saves to database for student review
   - Links to completed goal
   - Marks as "pending" for student to accept/dismiss

**Without Inngest:** ❌ No automatic suggestions, missed upsell opportunities  
**With Inngest:** ✅ Smart subject recommendations, better learning path

---

## 🔧 Technical Benefits

### 1. **Reliability**
- **Automatic retries** if a step fails
- **Step-by-step execution** - each step is tracked independently
- **Error handling** - failures don't crash the entire job
- **Idempotency** - safe to retry operations

### 2. **Observability**
- **Job dashboard** - see all running/completed jobs
- **Step tracking** - know exactly where a job is
- **Error logs** - detailed error information
- **Performance metrics** - track job duration

### 3. **Scalability**
- **Handles high volume** - processes many jobs concurrently
- **No server management** - fully managed service
- **Auto-scaling** - handles traffic spikes automatically

### 4. **Developer Experience**
- **Type-safe** - full TypeScript support
- **Easy debugging** - step-by-step execution visible
- **Local development** - test jobs locally with Inngest Dev Server
- **Simple API** - easy to trigger jobs with `inngest.send()`

---

## 📊 Current Status

### ✅ **Implemented (Code Ready)**
- All 4 Inngest functions are written and ready
- API routes trigger Inngest events
- Functions handle errors gracefully

### ⚠️ **Needs Setup**
- **Inngest account** - Sign up at https://inngest.com
- **Inngest Dev Server** - Run `npx inngest-cli@latest dev` locally
- **Environment variable** - Add `INNGEST_EVENT_KEY` to `.env.local`
- **Deploy to production** - Configure Inngest in production environment

### 🔄 **Current Behavior Without Inngest**
- ✅ Transcript uploads work (creates session record)
- ✅ Practice generation API works (creates practice record)
- ⚠️ **BUT**: Analysis doesn't run automatically
- ⚠️ **BUT**: Practice questions stay empty (no AI generation)
- ⚠️ **BUT**: No embeddings stored in Pinecone
- ⚠️ **BUT**: No engagement nudges or subject suggestions

---

## 🎯 Impact Summary

| Feature | Without Inngest | With Inngest |
|---------|----------------|--------------|
| **Transcript Analysis** | ❌ Manual only, no AI insights | ✅ Automatic AI-powered analysis |
| **Practice Generation** | ❌ Empty practices, no questions | ✅ AI-generated adaptive questions |
| **RAG Chat** | ❌ Can't reference past sessions | ✅ Chat uses session context |
| **Progress Tracking** | ❌ Manual updates only | ✅ Automatic mastery tracking |
| **Student Engagement** | ❌ No automated nudges | ✅ Proactive engagement messages |
| **Subject Suggestions** | ❌ No recommendations | ✅ Smart subject recommendations |

---

## 🚀 Next Steps to Enable Inngest

1. **Sign up for Inngest** (free tier available)
2. **Get your Event Key** from Inngest dashboard
3. **Add to `.env.local`**:
   ```bash
   INNGEST_EVENT_KEY=your-event-key-here
   ```
4. **Run Inngest Dev Server** locally:
   ```bash
   npx inngest-cli@latest dev
   ```
5. **Test the flow**:
   - Upload a transcript → See analysis complete
   - Generate practice → See questions populate
   - Complete a goal → See subject suggestions

---

## 💡 Why It's Optional (For Now)

The application works **without Inngest** for basic functionality:
- ✅ Users can log in and navigate
- ✅ Goals can be created and managed
- ✅ Sessions can be uploaded (just no automatic analysis)
- ✅ Practices can be created manually
- ✅ Chat works (just without RAG from past sessions)

**Inngest unlocks the full AI-powered experience**, but the app is functional without it for development and testing.

