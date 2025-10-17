# Test Plan: User Management Features

**Date**: October 17, 2025  
**Status**: TESTING IN PROGRESS

## Features to Test

### 1. Role Updates ✅
### 2. Status (Active/Disabled) Updates ✅  
### 3. Password Reset Button ✅
### 4. User Profile Link ✅

---

## Test Case 1: Role Updates

### Prerequisites
- Backend running on localhost:8000
- Frontend running on localhost:5173
- Logged in as superadmin (infysightsa@infysight.com)
- Test user available: infysightuser@infysight.com (ID: f933db58-9ac1-56e8-af7d-cb8484b26346)

### Steps
1. Navigate to Users list
2. Click on "infysightuser@infysight.com"
3. Click "Edit" button
4. Observe current roles selection
5. Change roles to "Analyst"
6. Click "Save"
7. Wait for success notification
8. Return to list
9. Click on user again to verify

### Expected Results
- [ ] Step 4: Current roles should be pre-selected in the dropdown
- [ ] Step 6: Save succeeds without 422 error
- [ ] Step 7: Success notification appears
- [ ] Step 8: List shows updated user
- [ ] Step 9: Edit form shows new role "Analyst" selected

### Debug Commands
```bash
# Check what's being sent to backend
# Open browser console and look for: "Updating user with payload:"

# Verify backend received update
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"infysightsa@infysight.com","password":"infysightsa123"}' | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))")

curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:8000/api/v1/users/f933db58-9ac1-56e8-af7d-cb8484b26346" | python3 -c "import sys,json; u=json.load(sys.stdin); print(f\"Roles: {u.get('roles')}\")"
```

---

## Test Case 2: Status Updates

### Steps
1. Navigate to Users list
2. Click on "infysightuser@infysight.com"
3. Click "Edit" button
4. Observe current status (should be "Active")
5. Change status to "Disabled"
6. Click "Save"
7. Return to list
8. Verify user shows as "Disabled" in list
9. Refresh page
10. Verify status persists

### Expected Results
- [ ] Step 4: Status dropdown shows "Active" selected
- [ ] Step 6: Save succeeds
- [ ] Step 8: List shows status "Disabled"
- [ ] Step 10: After refresh, still shows "Disabled"

### Debug Commands
```bash
# Verify status in backend
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"infysightsa@infysight.com","password":"infysightsa123"}' | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))")

curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:8000/api/v1/users/f933db58-9ac1-56e8-af7d-cb8484b26346" | python3 -c "import sys,json; u=json.load(sys.stdin); print(f\"Status: {u.get('status')}\")"
```

---

## Test Case 3: Password Reset Button

### Steps
1. Navigate to Users list
2. Click on "infysightuser@infysight.com"
3. Verify "Show" page appears
4. Look for "Reset Password" button in toolbar
5. Click "Reset Password" button
6. Observe notification

### Expected Results
- [ ] Step 4: "Reset Password" button is visible in the top toolbar
- [ ] Step 5: Button is clickable
- [ ] Step 6: Success notification appears with temporary password
- [ ] Step 6: Notification stays visible for 10 seconds

### Debug Commands
```bash
# Test password reset endpoint directly
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"infysightsa@infysight.com","password":"infysightsa123"}' | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))")

curl -s -X POST -H "Authorization: Bearer $TOKEN" "http://localhost:8000/api/v1/users/f933db58-9ac1-56e8-af7d-cb8484b26346/reset-password" | python3 -c "import sys,json; print(json.dumps(json.load(sys.stdin), indent=2))"
```

---

## Test Case 4: User Profile Link

### Steps
1. Navigate to Users list
2. Click on "infysightuser@infysight.com"
3. Verify "Show" page appears
4. Look for "View Profile" button in toolbar
5. Click "View Profile" button
6. Verify UserProfile page loads
7. Check for profile photo section
8. Check for profile form fields (full_name, phone, address)

### Expected Results
- [ ] Step 4: "View Profile" button is visible in the top toolbar
- [ ] Step 5: Button is clickable
- [ ] Step 6: UserProfile page loads at URL `/users/{id}/profile`
- [ ] Step 7: Profile photo section with Avatar visible
- [ ] Step 7: Upload and Delete buttons visible
- [ ] Step 8: Form fields for full_name, phone, address visible
- [ ] Step 8: Save button visible

