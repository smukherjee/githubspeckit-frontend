# OWASP ZAP Security Testing Guide

## Overview

OWASP ZAP (Zed Attack Proxy) is an open-source web application security scanner used to find vulnerabilities in web applications during development and testing.

**Use Cases:**
- Automated security scanning
- Penetration testing
- API security testing
- CI/CD integration
- Security regression testing

---

## Prerequisites

### Install OWASP ZAP

**macOS:**
```bash
brew install --cask owasp-zap
```

**Linux:**
```bash
# Download from https://www.zaproxy.org/download/
wget https://github.com/zaproxy/zaproxy/releases/download/v2.14.0/ZAP_2.14.0_Linux.tar.gz
tar -xvf ZAP_2.14.0_Linux.tar.gz
```

**Windows:**
Download installer from https://www.zaproxy.org/download/

**Docker (Recommended for CI/CD):**
```bash
docker pull zaproxy/zap-stable
```

---

## Project Setup

### 1. Install ZAP Node.js Client

```bash
npm install --save-dev zaproxy
```

### 2. Create ZAP Configuration Directory

```bash
mkdir -p security/zap
```

---

## ZAP Scanning Scripts

### Basic Automated Scan

Create `security/zap/zap-baseline-scan.sh`:

```bash
#!/bin/bash

# OWASP ZAP Baseline Scan
# Runs a passive scan against the target URL

TARGET_URL="${1:-http://localhost:4173}"
ZAP_PORT="${ZAP_PORT:-8090}"
REPORT_DIR="./security/zap/reports"

echo "════════════════════════════════════════════════════"
echo "OWASP ZAP Baseline Scan"
echo "════════════════════════════════════════════════════"
echo "Target: $TARGET_URL"
echo "ZAP Port: $ZAP_PORT"
echo ""

# Create reports directory
mkdir -p "$REPORT_DIR"

# Run ZAP baseline scan using Docker
docker run --rm \
  -v "$(pwd)/$REPORT_DIR:/zap/wrk/:rw" \
  -t zaproxy/zap-stable \
  zap-baseline.py \
  -t "$TARGET_URL" \
  -r "baseline-report-$(date +%Y%m%d-%H%M%S).html" \
  -l INFO \
  -I

echo ""
echo "✅ Scan complete! Report saved to $REPORT_DIR"
```

### Full Active Scan

Create `security/zap/zap-full-scan.sh`:

```bash
#!/bin/bash

# OWASP ZAP Full Active Scan
# WARNING: This is invasive and may modify data!
# Only run against test environments

TARGET_URL="${1:-http://localhost:4173}"
ZAP_PORT="${ZAP_PORT:-8090}"
REPORT_DIR="./security/zap/reports"

echo "════════════════════════════════════════════════════"
echo "OWASP ZAP Full Active Scan"
echo "⚠️  WARNING: This scan is INVASIVE!"
echo "════════════════════════════════════════════════════"
echo "Target: $TARGET_URL"
echo "ZAP Port: $ZAP_PORT"
echo ""

read -p "Are you sure you want to run an active scan? (yes/no) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Scan cancelled"
    exit 1
fi

# Create reports directory
mkdir -p "$REPORT_DIR"

# Run ZAP full scan using Docker
docker run --rm \
  -v "$(pwd)/$REPORT_DIR:/zap/wrk/:rw" \
  -t zaproxy/zap-stable \
  zap-full-scan.py \
  -t "$TARGET_URL" \
  -r "full-scan-report-$(date +%Y%m%d-%H%M%S).html" \
  -l INFO \
  -I

echo ""
echo "✅ Scan complete! Report saved to $REPORT_DIR"
```

### API Security Scan

Create `security/zap/zap-api-scan.sh`:

