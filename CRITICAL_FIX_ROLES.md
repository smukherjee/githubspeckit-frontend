# Critical Bug Fix: User Roles & Status Update

**Date**: October 17, 2025  
**Priority**: CRITICAL

## Root Cause Analysis

### Issue 1: Invalid Role Names
**Problem**: Users cannot be updated; API returns 422 validation error

**Root Cause**: Frontend was sending incorrect role names to backend:
- Frontend was using: `"standard"` 
- Backend expects: `"user"`

**Backend Valid Roles** (from API validation error):
- `superadmin`
- `tenant_admin`
- `admin`
- `developer`
- `analyst`
- `user`
- `support_readonly`

### Issue 2: Roles Not Populating in Edit Form
**Problem**: When opening user edit form, the roles dropdown shows empty

**Root Cause**: The roles were being sent correctly from backend, but the SelectArrayInput choices didn't match the actual role values in the database. If a user has role `["user"]` but the choices only include `["standard"]`, the field appears empty.

## Fixes Applied

### 1. Updated UserEdit.tsx
Changed roles choices from:
```typescript
choices={[
  { id: 'superadmin', name: 'Superadmin' },
  { id: 'tenant_admin', name: 'Tenant Admin' },
  { id: 'standard', name: 'Standard User' },  // ❌ WRONG
]}
```

To:
```typescript
choices={[
  { id: 'superadmin', name: 'Superadmin' },
  { id: 'tenant_admin', name: 'Tenant Admin' },
  { id: 'admin', name: 'Admin' },
  { id: 'developer', name: 'Developer' },
  { id: 'analyst', name: 'Analyst' },
  { id: 'user', name: 'User' },  // ✅ CORRECT
  { id: 'support_readonly', name: 'Support (Read-Only)' },
]}
```

### 2. Updated UserCreate.tsx
Added missing role options to match backend:
```typescript
choices={[
  { id: 'superadmin', name: 'Superadmin' },
  { id: 'tenant_admin', name: 'Tenant Admin' },
  { id: 'admin', name: 'Admin' },              // ✅ ADDED
  { id: 'developer', name: 'Developer' },      // ✅ ADDED
  { id: 'analyst', name: 'Analyst' },          // ✅ ADDED
  { id: 'user', name: 'User' },
  { id: 'support_readonly', name: 'Support (Read-Only)' },
]}
```

### 3. Enhanced Status Mapping in dataProvider.ts
Already fixed in previous commit - added bidirectional mapping:
- `getList`: Maps `is_disabled` → `status` when fetching users
- `getOne`: Maps `is_disabled` → `status` when fetching single user
- `update`: Maps `status` → `is_disabled` when saving, then maps response back

## Testing

### Test Roles Population:
1. Open any existing user in edit mode
2. **Expected**: Roles field should now show the user's current roles pre-selected
3. Change roles and save
4. **Expected**: Changes should persist without 422 error

### Test Status Update:
1. Open a user with status "Active"
2. Change status to "Disabled"
3. Save
4. Return to user list
5. **Expected**: User should show as "Disabled" in the list
6. Refresh page to verify persistence

### Test Role Update:
1. Open a user and change their roles
2. Save
3. **Expected**: Success notification, no 422 error
4. Refresh and re-edit user
5. **Expected**: New roles should be selected

## API Validation Error That Led to Discovery

```json
{
  "detail": [
    {
      "type": "value_error",
      "loc": ["body", "roles"],
      "msg": "Value error, Invalid roles: standard. Valid roles are: admin, analyst, developer, superadmin, support_readonly, tenant_admin, user",
      "input": ["standard"]
    }
  ]
}
```

This 422 error revealed the mismatch between frontend and backend role names.

## Files Modified

1. **src/resources/users/UserEdit.tsx**
   - Updated roles choices array with all 7 valid backend roles
   - Removed invalid `"standard"` role

2. **src/resources/users/UserCreate.tsx**
   - Added missing roles: admin, developer, analyst
   - Ensured consistency with UserEdit

3. **src/providers/dataProvider.ts** (previous fix)
   - Added `is_disabled` ↔ `status` mapping in getList
   - Added `is_disabled` ↔ `status` mapping in getOne
   - Added `is_disabled` ↔ `status` mapping in update response

## Impact

- ✅ Users can now be updated successfully
- ✅ Roles populate correctly in edit form
- ✅ Status changes reflect immediately in list
- ✅ All backend role types are now supported
- ✅ No more 422 validation errors on user update

## Prevention

To prevent similar issues in the future:
1. Always validate form choices against backend API schema
2. Use OpenAPI spec to verify valid enum values
3. Test create/edit operations with all available options
4. Check browser console for API validation errors
5. Document valid values in code comments

## Related Files

- `src/types/user.ts` - Consider adding Role type enum
- `src/resources/users/UserList.tsx` - May need role display updates
- `src/resources/users/UserShow.tsx` - May need role display updates
