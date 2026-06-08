import request from 'supertest';
import http from 'http';
import appModule from '../index.js';

// The server in index.js starts listening immediately; instead, we'll just
// query the running server at localhost:3001 for integration-style test.

describe('GET /api/health', () => {
  test('returns status ok', async () => {
    const res = await request('http://localhost:3001').get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  }, 10000);
});
