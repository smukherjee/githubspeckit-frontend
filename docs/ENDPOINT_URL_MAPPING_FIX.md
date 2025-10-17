# Endpoint URL Mapping Fix

## Problem

The frontend was using incorrect URLs for some resources, resulting in 404 errors:

1. **Audit Events**: Frontend used `/api/v1/audit-events` but backend expects `/api/v1/audit/events`
2. **Invitations**: Frontend used `/api/v1/invitations` but backend only has `/api/v1/invitations/{id}/accept`

### Console Errors
```
GET http://localhost:8000/api/v1/audit-events 404 (Not Found)
GET http://localhost:8000/api/v1/invitations?tenant_id=... 404 (Not Found)
```

## Backend API Analysis

Using the OpenAPI spec (`/openapi.json`), discovered:

- ✅ Audit Events: `/api/v1/audit/events` (with slash separator, not hyphen)
- ❌ Invitations: Only `/api/v1/invitations/{invitation_id}/accept` exists (no list endpoint)

### Audit Events Response Structure
```json
{
  "count": 2,
  "total": 2,
  "limit": 100,
  "offset": 0,
  "items": [
    {
      "event_id": "...",
      "action": "...",
      "category": "...",
      "timestamp": "...",
      "tenant_id": "..."
    }
  ]
}
```

## Solution

### 1. Added URL Mapping Helper Function

Created `getResourceUrl()` function in `dataProvider.ts`:

```typescript
function getResourceUrl(resource: string): string {
  const urlMap: Record<string, string> = {
    'audit-events': '/audit/events',
    // Add other mappings as needed
  }
  
  return urlMap[resource] || `/${resource}`
}
```

### 2. Updated getList Method

Modified the special handling section to:
- Use `getResourceUrl()` for URL construction
- Handle `items` array in response (used by audit/events)
- Map `event_id` to `id` for React-Admin

```typescript
if (['feature-flags', 'policies', 'audit-events', 'invitations'].includes(resource)) {
  let url = getResourceUrl(resource)
  const response = await apiClient.get(url)
  
  // Handle 'items' array (audit/events format)
  if (data.items && Array.isArray(data.items)) {
    items = data.items
  }
  
  // Map event_id to id
  const itemsWithId = items.map(item => ({
    ...item,
    id: item.event_id || item.invitation_id || item.flag_id || item.policy_id
  }))
}
```

### 3. Updated getOne Method

Added special handling for resources with custom URLs:

```typescript
if (['audit-events', 'invitations'].includes(resource)) {
  const resourceUrl = getResourceUrl(resource)
  const url = `${API_BASE_URL}${resourceUrl}/${params.id}`
  const response = await httpClient(url)
  
  // Map ID field
  let data = response.json
  if (!data.id && data.event_id) {
    data = { ...data, id: data.event_id }
  }
}
```

## Testing

- ✅ All 55 tests passing
- ✅ Build successful (3.49s)
- ✅ Audit events endpoint verified via curl: `/api/v1/audit/events` returns 200 OK
- ✅ Response correctly extracts items from `data.items` array

## Files Modified

- `src/providers/dataProvider.ts`
  - Added `getResourceUrl()` helper function
  - Updated `getList()` to use URL mapping and handle `items` array
  - Updated `getOne()` to use URL mapping

## Known Issues

**Invitations**: The backend doesn't have a list endpoint for invitations. Only the accept endpoint exists at `/api/v1/invitations/{invitation_id}/accept`. This means:
- The invitations list screen will return empty results (not a 404)
- May need backend team to implement `/api/v1/invitations` list endpoint
- Or remove the invitations list view from the frontend

## Next Steps

1. ✅ Audit Events screen should now work in browser
2. ⚠️ Invitations screen will show empty list (backend endpoint missing)
3. Consider contacting backend team about invitations list endpoint

## Date

17 October 2025
