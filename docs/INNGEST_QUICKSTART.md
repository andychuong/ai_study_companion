# Inngest Quick Start Guide

Get Inngest running in **2 minutes** for local development!

---

## 🚀 Quick Start

### Step 1: Start Inngest Dev Server

Open a **new terminal** and run:

```bash
npm run inngest:dev
```

You should see:
```
✓ Inngest Dev Server running
  → Dashboard: http://localhost:8288
  → Sync endpoint: http://localhost:8288/api/inngest
```

**Keep this terminal open!** The dev server needs to keep running.

### Step 2: Verify Setup

In your **main terminal**, run:

```bash
npm run inngest:check
```

You should see:
```
✅ Inngest dev server is running on http://localhost:8288
✅ Inngest endpoint is accessible
   → Found 4 registered functions:
     - analyze-transcript
     - generate-practice
     - send-engagement-nudges
     - generate-subject-suggestions
```

### Step 3: Test It!

1. **Open Inngest Dashboard**: http://localhost:8288
2. **Upload a transcript** via the app UI
3. **Watch the job run** in the Inngest dashboard!

---

## 🎯 What You'll See

### In Inngest Dashboard (http://localhost:8288)

**Functions Tab:**
- See all 4 registered functions
- View function definitions and triggers

**Runs Tab:**
- See jobs executing in real-time
- Watch step-by-step progress
- View logs and errors

**Events Tab:**
- See events being sent
- Monitor event flow

---

## ✅ Success Indicators

When Inngest is working correctly:

1. ✅ **Dev server running**: Terminal shows "Inngest Dev Server running"
2. ✅ **Dashboard accessible**: http://localhost:8288 loads
3. ✅ **Functions registered**: Dashboard shows 4 functions
4. ✅ **Jobs execute**: When you upload a transcript, you see a job run
5. ✅ **No 503 errors**: `/api/inngest` endpoint returns function list

---

## 🐛 Troubleshooting

### "Port 8288 already in use"

**Solution**: Kill the process using port 8288:
```bash
lsof -ti:8288 | xargs kill -9
```

Or use a different port:
```bash
npx inngest-cli@latest dev --port 8289
```

### "Inngest endpoint returned 503"

**Solution**: 
1. Make sure Inngest dev server is running (`npm run inngest:dev`)
2. Restart your Next.js dev server (`npm run dev`)
3. Check both are running in separate terminals

### "Could not reach Inngest endpoint"

**Solution**:
1. Make sure Next.js app is running (`npm run dev`)
2. Check the port matches (default: 3001)
3. Verify `NEXTAUTH_URL` in `.env.local` matches your app URL

---

## 📚 Next Steps

Once Inngest is running:

1. **Test Transcript Analysis**:
   - Upload a session transcript
   - Watch `analyze-transcript` function execute
   - See analysis complete in database

2. **Test Practice Generation**:
   - Click "Generate Practice" on a session
   - Watch `generate-practice` function execute
   - See questions populate automatically

3. **Monitor Jobs**:
   - Keep Inngest dashboard open
   - Watch jobs complete successfully
   - Check logs if any errors occur

---

## 💡 Tips

- **Keep dev server running**: Don't close the terminal running `npm run inngest:dev`
- **Use dashboard**: The Inngest dashboard is your best debugging tool
- **Check logs**: If a job fails, check the logs in the dashboard for details
- **No cloud needed**: Local dev server works perfectly without any account

---

## 🎉 You're All Set!

Inngest is now running and ready to process background jobs. Try uploading a transcript and watch the magic happen! ✨