```bash
#!/bin/bash

# OWASP ZAP API Scan
# Scans REST API endpoints

API_URL="${1:-http://localhost:8000/api/v1}"
API_DEFINITION="${2:-./security/zap/api-definition.json}"
REPORT_DIR="./security/zap/reports"

echo "════════════════════════════════════════════════════"
echo "OWASP ZAP API Security Scan"
echo "════════════════════════════════════════════════════"
echo "API URL: $API_URL"
echo "API Definition: $API_DEFINITION"
echo ""

# Create reports directory
mkdir -p "$REPORT_DIR"

# Run ZAP API scan using Docker
docker run --rm \
  -v "$(pwd)/$REPORT_DIR:/zap/wrk/:rw" \
  -v "$(pwd)/$API_DEFINITION:/zap/api-definition.json:ro" \
  -t zaproxy/zap-stable \
  zap-api-scan.py \
  -t "$API_URL" \
  -f openapi \
  -r "api-scan-report-$(date +%Y%m%d-%H%M%S).html" \
  -l INFO

echo ""
echo "✅ Scan complete! Report saved to $REPORT_DIR"
```

---

## Automated Testing Script

Create `security/zap/run-security-tests.js`:

```javascript
#!/usr/bin/env node

/**
 * OWASP ZAP Automated Security Testing
 * 
 * Runs ZAP security scans programmatically via Node.js
 */

const ZAP = require('zaproxy');
const fs = require('fs');
const path = require('path');

// Configuration
const ZAP_API_KEY = process.env.ZAP_API_KEY || 'changeme';
const ZAP_PROXY = process.env.ZAP_PROXY || 'http://localhost:8090';
const TARGET_URL = process.env.TARGET_URL || 'http://localhost:4173';
const REPORT_DIR = './security/zap/reports';

// Initialize ZAP client
const zaproxy = new ZAP({
  apiKey: ZAP_API_KEY,
  proxy: ZAP_PROXY
});

// Ensure report directory exists
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

/**
 * Run Spider to discover URLs
 */
async function runSpider() {
  console.log('🕷️  Starting Spider scan...');
  
  try {
    const scanId = await zaproxy.spider.scan({
      url: TARGET_URL,
      maxChildren: 10,
      recurse: true,
      contextName: '',
      subtreeOnly: false
    });
    
    console.log(`   Spider scan started (ID: ${scanId})`);
    
    // Wait for spider to complete
    let progress = 0;
    while (progress < 100) {
      await sleep(2000);
      const status = await zaproxy.spider.status(scanId);
      progress = parseInt(status);
      process.stdout.write(`\r   Progress: ${progress}%`);
    }
    
    console.log('\n   ✅ Spider scan complete');
    
    // Get discovered URLs
    const urls = await zaproxy.spider.results(scanId);
    console.log(`   Found ${urls.length} URLs`);
    
    return urls;
  } catch (error) {
    console.error('   ❌ Spider scan failed:', error.message);
    throw error;
  }
}

/**
 * Run Passive Scan
 */
async function runPassiveScan() {
  console.log('\n🔍 Starting Passive scan...');
  
  try {
    // Passive scanning happens automatically
    // Just wait for it to complete
    let recordsToScan = 1;
    while (recordsToScan > 0) {
      await sleep(2000);
      const status = await zaproxy.pscan.recordsToScan();
      recordsToScan = parseInt(status);
      if (recordsToScan > 0) {
        process.stdout.write(`\r   Records to scan: ${recordsToScan}`);
      }
    }
    
    console.log('\n   ✅ Passive scan complete');
  } catch (error) {
    console.error('   ❌ Passive scan failed:', error.message);
    throw error;
  }
}

/**
 * Run Active Scan (WARNING: Invasive!)
 */
async function runActiveScan() {
  console.log('\n⚠️  Starting Active scan (INVASIVE)...');
  
  try {
    const scanId = await zaproxy.ascan.scan({
      url: TARGET_URL,
      recurse: true,
      inScopeOnly: false,
      scanPolicyName: '',
      method: '',
      postData: ''
    });
    
    console.log(`   Active scan started (ID: ${scanId})`);
    
    // Wait for scan to complete
    let progress = 0;
    while (progress < 100) {
      await sleep(5000);
      const status = await zaproxy.ascan.status(scanId);
      progress = parseInt(status);
      process.stdout.write(`\r   Progress: ${progress}%`);
    }
    
    console.log('\n   ✅ Active scan complete');
  } catch (error) {
    console.error('   ❌ Active scan failed:', error.message);
    throw error;
  }
}

/**
 * Get Alerts (Vulnerabilities)
 */
async function getAlerts() {
  console.log('\n📋 Retrieving security alerts...');
  
  try {
    const alerts = await zaproxy.core.alerts({
      baseurl: TARGET_URL,
      start: 0,
      count: 100
    });
    
    // Group alerts by risk level
    const grouped = {
      High: [],
      Medium: [],
      Low: [],
      Informational: []
    };
    
    alerts.forEach(alert => {
      if (grouped[alert.risk]) {
        grouped[alert.risk].push(alert);
      }
    });
    
    console.log('\n   Security Findings:');
    console.log(`   🔴 High:          ${grouped.High.length}`);
    console.log(`   🟡 Medium:        ${grouped.Medium.length}`);
    console.log(`   🟢 Low:           ${grouped.Low.length}`);
    console.log(`   ℹ️  Informational: ${grouped.Informational.length}`);
    
    return { alerts, grouped };
  } catch (error) {
    console.error('   ❌ Failed to retrieve alerts:', error.message);
    throw error;
  }
}

/**
 * Generate HTML Report
 */
async function generateReport() {
  console.log('\n📄 Generating HTML report...');
  
  try {
    const htmlReport = await zaproxy.core.htmlreport();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(REPORT_DIR, `zap-report-${timestamp}.html`);
    
    fs.writeFileSync(reportPath, htmlReport);
    
    console.log(`   ✅ Report saved: ${reportPath}`);
    
    return reportPath;
  } catch (error) {
    console.error('   ❌ Failed to generate report:', error.message);
    throw error;
  }
}

/**
 * Generate JSON Report
 */
async function generateJsonReport(alerts) {
  console.log('📊 Generating JSON report...');
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(REPORT_DIR, `zap-report-${timestamp}.json`);
    
    const report = {
      timestamp: new Date().toISOString(),
      target: TARGET_URL,
      summary: {
        high: alerts.grouped.High.length,
        medium: alerts.grouped.Medium.length,
        low: alerts.grouped.Low.length,
        informational: alerts.grouped.Informational.length,
        total: alerts.alerts.length
      },
      alerts: alerts.alerts
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`   ✅ JSON report saved: ${reportPath}`);
    
    return reportPath;
  } catch (error) {
    console.error('   ❌ Failed to generate JSON report:', error.message);
    throw error;
  }
}

/**
 * Check if build passes security threshold
 */
function checkSecurityThreshold(grouped) {
  console.log('\n🎯 Checking security threshold...');
  
  const highCount = grouped.High.length;
  const mediumCount = grouped.Medium.length;
  
  // Fail if there are any High severity issues
  if (highCount > 0) {
    console.log('   ❌ FAILED: High severity vulnerabilities found!');
    return false;
  }
  
  // Warn if there are Medium severity issues
  if (mediumCount > 0) {
    console.log(`   ⚠️  WARNING: ${mediumCount} medium severity issues found`);
  }
  
  console.log('   ✅ PASSED: No high severity vulnerabilities');
  return true;
}

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main execution
 */
async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('OWASP ZAP Automated Security Testing');
  console.log('═══════════════════════════════════════════════');
  console.log(`Target: ${TARGET_URL}`);
  console.log(`ZAP Proxy: ${ZAP_PROXY}`);
  console.log('');
  
  try {
    // Check if ZAP is running
    await zaproxy.core.version();
    console.log('✅ Connected to ZAP');
    
    // Run security tests
    await runSpider();
    await runPassiveScan();
    
    // Optionally run active scan (commented by default)
    // await runActiveScan();
    
    // Get results
    const alerts = await getAlerts();
    
    // Generate reports
    await generateReport();
    await generateJsonReport(alerts);
    
    // Check security threshold
    const passed = checkSecurityThreshold(alerts.grouped);
    
    console.log('\n═══════════════════════════════════════════════');
    console.log('Scan Complete!');
    console.log('═══════════════════════════════════════════════\n');
    
    // Exit with appropriate code
    process.exit(passed ? 0 : 1);
    
  } catch (error) {
    console.error('\n❌ Security scan failed:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main };
```

