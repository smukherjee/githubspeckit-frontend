# Sentry Setup Guide

## Overview

Sentry provides real-time error tracking and performance monitoring for the application. This guide will help you set up Sentry to enable security event logging and error monitoring.

---

## Step 1: Create a Sentry Account

1. Go to **https://sentry.io/**
2. Click **"Sign Up"** (or use existing account)
3. Choose your organization name (e.g., "InfySight" or your company name)

---

## Step 2: Create a New Project

1. After signing in, click **"Create Project"**
2. Select platform: **"React"**
3. Set alert frequency: **"Alert me on every new issue"** (recommended)
4. Project name: `githubspeckit-frontend`
5. Click **"Create Project"**

---

## Step 3: Get Your DSN

After creating the project, Sentry will show you the DSN (Data Source Name).

**DSN Format:**
```
https://[KEY]@o[ORG-ID].ingest.sentry.io/[PROJECT-ID]
```

**Example:**
```
https://abc123def456@o987654.ingest.sentry.io/123456
```

**Copy this DSN** - you'll need it for the next step.

---

## Step 4: Configure Environment Variables

### Development Environment

Edit `.env.development`:

```bash
# Sentry Error Monitoring (Optional in development)
VITE_SENTRY_DSN=https://your-key@o123456.ingest.sentry.io/123456

# Optional: Enable Sentry in development
VITE_SENTRY_DEBUG=true
```

### Production Environment

Create `.env.production` (or configure in your deployment platform):

```bash
# Sentry Error Monitoring (REQUIRED for production)
VITE_SENTRY_DSN=https://your-key@o123456.ingest.sentry.io/123456
```

---

## Step 5: Test Sentry Integration

### Local Testing

1. **Add DSN to `.env.development`:**
   ```bash
   VITE_SENTRY_DSN=https://your-actual-dsn@sentry.io/project-id
   VITE_SENTRY_DEBUG=true
   ```

2. **Restart development server:**
   ```bash
   npm run dev
   ```

3. **Check console** - you should NOT see "Sentry: DSN not configured"

4. **Trigger a test error:**
   - Open browser console
   - Run: `throw new Error("Test Sentry Error")`
   - Check Sentry dashboard for the error

### Production Build Testing

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Preview production build:**
   ```bash
   npm run preview
   ```

3. **Test error tracking:**
   - Navigate to the app
   - Trigger an error (e.g., invalid login)
   - Check Sentry dashboard

---

## Step 6: Verify Security Event Logging

The application logs these security events to Sentry:

### Logged Events

1. **Failed Login Attempts** (`auth_failed`)
   - Test: Try logging in with wrong credentials
   - Sentry: Check "Issues" → filter by "auth_failed"

2. **Token Expiration** (`token_expired`)
   - Test: Wait for JWT token to expire (15 minutes)
   - Or manually clear token and refresh
   - Sentry: Check for "token_expired" events

3. **Permission Denied** (`permission_denied`)
   - Test: Try accessing a resource without permission
   - Sentry: Check for HTTP 403 errors

### How to Check in Sentry

1. Go to your Sentry project dashboard
2. Click **"Issues"** in sidebar
3. Look for tagged events:
   - Tag: `security = true`
   - Tag: `event_type = auth_failed`
   - Tag: `event_type = permission_denied`
   - Tag: `event_type = token_expired`

---

## Step 7: Configure Alerts (Optional)

### Set Up Email Alerts

1. In Sentry, go to **Settings** → **Alerts**
2. Click **"Create Alert Rule"**
3. Configure:
   - **When:** An event is seen
   - **If:** All events
   - **Then:** Send notification via email
4. Save rule

### Set Up Slack Integration (Recommended)

1. Go to **Settings** → **Integrations**
2. Find **Slack** → Click **"Install"**
3. Authorize Sentry to access your Slack workspace
4. Configure notification rules
5. Choose Slack channel (e.g., `#security-alerts`)

---

## Step 8: Production Deployment

### Deploy to Vercel/Netlify

Add environment variable in deployment platform:

**Vercel:**
1. Go to project **Settings** → **Environment Variables**
2. Add: `VITE_SENTRY_DSN` = `your-dsn-here`
3. Redeploy

**Netlify:**
1. Go to **Site Settings** → **Environment Variables**
2. Add: `VITE_SENTRY_DSN` = `your-dsn-here`
3. Trigger rebuild

### Deploy to AWS/Azure/GCP

Add to your CI/CD configuration (e.g., `.gitlab-ci.yml`, GitHub Actions):

```yaml
env:
  VITE_SENTRY_DSN: ${{ secrets.VITE_SENTRY_DSN }}
```

