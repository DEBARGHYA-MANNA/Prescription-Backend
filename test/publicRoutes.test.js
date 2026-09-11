process.env.NODE_ENV = 'test';

const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const app = require('../src/app');

let server;
let baseUrl;

before(() => new Promise((resolve) => {
  server = app.listen(0, '127.0.0.1', () => {
    baseUrl = `http://127.0.0.1:${server.address().port}`;
    resolve();
  });
}));

after(() => new Promise((resolve, reject) => {
  server.close((error) => (error ? reject(error) : resolve()));
}));

async function request(path, options) {
  const response = await fetch(`${baseUrl}${path}`, options);
  return { response, body: await response.json() };
}

test('health endpoint reports an available API', async () => {
  const { response, body } = await request('/api/v1/health');

  assert.equal(response.status, 200);
  assert.deepEqual(body, { success: true, data: { status: 'ok' } });
});

test('template endpoint exposes the supported prescription layouts', async () => {
  const { response, body } = await request('/api/v1/prescription-templates');

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.deepEqual(body.data.templates.map((template) => template.id), [
    'classic',
    'modern',
    'minimal',
  ]);
});

test('protected profile endpoint rejects a request without a token', async () => {
  const { response, body } = await request('/api/v1/doctor/profile');

  assert.equal(response.status, 401);
  assert.equal(body.success, false);
  assert.match(body.error.message, /Authentication required/);
});

test('signup validates the request before accessing the database', async () => {
  const { response, body } = await request('/api/v1/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'A', email: 'not-an-email', password: 'short' }),
  });

  assert.equal(response.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.error.message, 'Request validation failed.');
  assert.ok(body.error.details.length >= 3);
});
