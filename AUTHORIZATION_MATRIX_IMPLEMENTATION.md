# Authorization Matrix Implementation

## Overview
This document describes the implementation of the backend authorization matrix in the frontend React Admin application.

## Backend Authorization Matrix

| Action                               | Regular User | Tenant Admin | Superadmin |
|--------------------------------------|--------------|--------------|------------|
| View own profile                     | ✅           | ✅           | ✅         |
| View other users (same tenant)       | ❌           | ✅           | ✅         |
| View other users (different tenant)  | ❌           | ❌           | ✅         |
| Edit own profile                     | ✅           | ✅           | ✅         |
| Edit other users (same tenant)       | ❌           | ✅           | ✅         |
| Edit other users (different tenant)  | ❌           | ❌           | ✅         |

## Implementation

### 1. Authorization Utility Functions (`src/utils/authorization.ts`)

Created comprehensive authorization helper functions:

#### Role Checking Functions:
- `hasRole(user, role)` - Check if user has a specific role
- `isSuperadmin(user)` - Check if user is superadmin
- `isTenantAdmin(user)` - Check if user is tenant admin

#### Tenant & User Comparison:
- `isSameTenant(currentUser, targetUser)` - Check if two users are in same tenant
- `isSelfUser(currentUser, targetUserId)` - Check if target user is current user

#### Authorization Decision Functions:
- `canViewUser(targetUser)` - Check if current user can VIEW a specific user
- `canEditUser(targetUser)` - Check if current user can EDIT a specific user
- `canViewProfile(targetUserId, targetTenantId)` - Check profile view permission
- `canEditProfile(targetUserId, targetTenantId)` - Check profile edit permission
- `canDeleteUser(targetUser)` - Check delete permission
- `canRestoreUser(targetUser)` - Check restore permission
- `canResetPassword(targetUser)` - Check password reset permission

#### Helper Functions:
- `getUnauthorizedMessage(action)` - Get user-friendly error message for unauthorized access

### 2. Component Updates

#### UserShow.tsx
**Changes:**
- Edit button only shows if `canEditUser()` returns true
- View Profile button only shows if `canViewProfile()` returns true
- Restore button checks `canRestoreUser()` before displaying
- Reset Password button checks `canResetPassword()` before displaying

**Logic:**
```typescript
// Edit button - only if user can edit this user
{record && canEditUser({ user_id: record.user_id, tenant_id: record.tenant_id }) && (
  <EditButton />
)}

// Profile button - only if user can view profile
{record && canViewProfile(record.user_id, record.tenant_id) && (
  <Button component={Link} to={`/users/${record.user_id}/profile`} />
)}
```

#### UserEdit.tsx
**Changes:**
- Added `EditAuthCheck` component that runs on mount
- Checks authorization before allowing edit
- Redirects to `/forbidden` page if unauthorized
- Shows error notification with appropriate message

**Logic:**
```typescript
function EditAuthCheck() {
  useEffect(() => {
    if (record && !canEditUser({ user_id: record.user_id, tenant_id: record.tenant_id })) {
      notify(getUnauthorizedMessage('edit'), { type: 'error' })
      redirect('/forbidden')
    }
  }, [record, redirect, notify])
  return null
}
```

#### UserProfile.tsx
**Changes:**
- Checks `canViewProfile()` on component mount
- Shows unauthorized error if user can't view profile
- Determines if user can edit using `canEditProfile()`
- Form fields are read-only if user can't edit
- Photo upload/delete buttons only shown if user can edit
- Save button only shown if user can edit
- Shows "read-only mode" alert if user can only view

**Logic:**
```typescript
const canEdit = id ? canEditProfile(id, profile?.user_id) : false

// Field example
<TextField
  disabled={!canEdit}
  InputProps={{ readOnly: !canEdit }}
/>

// Photo buttons only if canEdit
{canEdit && (
  <Button>Upload Photo</Button>
)}
```

#### UserList.tsx
**Changes:**
- Custom `handleRowClick` function checks authorization
- Only allows navigation to show page if `canViewUser()` returns true
- Prevents unauthorized users from viewing user details

**Logic:**
```typescript
const handleRowClick = (_id, _resource, record) => {
  if (canViewUser(record)) {
    return 'show' // Navigate to show page
  }
  return false // Don't navigate
}
```

