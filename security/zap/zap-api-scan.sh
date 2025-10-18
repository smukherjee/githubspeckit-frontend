#!/bin/bash

# OWASP ZAP API Scan
# Scans REST API endpoints

API_URL="${1:-http://host.docker.internal:8000/api/v1}"
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

# Check if API definition exists
if [ ! -f "$API_DEFINITION" ]; then
    echo "⚠️  Warning: API definition not found at $API_DEFINITION"
    echo "   Running scan without API definition..."
    
    docker run --rm \
      --add-host=host.docker.internal:host-gateway \
      -v "$(pwd)/$REPORT_DIR:/zap/wrk/:rw" \
      -t zaproxy/zap-stable \
      zap-baseline.py \
      -t "$API_URL" \
      -r "api-scan-report-$(date +%Y%m%d-%H%M%S).html" \
      -l INFO
else
    docker run --rm \
      --add-host=host.docker.internal:host-gateway \
      -v "$(pwd)/$REPORT_DIR:/zap/wrk/:rw" \
      -v "$(pwd)/$API_DEFINITION:/zap/api-definition.json:ro" \
      -t zaproxy/zap-stable \
      zap-api-scan.py \
      -t "$API_URL" \
      -f openapi \
      -r "api-scan-report-$(date +%Y%m%d-%H%M%S).html" \
      -l INFO
fi

echo ""
echo "✅ Scan complete! Report saved to $REPORT_DIR"
