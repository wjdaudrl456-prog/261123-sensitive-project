import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeSentiment,
  buildRequestBody,
  extractOutputText,
  normalizeResult,
  DEFAULT_MODEL,
  OPENAI_URL
} from '../lib/openai.js';
import { AppError } from '../lib/errors.js';

// 정상 OpenAI 응답 모양 모킹 도우미
function fakeOpenAIResponse(result, { status = 200, extra = {} } = {}) {
  const payload = {
    id: 'resp_test',
    status: 'completed',
    output: [
      { type: 'reasoning', summary: [] },
      {
        type: 'message',
        role: 'assistant',
        content: [{ type: 'output_text', text: JSON.stringify(result) }]
      }
    ],
    ...extra
  };
  return async () =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
}

// 응답을 보내지 않고 취소될 때까지 기다리는 가짜 fetch (타임아웃 테스트용)
function hangingFetch(_url, { signal }) {
  return new Promise((_, reject) => {
    signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
  });
}

test('O-01: buildRequestBody 요청 본문 구조 및 strict 속성 확인', () => {
  const body = buildRequestBody('안녕', 'custom-model');
  assert.equal(body.model, 'custom-model');
  assert.equal(body.store, false);
  assert.equal(body.input, '안녕');
  assert.equal(body.text.format.type, 'json_schema');
  assert.equal(body.text.format.strict, true);
  assert.equal(body.text.format.name, 'sentiment_result');
  assert.ok(body.instructions);
});

test('O-02: 모델 인자 없을 때 DEFAULT_MODEL(gpt-6-luna) 사용', () => {
  const body = buildRequestBody('안녕');
  assert.equal(body.model, DEFAULT_MODEL);
  assert.equal(DEFAULT_MODEL, 'gpt-6-luna');
});

test('O-03: 정상 응답 파싱 및 { sentiment, confidence, reason } 반환', async () => {
  let capturedHeaders = null;
  let capturedBody = null;
  const mockFetch = async (url, options) => {
    capturedHeaders = options.headers;
    capturedBody = JSON.parse(options.body);
    const mockRes = fakeOpenAIResponse({
      sentiment: 'positive',
      confidence: 95,
      reason: '매우 긍정적입니다.'
    });
    return mockRes();
  };

  const result = await analyzeSentiment('좋은 하루', {
    apiKey: 'test-key',
    fetchImpl: mockFetch
  });

  assert.deepEqual(result, {
    sentiment: 'positive',
    confidence: 95,
    reason: '매우 긍정적입니다.'
  });
  assert.equal(capturedHeaders.Authorization, 'Bearer test-key');
  assert.equal(capturedBody.store, false);
});

test('O-04: OpenAI 429 반환 시 AI_RATE_LIMITED 오류', async () => {
  const mockFetch = async () => new Response('Too Many Requests', { status: 429 });
  await assert.rejects(
    async () => analyzeSentiment('테스트', { apiKey: 'key', fetchImpl: mockFetch }),
    (err) => err instanceof AppError && err.code === 'AI_RATE_LIMITED'
  );
});

test('O-05: OpenAI 500 반환 시 AI_UPSTREAM_ERROR 오류', async () => {
  const mockFetch = async () => new Response('Internal Server Error', { status: 500 });
  await assert.rejects(
    async () => analyzeSentiment('테스트', { apiKey: 'key', fetchImpl: mockFetch }),
    (err) => err instanceof AppError && err.code === 'AI_UPSTREAM_ERROR'
  );
});

test('O-06: timeoutMs 초과 시 AI_TIMEOUT 오류 발생', async () => {
  await assert.rejects(
    async () =>
      analyzeSentiment('테스트', {
        apiKey: 'key',
        fetchImpl: hangingFetch,
        timeoutMs: 50
      }),
    (err) => err instanceof AppError && err.code === 'AI_TIMEOUT'
  );
});

test('O-07: content에 refusal 포함 시 AI_REFUSED 오류', async () => {
  const payload = {
    id: 'resp_refusal',
    status: 'completed',
    output: [
      {
        type: 'message',
        role: 'assistant',
        content: [{ type: 'refusal', refusal: '분석을 거절합니다.' }]
      }
    ]
  };
  const mockFetch = async () =>
    new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  await assert.rejects(
    async () => analyzeSentiment('거절 문장', { apiKey: 'key', fetchImpl: mockFetch }),
    (err) => err instanceof AppError && err.code === 'AI_REFUSED'
  );
});

test('O-08: output_text가 JSON이 아니거나 잘못된 sentiment일 때 AI_BAD_RESPONSE 오류', async () => {
  // 1) JSON이 아닌 경우
  const mockBadJson = fakeOpenAIResponse('not-json');
  // fakeOpenAIResponse는 인자를 JSON.stringify 하므로, 원본 text에 직접 비-JSON 주입
  const badPayload = {
    status: 'completed',
    output: [
      {
        type: 'message',
        role: 'assistant',
        content: [{ type: 'output_text', text: 'not json text' }]
      }
    ]
  };
  const mockBadFetch = async () =>
    new Response(JSON.stringify(badPayload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  await assert.rejects(
    async () => analyzeSentiment('테스트', { apiKey: 'key', fetchImpl: mockBadFetch }),
    (err) => err instanceof AppError && err.code === 'AI_BAD_RESPONSE'
  );

  // 2) sentiment가 허용 범위를 벗어난 경우 (e.g. happy)
  const mockInvalidSentiment = fakeOpenAIResponse({
    sentiment: 'happy',
    confidence: 80,
    reason: '이유'
  });
  await assert.rejects(
    async () => analyzeSentiment('테스트', { apiKey: 'key', fetchImpl: mockInvalidSentiment }),
    (err) => err instanceof AppError && err.code === 'AI_BAD_RESPONSE'
  );
});

test('O-09: confidence 정규화 (87.6 -> 88, -5 -> 0, 130 -> 100)', () => {
  assert.equal(
    normalizeResult({ sentiment: 'positive', confidence: 87.6, reason: '이유' }).confidence,
    88
  );
  assert.equal(
    normalizeResult({ sentiment: 'negative', confidence: -5, reason: '이유' }).confidence,
    0
  );
  assert.equal(
    normalizeResult({ sentiment: 'neutral', confidence: 130, reason: '이유' }).confidence,
    100
  );
});

test('O-10: reason이 200자 초과 시 200자로 축약 및 말줄임표(…) 확인', () => {
  const longReason = '가'.repeat(250);
  const result = normalizeResult({
    sentiment: 'positive',
    confidence: 90,
    reason: longReason
  });
  assert.equal(result.reason.length, 200);
  assert.ok(result.reason.endsWith('…'));
});
