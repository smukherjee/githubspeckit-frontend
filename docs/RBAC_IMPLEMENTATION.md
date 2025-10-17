# RBAC Implementation in Mock Handlers

## Summary

Successfully implemented **Role-Based Access Control (RBAC)** in MSW mock handlers to accurately simulate backend behavior and properly test frontend error handling for user permissions.

## Changes Made

### 1. Added RBAC to POST /users Handler
**File**: `/tests/mocks/handlers/users.ts`

```typescript
// Extract user role from Authorization token
const authHeader = request.headers.get('Authorization')
let userRole = 'standard' // Default to most restrictive role

if (authHeader) {
  const token = authHeader.replace('Bearer ', '')
  // Extract role from mock token format: mock-access-token-{user_id}
  if (token.includes('user-sa-')) {
    userRole = 'superadmin'
  } else if (token.includes('user-admin-')) {
    userRole = 'tenant_admin'
  } else {
    userRole = 'standard'
  }
}

// RBAC: Only superadmin and tenant_admin can create users
if (userRole === 'standard') {
  return HttpResponse.json(
    { detail: 'You do not have permission to create users' },
    { status: 403 }
  )
}
```

### 2. Added RBAC to PUT /users/:id Handler
Same role extraction and permission check - only superadmin and tenant_admin can update users.

### 3. Added RBAC to DELETE /users/:id Handler
Same role extraction and permission check - only superadmin and tenant_admin can delete users.

### 4. Updated Test Files

#### `/tests/components/dataProvider.test.ts`
- T025 (create): Added `user_id: 'user-admin-1'` and `localStorage.setItem('access_token', 'mock-access-token-user-admin-1')`
- T026 (update): Added `user_id: 'user-admin-1'` and access token
- T027 (delete): Added `user_id: 'user-admin-1'` and access token

#### `/tests/integration/auth-superadmin.test.tsx`
- Updated user_id to `'user-sa-1'` (matches superadmin token pattern)
- Added `localStorage.setItem('access_token', 'mock-access-token-user-sa-1')`

#### `/tests/integration/auth-tenant-admin.test.tsx`
- Updated user_id to `'user-admin-1'` (matches tenant_admin token pattern)
- Added `localStorage.setItem('access_token', 'mock-access-token-user-admin-1')`

#### `/tests/integration/rbac-standard-user.test.tsx`
- **Unskipped** the test `'should prevent standard user from creating users'`
- Test now properly validates that standard users receive 403 Forbidden

## RBAC Rules Implemented

| Operation | Standard User | Tenant Admin | Superadmin |
|-----------|--------------|--------------|------------|
| GET /users | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| POST /users | ❌ 403 Forbidden | ✅ Allowed | ✅ Allowed |
| PUT /users/:id | ❌ 403 Forbidden | ✅ Allowed | ✅ Allowed |
| DELETE /users/:id | ❌ 403 Forbidden | ✅ Allowed | ✅ Allowed |

## Token Format Convention

Mock tokens follow the pattern: `mock-access-token-{user_id}`

- **Superadmin**: `mock-access-token-user-sa-1`
- **Tenant Admin**: `mock-access-token-user-admin-1`
- **Standard User**: `mock-access-token-user-standard-1`

The user_id prefix determines the role:
- `user-sa-*` → superadmin
- `user-admin-*` → tenant_admin
- All others → standard

## Test Results

### Before RBAC Implementation
- **54/55 tests passing (98.2%)**
- 1 test skipped (RBAC test marked as backend responsibility)

### After RBAC Implementation
- **✅ 55/55 tests passing (100%)**
- 0 tests skipped
- All RBAC enforcement properly tested

## Benefits

1. **Accurate Backend Simulation**: Mock handlers now behave like the real backend API
2. **Complete Test Coverage**: All permission scenarios are tested
3. **Frontend Error Handling**: Properly validates that frontend displays 403 errors correctly
4. **Security Awareness**: Developers can see RBAC in action during testing
5. **Documentation**: Tests serve as living documentation of permission model

## Next Steps

When integrating with actual backend:
1. Verify backend returns same 403 error format: `{ detail: "message" }`
2. Ensure backend implements identical RBAC rules
3. Test with real JWT tokens that include role claims
4. Validate error messages match between mock and real backend

## Technical Notes

- RBAC checking is done in the mock handler, not in the frontend dataProvider
- This matches production behavior where backend enforces permissions
- Frontend receives 403 errors and displays them appropriately
- All existing tests updated to include proper Authorization tokens
- No changes needed to production code - only test infrastructure
