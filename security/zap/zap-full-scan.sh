#!/bin/bash

# OWASP ZAP Full Active Scan
# WARNING: This is invasive and may modify data!
# Only run against test environments

TARGET_URL="${1:-http://host.docker.internal:4173}"
ZAP_PORT="${ZAP_PORT:-8090}"
REPORT_DIR="./security/zap/reports"

echo "════════════════════════════════════════════════════"
echo "OWASP ZAP Full Active Scan"
echo "⚠️  WARNING: This scan is INVASIVE!"
echo "════════════════════════════════════════════════════"
echo "Target: $TARGET_URL"
echo "ZAP Port: $ZAP_PORT"
echo ""

read -p "Are you sure you want to run an active scan? (yes/no) " -n 3 -r
echo
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "❌ Scan cancelled"
    exit 1
fi

# Create reports directory
mkdir -p "$REPORT_DIR"

# Run ZAP full scan using Docker
# Use --add-host to map host.docker.internal on macOS/Linux
docker run --rm \
  --add-host=host.docker.internal:host-gateway \
  -v "$(pwd)/$REPORT_DIR:/zap/wrk/:rw" \
  -t zaproxy/zap-stable \
  zap-full-scan.py \
  -t "$TARGET_URL" \
  -r "full-scan-report-$(date +%Y%m%d-%H%M%S).html" \
  -l INFO \
  -I

echo ""
echo "✅ Scan complete! Report saved to $REPORT_DIR"
