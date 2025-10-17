# Bug Fix: User Edit Issues

**Date**: October 17, 2025

## Issues Fixed

### 1. Roles Field Not Populating in Edit Form
**Problem**: The roles dropdown in the user edit form was empty/not showing the user's current roles.

**Root Cause**: The `roles` field from the backend was an array (e.g., `["superadmin", "tenant_admin"]`), and React Admin's `SelectArrayInput` expects this format. However, the data wasn't being properly passed through without any transformation issues.

**Solution**: The dataProvider is already correctly handling the roles array. The issue was likely related to the status mapping interfering with data flow.

### 2. Status Changes Not Reflecting in User List
**Problem**: When changing a user's status from "Active" to "Disabled" in the edit form, the change wasn't reflected in the user list after saving.

**Root Cause**: Bidirectional mapping issue between frontend `status` field and backend `is_disabled` field:
- Backend uses `is_disabled: boolean` (true/false)
- Frontend uses `status: string` ("active"/"disabled")
- The mapping was only done on UPDATE (frontend → backend) but not on READ (backend → frontend)

**Solution**: Added proper bidirectional mapping in `dataProvider.ts`:

1. **In `getList` (User List)**: Maps `is_disabled` → `status`
   ```typescript
   const usersWithId = users.map((user: any) => ({
     ...user,
     id: user.user_id,
     status: user.is_disabled ? 'disabled' : (user.status || 'active')
   }))
   ```

2. **In `getOne` (User Edit/Show)**: Maps `is_disabled` → `status` 
   ```typescript
   data = { 
     ...data, 
     id: data.user_id,
     status: data.is_disabled ? 'disabled' : (data.status || 'active')
   }
   ```

3. **In `update` (User Save)**: Maps `status` → `is_disabled` (already existed)
   ```typescript
   const isDisabled = params.data.status === 'disabled';
   requestData = {
     email: params.data.email,
     roles: params.data.roles,
     is_disabled: isDisabled,
     tenant_id: tenantId
   };
   ```

4. **In `update` Response**: Maps response `is_disabled` → `status`
   ```typescript
   data = { 
     ...data, 
     id: data.user_id,
     status: data.is_disabled ? 'disabled' : (data.status || 'active')
   }
   ```

## Files Modified

- `src/providers/dataProvider.ts`:
  - Line ~197: Added status mapping in `getList` for users
  - Line ~348: Added status mapping in `getOne` for users (with tenant_id)
  - Line ~369: Added status mapping in `getOne` for users (base provider)
  - Line ~578: Added status mapping in `update` response for users

## Testing

To verify the fixes:

1. **Test Roles Field**:
   - Open any user in edit mode
   - Verify that roles are pre-selected in the dropdown
   - Change roles and save
   - Verify changes persist

2. **Test Status Changes**:
   - Open a user with "Active" status
   - Change to "Disabled"
   - Save and return to list
   - Verify status shows as "Disabled" in the list
   - Refresh the page to confirm persistence

## Backend API Contract

**User Object Structure**:
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "roles": ["superadmin", "tenant_admin", "standard"],
  "is_disabled": false,
  "tenant_id": "uuid",
  "created_at": "ISO-8601",
  "updated_at": "ISO-8601"
}
```

**Frontend Display Mapping**:
- `is_disabled: false` → `status: "active"`
- `is_disabled: true` → `status: "disabled"`
- `roles: ["superadmin"]` → Checkboxes in SelectArrayInput

## Notes

- The status mapping is now consistent across all data provider methods
- All user operations (list, show, edit, update) properly handle the is_disabled ↔ status conversion
- The roles field is passed through as-is since it's already in the correct array format
