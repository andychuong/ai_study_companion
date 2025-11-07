# AI Study Companion - Deployment Plan

**Document Version:** 1.0  
**Last Updated:** November 7, 2025  
**Target Environment:** Production  
**Deployment Type:** Initial Production Launch

---

## Table of Contents

1. [Overview](#overview)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Environment Setup](#environment-setup)
4. [Database Deployment](#database-deployment)
5. [Application Deployment](#application-deployment)
6. [Background Jobs Setup](#background-jobs-setup)
7. [Testing & Validation](#testing--validation)
8. [Go-Live Procedures](#go-live-procedures)
9. [Post-Deployment Monitoring](#post-deployment-monitoring)
10. [Rollback Procedures](#rollback-procedures)
11. [Troubleshooting Guide](#troubleshooting-guide)

---

## Overview

### Deployment Goals
- Deploy AI Study Companion to production environment
- Ensure zero-downtime deployment process
- Validate all features are working correctly
- Establish monitoring and alerting

### Deployment Timeline

| Phase | Duration | Description |
|-------|----------|-------------|
| Pre-deployment | 2 hours | Environment setup, credentials, final testing |
| Database Setup | 1 hour | Create production DB, run migrations |
| Application Deploy | 30 mins | Deploy to Vercel, configure domains |
| Background Jobs | 30 mins | Setup Inngest, test functions |
| Testing | 2 hours | Comprehensive validation |
| Go-Live | 30 mins | DNS cutover, final checks |
| **Total** | **6.5 hours** | End-to-end deployment |

### Deployment Team Roles

| Role | Responsibilities |
|------|------------------|
| **Deployment Lead** | Overall coordination, go/no-go decisions |
| **Backend Engineer** | API deployment, database migrations |
| **Frontend Engineer** | UI deployment, client-side testing |
| **DevOps Engineer** | Infrastructure, monitoring setup |
| **QA Engineer** | Test execution, validation |

---

## Pre-Deployment Checklist

### Code Readiness ✅

- [ ] All features completed and merged to `main` branch
- [ ] Code review completed and approved
- [ ] No critical or high-priority bugs in backlog
- [ ] All unit tests passing (`npm run test`)
- [ ] Type checking passing (`npm run type-check`)
- [ ] Linting passing (`npm run lint`)
- [ ] Build succeeds locally (`npm run build`)

### Documentation ✅

- [ ] Architecture documentation up to date
- [ ] API documentation complete
- [ ] Environment variables documented
- [ ] Deployment runbook reviewed
- [ ] User documentation prepared

### Infrastructure Readiness ✅

- [ ] Vercel account created and configured
- [ ] Neon database account created
- [ ] Inngest account created
- [ ] OpenAI API key obtained and tested
- [ ] Domain name registered (if applicable)
- [ ] SSL certificates ready (handled by Vercel)

### Security Checklist ✅

- [ ] All secrets stored in environment variables
- [ ] No hardcoded credentials in codebase
- [ ] JWT_SECRET generated (strong, random)
- [ ] Database credentials secured
- [ ] API keys validated and scoped correctly
- [ ] CORS configured properly
- [ ] Rate limiting configured

### Backup & Recovery ✅

- [ ] Database backup strategy defined
- [ ] Rollback plan documented
- [ ] Contact list for emergencies prepared
- [ ] Incident response plan reviewed

---

## Environment Setup

### 1. Vercel Account Setup

#### Create Vercel Project
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project to Vercel
vercel link
```

#### Configure Project Settings
1. Go to Vercel Dashboard
2. Create new project
3. Import GitHub repository
4. Configure build settings:
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm ci`
   - **Node Version:** 20.x

### 2. Database Setup (Neon)

#### Create Production Database
```bash
# Sign up at https://neon.tech
# Create new project: "ai-study-companion-prod"
# Copy connection string
```

**Connection String Format:**
```
postgresql://username:password@host/dbname?sslmode=require
```

#### Configure Connection Pooling
- Enable **Connection Pooling** in Neon dashboard
- Use pooled connection string for API routes
- Use direct connection for migrations

### 3. Inngest Setup

#### Create Inngest Account
```bash
# Sign up at https://www.inngest.com
# Create new app: "ai-study-companion"
# Copy Event Key and Signing Key
```

#### Configure Webhook
- Set webhook URL: `https://your-domain.com/api/inngest`
- Configure signing secret
- Test webhook connectivity

### 4. OpenAI Setup

#### API Key Configuration
```bash
# Go to https://platform.openai.com/api-keys
# Create new API key
# Set usage limits ($50/month recommended for MVP)
# Save key securely
```

---

## Database Deployment

### Step 1: Review Migration Files

```bash
# Check existing migrations
ls -la drizzle/

# Review SQL statements
cat drizzle/0000_*.sql
```

### Step 2: Set Production Database URL

```bash
# Create .env.production file (DO NOT COMMIT)
echo "DATABASE_URL=postgresql://..." > .env.production
```

### Step 3: Run Migrations

```bash
# Dry run (verify SQL)
npm run db:generate

# Apply migrations to production
DATABASE_URL="your-production-url" npm run db:migrate

# Verify tables created
# Use Neon SQL Editor or psql
```

### Step 4: Seed Initial Data (Optional)

```bash
# Seed admin user and test tutors
DATABASE_URL="your-production-url" npm run seed

# Or manually insert via SQL:
```

```sql
-- Create admin user
INSERT INTO users (email, password_hash, name, role)
VALUES (
  'admin@yourdomain.com',
  '$2a$10$...', -- bcrypt hash of password
  'Admin User',
  'admin'
);

-- Create test tutor
INSERT INTO users (email, password_hash, name, role)
VALUES (
  'tutor@yourdomain.com',
  '$2a$10$...',
  'Dr. Sarah Johnson',
  'tutor'
);
```

### Step 5: Verify Database Schema

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Expected tables:
-- users, sessions, transcripts, concepts, goals, 
-- practices, subject_suggestions, notifications
```

### Step 6: Create Database Backup

```bash
# In Neon dashboard:
# 1. Go to Settings → Backups
# 2. Enable Point-in-Time Recovery
# 3. Set retention period (7 days minimum)
```

---

## Application Deployment

### Step 1: Configure Environment Variables in Vercel

Navigate to: **Project Settings → Environment Variables**

#### Production Environment Variables

```bash
# Database
DATABASE_URL=postgresql://[user]:[password]@[host]/[dbname]?sslmode=require

# Authentication
JWT_SECRET=[generate-strong-random-string-min-32-chars]

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Inngest
INNGEST_EVENT_KEY=[from-inngest-dashboard]
INNGEST_SIGNING_KEY=[from-inngest-dashboard]

# Application
NEXT_PUBLIC_API_URL=https://your-domain.com
NODE_ENV=production

# Optional: Monitoring
SENTRY_DSN=[if-using-sentry]
LOG_LEVEL=info
```

#### Generate JWT_SECRET

```bash
# Use Node.js to generate secure random string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or use OpenSSL
openssl rand -base64 64
```

### Step 2: Deploy to Vercel

#### Method 1: Automatic Deployment (Recommended)

```bash
# Push to main branch
git checkout main
git pull origin main
git push origin main

# Vercel auto-deploys from GitHub
# Monitor deployment: https://vercel.com/dashboard
```

#### Method 2: Manual Deployment

```bash
# Deploy with Vercel CLI
vercel --prod

# Follow prompts
# Wait for deployment to complete
```

### Step 3: Verify Deployment

```bash
# Check deployment status
vercel ls

# Get deployment URL
vercel inspect [deployment-url]

# Test basic endpoints
curl https://your-domain.com/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

### Step 4: Configure Custom Domain (Optional)

#### Add Domain in Vercel
1. Go to **Project Settings → Domains**
2. Add custom domain: `app.yourdomain.com`
3. Update DNS records as instructed:
   ```
   Type: CNAME
   Name: app
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (5-30 minutes)
5. Verify SSL certificate issued

---

## Background Jobs Setup

### Step 1: Register Inngest Functions

Inngest auto-discovers functions via the `/api/inngest` endpoint.

```bash
# Trigger function registration
curl https://your-domain.com/api/inngest

# Expected response:
{
  "function_count": 4,
  "functions": [
    "analyze-transcript",
    "generate-practice",
    "send-engagement-nudges",
    "generate-subject-suggestions"
  ]
}
```

### Step 2: Configure Inngest Dashboard

1. Login to Inngest Dashboard
2. Navigate to **Functions**
3. Verify 4 functions are registered:
   - ✅ `analyze-transcript`
   - ✅ `generate-practice`
   - ✅ `send-engagement-nudges`
   - ✅ `generate-subject-suggestions`

### Step 3: Test Background Functions

#### Test Transcript Analysis

```bash
# Upload a test transcript via API
curl https://your-domain.com/api/transcripts/upload \
  -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tutorId": "tutor-uuid",
    "sessionDate": "2025-11-07T10:00:00Z",
    "duration": 3600,
    "transcript": "Tutor: Let us discuss quadratic equations...",
    "transcriptSource": "manual_upload",
    "transcriptFormat": "plain_text"
  }'

# Check Inngest Dashboard → Events
# Verify "transcript.uploaded" event received
# Monitor function execution
```

#### Test Practice Generation

```bash
# Trigger practice generation
curl https://your-domain.com/api/practice/generate \
  -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-uuid",
    "conceptIds": ["concept-uuid"]
  }'

# Check Inngest Dashboard for "practice.generate" event
```

### Step 4: Configure Cron Jobs

Edit Inngest function to add schedule:

```typescript
// In lib/inngest/functions/engagement-nudges.ts
export const sendEngagementNudges = inngest.createFunction(
  { 
    id: 'send-engagement-nudges',
    cron: '0 9 * * *' // Daily at 9 AM UTC
  },
  { cron: '0 9 * * *' },
  async ({ step }) => {
    // Function implementation
  }
);
```

Deploy updated code to trigger cron registration.

### Step 5: Monitor Function Execution

- Check Inngest Dashboard → Runs
- Verify successful executions
- Check error logs for any failures
- Review retry attempts

---

## Testing & Validation

### Smoke Tests (Critical Path)

#### 1. Authentication Flow ✅
```bash
# Test login
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Expected: JWT token returned
```

#### 2. Session Upload ✅
- Login to application
- Navigate to `/sessions`
- Click "Upload Session"
- Fill form and submit
- Verify session appears in list

#### 3. Transcript Analysis ✅
- Upload transcript (from step 2)
- Wait 30-60 seconds
- Refresh sessions page
- Verify status changed from "Pending" to "Analyzed"
- Click session to view extracted concepts

#### 4. Practice Generation ✅
- Open analyzed session
- Click "Generate Practice Problems"
- Wait for generation to complete
- Navigate to practice page
- Verify problems displayed correctly

#### 5. Goal Management ✅
- Navigate to `/goals`
- Click "New Goal"
- Create test goal
- Verify goal appears in list
- Mark goal complete
- Verify suggestions modal appears (if configured)

#### 6. AI Chat ✅
- Navigate to `/chat`
- Type test message: "Help me understand quadratic equations"
- Verify AI response received
- Test "Request Tutor" button
- Verify tutor booking modal opens

#### 7. Notifications ✅
- Check notification bell icon
- Verify unread count displays
- Click bell to view notifications
- Mark notification as read
- Verify count updates

### Performance Tests

#### Page Load Times
```bash
# Test with Lighthouse or WebPageTest
# Target metrics:
# - First Contentful Paint: < 1.5s
# - Time to Interactive: < 3.5s
# - Largest Contentful Paint: < 2.5s
```

#### API Response Times
```bash
# Test API endpoints
time curl https://your-domain.com/api/sessions/student/[id] \
  -H "Authorization: Bearer TOKEN"

# Target: < 500ms for most endpoints
# Target: < 2s for AI endpoints
```

#### Database Query Performance
```sql
-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 1000 -- > 1 second
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Security Tests

#### 1. Authentication Bypass ✅
```bash
# Attempt to access protected route without token
curl https://your-domain.com/api/sessions/student/test-id

# Expected: 401 Unauthorized
```

#### 2. Authorization Tests ✅
```bash
# Student tries to access another student's data
curl https://your-domain.com/api/sessions/student/other-student-id \
  -H "Authorization: Bearer STUDENT_TOKEN"

# Expected: 403 Forbidden
```

#### 3. SQL Injection Tests ✅
```bash
# Test input sanitization
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com OR 1=1--","password":"test"}'

# Expected: 400 Bad Request or 401 Unauthorized (not 500)
```

#### 4. XSS Tests ✅
- Input: `<script>alert('XSS')</script>` in goal description
- Expected: Text displayed as-is, not executed

### Load Tests (Optional)

```bash
# Install Apache Bench
apt-get install apache2-utils

# Test API endpoint
ab -n 1000 -c 10 https://your-domain.com/api/health

# Review results
# - Requests per second
# - Average response time
# - Failed requests (should be 0)
```

---

## Go-Live Procedures

### Pre-Launch Checklist (1 hour before)

- [ ] All smoke tests passed
- [ ] All team members ready
- [ ] Rollback plan confirmed
- [ ] Monitoring dashboards open
- [ ] Communication channels established
- [ ] Database backup completed
- [ ] DNS changes prepared (if applicable)

### Launch Steps

#### T-60 minutes: Final Verification
```bash
# Run full test suite
npm run test

# Check all deployments are stable
vercel ls

# Verify database connectivity
# Test from Vercel deployment
```

#### T-30 minutes: Enable Monitoring

1. **Setup Vercel Analytics**
   - Enable in Vercel Dashboard
   - Verify tracking code injected

2. **Configure Error Tracking** (if using Sentry)
   ```bash
   # Add Sentry DSN to environment variables
   # Deploy updated configuration
   ```

3. **Database Monitoring**
   - Enable query logging in Neon
   - Set up alerts for slow queries

#### T-15 minutes: Final DNS Checks

```bash
# Verify DNS propagation (if using custom domain)
dig app.yourdomain.com

# Expected: CNAME pointing to Vercel
```

#### T-5 minutes: Warm Up Application

```bash
# Hit key endpoints to warm up serverless functions
curl https://your-domain.com/api/health
curl https://your-domain.com/dashboard
curl https://your-domain.com/chat
curl https://your-domain.com/sessions
```

#### T-0 minutes: GO LIVE! 🚀

1. **Announce Launch**
   - Post in team Slack/Discord
   - Notify stakeholders
   - Share production URL

2. **Monitor Key Metrics**
   - Watch Vercel dashboard for errors
   - Monitor API response times
   - Check Inngest for job failures
   - Track database connection count

3. **Enable User Access**
   - If using invite-only: Send invitations
   - If public: Announce on social media

### Post-Launch Monitoring (First 24 Hours)

#### Hour 1-2: Active Monitoring
- Watch real-time logs
- Check for errors every 5 minutes
- Respond to any incidents immediately

#### Hour 3-8: Regular Checks
- Check metrics every 30 minutes
- Review error reports
- Monitor user feedback channels

#### Hour 9-24: Standard Monitoring
- Check dashboards every 2 hours
- Review daily metrics summary
- Plan fixes for any non-critical issues

---

## Post-Deployment Monitoring

### Metrics to Track

#### Application Metrics
| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| API Success Rate | > 99% | < 95% |
| Average Response Time | < 500ms | > 1000ms |
| Error Rate | < 1% | > 5% |
| Uptime | 99.9% | < 99% |

#### Business Metrics
| Metric | Description |
|--------|-------------|
| Daily Active Users | Students logging in per day |
| Sessions Uploaded | Transcripts uploaded per day |
| Practice Completions | Practice sets completed per day |
| Chat Interactions | AI chat messages per day |
| Goal Completions | Goals marked complete per day |

#### Infrastructure Metrics
| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Database Connections | < 80% max | > 90% |
| Database Query Time | < 100ms avg | > 500ms |
| Function Execution Time | < 30s | > 60s |
| API Rate Limit Hits | 0 | > 10/hour |

### Monitoring Tools Setup

#### 1. Vercel Analytics
```bash
# Already enabled by default
# View at: https://vercel.com/[team]/[project]/analytics
```

#### 2. Database Monitoring (Neon)
- Navigate to Neon Dashboard → Monitoring
- Check:
  - Active connections
  - Query performance
  - Storage usage
  - CPU usage

#### 3. Inngest Monitoring
- Navigate to Inngest Dashboard → Metrics
- Check:
  - Function execution success rate
  - Average execution time
  - Failed runs
  - Retry counts

#### 4. Custom Logging
```typescript
// lib/utils/logger.ts
import { createLogger } from './logger';

const logger = createLogger('deployment');

// Log important events
logger.info('User login', { userId, timestamp });
logger.error('API error', { endpoint, error, stack });
logger.warn('Slow query', { query, duration });
```

### Alert Configuration

#### Critical Alerts (Immediate Response)
- API error rate > 10%
- Database connection failures
- Background job failures > 50%
- Site completely down

#### Warning Alerts (Response within 1 hour)
- API error rate > 5%
- Slow query detected (> 1s)
- High memory usage (> 80%)
- Background job failures > 20%

#### Info Alerts (Response within 24 hours)
- Unusual traffic patterns
- API rate limit hits
- Storage approaching limits

### Daily Health Check Script

```bash
#!/bin/bash
# daily-health-check.sh

echo "=== Daily Health Check ==="
echo "Date: $(date)"

# Check API health
echo "\n1. API Health Check"
curl -s https://your-domain.com/api/health || echo "❌ API down"

# Check database connectivity
echo "\n2. Database Check"
# Run via Vercel function or direct connection

# Check Inngest functions
echo "\n3. Background Jobs Check"
curl -s https://your-domain.com/api/inngest | jq '.function_count'

# Check recent errors
echo "\n4. Recent Errors"
# Query logs for errors in last 24 hours

echo "\n=== Health Check Complete ==="
```

---

## Rollback Procedures

### When to Rollback

Initiate rollback if:
- ❌ Critical bugs affecting > 50% of users
- ❌ Data corruption detected
- ❌ Security vulnerability discovered
- ❌ System completely unavailable
- ❌ Database migration failed

**DO NOT rollback for:**
- ✅ Minor UI bugs
- ✅ Non-critical feature issues
- ✅ Performance degradation < 20%

### Rollback Steps

#### Level 1: Application Rollback (No DB Changes)

```bash
# 1. Identify last stable deployment
vercel ls --prod

# 2. Promote previous deployment
vercel promote [previous-deployment-url] --prod

# 3. Verify rollback
curl https://your-domain.com/api/health

# Time to complete: 5 minutes
```

#### Level 2: Application + Database Rollback

```bash
# 1. Stop all traffic to database (if possible)
# Set maintenance mode in Vercel

# 2. Restore database from backup
# In Neon Dashboard:
# - Go to Backups
# - Select restore point (before deployment)
# - Click "Restore"

# 3. Rollback application code
vercel promote [previous-deployment-url] --prod

# 4. Verify database state
# Run test queries to confirm data integrity

# 5. Resume traffic

# Time to complete: 15-30 minutes
```

#### Level 3: Full System Rollback

```bash
# 1. Put site in maintenance mode
# Deploy maintenance page to Vercel

# 2. Document current state
# - Take screenshots
# - Export database schema
# - Save error logs

# 3. Restore database to last known good state

# 4. Rollback application code

# 5. Rollback Inngest functions
# - Deploy previous version
# - Re-register functions

# 6. Verify all systems
# - Run smoke tests
# - Check data integrity
# - Test critical paths

# 7. Remove maintenance mode

# Time to complete: 1-2 hours
```

### Post-Rollback Actions

1. **Incident Report**
   - Document what went wrong
   - Root cause analysis
   - Timeline of events
   - Actions taken

2. **Communication**
   - Notify users of issue resolution
   - Update status page
   - Post-mortem with team

3. **Prevention**
   - Identify missing tests
   - Update deployment checklist
   - Improve monitoring

---

## Troubleshooting Guide

### Common Issues

#### Issue 1: 500 Internal Server Error

**Symptoms:**
- API routes returning 500 errors
- Error in Vercel logs: "Internal Server Error"

**Diagnosis:**
```bash
# Check Vercel function logs
vercel logs --prod

# Common causes:
# - Environment variable missing
# - Database connection failure
# - Unhandled exception in code
```

**Resolution:**
```bash
# 1. Check environment variables
vercel env ls

# 2. Verify DATABASE_URL is set correctly
vercel env pull .env.local

# 3. Test database connection
# Add health check endpoint

# 4. Check for syntax errors in deployment
# Review build logs
```

#### Issue 2: Database Connection Timeout

**Symptoms:**
- Slow API responses
- "connection timeout" errors
- High database connection count

**Diagnosis:**
```sql
-- Check active connections
SELECT count(*) 
FROM pg_stat_activity 
WHERE state = 'active';

-- Check for long-running queries
SELECT pid, query, state, query_start
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY query_start;
```

**Resolution:**
```bash
# 1. Enable connection pooling in Neon

# 2. Update connection string to use pooled connection

# 3. Implement connection timeout in code:
# In lib/db/index.ts
const pool = new Pool({
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 20
});

# 4. Kill long-running queries if needed
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'active' 
AND query_start < now() - interval '5 minutes';
```

#### Issue 3: Background Jobs Not Running

**Symptoms:**
- Transcripts stuck in "processing" status
- No events in Inngest dashboard
- Practice problems not generating

**Diagnosis:**
```bash
# 1. Check Inngest endpoint
curl https://your-domain.com/api/inngest

# 2. Check Inngest dashboard for errors

# 3. Verify event keys are correct
vercel env ls | grep INNGEST
```

**Resolution:**
```bash
# 1. Re-register functions
# Deploy latest code to trigger registration

# 2. Check webhook configuration in Inngest
# Ensure URL is correct: https://your-domain.com/api/inngest

# 3. Manually trigger test event
curl -X POST https://your-domain.com/api/inngest \
  -H "Content-Type: application/json" \
  -d '{"event":"test.event","data":{}}'

# 4. Check function logs in Inngest dashboard
```

#### Issue 4: High OpenAI API Costs

**Symptoms:**
- Unexpected OpenAI bill
- Rate limit errors from OpenAI

**Diagnosis:**
```bash
# Check OpenAI usage dashboard
# Review API calls by endpoint

# Identify high-usage functions:
# - Transcript analysis
# - Practice generation
# - Chat conversations
```

**Resolution:**
```typescript
// 1. Implement caching for common queries
const cache = new Map();

// 2. Reduce max_tokens in API calls
const completion = await chatCompletion(messages, {
  maxTokens: 500, // Reduced from 2000
});

// 3. Add rate limiting per user
// Track API usage per student

// 4. Set usage alerts in OpenAI dashboard
// Alert at $10, $25, $50 thresholds

// 5. Implement response streaming for long generations
```

#### Issue 5: Slow Page Load Times

**Symptoms:**
- Dashboard takes > 5s to load
- Poor Lighthouse scores

**Diagnosis:**
```bash
# Run Lighthouse audit
lighthouse https://your-domain.com/dashboard --view

# Check bundle size
vercel inspect [deployment-url] | grep "Lambda Size"

# Review React Query network tab
# Check for unnecessary re-fetches
```

**Resolution:**
```typescript
// 1. Implement pagination for large lists
const { data } = useQuery(['sessions', page], 
  () => fetchSessions(page, 20)
);

// 2. Add loading skeletons
<Suspense fallback={<CardSkeleton />}>
  <SessionsList />
</Suspense>

// 3. Optimize images
// Use Next.js Image component

// 4. Lazy load heavy components
const TutorModal = dynamic(() => import('./TutorModal'), {
  loading: () => <Spinner />
});

// 5. Implement query deduplication
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000 }
  }
});
```

### Emergency Contacts

| Role | Name | Contact | Availability |
|------|------|---------|--------------|
| Deployment Lead | [Name] | [Email/Phone] | 24/7 for launch week |
| Backend Engineer | [Name] | [Email/Phone] | Business hours + on-call |
| DevOps | [Name] | [Email/Phone] | 24/7 |
| Vercel Support | Support | support@vercel.com | 24/7 (Pro plan) |
| Neon Support | Support | support@neon.tech | Email only |

### Escalation Path

1. **Level 1:** Developer on-call (0-30 min)
2. **Level 2:** Tech Lead (30-60 min)
3. **Level 3:** CTO/Engineering Manager (60+ min)

---

## Appendix

### A. Environment Variables Reference

```bash
# Required Production Variables
DATABASE_URL=                    # Neon connection string
JWT_SECRET=                      # 64-char random string
OPENAI_API_KEY=                  # OpenAI API key
INNGEST_EVENT_KEY=               # Inngest event key
INNGEST_SIGNING_KEY=             # Inngest signing key
NEXT_PUBLIC_API_URL=             # Production URL
NODE_ENV=production

# Optional Variables
SENTRY_DSN=                      # Error tracking
LOG_LEVEL=info                   # Logging verbosity
RATE_LIMIT_MAX=100               # API rate limit
```

### B. Deployment Checklist (Quick Reference)

**Pre-Deployment:**
- [ ] Code merged to main
- [ ] Tests passing
- [ ] Build succeeds
- [ ] Environment variables configured
- [ ] Database backup created

**Deployment:**
- [ ] Database migrations run
- [ ] Application deployed to Vercel
- [ ] Inngest functions registered
- [ ] DNS configured (if needed)

**Validation:**
- [ ] Smoke tests passed
- [ ] Security tests passed
- [ ] Performance acceptable
- [ ] Monitoring configured

**Go-Live:**
- [ ] Team notified
- [ ] Monitoring active
- [ ] Users can access
- [ ] No critical errors

### C. Useful Commands

```bash
# Vercel Commands
vercel                          # Deploy to preview
vercel --prod                   # Deploy to production
vercel logs                     # View logs
vercel env ls                   # List environment variables
vercel promote [url]            # Promote deployment

# Database Commands
npm run db:generate             # Generate migration
npm run db:migrate              # Apply migration
npm run db:studio               # Open database GUI

# Testing Commands
npm run test                    # Run tests
npm run type-check              # Check TypeScript
npm run lint                    # Run linter
npm run build                   # Test build

# Health Checks
curl [url]/api/health           # Check API health
curl [url]/api/inngest          # Check Inngest functions
```

### D. Post-Deployment Review Template

```markdown
## Deployment Post-Mortem

**Date:** [Date]
**Deployment ID:** [Vercel deployment ID]
**Team:** [Names]

### What Went Well
- 
- 
- 

### Issues Encountered
- 
- 
- 

### Metrics
- Deployment time: [X] minutes
- Downtime: [X] minutes
- Rollbacks: [X]
- Issues reported: [X]

### Lessons Learned
- 
- 
- 

### Action Items
- [ ] 
- [ ] 
- [ ] 

### Next Deployment Changes
- 
- 
- 
```

---

**Document Status:** Ready for Production Deployment  
**Last Updated:** November 7, 2025  
**Next Review:** After first production deployment  
**Feedback:** Send to deployment-team@yourdomain.com

