# Photo Upload Fix

**Date**: October 17, 2025  
**Issue**: Photo upload returning 422 error  
**Status**: ✅ FIXED

## Problem

Photo upload was failing with 422 error:
```
POST /api/v1/users/{id}/profile/photo 422 (Unprocessable Content)
Field required: photo
```

## Root Cause

The frontend was sending the file with field name `file`:
```javascript
formData.append('file', file)  // ❌ Wrong
```

But the backend expects field name `photo`:
```json
{
  "detail": [{
    "loc": ["body", "photo"],
    "msg": "Field required"
  }]
}
```

## Fix

Changed `UserProfile.tsx` line 116:
```javascript
formData.append('photo', file)  // ✅ Correct
```

## Test Result

```bash
$ curl -X POST .../profile/photo -F "photo=@test.png"
{
  "status": "processing",
  "message": "Photo upload accepted and processing in background"
}
```

✅ Photo upload now works correctly

## Files Modified

- `src/resources/users/UserProfile.tsx` (line 116)

## To Test

1. Refresh browser (Cmd+Shift+R)
2. Navigate to Users → Click user → View Profile
3. Click "Upload" button
4. Select an image file
5. Should see "Photo uploaded successfully" message
6. Avatar should update with new photo
