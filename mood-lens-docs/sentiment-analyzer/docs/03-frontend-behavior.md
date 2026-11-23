# 03. 화면 기능 구현 지침 (`public/js/app.js`)

> 목적: 버튼을 누르면 무슨 일이 일어나는지, 화면이 어떤 상태로 바뀌는지를 **빠짐없이** 정합니다.
> 이 문서에 없는 동작은 만들지 않습니다.

---

## 1. 화면 상태 (State)

화면은 언제나 아래 4가지 상태 중 **정확히 하나**입니다.

| 상태 이름 | 뜻 | 결과 패널에 보이는 것 |
|---|---|---|
| `idle` | 아직 분석 전 / 지우기 직후 | `#result-empty` |
| `loading` | 서버 응답을 기다리는 중 | `#result-loading` |
| `success` | 분석 성공 | `#result-success` |
| `error` | 분석 실패 | `#result-error` |

### 1-1. 상태 객체 (이 모양 그대로 사용)

```js
// 화면의 현재 상태를 한곳에서 관리한다 (전역 변수 대신 사용)
const state = {
  status: 'idle',   // 'idle' | 'loading' | 'success' | 'error'
  result: null,     // 성공 시 { sentiment, confidence, reason }
  error: null       // 실패 시 { code, title, message }
};
```

- 상태를 바꿀 때는 반드시 `setState(patch)` 함수 하나만 사용하고, 이 함수가 끝에서 `render()`를 호출한다.
- `render()`는 `state`만 보고 화면 전체(결과 패널 4개 영역의 `hidden`, 버튼 활성/비활성, 버튼 문구)를 다시 그린다.

### 1-2. 상태 전이 표

| 현재 상태 | 사건 | 다음 상태 | 비고 |
|---|---|---|---|
| 모든 상태 | 지우기 클릭 | `idle` | 입력창 비움, 글자 수 `0 / 1,000`, 입력창 포커스 |
| `idle`/`success`/`error` | 분석 요청(버튼 또는 단축키) + 입력 유효 | `loading` | 서버로 요청 전송 |
| `idle`/`success`/`error` | 분석 요청 + 입력 무효 | `error` | 서버 요청 **안 함**, 입력 오류 코드 표시 |
| `loading` | 분석 요청 | `loading` (변화 없음) | **무시**한다(중복 요청 방지) |
| `loading` | 서버 성공 응답 | `success` | |
| `loading` | 서버 실패 응답 / 네트워크 실패 | `error` | |
| `success`/`error` | 입력창 내용 수정 | 상태 유지 | 이전 결과는 다음 분석 전까지 그대로 둔다 |
| 모든 상태 | 예시 칩 클릭 | 상태 유지 | 입력창 내용만 교체, 자동 분석 안 함 |

---

## 2. 입력 처리

### 2-1. 상수

```js
const MAX_LENGTH = 1000;
const API_URL = '/api/analyze';
const CLIENT_TIMEOUT_MS = 25000; // 서버 타임아웃(20초)보다 길게
```

### 2-2. 입력 검증 함수 (서버와 같은 규칙)

```js
// 입력이 유효하면 null, 아니면 오류 코드 문자열을 돌려준다
function validateInput(raw) {
  const text = raw.trim();
  if (text.length === 0) return 'EMPTY_TEXT';
  if (raw.length > MAX_LENGTH) return 'TEXT_TOO_LONG';
  return null;
}
```

- 길이는 JavaScript의 `string.length` 기준으로 센다(서버와 동일).
- 서버로 보낼 때는 **앞뒤 공백을 제거한 값**(`trim()`)을 보낸다.

### 2-3. 글자 수 표시
- `input` 이벤트마다 `#char-count`를 `${n.toLocaleString('ko-KR')} / 1,000` 형식으로 갱신한다.
- `n === 1000`이면 `#char-count`에 클래스 `is-limit`을 붙인다(빨간색).

### 2-4. 분석하기 버튼 활성 조건
- `state.status !== 'loading'` **그리고** `inputText.value.trim().length > 0` 일 때만 활성.
- 이 조건은 `render()`와 `input` 이벤트 둘 다에서 계산한다.

