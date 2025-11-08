# Deployment Guide: Local to Production

This guide walks you through deploying your AI Study Companion changes from local development to production on Vercel.

## Prerequisites

- ✅ Git repository is set up and connected to remote
- ✅ Vercel project is configured
- ✅ Environment variables are set in Vercel dashboard
- ✅ Database is accessible from production

## Step 1: Pre-Deployment Checklist

### 1.1 Review Your Changes

Check what files have been modified:

```bash
git status
```

**Current changes to deploy:**
- ✅ Logo and branding updates (`public/logo.svg`, `app/(dashboard)/layout.tsx`)
- ✅ Auth page improvements (`app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`, `app/(auth)/forgot-password/page.tsx`)
- ✅ Background pattern component (`components/layout/AuthBackground.tsx`)
- ✅ Tutor-student workflow (`app/(dashboard)/tutor/`, `app/api/sessions/book/`, `app/api/tutor/students/`)
- ✅ API updates (`lib/api/tutor.ts`)

### 1.2 Test Locally

Before deploying, ensure everything works locally:

```bash
# Build the project to check for errors
npm run build

# If build succeeds, start the production server locally
npm start
```

**Test these features:**
- [ ] Login page displays correctly with logo and background pattern
- [ ] Register page displays correctly with logo and background pattern
- [ ] Dashboard shows logo in sidebar
- [ ] Tutor dashboard works (`/tutor`)
- [ ] Student booking works (`/sessions/book`)
- [ ] API endpoints respond correctly

### 1.3 Check for Linter Errors

```bash
npm run lint
```

Fix any linting errors before proceeding.

## Step 2: Commit Your Changes

### 2.1 Stage All Changes

```bash
# Add all modified and new files
git add .

# Or add files individually if you prefer:
git add app/
git add components/
git add public/
git add lib/
```

### 2.2 Commit with Descriptive Message

```bash
git commit -m "feat: Add logo, auth page improvements, and tutor-student workflow

- Add logo and branding to header and auth pages
- Create educational background pattern for auth pages
- Implement tutor dashboard and student booking flow
- Add API endpoints for session booking and tutor student list"
```

**Commit message best practices:**
- Use conventional commit format: `feat:`, `fix:`, `style:`, `refactor:`, etc.
- Write clear, descriptive messages
- Include bullet points for multiple changes

### 2.3 Verify Commit

```bash
git log -1
```

## Step 3: Push to Remote Repository

### 3.1 Push to Main Branch

```bash
git push origin main
```

**Note:** If you're working on a feature branch, merge to main first:
```bash
git checkout main
git merge your-feature-branch
git push origin main
```

### 3.2 Verify Push

Check your remote repository (GitHub/GitLab) to confirm the push was successful.

## Step 4: Vercel Deployment

### 4.1 Automatic Deployment

If Vercel is connected to your Git repository, it will **automatically deploy** when you push to the main branch.

**Check deployment status:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. View the "Deployments" tab
4. Wait for the build to complete (usually 2-5 minutes)

### 4.2 Manual Deployment (if needed)

If automatic deployment is disabled:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy to production
vercel --prod
```

## Step 5: Verify Environment Variables

### 5.1 Check Vercel Environment Variables

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Ensure all required variables are set:

**Required Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Secret for authentication
- `OPENAI_API_KEY` - OpenAI API key
- `PINECONE_API_KEY` - Pinecone API key
- `PINECONE_ENVIRONMENT` - Pinecone environment
- `INNGEST_EVENT_KEY` - Inngest event key (if using)
- `INNGEST_SIGNING_KEY` - Inngest signing key (if using)
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob token (if using)

### 5.2 Add Missing Variables

If any are missing:
1. Click "Add New"
2. Add variable name and value
3. Select environment (Production, Preview, Development)
4. Click "Save"
5. Redeploy if needed

## Step 6: Post-Deployment Verification

### 6.1 Test Production URL

Visit your production URL (e.g., `https://your-app.vercel.app`) and test:

**Auth Pages:**
- [ ] `/login` - Logo visible, background pattern displays
- [ ] `/register` - Logo visible, background pattern displays
- [ ] `/forgot-password` - Logo visible, background pattern displays

**Dashboard:**
- [ ] `/dashboard` - Logo in sidebar, navigation works
- [ ] `/tutor` - Tutor dashboard loads (if logged in as tutor)
- [ ] `/sessions/book` - Booking page works (if logged in as student)

**API Endpoints:**
- [ ] `/api/sessions/book` - Returns correct response
- [ ] `/api/tutor/students` - Returns student list (if logged in as tutor)

### 6.2 Check Browser Console

Open browser DevTools (F12) and check for:
- ✅ No console errors
- ✅ No 404 errors for assets (logo.svg, etc.)
- ✅ Network requests succeed

### 6.3 Test on Different Devices

- [ ] Desktop browser
- [ ] Mobile browser
- [ ] Tablet (if applicable)

## Step 7: Monitor Deployment

### 7.1 Check Vercel Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Check "Build Logs" and "Function Logs" for errors

### 7.2 Monitor Application

- Check error tracking (if configured)
- Monitor database connections
- Verify Inngest functions are working (if applicable)

## Troubleshooting

### Build Fails

**Common issues:**
1. **TypeScript errors**: Run `npm run type-check` locally and fix errors
2. **Missing dependencies**: Ensure all packages are in `package.json`
3. **Environment variables**: Check all required vars are set in Vercel

**Solution:**
```bash
# Fix errors locally first
npm run build
npm run type-check
npm run lint

# Then push again
git add .
git commit -m "fix: resolve build errors"
git push origin main
```

### Assets Not Loading

**Issue:** Logo or other assets return 404

**Solution:**
1. Ensure `public/` directory is committed
2. Check file paths are correct (case-sensitive)
3. Verify Next.js Image component is used correctly

### Environment Variables Not Working

**Issue:** API calls fail in production

**Solution:**
1. Verify variables are set in Vercel dashboard
2. Ensure variables are set for "Production" environment
3. Redeploy after adding variables

### Database Connection Issues

**Issue:** Database queries fail in production

**Solution:**
1. Verify `DATABASE_URL` is correct for production database
2. Check database allows connections from Vercel IPs
3. Ensure SSL is enabled if required

## Rollback Plan

If something goes wrong:

### Option 1: Revert via Git

```bash
# Revert last commit
git revert HEAD
git push origin main
```

### Option 2: Redeploy Previous Version

1. Go to Vercel Dashboard → Deployments
2. Find the last working deployment
3. Click "..." → "Promote to Production"

## Quick Reference Commands

```bash
# Full deployment workflow
npm run build              # Test build locally
npm run lint              # Check for linting errors
git add .                 # Stage all changes
git commit -m "feat: ..." # Commit changes
git push origin main      # Push to remote (triggers auto-deploy)

# Check deployment status
vercel ls                 # List deployments
vercel inspect            # Inspect latest deployment
```

## Next Steps After Deployment

1. ✅ Share production URL with team
2. ✅ Update documentation with new features
3. ✅ Monitor error logs for 24-48 hours
4. ✅ Gather user feedback
5. ✅ Plan next iteration

---

**Last Updated:** November 8, 2025
**Deployment Platform:** Vercel
**Framework:** Next.js 14

