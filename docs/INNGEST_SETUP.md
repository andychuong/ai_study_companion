# Inngest Setup Guide

This guide will help you set up Inngest for background job processing in the AI Study Companion.

---

## 🎯 Quick Start (Local Development)

For local development, you can use **Inngest Dev Server** which doesn't require any cloud account:

### Step 1: Start Inngest Dev Server

In a **separate terminal**, run:

```bash
npx inngest-cli@latest dev
```

This will:
- Start a local Inngest server on `http://localhost:8288`
- Provide a web UI at `http://localhost:8288` to monitor jobs
- Automatically sync your functions
- **No account or API key needed for local dev!**

### Step 2: Start Your Next.js App

In your main terminal:

```bash
npm run dev
```

The app will automatically connect to the local Inngest server.

### Step 3: Test It Out

1. **Upload a transcript** → Check Inngest dashboard to see `transcript.uploaded` event
2. **Generate practice** → See `practice.generate` event trigger
3. **Complete a goal** → See `goal.completed` event trigger

---

## ☁️ Production Setup (Inngest Cloud)

For production deployment, you'll need an Inngest Cloud account:

### Step 1: Sign Up

1. Go to https://www.inngest.com
2. Sign up for a free account (25K events/month free tier)
3. Create a new app

### Step 2: Get Your Credentials

From the Inngest dashboard:
1. Go to **Settings** → **Keys**
2. Copy your **Event Key** (starts with `event_`)
3. Copy your **Signing Key** (starts with `signkey_`)

### Step 3: Add to Environment Variables

Add to your `.env.local` (for local) or Vercel environment variables (for production):

```bash
INNGEST_EVENT_KEY=event_your_key_here
INNGEST_SIGNING_KEY=signkey_your_key_here
```

### Step 4: Deploy

When you deploy to Vercel:
1. Add the environment variables in Vercel dashboard
2. Inngest will automatically discover your functions via `/api/inngest` endpoint
3. Functions will appear in your Inngest dashboard

---

## 🔍 Verifying Setup

### Check Inngest is Running (Local)

1. Open http://localhost:8288 in your browser
2. You should see the Inngest Dev Server UI
3. Your functions should appear in the "Functions" tab

### Check Functions are Registered

Visit: `http://localhost:3001/api/inngest` (or your app URL)

You should see a JSON response with your function definitions, or a 503 if Inngest isn't configured.

### Test a Job

1. **Upload a transcript** via the UI
2. Check Inngest dashboard → "Runs" tab
3. You should see `analyze-transcript` function executing
4. Watch it progress through each step

---

## 🐛 Troubleshooting

### "Inngest is not configured" Error

**Local Dev:**
- Make sure `npx inngest-cli@latest dev` is running
- Check it's on port 8288
- Restart your Next.js dev server

**Production:**
- Verify `INNGEST_EVENT_KEY` is set in environment variables
- Check Inngest dashboard → Settings → Keys
- Ensure the key is correct (starts with `event_`)

### Functions Not Appearing

1. Check `/api/inngest` endpoint returns functions (not 503)
2. Verify Inngest can reach your app:
   - Local: Should work automatically
   - Production: May need to configure webhook URL in Inngest dashboard

### Jobs Not Running

1. Check Inngest dashboard → "Runs" tab for errors
2. Check server logs for Inngest-related errors
3. Verify OpenAI/Pinecone API keys are set (jobs need these)
4. Check function logs in Inngest dashboard for detailed errors

### Port Conflicts

If port 8288 is taken:
```bash
npx inngest-cli@latest dev --port 8289
```

Then update your app to use the custom port (usually auto-detected).

---

## 📊 Monitoring Jobs

### Local Dev Server Dashboard

Visit `http://localhost:8288` to see:
- **Functions**: All registered functions
- **Runs**: Job execution history
- **Events**: Event stream
- **Logs**: Detailed execution logs

### Production Dashboard

Visit https://app.inngest.com to see:
- All the same features as local
- Usage metrics
- Error tracking
- Function performance

---

## 🎯 What Happens When Jobs Run

### 1. Transcript Upload → Analysis

```
User uploads transcript
  ↓
API creates session record
  ↓
Sends 'transcript.uploaded' event
  ↓
Inngest triggers 'analyze-transcript' function
  ↓
Function runs steps:
  1. Extract insights (GPT-4)
  2. Generate embeddings (OpenAI)
  3. Store in Pinecone
  4. Update database
  5. Update mastery levels
  6. Trigger practice generation
```

### 2. Practice Generation

```
User clicks "Generate Practice"
  ↓
API creates practice record
  ↓
Sends 'practice.generate' event
  ↓
Inngest triggers 'generate-practice' function
  ↓
Function runs steps:
  1. Get session data
  2. Get student profile
  3. Calculate difficulty
  4. Generate questions (GPT-4)
  5. Store practice
```

### 3. Goal Completion → Suggestions

```
User completes a goal
  ↓
API updates goal status
  ↓
Sends 'goal.completed' event
  ↓
Inngest triggers 'generate-subject-suggestions' function
  ↓
Function runs steps:
  1. Get goal details
  2. Get student history
  3. Generate suggestions (GPT-4)
  4. Store suggestions
```

### 4. Daily Engagement Nudges

```
Cron schedule (9 AM daily)
  ↓
Inngest triggers 'send-engagement-nudges' function
  ↓
Function runs steps:
  1. Find students needing nudge
  2. Generate personalized messages (GPT-4)
  3. Send notifications (when integrated)
```

---

## 💡 Tips

1. **Local Development**: Use Inngest Dev Server - it's free and perfect for testing
2. **Production**: Start with free tier (25K events/month) - upgrade as needed
3. **Debugging**: Use Inngest dashboard to see exactly where jobs fail
4. **Costs**: Inngest free tier is generous - you likely won't hit limits during development
5. **Monitoring**: Check Inngest dashboard regularly to ensure jobs are completing successfully

---

## 🚀 Next Steps

After setting up Inngest:

1. ✅ Upload a test transcript and watch it analyze
2. ✅ Generate practice problems and verify questions populate
3. ✅ Complete a goal and check for subject suggestions
4. ✅ Monitor job performance in Inngest dashboard
5. ✅ Set up error alerts in Inngest dashboard (production)

---

## 📚 Resources

- [Inngest Documentation](https://www.inngest.com/docs)
- [Inngest Dev Server Guide](https://www.inngest.com/docs/local-development)
- [Inngest Dashboard](https://app.inngest.com)

