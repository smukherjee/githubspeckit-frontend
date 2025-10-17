# Tenant Switcher and User Enable/Disable Fix

## Summary

Fixed the tenant switcher to properly refresh data when switching tenants, and confirmed that user enable/disable functionality already exists in the UserEdit screen.

## Issues Fixed

### 1. Tenant Switcher Had No Effect ❌ → ✅

**Problem:**
- The `dataProvider` was created as a static singleton without tenant context
- When superadmin users switched tenants, the dataProvider continued using the old tenant ID
- Data displayed didn't change when selecting a different tenant

**Root Cause:**
```typescript
// Old approach - static dataProvider
export const dataProvider = createDataProvider()

// In App.tsx
<Admin dataProvider={dataProvider} ... />
```

The dataProvider was created once at module load time and never recreated.

**Solution:**
Created a two-tier component structure:

1. **Outer App Component**: Wraps everything in `TenantProvider`
2. **Inner AdminApp Component**: Uses `useTenant()` hook and recreates dataProvider when tenant changes

```typescript
// App.tsx
function AdminApp() {
  const { selectedTenantId } = useTenant()
  
  // Recreate dataProvider when selectedTenantId changes
  const dataProvider = useMemo(
    () => createDataProvider(selectedTenantId),
    [selectedTenantId]
  )

  return (
    <Admin
      authProvider={authProvider}
      dataProvider={dataProvider}
      ...
    />
  )
}

function App() {
  return (
    <ErrorBoundary>
      <TenantProvider>
        <AdminApp />
      </TenantProvider>
    </ErrorBoundary>
  )
}
```

**How It Works:**
1. User selects a tenant from the dropdown
2. `setSelectedTenantId()` updates the context state
3. `useMemo` detects the change and calls `createDataProvider(selectedTenantId)`
4. React-Admin receives the new dataProvider
5. All lists automatically refetch data with the new tenant_id

### 2. TenantSwitcher Response Format Handling

**Problem:**
The TenantSwitcher expected `{tenants: [...]}` format but needed to handle both formats.

**Solution:**
```typescript
const response = await apiClient.get('/tenants')

// Backend may return {tenants: [...]} or just [...]
let tenantsList: Tenant[] = []
if (Array.isArray(response.data)) {
  tenantsList = response.data
} else if (response.data?.tenants && Array.isArray(response.data.tenants)) {
  tenantsList = response.data.tenants
}

setTenants(tenantsList)
```

### 3. User Enable/Disable Functionality ✅

**Status:** Already working! No changes needed.

The `UserEdit` component already has:
```typescript
<SelectInput
  source="status"
  label="Status"
  choices={[
    { id: 'invited', name: 'Invited' },
    { id: 'active', name: 'Active' },
    { id: 'disabled', name: 'Disabled' },
  ]}
  validate={[required()]}
  fullWidth
/>
```

**Bulk Actions** are also available in UserList:
```typescript
const UserBulkActionButtons = () => (
  <>
    <BulkUpdateButton label="Enable" data={{ status: 'active' }} />
    <BulkUpdateButton label="Disable" data={{ status: 'disabled' }} />
    <BulkDeleteButton />
  </>
)
```

Users can be enabled/disabled in two ways:
1. **Edit Screen**: Change status dropdown to "Active" or "Disabled"
2. **Bulk Actions**: Select multiple users and click "Enable" or "Disable" button

## Files Modified

### 1. `src/App.tsx`
**Changes:**
- Added `useMemo` import from React
- Changed `dataProvider` import to `createDataProvider`
- Added `useTenant` import
- Created new `AdminApp` component that uses tenant context
- Made `dataProvider` dynamic using `useMemo` based on `selectedTenantId`
- Wrapped AdminApp in TenantProvider

**Impact:** Tenant switching now properly refreshes all data

### 2. `src/components/TenantSwitcher/TenantSwitcher.tsx`
**Changes:**
- Updated tenant fetching to handle both response formats
- Removed unused `TenantsListResponse` interface
- Simplified response parsing logic

**Impact:** More robust handling of backend response formats

## Testing

- ✅ All 55 tests passing
- ✅ Build successful (3.70s)
- ✅ No TypeScript errors
- ✅ No breaking changes to existing functionality

## What to Test in Browser

### Tenant Switching (Superadmin Only)
1. Login as `infysightsa@infysight.com` / `infysightsa123`
2. Check that tenant dropdown appears in top bar (superadmin only)
3. Select "infysight" tenant from dropdown
4. Navigate to Users screen - should show users for that tenant
5. Switch to "test_tenant_976e32a7" from dropdown
6. Users list should automatically refresh showing different users
7. Try other resources (Feature Flags, Policies, etc.) - all should update

### User Enable/Disable
1. Navigate to Users screen
2. **Individual Edit:**
   - Click on a user row to open edit screen
   - Change Status dropdown to "Disabled"
   - Click Save
   - User status should update
3. **Bulk Actions:**
   - Go back to Users list
   - Select multiple users (checkboxes appear)
   - Click "Disable" button from bulk actions
   - All selected users should be disabled
   - Select them again and click "Enable" to re-enable

## Technical Details

### How Tenant Context Works

```
┌─────────────────────────────────────────────────────────────┐
│ TenantProvider (stores selectedTenantId in state)           │
│   ↓                                                          │
│ AdminApp (reads selectedTenantId via useTenant)             │
│   ↓                                                          │
│ useMemo(() => createDataProvider(selectedTenantId))         │
│   ↓                                                          │
│ React-Admin Admin component                                 │
│   ↓                                                          │
│ All resource lists/forms use this dataProvider              │
└─────────────────────────────────────────────────────────────┘
```

When tenant changes:
1. TenantSwitcher calls `setSelectedTenantId(newId)`
2. TenantContext state updates
3. AdminApp re-renders (context changed)
4. useMemo sees dependency changed, calls `createDataProvider(newId)`
5. React-Admin receives new dataProvider
6. All data refetches automatically with new tenant_id

### DataProvider Tenant Injection

The `createDataProvider(selectedTenantId)` function injects the tenant_id into all API calls:

```typescript
// For getList
params.filter = {
  ...params.filter,
  tenant_id: selectedTenantId,
}

// For getOne, update, delete
const url = `${API_BASE_URL}/${resource}/${id}?tenant_id=${selectedTenantId}`
```

Special cases:
- **Tenants resource**: Never injects tenant_id (superadmin views all tenants)
- **GET /users/me**: Never injects tenant_id (returns current user)
- **Audit Events**: Special URL mapping to `/audit/events`

## Date

17 October 2025
