import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../app.js';

async function withServer(run) {
  const server = app.listen(0);
  try {
    await new Promise((resolve, reject) => {
      server.once('listening', resolve);
      server.once('error', reject);
    });
    const { port } = server.address();
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

test('POST /api/doubts validates required student and doubt fields', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/doubts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentName: '   ', doubt: 'Question' }),
    });
    const body = await response.json();
    assert.equal(response.status, 400);
    assert.equal(body.code, 'INVALID_REQUEST');
  });
});

test('POST /api/practice/sessions validates student IDs before database access', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/practice/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: 'x', displayName: 'Maya' }),
    });
    const body = await response.json();
    assert.equal(response.status, 400);
    assert.equal(body.code, 'INVALID_STUDENT_ID');
  });
});

test('POST /api/doubts surfaces missing AI configuration instead of a placeholder answer', async () => {
  const previousProvider = process.env.AI_PROVIDER;
  const previousKey = process.env.GROQ_API_KEY;
  process.env.AI_PROVIDER = 'groq';
  delete process.env.GROQ_API_KEY;

  try {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/doubts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: 'Maya',
          subject: 'DSA',
          doubt: 'Why does binary search halve its search range?',
        }),
      });
      const body = await response.json();
      assert.equal(response.status, 503);
      assert.equal(body.code, 'AI_NOT_CONFIGURED');
      assert.equal(body.success, false);
    });
  } finally {
    if (previousProvider === undefined) delete process.env.AI_PROVIDER;
    else process.env.AI_PROVIDER = previousProvider;
    if (previousKey === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = previousKey;
  }
});
