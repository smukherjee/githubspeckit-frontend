# Bug Fix: User Status Update & UI Improvements

## Issue
User status updates were failing silently - changing users from active to disabled was not working.

## Root Causes

### 1. Field Name Mismatch
- **Frontend**: Sent `status` field as string ('active', 'disabled', 'invited')
- **Backend**: Expected `is_disabled` field as boolean (true/false)
- **Result**: Backend returned HTTP 200 but silently ignored the unrecognized `status` field

### 2. Optimistic Mutation Mode
- React Admin was using optimistic updates by default
- UI updated immediately without waiting for server response
- No actual PUT request was being sent to the backend
- User saw "success" message but no data was persisted

### 3. Responsive Layout Issues
- Breakpoint set to `down('lg')` caused desktop view to use mobile SimpleList
- Status column with color coding wasn't visible on desktop screens

## Solutions Implemented

### 1. Data Provider Fix (`src/providers/dataProvider.ts`)

Added field mapping in the `update` method for users resource:

```typescript
if (resource === 'users') {
  const isDisabled = params.data.status === 'disabled' ? true : false;
  
  requestData = {
    email: params.data.email,
    roles: params.data.roles,
    is_disabled: isDisabled,  // Map status → is_disabled
    tenant_id: tenantId
  };
}
```

**Mapping:**
- `status: 'disabled'` → `is_disabled: true`
- `status: 'active'` or `'invited'` → `is_disabled: false`

### 2. Pessimistic Mutation Mode

Added `mutationMode="pessimistic"` to Edit components to force actual API calls:

**Files Updated:**
- `src/resources/users/UserEdit.tsx`
- `src/resources/featureFlags/index.tsx` (FeatureFlagEdit)
- `src/resources/policies/index.tsx` (PolicyEdit)

```tsx
<Edit redirect="list" mutationMode="pessimistic">
  <SimpleForm>
    {/* ... */}
  </SimpleForm>
</Edit>
```

### 3. UI Improvements - Status Column with Color Coding

**Files Updated:**
- `src/resources/users/UserList.tsx`
- `src/resources/featureFlags/index.tsx`
- `src/resources/invitations/index.tsx`
- `src/resources/tenants/index.tsx`

**Changes:**
1. Changed breakpoint from `down('lg')` to `down('sm')` for proper desktop display
2. Replaced plain TextField with color-coded Chip component

```tsx
<FunctionField
  label="Status"
  render={(record: RaRecord) => {
    const status = record.status as string;
    return (
      <Chip
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        color={
          status === 'active' ? 'success' :
          status === 'disabled' ? 'error' :
          'default'
        }
        size="small"
      />
    );
  }}
/>
```

**Color Scheme:**
- 🟢 Green (`success`) - Active/Enabled
- 🔴 Red (`error`) - Disabled/Revoked
- 🟡 Orange (`warning`) - Pending (invitations)
- ⚪ Gray (`default`) - Other states

## Verification

### Before Fix
```bash
# PUT request with status field
curl -X PUT /api/v1/users/{id} \
  -d '{"email":"user@example.com","roles":["user"],"status":"disabled"}'

# Response: HTTP 200
# Actual Result: Status remained "active" (field ignored)
```

### After Fix
```bash
# PUT request with is_disabled field
curl -X PUT /api/v1/users/{id} \
  -d '{"email":"user@example.com","roles":["user"],"is_disabled":true}'

# Response: HTTP 200
# Actual Result: Status changed to "disabled" ✅
```

## Testing Checklist

- [x] User status update from active → disabled works
- [x] User status update from disabled → active works
- [x] Status column displays with color coding on desktop
- [x] Mobile view still uses SimpleList layout
- [x] Feature flags state (enabled/disabled) color coded
- [x] Invitations status (pending/accepted/revoked) color coded
- [x] Tenants status (active/disabled) color coded
- [x] All updates wait for server response (pessimistic mode)

## Files Modified

1. `src/providers/dataProvider.ts` - Added status→is_disabled mapping
2. `src/resources/users/UserEdit.tsx` - Added pessimistic mutation mode
3. `src/resources/users/UserList.tsx` - Fixed breakpoint, added status column chip
4. `src/resources/featureFlags/index.tsx` - Pessimistic mode + status chip
5. `src/resources/policies/index.tsx` - Pessimistic mode
6. `src/resources/invitations/index.tsx` - Status column chip
7. `src/resources/tenants/index.tsx` - Status column chip

## Lessons Learned

1. **Always check OpenAPI schema** for exact field names and types
2. **Test API directly** with curl to isolate frontend vs backend issues
3. **React Admin's optimistic updates** can mask API failures
4. **Breakpoint values matter** - `down('lg')` is too aggressive for desktop views
5. **Color coding improves UX** - status at a glance vs reading text

## API Endpoints Analysis

### User Management
- `PUT /api/v1/users/{user_id}` - Update user (email, roles, is_disabled)
- `DELETE /api/v1/users/{user_id}` - **Disable User** (soft delete, sets status='disabled')
- `POST /api/v1/users/{user_id}/restore` - **Restore User** (sets status='active')

### Tenant Management
- `DELETE /api/v1/tenants/{tenant_id}` - **Soft Delete Tenant**
- `POST /api/v1/tenants/{tenant_id}/restore` - **Restore Tenant**

### Key Insights
1. **DELETE operations are SOFT DELETES** - they disable/deactivate, not permanently delete
2. **RESTORE operations** are available via POST endpoints
3. **Status changes** can be done via PUT (is_disabled field) or DELETE/restore
4. **Disabled records should remain visible** in lists for restore capability

## Bulk Action Changes

### Before
```tsx
<BulkDeleteButton /> // Misleading - calls DELETE which soft deletes
```

### After
```tsx
<BulkUpdateButton label="Set Active" data={{ status: 'active' }} mutationMode="pessimistic" />
<BulkUpdateButton label="Set Disabled" data={{ status: 'disabled' }} mutationMode="pessimistic" />
```

## Related Documentation

- React Admin Mutation Modes: https://marmelab.com/react-admin/Edit.html#mutationmode
- Backend API Schema: `/api/v1/docs` (OpenAPI spec)
- User Update Endpoint: `PUT /api/v1/users/{user_id}`
- UserUpdateRequest Schema: `{email?, roles?, is_disabled?}`
- UserStatus Enum: `["invited", "active", "disabled"]`
