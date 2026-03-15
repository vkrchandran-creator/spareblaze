/**
 * Auth API — End-to-End Tests
 * Uses Node.js built-in fetch (Node 18+) against a live server.
 * Run: node tests/auth.test.js
 */

require('dotenv').config();
const http = require('http');
const app  = require('../src/app');

const PORT   = 5001; // dedicated test port, never conflicts
const BASE   = `http://localhost:${PORT}/api/v1`;
const TEST_EMAIL = `test_${Date.now()}@spareblaze.in`;

let server;
let authToken;

// ─── Mini test runner ────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✓  ${label}`);
    passed++;
  } else {
    console.error(`  ✗  ${label}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

async function request(method, path, body, token) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };
  const res  = await fetch(`${BASE}${path}`, opts);
  const json = await res.json();
  return { status: res.status, ...json };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

async function runTests() {
  console.log('\n─── Phase 4: Auth API Tests ────────────────────────────────────\n');

  // 1. Register
  console.log('1. POST /auth/register');
  const reg = await request('POST', '/auth/register', {
    name: 'Test User', email: TEST_EMAIL,
    phone: '9876543210', password: 'SecurePass123',
  });
  assert('returns 201',          reg.status === 201);
  assert('success: true',        reg.success === true);
  assert('returns JWT token',    typeof reg.data?.token === 'string' && reg.data.token.length > 20);
  assert('returns user object',  reg.data?.user?.email === TEST_EMAIL);
  assert('role is customer',     reg.data?.user?.role === 'customer');
  assert('no passwordHash leak', !reg.data?.user?.passwordHash);
  authToken = reg.data?.token;

  // 2. Duplicate register
  console.log('\n2. POST /auth/register — duplicate email');
  const dup = await request('POST', '/auth/register', {
    name: 'Test User', email: TEST_EMAIL,
    phone: '9876543210', password: 'SecurePass123',
  });
  assert('returns 409',    dup.status === 409);
  assert('success: false', dup.success === false);
  assert('error message',  dup.message.toLowerCase().includes('already'));

  // 3. Register validation errors
  console.log('\n3. POST /auth/register — validation failures');
  const badReg = await request('POST', '/auth/register', { name: '', email: 'notanemail', phone: '123', password: 'short' });
  assert('returns 422',           badReg.status === 422);
  assert('has details array',     Array.isArray(badReg.details));
  assert('catches bad email',     badReg.details.some(e => e.path === 'email'));
  assert('catches bad phone',     badReg.details.some(e => e.path === 'phone'));
  assert('catches short password',badReg.details.some(e => e.path === 'password'));

  // 4. Login — correct credentials
  console.log('\n4. POST /auth/login — correct credentials');
  const login = await request('POST', '/auth/login', { email: TEST_EMAIL, password: 'SecurePass123' });
  assert('returns 200',       login.status === 200);
  assert('success: true',     login.success === true);
  assert('returns token',     typeof login.data?.token === 'string');
  assert('returns user',      login.data?.user?.email === TEST_EMAIL);
  assert('no passwordHash',   !login.data?.user?.passwordHash);
  authToken = login.data?.token; // refresh token

  // 5. Login — wrong password
  console.log('\n5. POST /auth/login — wrong password');
  const badLogin = await request('POST', '/auth/login', { email: TEST_EMAIL, password: 'WrongPassword!' });
  assert('returns 401',    badLogin.status === 401);
  assert('success: false', badLogin.success === false);
  assert('generic message — no user enumeration',
    badLogin.message.toLowerCase().includes('invalid'));

  // 6. Login — non-existent email (same 401, same message)
  console.log('\n6. POST /auth/login — non-existent email');
  const noUser = await request('POST', '/auth/login', { email: 'nobody@example.com', password: 'anything' });
  assert('returns 401',           noUser.status === 401);
  assert('same message as wrong password', noUser.message === badLogin.message);

  // 7. GET /auth/me — valid token
  console.log('\n7. GET /auth/me — valid token');
  const me = await request('GET', '/auth/me', null, authToken);
  assert('returns 200',         me.status === 200);
  assert('success: true',       me.success === true);
  assert('correct email',       me.data?.email === TEST_EMAIL);
  assert('has addresses array', Array.isArray(me.data?.addresses));
  assert('no passwordHash',     !me.data?.passwordHash);

  // 8. GET /auth/me — no token
  console.log('\n8. GET /auth/me — no token');
  const noToken = await request('GET', '/auth/me');
  assert('returns 401',    noToken.status === 401);
  assert('success: false', noToken.success === false);

  // 9. GET /auth/me — malformed token
  console.log('\n9. GET /auth/me — malformed token');
  const badToken = await request('GET', '/auth/me', null, 'not.a.valid.token');
  assert('returns 401',    badToken.status === 401);
  assert('success: false', badToken.success === false);

  // 10. POST /auth/logout
  console.log('\n10. POST /auth/logout');
  const logout = await request('POST', '/auth/logout', null, authToken);
  assert('returns 200',    logout.status === 200);
  assert('success: true',  logout.success === true);

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n─────────────────────────────────────────────────────────────────');
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log('─────────────────────────────────────────────────────────────────\n');

  if (failed > 0) process.exit(1);
}

// ─── Boot server, run, teardown ──────────────────────────────────────────────

server = http.createServer(app);
server.listen(PORT, async () => {
  try {
    await runTests();
  } catch (err) {
    console.error('\nUnexpected error:', err);
    process.exit(1);
  } finally {
    server.close();
  }
});
