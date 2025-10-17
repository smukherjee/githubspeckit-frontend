/**
 * Screen Endpoint Verification
 * 
 * This document verifies that all screens properly work with backend endpoints
 */

# Screen to Endpoint Mapping Verification

## Status Summary
- Build: ✅ PASSING (3.68s)
- Tests: 44/55 PASSING (80%)
- Runtime: Need to verify

## Resource Screens

### 1. Users Resource (/users)

**Endpoints Used:**
- GET /api/v1/users?tenant_id={id} - List users
- GET /api/v1/users/{id}?tenant_id={id} - Get single user
- POST /api/v1/users - Create user (tenant_id in body)
- PUT /api/v1/users/{id} - Update user
- DELETE /api/v1/users/{id} - Soft delete user

**Components:**
- ✅ UserList.tsx - Uses Datagrid, filters by tenant
- ✅ UserCreate.tsx - Form with email, roles
- ✅ UserEdit.tsx - Edit form
- ✅ UserShow.tsx - Show details

**Data Flow:**
1. App.tsx registers resource with name="users"
2. dataProvider.getList('users') → adds tenant_id to filters
3. ra-data-simple-rest converts filters to query params
4. Hits GET /api/v1/users?tenant_id=XXX

**Potential Issues:**
- ⚠️ ra-data-simple-rest might add pagination params (_start, _end, _sort, _order)
- ⚠️ Mock handlers expect (page, perPage) format
- ⚠️ Need to verify filter → query param conversion

### 2. Tenants Resource (/tenants)

**Endpoints Used:**
- GET /api/v1/tenants - List all tenants (superadmin only, NO tenant_id)
- GET /api/v1/tenants/{id} - Get single tenant
- POST /api/v1/tenants - Create tenant
- PUT /api/v1/tenants/{id} - Update tenant
- DELETE /api/v1/tenants/{id} - Soft delete tenant

**Components:**
- ✅ TenantList - Defined in index.tsx
- ✅ TenantCreate - Defined in index.tsx
- ✅ TenantEdit - Defined in index.tsx
- ✅ TenantShow - Defined in index.tsx

**Data Flow:**
1. dataProvider.shouldInjectTenantId('tenants') → returns FALSE
2. No tenant_id injected (correct for superadmin-only resource)

**Status:** ✅ Should work correctly

### 3. Feature Flags Resource (/feature-flags)

**Endpoints Used:**
- GET /api/v1/feature-flags?tenant_id={id} - List flags
- GET /api/v1/feature-flags/{id} - Get single flag
- POST /api/v1/feature-flags - Create flag (tenant_id in body)
- PUT /api/v1/feature-flags/{id} - Update flag
- DELETE /api/v1/feature-flags/{id} - Delete flag

**Components:**
- ✅ FeatureFlagList
- ✅ FeatureFlagCreate
- ✅ FeatureFlagEdit
- ✅ FeatureFlagShow

**Data Flow:**
1. dataProvider checks if resource === 'feature-flags'
2. Makes direct apiClient.get('/feature-flags?tenant_id=XXX')
3. Bypasses ra-data-simple-rest for this resource

**Status:** ✅ Should work (custom handling in dataProvider)

### 4. Policies Resource (/policies)

**Endpoints Used:**
- GET /api/v1/policies?tenant_id={id} - List policies
- GET /api/v1/policies/{id} - Get single policy
- POST /api/v1/policies/register - Create policy (special endpoint!)
- PUT /api/v1/policies/{id} - Update policy
- DELETE /api/v1/policies/{id} - Delete policy

**Components:**
- ✅ PolicyList
- ✅ PolicyCreate
- ✅ PolicyEdit
- ✅ PolicyShow

**Data Flow:**
1. dataProvider.create('policies') → uses /policies/register endpoint
2. Special handling in dataProvider.create()

**Status:** ✅ Should work (custom endpoint handling)

### 5. Invitations Resource (/invitations)

**Endpoints Used:**
- GET /api/v1/invitations - List invitations
- GET /api/v1/invitations/{id} - Get single invitation
- ⚠️ NO CREATE - invitations are read-only in UI
- ⚠️ NO UPDATE - invitations are read-only
- ⚠️ NO DELETE - invitations are read-only

