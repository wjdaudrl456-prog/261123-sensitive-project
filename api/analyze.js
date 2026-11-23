import { analyzeSentiment } from '../lib/openai.js';
import { validateText } from '../lib/validate.js';
import { AppError, errorResponse } from '../lib/errors.js';

// 성공 응답을 만든다
function jsonResponse(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders
    }
  });
}

// POST /api/analyze : 문장을 받아 감성 분석 결과를 돌려준다
export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      throw new AppError('INVALID_REQUEST');
    }

    const text = validateText(body?.text); // 실패 시 AppError 발생, 성공 시 trim된 문자열

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new AppError('SERVER_CONFIG_ERROR');

    const data = await analyzeSentiment(text, {
      apiKey,
      model: process.env.OPENAI_MODEL
    });

    return jsonResponse({ ok: true, data });
  } catch (error) {
    return errorResponse(error); // AppError가 아니면 INTERNAL_ERROR로 변환
  }
}

// POST 외의 메서드는 모두 405
function methodNotAllowed() {
  return errorResponse(new AppError('METHOD_NOT_ALLOWED'), { Allow: 'POST' });
}
export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