Make the script executable:
```bash
chmod +x security/zap/run-security-tests.js
```

---

## CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/security-scan.yml`:

```yaml
name: OWASP ZAP Security Scan

on:
  push:
    branches: [main, master, develop]
  pull_request:
    branches: [main, master]
  schedule:
    # Run weekly on Mondays at 9 AM
    - cron: '0 9 * * 1'

jobs:
  zap-scan:
    runs-on: ubuntu-latest
    name: OWASP ZAP Security Scan
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
        env:
          VITE_API_BASE_URL: http://localhost:8000/api/v1
      
      - name: Start preview server
        run: |
          npm run preview &
          sleep 10
      
      - name: Run ZAP Baseline Scan
        uses: zaproxy/action-baseline@v0.9.0
        with:
          target: 'http://localhost:4173'
          rules_file_name: 'security/zap/zap-rules.tsv'
          cmd_options: '-a'
      
      - name: Upload ZAP Report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: zap-scan-report
          path: report_html.html
      
      - name: Create Issue on Failure
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '🔴 Security vulnerabilities found by OWASP ZAP',
              body: 'OWASP ZAP scan detected security vulnerabilities. Please review the scan report.',
              labels: ['security', 'vulnerability']
            })
```

### GitLab CI/CD

Create `.gitlab-ci.yml`:

