# MSW Setup Complete - Login Guide

## Mock Service Worker (MSW) Configuration

MSW has been successfully configured to intercept API requests in development mode. This allows you to test the application without a backend server running.

## Available Test Credentials

Use these credentials to log in:

### Superadmin User
- **Email**: `infysightsa@infysight.com`
- **Password**: `infysightsa123`
- **Roles**: `superadmin`

### Tenant Admin User
- **Email**: `infysightadmin@infysight.com`
- **Password**: `infysightsa123`
- **Roles**: `tenant_admin`

### Standard User
- **Email**: `infysightuser@infysight.com`
- **Password**: `infysightsa123`
- **Roles**: `standard`

## How MSW Works

1. **Service Worker Registration**: When you load the app in development mode, MSW registers a service worker (`mockServiceWorker.js` in the `public/` directory).

2. **Request Interception**: The service worker intercepts all HTTP requests made by your application.

3. **Mock Responses**: Based on the handlers defined in `tests/mocks/handlers/`, MSW returns mock responses instead of making real API calls.

4. **Console Logs**: You should see `[MSW]` messages in the browser console indicating that the service worker is active.

## Troubleshooting

### If MSW doesn't start:

1. **Check the browser console** for MSW initialization messages
2. **Clear browser cache** and reload the page
3. **Verify service worker** is registered in DevTools > Application > Service Workers
4. **Restart the dev server**: `npm run dev`

### If you see 401 Unauthorized errors:

1. **Ensure you're using the correct test credentials** (see above)
2. **Check that MSW is running** - you should see `[MSW]` logs in console
3. **Verify the service worker** is intercepting requests in the Network tab

### Service Worker Issues:

If the service worker fails to register:
```bash
# Regenerate the service worker file
npx msw init public/ --save
```

## Technical Details

- **MSW Version**: 2.11.5
- **Worker Location**: `public/mockServiceWorker.js`
- **Handler Definitions**: `tests/mocks/handlers/`
- **Browser Setup**: `tests/mocks/browser.ts`
- **Initialization**: `src/main.tsx` (before React app mounts)

## Next Steps

1. Refresh your browser at `http://localhost:5173/`
2. Open the browser console to see MSW logs
3. Try logging in with one of the test credentials above
4. The mock backend will authenticate you and return a mock JWT token

## Notes

- MSW only runs in **development mode**
- In production, the real backend API will be used
- Mock data is defined in `tests/mocks/handlers/` directory
- You can customize mock responses by editing the handler files
