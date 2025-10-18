# React Admin v5 Migration Plan

## Overview
Upgrade from react-admin v4.16.20 to v5.x to fix DOMPurify XSS vulnerability (GHSA-vhxf-7vqr-mrjg).

**Priority:** HIGH - Fix within 30 days  
**Risk Level:** MODERATE - DOMPurify <3.2.4 has XSS vulnerability  
**Breaking Changes:** YES - Major version upgrade

---

## Current State

```json
{
  "react-admin": "4.16.20",
  "ra-data-simple-rest": "4.16.20"
}
```

**Vulnerabilities:**
- DOMPurify <3.2.4 (moderate severity)
- Affects: ra-ui-materialui → react-admin dependency chain

---

## Target State

```json
{
  "react-admin": "^5.12.1",
  "ra-data-simple-rest": "^5.12.1"
}
```

**Benefits:**
- ✅ Fixes DOMPurify XSS vulnerability
- ✅ Updates to DOMPurify 3.2.4+
- ✅ Latest security patches
- ✅ Performance improvements

---

## Breaking Changes (React Admin v4 → v5)

### 1. **Material-UI v5 → v6** (if applicable)
- MUI v6 may require theme updates
- Check custom theme in `src/App.tsx`

### 2. **DataProvider Changes**
```typescript
// v4
const dataProvider = {
  getList: (resource, params) => { ... }
}

// v5 - Same interface, but stricter typing
const dataProvider: DataProvider = {
  getList: (resource, params) => { ... }
}
```

### 3. **AuthProvider Changes**
```typescript
// v4
const authProvider = {
  checkAuth: () => Promise<void>
}

// v5 - More strict typing
const authProvider: AuthProvider = {
  checkAuth: () => Promise<void>
}
```

### 4. **Resource Components**
- No major changes expected
- List, Create, Edit, Show components remain compatible

### 5. **Custom Components**
- Review Material-UI component usage
- Update any deprecated MUI v5 components

---

## Migration Steps

### Phase 1: Preparation (Day 1-3)
1. ✅ Create feature branch: `upgrade/react-admin-v5`
2. ✅ Backup current working state
3. ✅ Review React Admin v5 migration guide: https://marmelab.com/react-admin/Upgrade.html
4. ✅ Identify custom components using React Admin APIs

### Phase 2: Upgrade (Day 4-7)
1. **Install new versions:**
   ```bash
   npm install react-admin@^5.12.1 ra-data-simple-rest@^5.12.1 --force
   ```

2. **Update peer dependencies:**
   ```bash
   npm install @mui/material@^6.0.0 @mui/icons-material@^6.0.0
   ```

3. **Fix TypeScript errors:**
   - Run `npm run build`
   - Address any type errors in providers
   - Update custom components

4. **Update tests:**
   - Run `npm test`
   - Fix any test failures
   - Update MSW handlers if needed

### Phase 3: Testing (Day 8-14)
1. **Manual Testing:**
   - ✅ Login/Logout flow
   - ✅ All CRUD operations (Users, Tenants, Feature Flags, Policies, Invitations, Audit Events)
   - ✅ Permission checks (superadmin, tenant_admin, standard user)
   - ✅ Tenant switching
   - ✅ Error handling
   - ✅ Responsive layout

2. **Integration Testing:**
   - Run all integration tests
   - Test auth flows (login, logout, token refresh)
   - Test RBAC scenarios

3. **E2E Testing:**
   - Test with real backend
   - Verify API compatibility

### Phase 4: Deployment (Day 15-30)
1. **Staging Deployment:**
   - Deploy to staging environment
   - Smoke test all features
   - Performance testing

2. **Production Deployment:**
   - Schedule maintenance window
   - Deploy to production
   - Monitor error logs (Sentry)

---

## Risk Mitigation

### Rollback Plan
```bash
# If upgrade fails, rollback to v4
git checkout lighthouse-optimizations
npm install
npm run build
```

### Testing Checklist
- [ ] All routes load without errors
- [ ] Authentication works (login/logout)
- [ ] Authorization enforced (RBAC)
- [ ] CRUD operations work for all resources
- [ ] Tenant switching works (superadmin)
- [ ] Error boundaries catch errors
- [ ] No console errors in production build
- [ ] Performance metrics acceptable (Lighthouse score)

---

## Alternative Approach (If Major Upgrade Too Risky)

If React Admin v5 upgrade introduces too many breaking changes, consider:

### Option A: Pin DOMPurify Version
```bash
# Install DOMPurify 3.2.4+ directly
npm install dompurify@^3.2.4

# Add to package.json overrides
{
  "overrides": {
    "dompurify": "^3.2.4"
  }
}
```

**Pros:**
- ✅ Fixes vulnerability immediately
- ✅ No breaking changes
- ✅ Minimal testing required

**Cons:**
- ⚠️ May cause dependency conflicts
- ⚠️ Unsupported configuration
- ⚠️ Temporary solution only

### Option B: Wait for React Admin v4 Patch
- Monitor react-admin repository for v4 security patch
- If v4.16.21 is released with DOMPurify update, upgrade to that

---

## Timeline

| Phase | Duration | Deadline |
|-------|----------|----------|
| Preparation | 3 days | Day 3 |
| Upgrade | 4 days | Day 7 |
| Testing | 7 days | Day 14 |
| Deployment | 16 days | Day 30 |

**Total: 30 days** (Meeting OWASP audit requirement)

---

## Resources

- [React Admin v5 Migration Guide](https://marmelab.com/react-admin/Upgrade.html)
- [React Admin v5 Changelog](https://github.com/marmelab/react-admin/blob/master/CHANGELOG.md)
- [DOMPurify Security Advisory](https://github.com/advisories/GHSA-vhxf-7vqr-mrjg)
- [Material-UI v6 Migration](https://mui.com/material-ui/migration/migration-v5/)

---

## Decision

**Recommended Action:** Proceed with React Admin v5 upgrade (Full Migration)

**Justification:**
1. Security fix is critical (XSS vulnerability)
2. v4 is approaching end-of-life
3. v5 has better TypeScript support
4. Long-term maintainability

**Alternative:** If timeline is too aggressive, use Option A (pin DOMPurify) as temporary fix, then schedule v5 upgrade for next sprint.

---

## Sign-off

- [ ] Tech Lead approval
- [ ] QA sign-off after testing
- [ ] Product Owner informed of potential downtime
- [ ] DevOps notified of deployment

**Status:** ⏳ PENDING - Awaiting approval to proceed with upgrade

---

## Notes

- Current implementation already uses TypeScript with strict types
- AuthProvider and DataProvider are well-structured and should migrate easily
- Main risk is custom theme and Material-UI component usage
- Comprehensive test coverage will catch most issues
