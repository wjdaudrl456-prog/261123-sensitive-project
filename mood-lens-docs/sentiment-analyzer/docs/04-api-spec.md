# 04. API 명세 — `POST /api/analyze`

> 목적: 브라우저와 서버가 주고받는 데이터 모양을 **한 글자도 틀리지 않게** 정합니다.
> 브라우저(`app.js`)와 서버(`api/analyze.js`)는 이 문서를 기준으로 서로 맞춥니다.

---

## 1. 기본 정보

| 항목 | 값 |
|---|---|
| 주소 | `/api/analyze` (같은 도메인, 상대 경로) |
| 방식(Method) | `POST`만 허용 |
| 요청 형식 | `Content-Type: application/json` |
| 응답 형식 | `Content-Type: application/json; charset=utf-8` |
| 인증 | 없음 (공개 API) |
| CORS | 설정하지 않음 (같은 도메인에서만 사용) |
| 캐시 | 모든 응답에 `Cache-Control: no-store` |

---

## 2. 요청 (Request)

```json
{
  "text": "배송도 빠르고 품질도 기대 이상이에요. 다음에 또 살게요!"
}
```

| 필드 | 타입 | 필수 | 규칙 |
|---|---|---|---|
| `text` | string | ✅ | 앞뒤 공백 제거(`trim`) 후 길이 1 이상, 원본 길이 1,000 이하 (`string.length` 기준) |

- `text` 외의 필드는 **무시**한다(오류로 처리하지 않음).

---

## 3. 성공 응답 (HTTP 200)

```json
{
  "ok": true,
  "data": {
    "sentiment": "positive",
    "confidence": 92,
    "reason": "'기대 이상', '또 살게요'라는 표현에서 제품과 배송에 대한 만족감이 분명하게 드러나요."
  }
}
```

| 필드 | 타입 | 규칙 |
|---|---|---|
| `ok` | boolean | 항상 `true` |
| `data.sentiment` | string | `"positive"`, `"negative"`, `"neutral"` 중 하나 (영문 소문자) |
| `data.confidence` | integer | 0 이상 100 이하 정수 |
| `data.reason` | string | 한국어, 1자 이상 200자 이하 |

- 한글 라벨(`긍정` 등)로 바꾸는 일은 **브라우저가** 한다. 서버는 영문 값만 보낸다.
- `data`에 위 3개 외의 필드를 넣지 않는다.

---

## 4. 실패 응답 (HTTP 4xx / 5xx)

```json
{
  "ok": false,
  "error": {
    "code": "EMPTY_TEXT",
    "message": "분석할 문장을 입력해 주세요."
  }
}
```

| 필드 | 타입 | 규칙 |
|---|---|---|
| `ok` | boolean | 항상 `false` |
| `error.code` | string | `docs/06`의 서버 오류 코드 중 하나 |
| `error.message` | string | `docs/06` 표의 "설명" 문구 (개발 확인용. 화면은 브라우저의 표를 사용) |

### 4-1. 서버가 돌려줄 수 있는 오류 코드와 HTTP 상태

| 코드 | HTTP | 언제 |
|---|---|---|
| `METHOD_NOT_ALLOWED` | 405 | POST가 아닌 요청 (응답 헤더 `Allow: POST` 포함) |
| `INVALID_REQUEST` | 400 | 본문이 JSON이 아님, 또는 `text`가 없거나 문자열이 아님 |
| `EMPTY_TEXT` | 400 | `text.trim()`이 빈 문자열 |
| `TEXT_TOO_LONG` | 400 | `text.length > 1000` |
| `SERVER_CONFIG_ERROR` | 500 | `OPENAI_API_KEY` 환경 변수가 없음/빈 값 |
| `AI_RATE_LIMITED` | 429 | OpenAI가 429 응답 (요청 과다 또는 사용 한도 초과) |
| `AI_TIMEOUT` | 504 | OpenAI 응답이 20초 안에 오지 않음 |
| `AI_REFUSED` | 422 | OpenAI가 응답을 거절(refusal) |
| `AI_BAD_RESPONSE` | 502 | OpenAI 응답을 해석할 수 없음(JSON 아님, 형식 불일치, 미완성 응답) |
| `AI_UPSTREAM_ERROR` | 502 | 그 밖의 OpenAI 오류(401, 403, 404, 5xx 등) |
| `INTERNAL_ERROR` | 500 | 예상하지 못한 서버 내부 오류 |

### 4-2. 검사 순서 (반드시 이 순서)

```
1. Method 확인            → 아니면 METHOD_NOT_ALLOWED
2. 본문 JSON 파싱         → 실패하면 INVALID_REQUEST
3. text 타입 확인         → 문자열 아니면 INVALID_REQUEST
4. 빈 문자열 확인          → EMPTY_TEXT
5. 길이 확인              → TEXT_TOO_LONG
6. API 키 확인            → SERVER_CONFIG_ERROR
7. OpenAI 호출            → AI_* 오류 또는 성공
8. 위 과정의 예상 못한 예외 → INTERNAL_ERROR
```

> 입력 검사(2~5)를 API 키 확인(6)보다 먼저 한다. 그래야 키가 없는 환경에서도 입력 검증 테스트가 가능하다.

---

## 5. 서버 구현 골격 (`api/analyze.js`)

Vercel의 **Web 표준 방식**(HTTP 메서드 이름으로 내보내기)을 사용합니다.

```js
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
```

- `errorResponse(error, extraHeaders)`는 `lib/errors.js`에 두며, `jsonResponse`와 같은 헤더를 붙인다(`docs/06` 참고).

---

## 6. 직접 호출해 보기 (사람용 확인 방법)

`npx vercel dev` 실행 중에 새 터미널에서:

```bash
# 성공 예시
curl -s -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"배송도 빠르고 품질도 기대 이상이에요. 다음에 또 살게요!"}'

# 빈 문장 → EMPTY_TEXT (400)
curl -s -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"   "}'

# GET → METHOD_NOT_ALLOWED (405)
curl -s -i http://localhost:3000/api/analyze
```

---

## 7. 완료 기준 · 검증 기준

| ID | 요청 | 기대 HTTP | 기대 `code` / 결과 |
|---|---|---|---|
| P-01 | 정상 문장 | 200 | `ok: true`, `data` 3개 필드 규칙 만족 |
| P-02 | `{"text":"   "}` | 400 | `EMPTY_TEXT` |
| P-03 | 1,001자 문자열 | 400 | `TEXT_TOO_LONG` |
| P-04 | 1,000자 문자열 | 200 (키 있을 때) | 길이 오류 아님 |
| P-05 | `{"text":123}` | 400 | `INVALID_REQUEST` |
| P-06 | 본문 `hello` (JSON 아님) | 400 | `INVALID_REQUEST` |
| P-07 | GET 요청 | 405 | `METHOD_NOT_ALLOWED`, 응답 헤더 `Allow: POST` |
| P-08 | 키 없이 정상 문장 | 500 | `SERVER_CONFIG_ERROR` |
| P-09 | 모든 응답 헤더 | — | `Content-Type: application/json; charset=utf-8`, `Cache-Control: no-store` |
| P-10 | 모든 응답 본문 | — | `sk-` 문자열이 포함되지 않음 |