### 2-5. 단축키
- 입력창에서 `keydown` 이벤트: `(event.ctrlKey || event.metaKey) && event.key === 'Enter'` 이면 `event.preventDefault()` 후 분석 요청.
- 한글 입력 조합 중(`event.isComposing === true`)에는 무시한다.
- 힌트 문구(`#shortcut-hint`): `navigator.platform` 또는 `navigator.userAgent`에 `Mac`이 포함되면 `⌘ + Enter로 분석`, 아니면 `Ctrl + Enter로 분석`.

### 2-6. 예시 칩
- `data-example` 값에 따라 아래 문장을 입력창에 넣고, 글자 수·버튼 상태를 갱신하고, 입력창에 포커스한다.

```js
const EXAMPLES = {
  positive: '배송도 빠르고 품질도 기대 이상이에요. 다음에 또 살게요!',
  negative: '두 번이나 문의했는데 아무 답이 없네요. 정말 실망입니다.',
  neutral: '내일 오후 3시에 회의실 B에서 주간 회의가 있습니다.'
};
```

### 2-7. 헤더 '분석 시작' 버튼 / 히어로 링크
- `#start-btn` 클릭: `#analyzer`로 부드럽게 스크롤(`scrollIntoView({ behavior: 'smooth', block: 'start' })`) 후 `#input-text`에 포커스.
- `prefers-reduced-motion: reduce`이면 `behavior: 'auto'`.

---

## 3. 서버 요청 (`requestAnalysis`)

### 3-1. 순서
1. `state.status === 'loading'`이면 즉시 종료.
2. `validateInput()` → 오류면 `setState({ status: 'error', error: ERROR_MESSAGES[code] 기반 객체 })` 후 종료.
3. `setState({ status: 'loading' })`
4. `fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }), signal })`
   - `AbortController`로 `CLIENT_TIMEOUT_MS` 후 취소.
5. 응답 처리 (아래 3-2)
6. 성공 시 `setState({ status: 'success', result: data, error: null })`
7. 실패 시 `setState({ status: 'error', error: {...}, result: null })`

### 3-2. 응답 해석 규칙

| 상황 | 판정 | 화면 오류 코드 |
|---|---|---|
| `fetch`가 예외를 던짐 (오프라인, DNS 실패 등) & 취소 아님 | 실패 | `NETWORK_ERROR` |
| `AbortController`로 취소됨 (`error.name === 'AbortError'`) | 실패 | `AI_TIMEOUT` |
| 응답 본문이 JSON이 아님 | 실패 | `UNKNOWN_ERROR` |
| `body.ok === true` 이고 `body.data`가 형식 검사(3-3) 통과 | 성공 | — |
| `body.ok === true` 이지만 형식 검사 실패 | 실패 | `AI_BAD_RESPONSE` |
| `body.ok === false` 이고 `body.error.code`가 `ERROR_MESSAGES`에 있음 | 실패 | 그 코드 |
| `body.ok === false` 이지만 코드가 모르는 값 | 실패 | `UNKNOWN_ERROR` |

- 화면에 보이는 오류 **제목과 설명은 항상 `app.js` 안의 `ERROR_MESSAGES` 표에서 가져온다.** 서버가 보낸 `message`는 사용하지 않는다(문구 일관성 유지). `ERROR_MESSAGES` 내용은 `docs/06`의 표를 그대로 옮긴다.

### 3-3. 성공 데이터 형식 검사

```js
// 서버 응답이 화면에 그려도 안전한 모양인지 확인한다
function isValidResult(data) {
  return data
    && ['positive', 'negative', 'neutral'].includes(data.sentiment)
    && Number.isInteger(data.confidence)
    && data.confidence >= 0 && data.confidence <= 100
    && typeof data.reason === 'string'
    && data.reason.length > 0;
}
```

---

## 4. 결과 그리기 (`renderSuccess`)

