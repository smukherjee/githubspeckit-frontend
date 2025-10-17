# CRUD Operations Systematic Fixes

## Overview
Fixed all CRUD operations across all resource screens to match actual backend API schemas and endpoint specifications.

## Changes Made

### 1. Feature Flags Resource (`src/resources/featureFlags/index.tsx`)

**Before:**
- Fields: `name`, `flag_type`, `status`, `values`
- Create error: "type: missing" - wrong field names

**After:**
- Fields: `key`, `state`, `variant`, `flag_id` (matching FeatureFlagResponse schema)
- List now displays: Key, State, Variant
- Create/Edit forms use correct fields
- Show view displays all response fields: id, flag_id, key, state, variant, tenant_id

**Schema Compliance:**
```typescript
// FeatureFlagCreate (required fields)
{
  tenant_id: string (required)
  key: string (required)
  state?: FlagState (default: disabled)
  variant?: string
  flag_id?: string
}

// FeatureFlagResponse
{
  id: string
  flag_id: string
  tenant_id: string
  key: string
  state: FlagState
  variant?: string
}
```

### 2. Policies Resource (`src/resources/policies/index.tsx`)

**Before:**
- Fields: `resource_type`, `action`, `effect`, `conditions`
- Create error: "Method Not Allowed" - using wrong endpoint
- Had non-existent fields from schema

**After:**
- Fields: `policy_id`, `version`, `resource_type`, `condition_expression`, `effect`
- Create endpoint: `/policies/register` (not `/policies`)
- List displays: resource_type, condition_expression, effect, version
- Show displays all fields including created_by and created_at

**Schema Compliance:**
```typescript
// PolicyRegistrationRequest (use for create)
{
  policy_id: string (required)
  version: number (required)
  resource_type: string (required)
  condition_expression: string (required)
  effect: string (required) // "Allow" or "Deny"
}

// PolicyResponse
{
  id: string
  policy_id: string
  version: number
  resource_type: string
  condition_expression: string
  effect: string
  created_by?: string
  created_at?: string
}
```

**Data Provider Update:**
- Added special handling: `resource === 'policies'` routes create to `/policies/register` endpoint
- Properly marshals PolicyRegistrationRequest format

### 3. Invitations Resource (`src/resources/invitations/index.tsx`)

**Before:**
- Had Create/Edit forms
- Used non-existent `roles` field
- Attempted to create invitations via standard endpoint

**After:**
- Read-only resource (List and Show only)
- Remove create/edit/delete operations
- List displays: email, status, expires_at, created_at
- Show displays: id, invitation_id, email, status, expires_at, created_at, tenant_id
- Revoke button remains for pending invitations

**Schema Compliance:**
```typescript
// InvitationResponse (read-only)
{
  id: string
  invitation_id: string
  status: string (required)
  email?: string
  tenant_id?: string
  created_at?: string
  expires_at?: string
}

// Only operations:
// - GET /api/v1/invitations (list)
// - POST /api/v1/invitations/{invitation_id}/accept (accept)
// - POST /api/v1/invitations/{invitation_id}/revoke (revoke)
```

**Data Provider Updates:**
- Disable create for invitations
- Disable update for invitations
- Disable delete for invitations
- Revoke endpoint handled separately in Show component

### 4. Audit Events Resource (`src/resources/auditEvents/index.tsx`)

**Before:**
- Had non-existent fields in schema
- No category, actor_user_id fields
- Attempted to support CRUD operations

**After:**
- Read-only resource (List and Show only)
- List displays: timestamp, action, category, actor_id, resource_type
- Show displays: id, event_id, timestamp, action, category, actor_user_id, actor_id, resource_type, resource_id, target, metadata, tenant_id
- Filters and CSV export maintained

**Schema Compliance:**
```typescript
// AuditEventResponse (read-only)
{
  id: string
  event_id: string
  tenant_id: string (required)
  action: string (required)
  category: string (required)
  actor_user_id?: string
  actor_id?: string
  resource_type: string (required)
  resource_id?: string
  target: object (required)
  metadata: object (required)
  timestamp: string (required)
}
```

**Data Provider Updates:**
- Disable create for audit-events
- Disable update for audit-events
- Disable delete for audit-events
- List endpoint returns array directly

### 5. Data Provider (`src/providers/dataProvider.ts`)

**Create Updates:**
- Policies: Routes to `/policies/register` endpoint with PolicyRegistrationRequest format
- Feature-flags: Includes tenant_id in request body
- Invitations: Throws error (read-only resource)

**Update Updates:**
- Audit-events: Throws error (read-only resource)
- Invitations: Throws error (read-only resource)

**Delete Updates:**
- Audit-events: Throws error (read-only resource)
- Invitations: Throws error with hint about revoke endpoint

**List Handling:**
- All resources: Detects and handles array-direct responses
- Tenants: Already supported both formats
- Feature-flags: tenant_id included in query params when needed

## Testing Checklist

When backend is running, verify:

### Feature Flags
- [ ] List view displays all feature flags with correct schema
- [ ] Create form accepts: key, state, variant, flag_id
- [ ] Create submits to `/feature-flags` with tenant_id in body
- [ ] Edit form updates existing flag
- [ ] Show view displays all fields correctly
- [ ] Delete removes flag

### Policies
- [ ] List view displays all policies with correct schema
- [ ] Create form accepts: policy_id, version, resource_type, condition_expression, effect
- [ ] Create submits to `/policies/register` (NOT `/policies`)
- [ ] Show view displays created_by and created_at
- [ ] No edit/delete for policies (backend may not support)

### Invitations
- [ ] List view shows all invitations (read-only, no row click to edit)
- [ ] Show view displays invitation details with Revoke button
- [ ] No Create button visible or create throws error
- [ ] Revoke button works for pending invitations

### Audit Events
- [ ] List view shows audit trail with proper fields
- [ ] Click on any row shows Show view with all audit details
- [ ] Filters work: actor_id, action, resource_type, date range
- [ ] CSV export contains all fields
- [ ] No create/edit/delete operations available

## Build Status
✅ Build successful: `✓ built in 3.36s`
✅ No TypeScript compilation errors
✅ All imports and exports correct

## Remaining Tasks
1. Start backend service
2. Test each CRUD operation in browser
3. Verify API requests have correct Authorization headers
4. Monitor network tab for:
   - Correct endpoint paths
   - Correct HTTP methods
   - Correct request/response bodies
   - No 404/422/403 errors