Store DSN in secrets/environment variables (never commit to git).

---

## What Gets Logged

### Automatic Logging

✅ **Runtime Errors:**
- Unhandled JavaScript errors
- Unhandled promise rejections
- React component errors (via ErrorBoundary)

✅ **API Errors:**
- Network failures
- HTTP errors (4xx, 5xx)
- Timeout errors

✅ **Performance:**
- Page load times
- API response times
- Component render performance (10% sample rate)

### Security Event Logging

✅ **Authentication Events:**
- Failed login attempts
- Token expiration
- Invalid tokens

✅ **Authorization Events:**
- Permission denied (403 errors)
- Unauthorized access attempts

### User Context

Each error includes:
- User ID (masked)
- Email (partially masked: `inf***@infysight.com`)
- Tenant ID
- User roles
- Timestamp

---

## Privacy & Security

### Data Protection

✅ **Sensitive Data Filtering:**
- Authorization headers removed
- Cookie headers removed
- Email addresses masked
- Passwords never logged

✅ **Session Replay:**
- 10% of normal sessions recorded
- 100% of error sessions recorded
- All text masked by default
- All media blocked by default

### Configuration

In `src/config/sentry.ts`:

```typescript
beforeSend(event) {
  // Scrub sensitive data
  if (event.request?.headers) {
    delete event.request.headers['Authorization']
    delete event.request.headers['Cookie']
  }
  
  // Mask email
  if (event.user?.email) {
    event.user.email = event.user.email.replace(
      /^(.{3}).*(@.*)$/, 
      '$1***$2'
    )
  }
  
  return event
}
```

---

## Monitoring Dashboard

### Key Metrics to Watch

1. **Error Rate**
   - Sentry → Overview → Error rate graph
   - Watch for spikes

2. **Security Events**
   - Issues → Filter by tag `security=true`
   - Monitor failed login attempts

3. **Performance**
   - Performance → Web Vitals
   - Watch for slow page loads

4. **User Impact**
   - Issues → Sort by "Users affected"
   - Prioritize high-impact errors

---

## Troubleshooting

### "Sentry: DSN not configured" Warning

**Problem:** Sentry initialization warning in console

**Solution:**
1. Check if `VITE_SENTRY_DSN` is in `.env.development` or `.env.production`
2. Restart dev server: `npm run dev`
3. For production build: rebuild with DSN environment variable

### No Errors Appearing in Sentry

**Check:**
1. ✅ DSN is correct (no typos)
2. ✅ Internet connection available
3. ✅ Sentry project is active (not paused)
4. ✅ Browser extensions not blocking (AdBlock may block Sentry)
5. ✅ Check browser console for Sentry errors

**Test:**
```javascript
// In browser console
throw new Error("Test Error")
```

Should appear in Sentry within 1-2 seconds.

### "beforeSend" Not Filtering Data

**Check:**
1. Review `src/config/sentry.ts`
2. Ensure `beforeSend` function is properly configured
3. Check Sentry dashboard → Settings → Data Scrubbing

---

## Cost & Limits

### Sentry Free Tier

- ✅ 5,000 errors/month
- ✅ 10,000 performance units/month
- ✅ 500 replays/month
- ✅ 1 project
- ✅ Unlimited team members

**For most applications, this is sufficient for monitoring.**

### Paid Plans (Optional)

If you exceed free tier:
- **Team:** $26/month (50K errors)
- **Business:** $80/month (100K errors)

---

## Best Practices

### 1. Set Up Alerts Early
Configure alerts for critical errors immediately after setup.

### 2. Monitor Weekly
Review Sentry dashboard at least once per week for patterns.

### 3. Triage Issues
Categorize issues:
- 🔴 **Critical:** Security breaches, data loss
- 🟡 **High:** Features broken, login fails
- 🟢 **Low:** Minor UI issues, warnings

### 4. Fix High-Impact Issues First
Sort by "Users affected" and fix issues affecting most users first.

### 5. Use Release Tracking
Tag releases in Sentry to track which version introduced bugs:
```bash
sentry-cli releases new <version>
```

---

## Support & Resources

- **Sentry Docs:** https://docs.sentry.io/platforms/javascript/guides/react/
- **Configuration:** `src/config/sentry.ts`
- **Integration:** `src/main.tsx`
- **Security Logging:** `src/providers/authProvider.ts`

---

## Summary

✅ **Sentry is configured** - just needs DSN  
✅ **Security logging ready** - auth events, permission denials  
✅ **Privacy protected** - sensitive data filtered  
✅ **Production ready** - set DSN and deploy  

**Next Step:** Get your DSN from https://sentry.io/ and add to `.env.development`
