# Deployment Checklist

Use this checklist before deploying to production.

## Pre-Deployment

- [ ] All changes tested locally
- [ ] `npm run build` succeeds without errors
- [ ] `npm run lint` passes
- [ ] `npm run type-check` passes (if available)
- [ ] All new files are committed
- [ ] Commit message is descriptive

## Git Operations

- [ ] All changes staged (`git add .`)
- [ ] Changes committed with descriptive message
- [ ] Pushed to remote repository (`git push origin main`)

## Vercel Configuration

- [ ] All environment variables set in Vercel dashboard
- [ ] Database connection string is correct
- [ ] API keys are configured
- [ ] Inngest keys are set (if applicable)

## Post-Deployment

- [ ] Production URL loads correctly
- [ ] Login page displays with logo and background
- [ ] Register page displays with logo and background
- [ ] Dashboard shows logo in sidebar
- [ ] Tutor dashboard works (`/tutor`)
- [ ] Student booking works (`/sessions/book`)
- [ ] API endpoints respond correctly
- [ ] No console errors in browser
- [ ] No 404 errors for assets
- [ ] Mobile view works correctly

## Monitoring

- [ ] Checked Vercel deployment logs
- [ ] Verified no build errors
- [ ] Monitored error tracking (if configured)
- [ ] Tested critical user flows

---

**Date:** _______________
**Deployed by:** _______________
**Version:** _______________

