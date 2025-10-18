# API Soft Delete Analysis & Implementation

## Executive Summary

The backend API uses **soft delete** patterns throughout. DELETE operations don't permanently remove records - they mark them as disabled/inactive. Restore endpoints are available to reactivate disabled records.

## OpenAPI Schema Analysis

### User Management

#### UserResponse
```json
{
  "user_id": "string",
  "tenant_id": "string", 
  "email": "string",
  "status": "UserStatus",  // enum: ["invited", "active", "disabled"]
  "roles": ["string"],
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

#### UserUpdateRequest
```json
{
  "email": "string?",
  "roles": ["string"]?,
  "is_disabled": "boolean?"  // Key field for status changes
}
```

**Description**: "This endpoint handles core user fields only: email, roles, and status."

#### User API Endpoints

| Method | Endpoint | Purpose | Description |
|--------|----------|---------|-------------|
| PUT | `/api/v1/users/{user_id}` | Update user | Update email, roles, or is_disabled flag |
| DELETE | `/api/v1/users/{user_id}` | **Disable user** | Soft delete - sets status='disabled' |
| POST | `/api/v1/users/{user_id}/restore` | **Restore user** | Reactivate - sets status='active' |

### Tenant Management

#### TenantResponse
```json
{
  "tenant_id": "string",
  "name": "string",
  "status": "string",  // "active" or "disabled"
  "config_version": "integer",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

#### Tenant API Endpoints

| Method | Endpoint | Purpose | Description |
|--------|----------|---------|-------------|
| DELETE | `/api/v1/tenants/{tenant_id}` | **Soft delete tenant** | Marks tenant as deleted (Phase 3 database-backed) |
| POST | `/api/v1/tenants/{tenant_id}/restore` | **Restore tenant** | Reactivates deleted tenant |

## Key Findings

### 1. DELETE ≠ Permanent Delete

**All DELETE operations are SOFT DELETES:**
- Users: DELETE sets `status='disabled'`
- Tenants: DELETE marks as soft-deleted
- Records remain in database
- Data is not lost
- Can be restored

### 2. Restore Endpoints

**Restore functionality is available:**
```
POST /api/v1/users/{user_id}/restore
POST /api/v1/tenants/{tenant_id}/restore
```

Both return 200 on success and reactivate the record.

### 3. Status Management

**Two ways to change user status:**

#### Method 1: PUT with is_disabled
```bash
PUT /api/v1/users/{user_id}
{
  "email": "user@example.com",
  "roles": ["user"],
  "is_disabled": true  # Disables user
}
```

#### Method 2: DELETE/Restore
```bash
# Disable
DELETE /api/v1/users/{user_id}

# Restore  
POST /api/v1/users/{user_id}/restore
```

### 4. Frontend Mapping

**Status String → is_disabled Boolean**

| Frontend Status | Backend is_disabled | Display |
|----------------|---------------------|---------|
| 'active' | false | 🟢 Active |
| 'disabled' | true | 🔴 Disabled |
| 'invited' | false | ⚪ Invited |

## Implementation Consequences

### ✅ What We Got Right

1. **Status Column with Color Coding**
   - Shows active/disabled/invited states clearly
   - Color-coded chips for quick visual identification

2. **Pessimistic Mutation Mode**
   - Waits for server confirmation before UI update
   - Prevents false success messages

3. **is_disabled Field Mapping**
   - Correctly maps frontend status to backend boolean
   - Preserves abstraction while ensuring compatibility

4. **Tenant Soft Delete/Restore**
   - Already implemented with custom buttons
   - Calls correct endpoints

### ❌ What Needed Fixing

1. **BulkDeleteButton**
   - **Problem**: Name implies permanent deletion
   - **Reality**: Calls DELETE which soft deletes (disables)
   - **Solution**: Replaced with clear "Set Active"/"Set Disabled" buttons

2. **Misleading Labels**
   - **Before**: "Delete" button → confusing
   - **After**: "Set Disabled" → clear intent

3. **Missing Restore Actions**
   - **Problem**: No way to restore disabled users from UI
   - **Solution**: Could add restore buttons (not yet implemented)

## UI/UX Implications

### User List View

**Current State:**
- ✅ Shows all users (active and disabled)
- ✅ Color-coded status chips
- ✅ Bulk "Set Active" / "Set Disabled" buttons
- ❌ No individual restore button for disabled users

**Recommended Addition:**
```tsx
<FunctionField
  render={(record) => 
    record.status === 'disabled' ? (
      <Button onClick={() => restore(record.id)}>
        <RestoreIcon /> Restore
      </Button>
    ) : (
      <Button onClick={() => disable(record.id)}>
        <BlockIcon /> Disable
      </Button>
    )
  }
/>
```

### Tenant List View

**Current State:**
- ✅ Shows all tenants
- ✅ Color-coded status
- ✅ SoftDeleteTenantButton (calls DELETE)
- ✅ RestoreTenantButton (calls POST restore)
- ✅ Properly labeled (not "Delete")

### Edit Forms

**Current State:**
- ✅ Status can be changed via dropdown
- ✅ Changes mapped to is_disabled correctly
- ✅ Pessimistic mutation mode enabled

## Data Provider Implementation

### Current Delete Method

```typescript
delete: async (resource, params) => {
  // DELETE endpoint soft deletes for users/tenants
  const url = `${API_BASE_URL}/${resource}/${params.id}?tenant_id=${tenantId}`
  const response = await httpClient(url, { method: 'DELETE' })
  return { data: response.json }
}
```

**Behavior:**
- Users: Sets status='disabled'
- Tenants: Soft deletes
- Does NOT permanently delete data

### Recommended: Add Restore Method

```typescript
// Custom method for restore operations
restore: async (resource, params) => {
  if (!['users', 'tenants'].includes(resource)) {
    throw new Error(`Restore not supported for ${resource}`)
  }
  
  const tenantId = getTenantId(selectedTenantId)
  const url = `${API_BASE_URL}/${resource}/${params.id}/restore?tenant_id=${tenantId}`
  
  const response = await httpClient(url, { method: 'POST' })
  return { data: response.json }
}
```

## Testing Checklist

### User Operations
- [x] Create user → status='invited' or 'active'
- [x] PUT update with is_disabled=true → status='disabled'
- [x] PUT update with is_disabled=false → status='active'
- [ ] DELETE user → status='disabled'
- [ ] POST restore user → status='active'
- [x] Bulk "Set Disabled" → multiple users disabled
- [x] Bulk "Set Active" → multiple users activated

### Tenant Operations
- [x] Tenant list shows status column
- [x] SoftDeleteTenantButton → calls DELETE
- [x] RestoreTenantButton → calls POST restore
- [x] Status changes persist

### UI/UX
- [x] Disabled records visible in lists
- [x] Color coding distinguishes states
- [x] Button labels are clear ("Set Disabled" not "Delete")
- [x] Status chips show at a glance
- [ ] Restore action accessible for disabled records

## Recommendations

### 1. Add Restore Buttons to User List

Show restore button only for disabled users:

```tsx
{record.status === 'disabled' && (
  <RestoreUserButton />
)}
```

### 2. Clarify Delete vs Disable

**Option A: Remove Delete entirely**
- Only allow status changes via Edit form
- Clearest UX - no confusion

**Option B: Rename Delete button**
- Change label to "Disable" or "Deactivate"
- Add confirmation dialog explaining it's reversible

**Option C: Keep current (CHOSEN)**
- Bulk actions use "Set Active"/"Set Disabled"
- Clear, accurate labels
- No mention of "delete"

### 3. Document Soft Delete Pattern

Add to user documentation:
> **Note:** Disabling a user does not delete their data. Disabled users can be restored at any time. This ensures compliance and audit trail integrity.

### 4. Consider Permanent Delete (Optional)

If true deletion is ever needed:
- Add separate "Permanently Delete" action
- Require superadmin role
- Add confirmation with warning
- Only for compliance/GDPR use cases

## Conclusion

The soft delete pattern is correctly implemented in the backend and now properly reflected in the frontend UI. All "delete" operations preserve data and can be reversed via restore endpoints. The UI clearly communicates this through:

1. Color-coded status indicators
2. Accurate button labels ("Set Disabled" not "Delete")
3. Visible disabled records in lists
4. Restore functionality (for tenants, recommended for users)

No data loss occurs from user actions in the UI.
