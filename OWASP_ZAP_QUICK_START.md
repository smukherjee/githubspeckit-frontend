# OWASP ZAP Quick Start Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Install Docker

Make sure Docker is installed and running:
```bash
docker --version
```

If not installed, get Docker from: https://www.docker.com/get-started

### Step 2: Start Your Application

```bash
# Terminal 1: Start preview server
npm run preview
```

Your app should be running at `http://localhost:4173`

### Step 3: Run Your First Security Scan

```bash
# Terminal 2: Run baseline scan
npm run security:zap:baseline
```

**That's it!** Your first security scan is running. 🎉

---

## 📊 Understanding Results

After the scan completes, you'll find a report in:
```
security/zap/reports/baseline-report-YYYYMMDD-HHMMSS.html
```

Open it in your browser to see:

### Risk Levels
- 🔴 **High** - Fix immediately! Critical security issues
- 🟡 **Medium** - Fix soon. Important vulnerabilities
- 🟢 **Low** - Consider fixing. Minor issues
- ℹ️ **Informational** - Best practices & recommendations

---

## 🎯 Common Scans

### 1. Baseline Scan (Recommended for Daily Use)
**What:** Passive scan, non-invasive, safe for production
**When:** Every code commit, pull request
**Time:** ~2-5 minutes

```bash
npm run security:zap:baseline
```

### 2. Full Scan (Test Environments Only!)
**What:** Active scan, invasive, may modify data
**When:** Before major releases, weekly security audits
**Time:** ~10-30 minutes

```bash
npm run security:zap:full
```

⚠️ **WARNING:** Only run full scans on test environments!

### 3. API Scan
**What:** Tests REST API endpoints
**When:** API changes, new endpoints added
**Time:** ~5-15 minutes

```bash
npm run security:zap:api http://localhost:8000
```

---

## 🔧 Advanced Usage

### Run ZAP with Custom Target

```bash
npm run security:zap:baseline http://your-staging-url.com
```

### Automated Testing with ZAP Daemon

```bash
# Start ZAP in daemon mode
docker run -u zap -p 8090:8090 -d zaproxy/zap-stable \
  zap.sh -daemon -port 8090 -host 0.0.0.0 -config api.key=changeme

# Wait for ZAP to start
sleep 5

# Start your app
npm run preview &
sleep 5

# Run automated tests
npm run security:zap:auto
```

---

## 🤖 CI/CD Integration

### GitHub Actions (Already Set Up!)

The workflow runs automatically on:
- ✅ Push to main/develop branches
- ✅ Pull requests
- ✅ Weekly schedule (Mondays 9 AM)
- ✅ Manual trigger

View results at: **Actions** → **OWASP ZAP Security Scan**

### Manual Trigger

1. Go to **Actions** tab in GitHub
2. Select **OWASP ZAP Security Scan**
3. Click **Run workflow**
4. Choose branch and click **Run**

---

## 🛠️ Troubleshooting

### Docker Not Found
```bash
# Install Docker
# macOS: brew install --cask docker
# Or download from https://www.docker.com/
```

### Port Already in Use
```bash
# Kill process on port 4173
lsof -ti:4173 | xargs kill -9

# Or use different port
PORT=5173 npm run preview
npm run security:zap:baseline http://localhost:5173
```

### Scan Fails with Connection Error
```bash
# Check if app is running
curl http://localhost:4173

# Check Docker is running
docker ps

# Restart Docker and try again
```

### False Positives

If ZAP reports issues that aren't real vulnerabilities:

1. Open `security/zap/zap-rules.tsv`
2. Add rule to IGNORE:
   ```
   10096	IGNORE	# Timestamp Disclosure (false positive)
   ```
3. Re-run scan

---

## 📚 Learn More

- **Full Documentation:** [OWASP_ZAP_GUIDE.md](./OWASP_ZAP_GUIDE.md)
- **OWASP ZAP Website:** https://www.zaproxy.org/
- **ZAP Getting Started:** https://www.zaproxy.org/getting-started/

---

## ✅ Security Checklist

- [ ] Run baseline scan on every commit
- [ ] Fix all HIGH severity issues before merge
- [ ] Review MEDIUM issues weekly
- [ ] Schedule full scans monthly
- [ ] Update ZAP rules for false positives
- [ ] Monitor GitHub Actions for scan failures
- [ ] Document security fixes in commits

---

## 🎉 You're Secure!

Your application now has automated security testing with OWASP ZAP.

**Next Steps:**
1. Run your first scan: `npm run security:zap:baseline`
2. Review the report
3. Fix any issues found
4. Integrate into your workflow

Happy secure coding! 🔒
