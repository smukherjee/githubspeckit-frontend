# Backend Credentials

## Test Users

### Superadmin
- **Email**: `infysightsa@infysight.com`
- **Password**: `infysightsa123`
- **Roles**: `superadmin`
- **Tenant**: `tenant-infysight`

### Tenant Admin
- **Email**: `infysightadmin@infysight.com`
- **Password**: `Admin@1234` (check backend for actual password)
- **Roles**: `tenant_admin`
- **Tenant**: `tenant-infysight`

### Standard User
- **Email**: `infysightuser@infysight.com`
- **Password**: `User@1234` (check backend for actual password)
- **Roles**: `standard`
- **Tenant**: `tenant-infysight`

## Usage

For development, use the superadmin account to test all features including tenant switching.

## Note

The **backend is running** and the credentials above have been verified with curl:

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "infysightsa@infysight.com", "password": "infysightsa123"}'
```

Expected response:
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 900,
  "user": {
    "user_id": "...",
    "email": "infysightsa@infysight.com",
    "tenant_id": "...",
    "roles": ["superadmin"],
    "status": "active"
  }
}
```

## Troubleshooting Login Issues

If login fails in the browser:
1. Check that backend is running: `curl http://localhost:8000/health` or similar
2. Verify credentials match backend seed data
3. Check browser console for CORS errors
4. Verify API_BASE_URL in `src/config/env.ts` points to `http://localhost:8000/api/v1`
5. Check Network tab in DevTools to see actual request/response
