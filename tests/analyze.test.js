import test from 'node:test';
import assert from 'node:assert/strict';
import { POST, GET } from '../api/analyze.js';

// 테스트용 요청 생성 도우미
function makeRequest(body, { method = 'POST', raw = false } = {}) {
  return new Request('http://localhost/api/analyze', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: raw ? body : JSON.stringify(body)
  });
}

// 가짜 OpenAI 응답 생성
function fakeOpenAIResponse(result) {
  const payload = {
    id: 'resp_test',
    status: 'completed',
    output: [
      {
        type: 'message',
        role: 'assistant',
        content: [{ type: 'output_text', text: JSON.stringify(result) }]
      }
    ]
  };
  return async () =>
    new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
}

test('A-01: 키 있음 + 가짜 fetch 정상 -> 200, 정확한 data 반환', async (t) => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = 'test-key';

  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        id: 'resp_test',
        status: 'completed',
        output: [
          {
            type: 'message',
            role: 'assistant',
            content: [
              {
                type: 'output_text',
                text: JSON.stringify({
                  sentiment: 'positive',
                  confidence: 90,
                  reason: '기분 좋은 문장이에요.'
                })
              }
            ]
          }
        ]
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  t.after(() => {
    globalThis.fetch = originalFetch;
    process.env.OPENAI_API_KEY = originalKey;
  });

  const req = makeRequest({ text: '좋아요' });
  const res = await POST(req);
  assert.equal(res.status, 200);

  const json = await res.json();
  assert.equal(json.ok, true);
  assert.deepEqual(Object.keys(json.data).sort(), ['confidence', 'reason', 'sentiment']);
  assert.equal(json.data.sentiment, 'positive');
  assert.equal(json.data.confidence, 90);
});

test('A-02: text가 공백인 경우 400 EMPTY_TEXT', async () => {
  const req = makeRequest({ text: '  ' });
  const res = await POST(req);
  assert.equal(res.status, 400);

  const json = await res.json();
  assert.equal(json.ok, false);
  assert.equal(json.error.code, 'EMPTY_TEXT');
});

test('A-03: 본문이 올바른 JSON이 아닌 경우 400 INVALID_REQUEST', async () => {
  const req = makeRequest('hello', { raw: true });
  const res = await POST(req);
  assert.equal(res.status, 400);

  const json = await res.json();
  assert.equal(json.ok, false);
  assert.equal(json.error.code, 'INVALID_REQUEST');
});

test('A-04: API 키가 없을 때 500 SERVER_CONFIG_ERROR', async () => {
  const originalKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;

  try {
    const req = makeRequest({ text: '좋아요' });
    const res = await POST(req);
    assert.equal(res.status, 500);

    const json = await res.json();
    assert.equal(json.ok, false);
    assert.equal(json.error.code, 'SERVER_CONFIG_ERROR');
  } finally {
    process.env.OPENAI_API_KEY = originalKey;
  }
});

test('A-05: GET 요청 시 405 METHOD_NOT_ALLOWED 및 Allow: POST 헤더', async () => {
  const res = GET();
  assert.equal(res.status, 405);
  assert.equal(res.headers.get('Allow'), 'POST');

  const json = await res.json();
  assert.equal(json.ok, false);
  assert.equal(json.error.code, 'METHOD_NOT_ALLOWED');
});

test('A-06: 모든 응답 헤더(Content-Type, Cache-Control) 및 sk- 미포함 확인', async () => {
  const req = makeRequest({ text: '  ' });
  const res = await POST(req);

  assert.ok(res.headers.get('Content-Type')?.includes('application/json'));
  assert.equal(res.headers.get('Cache-Control'), 'no-store');

  const text = await res.text();
  assert.equal(text.includes('sk-'), false);
});
