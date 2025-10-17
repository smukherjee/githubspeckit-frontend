#!/usr/bin/env node
/**
 * Manual Screen Testing Script
 * 
 * Tests each screen's endpoint integration with the actual backend
 */

const BASE_URL = 'http://localhost:8000/api/v1';

// Helper function to make requests
async function makeRequest(method, path, body = null, headers = {}) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${path}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

async function testEndpoints() {
  console.log('🧪 Testing Backend Endpoints\n');

  // Test 1: Login
  console.log('1️⃣  Testing Login...');
  const loginResult = await makeRequest('POST', '/auth/login', {
    email: 'infysightsa@infysight.com',
    password: 'Admin@1234',
  });

  if (loginResult.status === 200) {
    console.log('✅ Login successful');
    const token = loginResult.data.access_token;
    const user = loginResult.data.user;
    console.log(`   User: ${user.email}, Roles: ${user.roles.join(', ')}`);
    console.log(`   Tenant: ${user.tenant_id}\n`);

    // Test 2: Get Users List
    console.log('2️⃣  Testing GET /users...');
    const usersResult = await makeRequest(
      'GET',
      `/users?tenant_id=${user.tenant_id}`,
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (usersResult.status === 200) {
      console.log(`✅ Users list retrieved: ${usersResult.data.data?.length || usersResult.data.length} users`);
    } else {
      console.log(`❌ Users list failed: ${usersResult.status} - ${JSON.stringify(usersResult.data)}`);
    }

    // Test 3: Get Tenants List (superadmin only)
    console.log('\n3️⃣  Testing GET /tenants...');
    const tenantsResult = await makeRequest(
      'GET',
      '/tenants',
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (tenantsResult.status === 200) {
      const tenants = Array.isArray(tenantsResult.data) ? tenantsResult.data : tenantsResult.data.data || [];
      console.log(`✅ Tenants list retrieved: ${tenants.length} tenants`);
    } else {
      console.log(`❌ Tenants list failed: ${tenantsResult.status}`);
    }

    // Test 4: Get Feature Flags
    console.log('\n4️⃣  Testing GET /feature-flags...');
    const flagsResult = await makeRequest(
      'GET',
      `/feature-flags?tenant_id=${user.tenant_id}`,
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (flagsResult.status === 200) {
      const flags = Array.isArray(flagsResult.data) ? flagsResult.data : flagsResult.data.data || [];
      console.log(`✅ Feature flags retrieved: ${flags.length} flags`);
    } else {
      console.log(`❌ Feature flags failed: ${flagsResult.status}`);
    }

    // Test 5: Get Policies
    console.log('\n5️⃣  Testing GET /policies...');
    const policiesResult = await makeRequest(
      'GET',
      `/policies?tenant_id=${user.tenant_id}`,
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (policiesResult.status === 200) {
      const policies = Array.isArray(policiesResult.data) ? policiesResult.data : policiesResult.data.data || [];
      console.log(`✅ Policies retrieved: ${policies.length} policies`);
    } else {
      console.log(`❌ Policies failed: ${policiesResult.status}`);
    }

    // Test 6: Get Audit Events
    console.log('\n6️⃣  Testing GET /audit/events...');
    const auditResult = await makeRequest(
      'GET',
      '/audit/events',
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (auditResult.status === 200) {
      const events = Array.isArray(auditResult.data) ? auditResult.data : auditResult.data.data || [];
      console.log(`✅ Audit events retrieved: ${events.length} events`);
    } else {
      console.log(`❌ Audit events failed: ${auditResult.status}`);
    }

    console.log('\n✅ All endpoint tests complete!');
  } else {
    console.log('❌ Login failed:', loginResult.status, loginResult.data);
  }
}

// Run tests
testEndpoints().catch(console.error);
