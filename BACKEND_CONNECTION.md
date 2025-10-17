# Backend Connection Setup

## Configuration

The frontend is now connected to the backend server running at `http://localhost:8000`.

### Vite Proxy Configuration
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000
- **Proxy**: All `/api/*` requests are proxied to the backend

## Authentication

### Login Endpoint
- **URL**: `POST /api/v1/auth/login`
- **Request Body**:
  ```json
  {
    "email": "your-email@example.com",
    "password": "your-password"
  }
  ```
- **Response**:
  ```json
  {
    "access_token": "jwt-token",
    "token_type": "Bearer",
    "expires_in": 900,
    "user": {
      "user_id": "...",
      "email": "...",
      "roles": ["..."],
      ...
    }
  }
  ```

## Testing the Connection

### 1. Verify Backend is Running
```bash
curl http://localhost:8000/api/v1/health
# Expected: {"status":"ok","migrations_applied":true,"key_rotation_version":1}
```

### 2. Test Login
You'll need valid credentials from your backend. If you don't have any users yet, you may need to:

1. Check if there are default/seed users in the backend
2. Create a user through the backend's admin interface
3. Use the backend's user creation API

### 3. Check Available Endpoints
```bash
# View the OpenAPI documentation
open http://localhost:8000/docs
```

## Troubleshooting

### 401 Unauthorized Errors
- Verify you're using valid credentials from the backend database
- Check that the backend server is running on port 8000
- Ensure migrations have been run on the backend

### Connection Refused
- Make sure the backend server is running: `cd ../backend && python -m uvicorn main:app --reload --port 8000`
- Check if port 8000 is in use: `lsof -ti:8000`

### Proxy Issues
- Restart the Vite dev server: `npm run dev`
- Check the Network tab in browser DevTools to see the actual requests

## Next Steps

1. Start the backend server if not already running
2. Create or obtain valid user credentials
3. Refresh the browser at http://localhost:5173
4. Try logging in with your credentials

## API Base URL

The API base URL is configured in `src/config/env.ts`:
```typescript
export const API_BASE_URL = '/api/v1'
```

This uses a relative URL, which works with Vite's proxy in development and allows for flexible deployment configurations in production.