| 화면 요소 | 값 |
|---|---|
| `#sentiment-label` | `positive`→`긍정`, `negative`→`부정`, `neutral`→`중립` |
| `#sentiment-badge` 클래스 | `badge badge--positive` / `badge--negative` / `badge--neutral` (기존 감성 클래스는 제거 후 추가) |
| `#confidence-value` | `${confidence}%` |
| `#confidence-label` | 80 이상 `확신이 높아요` / 50~79 `어느 정도 확신해요` / 0~49 `판단이 애매해요` |
| `#confidence-fill` | `style.width = confidence + '%'`, 감성 클래스(`fill--positive` 등) |
| `#confidence-bar` | `aria-valuenow = confidence` |
| `#reason-text` | `reason` |

- 모든 글자는 **`textContent`로만** 넣는다. `innerHTML` 사용 금지.
- 성공 카드가 나타난 뒤, 모바일(폭 < 1024px)에서는 결과 패널이 화면에 보이도록 `scrollIntoView({ block: 'nearest' })`를 호출한다.

## 5. 오류 그리기 (`renderError`)

| 화면 요소 | 값 |
|---|---|
| `#error-title` | `ERROR_MESSAGES[code].title` |
| `#error-message` | `ERROR_MESSAGES[code].message` |
| `#error-code` | `오류 코드: ${code}` |

- 입력 오류(`EMPTY_TEXT`, `TEXT_TOO_LONG`)일 때는 그린 직후 `#input-text`에 포커스를 돌려준다.

## 6. 로딩 그리기
- `#analyze-btn`: `disabled = true`, 내용 = 스피너 `<span class="spinner" aria-hidden="true"></span>` + 텍스트 `분석 중…`. (스피너 span은 미리 HTML에 두고 `hidden`으로 전환해도 됨. 문자열 HTML 삽입 금지)
- `#analyze-btn`에 `aria-busy="true"`.
- `#clear-btn`은 로딩 중에도 **활성** 상태지만, 클릭하면 진행 중인 요청을 `abort()`하고 `idle`로 돌아간다. 취소로 인한 `AbortError`는 오류로 표시하지 않는다(취소 사유를 구분하는 변수 사용).

---

## 7. 파일 구조 (app.js 안 함수 목록과 순서)

```
1. 상수: MAX_LENGTH, API_URL, CLIENT_TIMEOUT_MS, EXAMPLES, SENTIMENT_TEXT, ERROR_MESSAGES
2. DOM 참조: const els = { inputText: ..., charCount: ..., ... }
3. 상태: state, setState()
4. 검증: validateInput(), isValidResult(), getConfidenceLabel()
5. 그리기: render(), renderSuccess(), renderError(), updateCharCount(), updateAnalyzeButton()
6. 서버 통신: requestAnalysis(), toErrorState(code)
7. 이벤트 연결: bindEvents()
8. 시작: init()  → 힌트 문구 설정, 이벤트 연결, 첫 render()
```

---

## 8. 완료 기준 · 검증 기준

| ID | 확인 방법 | 기대 결과 |
|---|---|---|
| F-01 | 페이지 첫 진입 | 빈 상태 표시, 분석하기 버튼 비활성, 글자 수 `0 / 1,000` |
| F-02 | 스페이스만 5번 입력 | 버튼 비활성 유지 |
| F-03 | 긍정 예시 칩 클릭 | 입력창에 긍정 예시 문장, 글자 수 갱신, 버튼 활성, 분석은 시작 안 됨 |
| F-04 | 분석하기 빠르게 5번 클릭 | 개발자도구 Network에 `/api/analyze` 요청 **1건** |
| F-05 | 입력창에서 Ctrl(⌘)+Enter | 분석 시작 |
| F-06 | 한글 입력 중 Ctrl+Enter | 조합 중인 글자가 깨지지 않음 |
| F-07 | 로딩 중 지우기 클릭 | 빈 상태로 복귀, 오류 카드 안 나옴 |
| F-08 | 오류 후 정상 문장으로 재분석 | 성공 카드 표시 |
| F-09 | `app.js`에서 `innerHTML` 검색 | 0건 |
| F-10 | `app.js`에서 `api.openai.com` 검색 | 0건 |
