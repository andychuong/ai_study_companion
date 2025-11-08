# Deployment Scripts Guide

## Scripts Required for Deployment

### Essential (Automatically Run by Vercel)

1. **`npm run build`**
   - **Status:** REQUIRED
   - **Purpose:** Builds the Next.js application for production
   - **When:** Automatically executed by Vercel during deployment
   - **Location:** `package.json` → `"build": "next build"`

2. **`npm start`**
   - **Status:** REQUIRED (but handled automatically by Vercel)
   - **Purpose:** Starts the production server
   - **When:** Vercel automatically runs this after build
   - **Location:** `package.json` → `"start": "next start"`

### Database Migrations (Manual Step)

3. **`npm run db:migrate`**
   - **Status:** REQUIRED (manual step before/after deployment)
   - **Purpose:** Applies database schema migrations to production database
   - **When:** Run manually before or after deploying code changes
   - **Command:** `npm run db:migrate` (uses DATABASE_URL from environment)
   - **Alternative:** Use `scripts/migrate-production.ts` for production-specific migrations

## Scripts NOT Needed for Deployment

### Development Only

- `npm run dev` - Development server
- `npm run db:studio` - Database GUI tool
- `npm run type-check` - TypeScript checking (development tool)
- `npm run lint` - Code linting (development tool)

### Testing/Seeding (Development Only)

- `npm run seed` - Seed test data
- `npm run seed:comprehensive` - Comprehensive seed with notifications
- `npm run create-tutor` - Create test tutor accounts
- `npm run inngest:dev` - Local Inngest development server
- `npm run inngest:check` - Check Inngest configuration

### Script Files in `/scripts` Directory

**Production Scripts (in `/scripts`):**
- `migrate-production.ts` - Production database migrations (optional, can use `npm run db:migrate` instead)
- `migrate.ts` - Database migrations
- `setup-env.sh` - Environment setup script

**Development Scripts (in `/scripts/dev` - excluded from git):**
- `seed-comprehensive.ts` - Development data seeding
- `seed-test-data.ts` - Test data seeding
- `create-tutor.ts` - Development utility
- `check-inngest.ts` - Development testing
- `check-pinecone.ts` - Development testing
- `test-inngest.ts` - Development testing
- `generate-suggestions.ts` - Development testing
- `generate-suggestions-direct.ts` - Development testing
- `create-test-practice.ts` - Development testing

Note: The `/scripts/dev` folder is excluded from version control via `.gitignore`.

## Vercel Deployment Process

Vercel automatically runs these commands during deployment:

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build Application**
   ```bash
   npm run build
   ```

3. **Start Production Server**
   ```bash
   npm start
   ```

## Manual Steps Required

### Before First Deployment

1. **Set Environment Variables** in Vercel Dashboard:
   - `DATABASE_URL`
   - `OPENAI_API_KEY`
   - `PINECONE_API_KEY`
   - `PINECONE_INDEX_NAME`
   - `JWT_SECRET`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `INNGEST_EVENT_KEY` (optional)
   - `BLOB_READ_WRITE_TOKEN` (optional)
   - `UPSTASH_REDIS_REST_URL` (optional)
   - `UPSTASH_REDIS_REST_TOKEN` (optional)

2. **Run Database Migrations**
   ```bash
   # Option 1: Using npm script (recommended)
   DATABASE_URL="your-production-url" npm run db:migrate
   
   # Option 2: Using production migration script
   DATABASE_URL="your-production-url" npx tsx scripts/migrate-production.ts
   ```

### After Code Changes with Schema Updates

1. **Generate Migration** (local development)
   ```bash
   npm run db:generate
   ```

2. **Review Migration SQL** in `drizzle/` directory

3. **Apply Migration to Production**
   ```bash
   DATABASE_URL="your-production-url" npm run db:migrate
   ```

4. **Deploy Code** (Vercel will handle build automatically)

## Summary

**Required for Deployment:**
- ✅ `build` - Automatically run by Vercel
- ✅ `start` - Automatically run by Vercel
- ✅ `db:migrate` - Manual step (run before/after deployment)

**NOT Required:**
- ❌ All seed scripts
- ❌ All development scripts
- ❌ All testing scripts
- ❌ All scripts in `/scripts` folder (except `migrate-production.ts` which is optional)

## Recommendations

1. **Keep all scripts** - They're useful for development and testing
2. **Document which are for production** - This document serves that purpose
3. **Use `db:migrate` for production** - It's the standard way to apply migrations
4. **Consider CI/CD** - Automate database migrations in your deployment pipeline