```yaml
security-scan:
  stage: test
  image: node:18
  services:
    - zaproxy/zap-stable:latest
  
  variables:
    ZAP_PROXY: "http://zap:8080"
    TARGET_URL: "http://localhost:4173"
  
  before_script:
    - npm ci
    - npm run build
  
  script:
    - npm run preview &
    - sleep 10
    - |
      docker run --rm \
        -v $(pwd)/security/zap/reports:/zap/wrk/:rw \
        zaproxy/zap-stable \
        zap-baseline.py \
        -t $TARGET_URL \
        -r baseline-report.html \
        -l INFO
  
  artifacts:
    paths:
      - security/zap/reports/
    when: always
    expire_in: 30 days
  
  only:
    - merge_requests
    - main
    - develop
```

---

## ZAP Configuration

### Custom Rules File

Create `security/zap/zap-rules.tsv`:

```tsv
# OWASP ZAP Custom Rules
# Format: ID	THRESHOLD	[IGNORE/WARN/FAIL]

# Ignore false positives
10096	IGNORE	# Timestamp Disclosure
10109	IGNORE	# Modern Web Application

# Warn on these findings
10015	WARN	# Re-examine Cache-control Directives
10021	WARN	# X-Content-Type-Options Header Missing

# Fail on critical issues
40012	FAIL	# Cross Site Scripting (Reflected)
40014	FAIL	# Cross Site Scripting (Persistent)
40018	FAIL	# SQL Injection
90019	FAIL	# Server Side Code Injection
```

### ZAP Context File

Create `security/zap/zap-context.xml`:

```xml
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<configuration>
  <context>
    <name>GitHubSpecKit Frontend</name>
    <desc>Security context for frontend application</desc>
    <inscope>true</inscope>
    <incregexes>http://localhost:4173/.*</incregexes>
    <tech>
      <include>JavaScript</include>
      <include>React</include>
      <include>Node.js</include>
    </tech>
    <authentication>
      <type>1</type>
      <strategy>EACH_RESP</strategy>
      <pollurl></pollurl>
      <polldata></polldata>
      <pollheaders></pollheaders>
      <pollfreq>60</pollfreq>
      <pollunits>1</pollunits>
    </authentication>
  </context>
</configuration>
```