### 3. Authorization Rules Summary

#### Superadmin
- ✅ Can view ANY user across ALL tenants
- ✅ Can edit ANY user across ALL tenants
- ✅ Can manage profile photos for ANY user
- ✅ Can reset password for ANY user
- ✅ Can restore ANY user

#### Tenant Admin
- ✅ Can view users in SAME tenant only
- ✅ Can edit users in SAME tenant only
- ✅ Can manage profile photos for users in SAME tenant
- ✅ Can reset password for users in SAME tenant
- ✅ Can restore users in SAME tenant
- ❌ CANNOT access users in different tenants

#### Regular User
- ✅ Can view ONLY their own user record
- ✅ Can edit ONLY their own user record
- ✅ Can manage ONLY their own profile photo
- ❌ CANNOT view other users
- ❌ CANNOT edit other users
- ❌ CANNOT reset passwords
- ❌ CANNOT restore users

### 4. Tenant Comparison Logic

The authorization functions compare tenant IDs to determine access:

```typescript
export function isSameTenant(currentUser, targetUser) {
  return currentUser.tenant_id === targetUser.tenant_id
}
```

Rules:
1. Superadmin bypasses tenant checks (always allowed)
2. Tenant Admin requires same tenant match
3. Regular users require both same tenant AND same user_id

### 5. User Experience

**Authorized Actions:**
- Buttons and links are visible
- Forms are editable
- Navigation works as expected

**Unauthorized Actions:**
- Buttons/links are hidden (not just disabled)
- Forms show read-only view with info alert
- Unauthorized edit attempts redirect to `/forbidden`
- List rows don't navigate on click if not authorized
- Clear error messages explain the restriction

### 6. Security Notes

1. **Frontend validation is UI-only** - Backend enforces actual authorization
2. **User object comes from localStorage** - Retrieved via `getUser()` from storage utils
3. **Target user info comes from React Admin record context** - Contains `user_id`, `tenant_id`
4. **Authorization checks happen in components** - No API calls needed for UI decisions
5. **Backend API validates all requests** - Frontend checks are for UX only

### 7. Testing Checklist

Test with three different user types:

**As Regular User:**
- [ ] Can view and edit own profile ✅
- [ ] Can upload/delete own photo ✅
- [ ] Cannot view other users in list (rows don't click) ❌
- [ ] Cannot access other user show pages ❌
- [ ] Cannot edit other users ❌

**As Tenant Admin:**
- [ ] Can view all users in same tenant ✅
- [ ] Can edit users in same tenant ✅
- [ ] Can manage photos for users in same tenant ✅
- [ ] Cannot view users in different tenants ❌
- [ ] Cannot edit users in different tenants ❌

**As Superadmin:**
- [ ] Can view all users across all tenants ✅
- [ ] Can edit all users across all tenants ✅
- [ ] Can manage photos for all users ✅
- [ ] Can reset password for all users ✅
- [ ] Can restore all users ✅

## Files Modified

1. ✅ `src/utils/authorization.ts` - NEW: Authorization utility functions
2. ✅ `src/utils/index.ts` - Export authorization functions
3. ✅ `src/resources/users/UserShow.tsx` - Added authorization checks
4. ✅ `src/resources/users/UserEdit.tsx` - Added authorization guard
5. ✅ `src/resources/users/UserProfile.tsx` - Added read-only mode
6. ✅ `src/resources/users/UserList.tsx` - Added row click authorization

## Usage Example

```typescript
import { canViewUser, canEditUser, isSuperadmin } from '@/utils/authorization'

// In a component
const record = useRecordContext() // Get current record

// Check if user can view this user
if (canViewUser(record)) {
  // Show user details
}

// Check if user can edit this user
if (canEditUser(record)) {
  // Show edit form
}

// Check if current user is superadmin
const currentUser = getUser()
if (isSuperadmin(currentUser)) {
  // Show admin-only features
}
```

## Conclusion

The frontend now fully implements the backend authorization matrix. All user management screens respect the three-tier permission model:
- Regular users can only manage themselves
- Tenant admins can manage users within their tenant
- Superadmins can manage all users across all tenants

The implementation provides clear visual feedback and prevents unauthorized access attempts while maintaining good UX.
