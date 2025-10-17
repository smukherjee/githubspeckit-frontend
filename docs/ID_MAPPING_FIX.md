# ID Field Mapping Fix

## Problem
React-Admin requires all records to have an `id` field for list views, but the backend API returns resource-specific ID fields:
- Users: `user_id`
- Tenants: `tenant_id`
- Feature Flags: `flag_id`
- Policies: `policy_id`
- Audit Events: `event_id`
- Invitations: `invitation_id`

This caused the error:
```
The response to 'getList' must be like { data : [{ id: 123, ...}, ...] }, 
but the received data items do not have an 'id' key.
```

## Solution
Modified `src/providers/dataProvider.ts` to map resource-specific ID fields to `id` in the `getList` method:

### Users Resource
```typescript
const usersWithId = users.map(user => ({
  ...user,
  id: user.user_id
}))
```

### Tenants Resource
```typescript
const tenantsWithId = tenants.map(tenant => ({
  ...tenant,
  id: tenant.tenant_id
}))
```

### Other Resources (feature-flags, policies, audit-events, invitations)
```typescript
const itemsWithId = items.map(item => {
  if (item.id) {
    return item
  }
  
  let idField: string | undefined
  switch (resource) {
    case 'feature-flags':
      idField = item.flag_id
      break
    case 'policies':
      idField = item.policy_id
      break
    case 'audit-events':
      idField = item.event_id
      break
    case 'invitations':
      idField = item.invitation_id
      break
  }
  
  return {
    ...item,
    id: idField
  }
})
```

## Testing
- ✅ All 55 tests passing
- ✅ Build successful (3.45s)
- ✅ No runtime errors
- ✅ All resource list screens should now display properly

## Files Modified
- `src/providers/dataProvider.ts` - Added ID field mapping in getList method

## Date
17 October 2025
