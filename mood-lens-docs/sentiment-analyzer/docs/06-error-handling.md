# 06. 오류 처리 지침 (`lib/errors.js`, `app.js`의 `ERROR_MESSAGES`)

> 목적: 문제가 생겼을 때 사용자에게 **무엇이 잘못됐고, 무엇을 하면 되는지** 같은 말로 안내합니다.
> 오류 문구는 이 문서의 표를 **글자 그대로** 사용합니다. 새 문구를 만들지 않습니다.

---

## 1. 원칙

1. 모든 오류는 **코드**(영문 대문자)로 구분한다. 화면에는 코드에 맞는 **제목 + 설명 + 코드**를 보여준다.
2. 사용자 탓이 아닌 오류는 사용자를 탓하는 말투를 쓰지 않는다.
3. 기술 용어(500, JSON, API 등)를 제목·설명에 쓰지 않는다. 코드는 맨 아래 작은 글씨로만 표시한다.
4. OpenAI가 보낸 원본 오류 메시지, 스택 트레이스는 **절대** 화면이나 응답 본문에 넣지 않는다.
5. 앱은 어떤 오류에서도 멈추지 않는다. 오류 후 바로 다시 분석할 수 있어야 한다.

---

## 2. 오류 코드 전체 표

| 코드 | 발생 위치 | HTTP | 화면 제목 (`title`) | 화면 설명 (`message`) |
|---|---|---|---|---|
| `EMPTY_TEXT` | 브라우저·서버 | 400 | 문장을 입력해 주세요 | 분석할 문장을 입력해 주세요. |
| `TEXT_TOO_LONG` | 브라우저·서버 | 400 | 문장이 너무 길어요 | 1,000자 이하로 줄여서 다시 시도해 주세요. |
| `INVALID_REQUEST` | 서버 | 400 | 요청을 처리할 수 없어요 | 요청 형식이 올바르지 않아요. 페이지를 새로고침한 뒤 다시 시도해 주세요. |
| `METHOD_NOT_ALLOWED` | 서버 | 405 | 요청을 처리할 수 없어요 | 허용되지 않은 방식의 요청이에요. 페이지를 새로고침한 뒤 다시 시도해 주세요. |
| `SERVER_CONFIG_ERROR` | 서버 | 500 | 서비스 설정에 문제가 있어요 | 서버에 AI 연결 설정이 되어 있지 않아요. 관리자에게 문의해 주세요. |
| `AI_RATE_LIMITED` | 서버 | 429 | 요청이 많아 잠시 쉬고 있어요 | 사용량이 많거나 한도를 넘었어요. 잠시 후 다시 시도해 주세요. |
| `AI_TIMEOUT` | 서버·브라우저 | 504 | 응답이 너무 늦어요 | AI 응답 시간이 초과됐어요. 잠시 후 다시 시도해 주세요. |
| `AI_REFUSED` | 서버 | 422 | 이 문장은 분석할 수 없어요 | AI가 이 문장의 분석을 거절했어요. 다른 문장으로 시도해 주세요. |
| `AI_BAD_RESPONSE` | 서버·브라우저 | 502 | 결과를 읽지 못했어요 | AI 응답을 해석하지 못했어요. 다시 시도해 주세요. |
| `AI_UPSTREAM_ERROR` | 서버 | 502 | AI 서비스에 연결하지 못했어요 | AI 서비스에 일시적인 문제가 있어요. 잠시 후 다시 시도해 주세요. |
| `INTERNAL_ERROR` | 서버 | 500 | 알 수 없는 문제가 생겼어요 | 서버에서 예상하지 못한 오류가 발생했어요. 잠시 후 다시 시도해 주세요. |
| `NETWORK_ERROR` | 브라우저 전용 | — | 인터넷 연결을 확인해 주세요 | 서버에 연결할 수 없어요. 네트워크 상태를 확인한 뒤 다시 시도해 주세요. |
| `UNKNOWN_ERROR` | 브라우저 전용 | — | 알 수 없는 문제가 생겼어요 | 예상하지 못한 응답을 받았어요. 잠시 후 다시 시도해 주세요. |

- 서버 응답의 `error.message`에는 위 표의 **설명** 문구를 넣는다.

---

## 3. 서버 구현 (`lib/errors.js`)

```js
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
```

- 입력 오류(`EMPTY_TEXT`, `TEXT_TOO_LONG`, `INVALID_REQUEST`, `METHOD_NOT_ALLOWED`)는 `console.error` 대신 `console.warn`을 써도 된다(선택).
- `AppError`가 아닌 오류(예: 코드 버그로 인한 `TypeError`)는 `INTERNAL_ERROR`로 바뀌며, 이때만 `console.error`에 `error.message`를 함께 남긴다. **스택 트레이스는 응답에 넣지 않는다.**

## 4. 입력 검증 (`lib/validate.js`)

```js
import { AppError } from './errors.js';

export const MAX_LENGTH = 1000;

// 입력값을 검사하고, 통과하면 앞뒤 공백을 제거한 문자열을 돌려준다
export function validateText(value) {
  if (typeof value !== 'string') throw new AppError('INVALID_REQUEST');
  if (value.trim().length === 0) throw new AppError('EMPTY_TEXT');
  if (value.length > MAX_LENGTH) throw new AppError('TEXT_TOO_LONG');
  return value.trim();
}
```

---

## 5. 브라우저 구현 (`app.js`의 `ERROR_MESSAGES`)

- 2장 표의 **13개 코드 전부**를 `{ title, message }` 형태로 옮긴다.

```js
const ERROR_MESSAGES = {
  EMPTY_TEXT: { title: '문장을 입력해 주세요', message: '분석할 문장을 입력해 주세요.' },
  // ... 2장 표의 나머지 12개를 같은 형식으로
};
```

- 모르는 코드가 오면 `UNKNOWN_ERROR`를 사용한다.

---

## 6. 상황별 흐름 예시 (사람용)

| 상황 | 사용자에게 보이는 것 | 사용자가 할 일 |
|---|---|---|
| 아무것도 안 쓰고 Ctrl+Enter | "문장을 입력해 주세요" | 문장 입력 |
| 와이파이 끊김 | "인터넷 연결을 확인해 주세요" | 연결 후 다시 분석 |
| 배포 후 API 키 등록을 잊음 | "서비스 설정에 문제가 있어요" | (관리자) Vercel 환경 변수 등록 후 재배포 |
| OpenAI 결제 한도 초과 | "요청이 많아 잠시 쉬고 있어요" | (관리자) OpenAI 결제·한도 확인 |
| OpenAI 서버 장애 | "AI 서비스에 연결하지 못했어요" | 잠시 후 재시도 |

---

## 7. 완료 기준 · 검증 기준

| ID | 확인 | 기대 결과 |
|---|---|---|
| E-01 | `lib/errors.js`의 `ERRORS` 키 개수 | 11개 (서버 코드) |
| E-02 | `app.js`의 `ERROR_MESSAGES` 키 개수 | 13개 (서버 11 + 브라우저 전용 2) |
| E-03 | 두 파일의 공통 코드 11개의 `message` 문구 | 서로 완전히 같음 |
| E-04 | `new AppError('NOPE').code` | `'INTERNAL_ERROR'` |
| E-05 | `errorResponse(new TypeError('x'))` | 500, `code: 'INTERNAL_ERROR'`, 본문에 `TypeError`·스택 없음 |
| E-06 | Vercel 로그(배포 후) | 오류 코드는 보이고 입력 문장·API 키는 보이지 않음 |
