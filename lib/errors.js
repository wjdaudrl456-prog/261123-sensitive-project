// 오류 코드별 HTTP 상태와 안내 문구 (docs/06 표와 동일하게 유지)
export const ERRORS = {
  EMPTY_TEXT:          { status: 400, message: '분석할 문장을 입력해 주세요.' },
  TEXT_TOO_LONG:       { status: 400, message: '1,000자 이하로 줄여서 다시 시도해 주세요.' },
  INVALID_REQUEST:     { status: 400, message: '요청 형식이 올바르지 않아요. 페이지를 새로고침한 뒤 다시 시도해 주세요.' },
  METHOD_NOT_ALLOWED:  { status: 405, message: '허용되지 않은 방식의 요청이에요. 페이지를 새로고침한 뒤 다시 시도해 주세요.' },
  SERVER_CONFIG_ERROR: { status: 500, message: '서버에 AI 연결 설정이 되어 있지 않아요. 관리자에게 문의해 주세요.' },
  AI_RATE_LIMITED:     { status: 429, message: '사용량이 많거나 한도를 넘었어요. 잠시 후 다시 시도해 주세요.' },
  AI_TIMEOUT:          { status: 504, message: 'AI 응답 시간이 초과됐어요. 잠시 후 다시 시도해 주세요.' },
  AI_REFUSED:          { status: 422, message: 'AI가 이 문장의 분석을 거절했어요. 다른 문장으로 시도해 주세요.' },
  AI_BAD_RESPONSE:     { status: 502, message: 'AI 응답을 해석하지 못했어요. 다시 시도해 주세요.' },
  AI_UPSTREAM_ERROR:   { status: 502, message: 'AI 서비스에 일시적인 문제가 있어요. 잠시 후 다시 시도해 주세요.' },
  INTERNAL_ERROR:      { status: 500, message: '서버에서 예상하지 못한 오류가 발생했어요. 잠시 후 다시 시도해 주세요.' }
};

// 우리 서비스에서 '예상한' 오류를 표현하는 클래스
export class AppError extends Error {
  constructor(code, details = {}) {
    super(code);
    this.name = 'AppError';
    this.code = ERRORS[code] ? code : 'INTERNAL_ERROR';
    this.details = details; // 로그용 (예: { upstreamStatus: 401 }). 응답에는 넣지 않음
  }
}

// 어떤 오류든 정해진 JSON 오류 응답으로 바꾼다
export function errorResponse(error, extraHeaders = {}) {
  const code = error instanceof AppError ? error.code : 'INTERNAL_ERROR';
  const { status, message } = ERRORS[code];

  // 로그에는 코드와 상태만 남긴다 (입력 문장, API 키 기록 금지)
  console.error(`[analyze] ${code} (${status})`, error instanceof AppError ? error.details : '');

  return new Response(JSON.stringify({ ok: false, error: { code, message } }), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders
    }
  });
}