### Debug Commands
```bash
# Test profile endpoint directly
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"infysightsa@infysight.com","password":"infysightsa123"}' | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))")

curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:8000/api/v1/users/f933db58-9ac1-56e8-af7d-cb8484b26346/profile" | python3 -c "import sys,json; print(json.dumps(json.load(sys.stdin), indent=2))"
```

---

## Common Issues and Solutions

### Issue: Roles not populating
**Check**: Browser console for errors
**Check**: Network tab for API response
**Solution**: Ensure role choices match backend valid roles

### Issue: Status changes not saving
**Check**: Browser console for "Updating user with payload:"
**Check**: Verify payload includes `status` not `is_disabled`
**Solution**: Verify dataProvider sends `status` field

### Issue: Buttons not visible
**Check**: Browser console for React errors
**Check**: Verify imports are correct
**Solution**: Check component structure in UserShow.tsx

### Issue: Profile link broken
**Check**: Browser console for routing errors
**Check**: App.tsx has CustomRoutes registered
**Solution**: Verify route path matches Link destination

---

## Running the Tests

### Quick Test Script
```bash
#!/bin/bash
# Save as test-features.sh

echo "🧪 Testing User Management Features"
echo "======================================"

TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"infysightsa@infysight.com","password":"infysightsa123"}' | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))")

USER_ID="f933db58-9ac1-56e8-af7d-cb8484b26346"

echo ""
echo "1️⃣ Testing Role Update..."
RESULT=$(curl -s -X PUT "http://localhost:8000/api/v1/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"infysightuser@infysight.com","roles":["developer"],"status":"active"}')

if echo "$RESULT" | grep -q "user_id"; then
  echo "   ✅ Role update successful"
else
  echo "   ❌ Role update failed"
  echo "   Response: $RESULT"
fi

echo ""
echo "2️⃣ Testing Status Update..."
RESULT=$(curl -s -X PUT "http://localhost:8000/api/v1/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"infysightuser@infysight.com","roles":["developer"],"status":"disabled"}')

if echo "$RESULT" | grep -q '"status":"disabled"'; then
  echo "   ✅ Status update successful"
else
  echo "   ❌ Status update failed"
  echo "   Response: $RESULT"
fi

echo ""
echo "3️⃣ Testing Password Reset..."
RESULT=$(curl -s -X POST "http://localhost:8000/api/v1/users/$USER_ID/reset-password" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESULT" | grep -q "temporary_password"; then
  echo "   ✅ Password reset successful"
else
  echo "   ❌ Password reset failed"
  echo "   Response: $RESULT"
fi

echo ""
echo "4️⃣ Testing Profile Endpoint..."
RESULT=$(curl -s "http://localhost:8000/api/v1/users/$USER_ID/profile" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESULT" | grep -q "user_id"; then
  echo "   ✅ Profile endpoint accessible"
else
  echo "   ❌ Profile endpoint failed"
  echo "   Response: $RESULT"
fi

echo ""
echo "======================================"
echo "🏁 Backend API tests complete!"
echo ""
echo "👉 Now test in browser:"
echo "   1. Open http://localhost:5173"
echo "   2. Go to Users list"
echo "   3. Click on a user"
echo "   4. Verify all buttons and links are visible"
```

### Make executable and run:
```bash
chmod +x test-features.sh
./test-features.sh
```

---

## Test Results

### Backend API Tests
- [ ] Role update works via curl
- [ ] Status update works via curl
- [ ] Password reset works via curl
- [ ] Profile endpoint accessible via curl

### Frontend UI Tests
- [ ] Roles populate in edit form
- [ ] Role changes save successfully
- [ ] Status changes save successfully
- [ ] Changes reflect in list view
- [ ] Reset Password button visible
- [ ] Reset Password works
- [ ] View Profile button visible
- [ ] View Profile navigation works
- [ ] Profile form renders correctly

---

## Next Steps

1. Run the backend API test script
2. Test each feature in the browser
3. Check browser console for errors
4. Verify network requests in DevTools
5. Document any failures
6. Fix issues one by one
7. Re-test until all pass
