# System Endpoints Implementation

## Overview
Implemented system monitoring and configuration endpoints in the frontend. These endpoints provide visibility into system health, configuration, logs, and metrics.

## Implemented Endpoints

### 1. Health Check (`/api/v1/health`)
**Component**: `HealthStatus.tsx`

**Features**:
- Overall system status (ok, degraded, error)
- Database migrations status
- Key rotation version
- Auto-refreshes every 30 seconds
- No authentication required (public endpoint)

**Response**:
```json
{
  "status": "ok",
  "migrations_applied": true,
  "key_rotation_version": 1
}
```

### 2. Configuration Viewer (`/api/v1/config`, `/api/v1/config/errors`)
**Component**: `ConfigViewer.tsx`

**Features**:
- Displays all system configuration entries
- Shows config hash (SHA256) for change detection
- Secret masking for sensitive values
- Search/filter functionality
- Displays configuration errors if any
- Type indicators (string, number, boolean)

**Response**:
```json
{
  "hash": "78cae261...",
  "entries": {
    "APP_NAME": {
      "value": "modern-backend",
      "secret": false
    },
    "PASSWORD_MIN_LENGTH": {
      "value": 12,
      "secret": false
    }
  }
}
```

### 3. Logs Export (`/api/v1/logs/export`)
**Component**: `LogsViewer.tsx`

**Features**:
- View system logs with filtering
- Filter by:
  - Limit (1-10,000 records)
  - Category (info, warning, error)
  - Tenant ID
  - Correlation ID
  - Time range (since/until)
- Expandable log entries showing full details
- Redaction status indicator
- Shows truncation warnings
- Includes HTTP request details, headers, timing

**Response**:
```json
{
  "records": [
    {
      "ts": "2025-10-17T16:42:17.830039+00:00",
      "level": "info",
      "msg": "request",
      "http_method": "POST",
      "path": "/api/v1/auth/login",
      "status_code": 200,
      "duration_ms": 93.98,
      "tenant_id": null,
      "correlation_id": "pending",
      "had_redaction": false,
      "headers": {...}
    }
  ],
  "truncated": true,
  "total_available": 11,
  "reason": "size_limit"
}
```

### 4. Metrics Snapshot (`/api/v1/metrics/snapshot`)
**Component**: `MetricsViewer.tsx`

**Features**:
- Lists available metrics in the system
- Link to Prometheus metrics endpoint (`/metrics`)
- Simple overview of metric names

**Response**:
```json
{
  "metrics": [
    "justifications_count",
    "quality_gates_fail_created",
    "quality_gates_fail_total"
  ]
}
```

## Authorization

System monitoring endpoints are **Superadmin only**:

| Resource           | Superadmin | Tenant Admin | Regular User |
|--------------------|------------|--------------|--------------|
| system-health      | ✅         | ❌           | ❌           |
| system-config      | ✅         | ❌           | ❌           |
| system-logs        | ✅         | ❌           | ❌           |
| system-metrics     | ✅         | ❌           | ❌           |

## Navigation

System resources appear in the sidebar menu:
- 🏥 **System Health** - Health check status
- ⚙️ **Configuration** - System config viewer
- 📄 **Logs** - Log export and filtering
- 📊 **Metrics** - Metrics snapshot

## Files Created

1. **Type Definitions**:
   - `src/types/system.ts` - TypeScript types for all system endpoints

2. **Components**:
   - `src/resources/system/HealthStatus.tsx` - Health check viewer
   - `src/resources/system/ConfigViewer.tsx` - Configuration viewer
   - `src/resources/system/LogsViewer.tsx` - Logs export viewer
   - `src/resources/system/MetricsViewer.tsx` - Metrics snapshot viewer
   - `src/resources/system/index.tsx` - Export index

3. **Configuration**:
   - Updated `src/types/index.ts` - Export system types
   - Updated `src/App.tsx` - Register system resources
   - Updated `src/utils/permissions.ts` - Add RBAC rules for system resources

## Technical Details

### Health Status
- Auto-refreshes every 30 seconds
- Color-coded status indicators (green/yellow/red)
- Shows migration status with checkmarks
- Displays key rotation version

### Config Viewer
- Fetches both config and errors in parallel
- Search functionality filters config entries
- Secrets are masked with `••••••••`
- Shows data types and secret status
- Displays SHA256 hash for change tracking

### Logs Viewer
- Advanced filtering with multiple criteria
- Accordion-style expandable log entries
- Syntax highlighting for JSON data
- Shows HTTP request/response details
- Duration in milliseconds
- Redaction warnings for sensitive data
- Pagination support with truncation warnings

### Metrics Viewer
- Simple list of available metrics
- Link to raw Prometheus endpoint
- Chip-style display for metric names

## Usage

1. **Login as Superadmin**:
   ```
   Email: infysightsa@infysight.com
   Password: infysightsa123
   ```

2. **Navigate to System Resources**:
   - Click "System Health" in sidebar to view health status
   - Click "Configuration" to view system config
   - Click "Logs" to search and filter logs
   - Click "Metrics" to view available metrics

3. **Filter Logs**:
   - Set limit (default 100, max 10,000)
   - Select category (info, warning, error)
   - Enter tenant ID or correlation ID
   - Click "Apply Filters" or "Refresh"

## Notes

- Health endpoint is public (no auth required)
- All other system endpoints require authentication
- System resources are hidden from non-superadmin users
- Logs are automatically redacted (sensitive headers masked)
- Config secrets are always masked in the UI
- Metrics endpoint also supports raw Prometheus format at `/metrics`

## Future Enhancements

Potential improvements:
- Real-time log streaming with WebSocket
- Metrics visualization with charts
- Config editing capability (with validation)
- Export logs to CSV/JSON
- Advanced log search (regex, multi-field)
- Time-series metrics graphs
- Alert configuration based on health status
