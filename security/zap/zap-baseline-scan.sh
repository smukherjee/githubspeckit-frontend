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
