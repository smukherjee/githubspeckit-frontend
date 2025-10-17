# Missing Backend Endpoints - Implementation Plan

## Currently Implemented ✅
- Auth: login, revoke
- Users: list, get, create, update, delete (soft delete)
- Tenants: list, create
- Feature Flags: list, create
- Policies: register, list
- Invitations: list (read-only in UI)
- Audit Events: list (read-only in UI)

## Missing Endpoints to Implement

### HIGH PRIORITY - User Management
- [ ] `POST /api/v1/users/{user_id}/restore` - Restore disabled user
- [ ] `POST /api/v1/users/{user_id}/reset-password` - Reset user password
- [ ] `GET /api/v1/users/{user_id}/profile` - Get user profile
- [ ] `PUT /api/v1/users/{user_id}/profile` - Update user profile
- [ ] `POST /api/v1/users/{user_id}/profile/photo` - Upload profile photo
- [ ] `DELETE /api/v1/users/{user_id}/profile/photo` - Delete profile photo

### HIGH PRIORITY - Tenant Management
- [ ] `DELETE /api/v1/tenants/{tenant_id}` - Soft delete tenant
- [ ] `POST /api/v1/tenants/{tenant_id}/restore` - Restore tenant

### MEDIUM PRIORITY - Invitations
- [ ] `POST /api/v1/invitations/{invitation_id}/accept` - Accept invitation (currently stubbed)

### MEDIUM PRIORITY - Policies
- [ ] `POST /api/v1/policies/dry-run` - Test policy without saving

### LOW PRIORITY - New Resources
- [ ] Config resource (`/api/v1/config`, `/api/v1/config/errors`)
- [ ] Logs resource (`/api/v1/logs/export`)
- [ ] Metrics resource (`/api/v1/metrics/snapshot`)
- [ ] Embed resource (`/api/v1/embed/exchange`)

## Implementation Order

1. **User Restore** - Add restore button to user list/show
2. **Tenant Restore** - Add restore button to tenant list
3. **Password Reset** - Add action button in user show/edit
4. **User Profile** - Create profile management component
5. **Invitation Accept** - Implement accept flow
6. **Policy Dry Run** - Add test button in policy create
7. **New Resources** - Add as separate resources (config, logs, metrics)

## Technical Approach

### For Restore Operations:
- Add custom action buttons in Show/List views
- Use `apiClient.post()` directly (not through dataProvider)
- Show success notification and refresh list

### For Profile Operations:
- Create new `UserProfile.tsx` component
- Add file upload for photo
- Handle multipart/form-data for photo upload

### For New Resources:
- Create new resource folders
- Implement List/Show views (most are read-only)
- Add to App.tsx resources

## Files to Modify/Create

### Users
- `src/resources/users/UserList.tsx` - Add restore button
- `src/resources/users/UserShow.tsx` - Add restore & reset password buttons
- NEW: `src/resources/users/UserProfile.tsx` - Profile management
- NEW: `src/resources/users/UserRestore.tsx` - Restore component

### Tenants
- `src/resources/tenants/index.tsx` - Add soft delete & restore

### New Resources
- NEW: `src/resources/config/` - Config viewer
- NEW: `src/resources/logs/` - Logs export
- NEW: `src/resources/metrics/` - Metrics dashboard

### DataProvider
- `src/providers/dataProvider.ts` - May need custom methods for special endpoints