**Components:**
- ✅ InvitationList
- ❌ InvitationCreate - Exists but should throw error
- ✅ InvitationShow

**Data Flow:**
1. dataProvider.create('invitations') → throws error "read-only"
2. dataProvider.update('invitations') → throws error "read-only"
3. dataProvider.delete('invitations') → throws error "cannot be deleted"

**Status:** ⚠️ InvitationCreate component should be removed from App.tsx

### 6. Audit Events Resource (/audit-events)

**Endpoints Used:**
- GET /api/v1/audit/events - List audit events (backend uses /audit/events)
- GET /api/v1/audit-events - Alternative path for react-admin
- GET /api/v1/audit/events/{id} - Get single event
- ⚠️ NO CREATE - audit events are system-generated
- ⚠️ NO UPDATE - audit events are immutable
- ⚠️ NO DELETE - audit events are immutable

**Components:**
- ✅ AuditEventList
- ✅ AuditEventShow

**Data Flow:**
1. dataProvider checks resource === 'audit-events'
2. Makes direct apiClient.get('/audit-events')
3. Backend might use /audit/events instead

**Status:** ⚠️ Need to verify path discrepancy (/audit-events vs /audit/events)

## Identified Issues

### Issue 1: ra-data-simple-rest Query Parameter Format

**Problem:** ra-data-simple-rest uses _start/_end for pagination, but backend expects page/perPage

**Location:** All list endpoints that don't use custom handling

**Solution:** Either:
1. Update backend to accept _start/_end
2. Customize dataProvider to transform params
3. Use custom getList for all resources

### Issue 2: InvitationCreate in App.tsx

**Problem:** InvitationCreate is registered but should be read-only

**Location:** App.tsx line ~141

**Solution:** Remove create={InvitationCreate} from invitations resource

### Issue 3: Audit Events Path Mismatch

**Problem:** Backend uses /audit/events but react-admin resource is audit-events

**Location:** dataProvider.ts, backend API

**Solution:** Ensure mock handlers support both paths (already added)

### Issue 4: Test Mock Data Mismatch

**Problem:** Tests use tenant-acme but most mock data uses tenant-infysight

**Location:** tests/components/dataProvider.test.ts

**Solution:** Either:
1. Add more mock users for tenant-acme
2. Update tests to use tenant-infysight
3. Make mocks more flexible

## Recommended Fixes

### Fix 1: Remove InvitationCreate from App.tsx

```tsx
<Resource
  name="invitations"
  list={InvitationList}
  // Remove: create={InvitationCreate}
  show={InvitationShow}
  icon={MailIcon}
/>
```

### Fix 2: Add Mock Users for tenant-acme

Add more users to tests/mocks/handlers/users.ts:
```typescript
{
  user_id: 'user-acme-2',
  tenant_id: 'tenant-acme',
  email: 'user@acme.com',
  roles: ['standard'],
  status: 'active',
  created_at: '2025-01-02T00:00:00Z',
  updated_at: '2025-01-02T00:00:00Z',
},
```

### Fix 3: Verify ra-data-simple-rest Compatibility

The dataProvider already handles special cases for:
- feature-flags → custom getList
- policies → custom create (/register endpoint)
- audit-events → custom getList
- invitations → custom getList
- tenants → custom getList (no tenant_id)

For users resource, it relies on ra-data-simple-rest. Need to verify query param format.

## Next Steps

1. ✅ Build passes - no compilation errors
2. ⚠️ Remove InvitationCreate from App.tsx
3. ⚠️ Add more mock data for tenant-acme
4. ⚠️ Run dev server and manually test each screen
5. ⚠️ Fix remaining 11 test failures
6. ✅ Document any remaining issues

## Success Criteria

- [ ] All 6 resource list screens load without errors
- [ ] Create forms submit successfully
- [ ] Edit forms load and save correctly
- [ ] Show pages display all data
- [ ] Tenant switching works for superadmin
- [ ] RBAC permissions properly hide/show resources
- [ ] All 55 tests pass
