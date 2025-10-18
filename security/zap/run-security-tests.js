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
