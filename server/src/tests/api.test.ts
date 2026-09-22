import assert from 'node:assert';
import test from 'node:test';
import app from '../app';
import { connectDB } from '../config/database';
import { env } from '../config/env';
import http from 'node:http';
import mongoose from 'mongoose';

test('SkillForge API Test Suite', async (t) => {
  let server: http.Server;
  let baseUrl: string;

  await t.test('Setup: Start test HTTP server', async () => {
    if (env.mongoUri) {
      await connectDB().catch(() => {
        console.log('[test] Running in mock/disconnected DB mode');
      });
    }
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address();
        if (typeof addr === 'object' && addr !== null) {
          baseUrl = `http://127.0.0.1:${addr.port}`;
        }
        resolve();
      });
    });
    assert.ok(baseUrl, 'Test server base URL must be set');
  });

  await t.test('GET /api/health should return 200 and db status', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    const data = (await res.json()) as any;
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.status, 'ok');
    assert.ok(typeof data.db === 'string');
  });

  await t.test('GET /api/unknown-endpoint should return 404 Route Not Found', async () => {
    const res = await fetch(`${baseUrl}/api/unknown-endpoint`);
    assert.strictEqual(res.status, 404);
    const data = (await res.json()) as any;
    assert.strictEqual(data.success, false);
  });

  await t.test('POST /api/auth/login with invalid payload should reject', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '', password: '' }),
    });
    assert.ok(res.status >= 400);
  });

  await t.test('Teardown: Close test server and DB connection', async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
});