---

## NPM Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "security:zap:baseline": "bash security/zap/zap-baseline-scan.sh",
    "security:zap:full": "bash security/zap/zap-full-scan.sh",
    "security:zap:api": "bash security/zap/zap-api-scan.sh",
    "security:zap:auto": "node security/zap/run-security-tests.js",
    "security:all": "npm run lint && npm run security:zap:baseline"
  }
}
```

---

## Usage Examples

### Quick Baseline Scan

```bash
# Start preview server
npm run preview

# In another terminal, run baseline scan
npm run security:zap:baseline
```

### Full Security Audit

```bash
# Start preview server
npm run preview

# Run full scan (WARNING: Invasive!)
npm run security:zap:full
```

### API Security Test

```bash
# Ensure backend is running
# Then run API scan
npm run security:zap:api http://localhost:8000
```

### Automated Testing

```bash
# Start ZAP daemon
docker run -u zap -p 8090:8090 -d zaproxy/zap-stable zap.sh -daemon -port 8090 -host 0.0.0.0 -config api.key=changeme

# Start preview
npm run preview

# Run automated tests
npm run security:zap:auto
```

---

## Interpreting Results

### Risk Levels

- 🔴 **High**: Critical vulnerabilities requiring immediate attention
- 🟡 **Medium**: Important issues that should be fixed soon
- 🟢 **Low**: Minor issues for consideration
- ℹ️ **Informational**: Best practices and recommendations

### Common Findings

1. **X-Frame-Options Header Not Set**
   - Risk: Medium
   - Fix: Add header in backend/server config

2. **Content Security Policy (CSP) Not Set**
   - Risk: Medium
   - Fix: Add CSP headers

3. **X-Content-Type-Options Header Missing**
   - Risk: Low
   - Fix: Add `X-Content-Type-Options: nosniff`

4. **Cookie Without Secure Flag**
   - Risk: Low
   - Fix: Set `Secure` flag on cookies

---

## Best Practices

### 1. Regular Scanning
- Run baseline scans on every PR
- Run full scans weekly
- Run after major changes

### 2. Integrate with CI/CD
- Automate scans in pipeline
- Fail builds on high severity issues
- Track vulnerabilities over time

### 3. False Positive Management
- Review and document false positives
- Update `zap-rules.tsv` accordingly
- Re-scan after fixes

### 4. Security Champions
- Assign security ownership
- Review ZAP reports regularly
- Prioritize fixes

---

## Troubleshooting

### ZAP Not Starting

```bash
# Check if ZAP is running
docker ps | grep zap

# Restart ZAP
docker restart <container-id>
```

### Connection Refused

```bash
# Check ZAP proxy port
netstat -an | grep 8090

# Use different port
ZAP_PORT=8091 npm run security:zap:baseline
```

### Timeout Issues

Increase timeout in scan scripts:
```bash
--timeout 300
```

---

## Resources

- **OWASP ZAP Documentation**: https://www.zaproxy.org/docs/
- **ZAP API Documentation**: https://www.zaproxy.org/docs/api/
- **ZAP Docker**: https://hub.docker.com/r/zaproxy/zap-stable
- **ZAP GitHub Actions**: https://github.com/zaproxy/action-baseline

---

## Security Compliance

Using OWASP ZAP helps achieve:

- ✅ OWASP Top 10 coverage
- ✅ PCI DSS compliance
- ✅ GDPR security requirements
- ✅ SOC 2 security controls
- ✅ ISO 27001 requirements

---

## Next Steps

1. ✅ Install OWASP ZAP
2. ✅ Run baseline scan
3. ✅ Review findings
4. ✅ Fix high/medium issues
5. ✅ Integrate with CI/CD
6. ✅ Schedule regular scans

**Happy Secure Coding! 🔒**
