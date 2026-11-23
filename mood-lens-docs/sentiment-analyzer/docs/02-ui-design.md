# 02. UI 구현 지침

> 목적: 첨부된 참고 화면(어두운 배경의 제품 소개 페이지)의 **분위기**를 감성 분석 서비스에 맞게 옮깁니다.
> 모든 색상·크기·간격은 이 문서의 **디자인 토큰 값만** 사용합니다. 새 값을 만들지 않습니다.

---

## 1. 참고 화면에서 가져오는 것 / 가져오지 않는 것

| 가져오는 것 (O) | 가져오지 않는 것 (X) |
|---|---|
| 거의 검정(#08090a)에 가까운 배경 | 참고 화면의 로고, 서비스명, 메뉴 이름 |
| 화면 상단 고정 헤더 + 아래쪽 얇은 구분선 | 참고 화면의 문구(영어 제목/설명) 번역·변형 |
| 크고 굵으며 자간이 좁은 2줄 제목 | 참고 화면의 아이콘 모양 그대로 따라 그리기 |
| 회색 톤의 보조 설명 문구 | 사이드바 메뉴, 이슈 목록 같은 업무 도구 UI |
| 흰색 **알약 모양**(완전 둥근) 주요 버튼 | |
| 가는 테두리 + 둥근 모서리의 **앱 창 모양 패널** | |
| 패널 안의 작은 상태 아이콘·배지(작은 테두리 칩) | |
| 오른쪽에 떠 있는 듯한 **보조 패널**(결과 패널로 사용) | |

---

## 2. 글꼴 (Pretendard 웹폰트)

### 2-1. `public/css/fonts.css` — 아래 내용을 **수정 없이 그대로** 저장

```css
@font-face {
    font-family: 'Pretendard';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Thin.woff2') format('woff2');
    font-weight: 100;
    font-display: swap;
}

@font-face {
    font-family: 'Pretendard';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-ExtraLight.woff2') format('woff2');
    font-weight: 200;
    font-display: swap;
}

@font-face {
    font-family: 'Pretendard';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Light.woff2') format('woff2');
    font-weight: 300;
    font-display: swap;
}

@font-face {
    font-family: 'Pretendard';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Regular.woff2') format('woff2');
    font-weight: 400;
    font-display: swap;
}

@font-face {
    font-family: 'Pretendard';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Medium.woff2') format('woff2');
    font-weight: 500;
    font-display: swap;
}

@font-face {
    font-family: 'Pretendard';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-SemiBold.woff2') format('woff2');
    font-weight: 600;
    font-display: swap;
}

@font-face {
    font-family: 'Pretendard';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Bold.woff2') format('woff2');
    font-weight: 700;
    font-display: swap;
}

@font-face {
    font-family: 'Pretendard';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-ExtraBold.woff2') format('woff2');
    font-weight: 800;
    font-display: swap;
}

@font-face {
    font-family: 'Pretendard';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Black.woff2') format('woff2');
    font-weight: 900;
    font-display: swap;
}

@font-face {
    font-family: 'PretendardVariable';
    src: url('https://cdn.jsdelivr.net/gh/Project-Noonnu/2611030106@font-variable-694/variable-694/PretendardVariable.woff2') format('woff2');
    font-weight: 45 930;
    font-display: swap;
}

/* 가변: font-family: 'PretendardVariable'; font-variation-settings: "wght" 400; */
```

### 2-2. 글꼴 사용 규칙
- 본문 전체 글꼴: `--font-sans` 토큰 (아래 3장) — 정적 `Pretendard`를 사용한다.
- `PretendardVariable`은 정의만 두고 **사용하지 않는다.** (사용하지 않으면 브라우저가 내려받지 않음)
- 실제로 쓰는 굵기는 **400, 500, 600, 700 네 가지뿐**이다. 다른 굵기를 쓰지 않는다.
- `index.html`의 `<head>`에서 `fonts.css`를 `style.css`보다 **먼저** 불러온다.

---

## 3. 디자인 토큰 (`public/css/style.css` 맨 위 `:root`에 그대로 작성)

```css
:root {
  /* ── 색상: 배경 ── */
  --color-bg: #08090a;             /* 페이지 배경 */
  --color-bg-elevated: #0f1011;    /* 앱 창 바깥 프레임 */
  --color-surface: #141516;        /* 패널 내부 */
  --color-surface-2: #1b1c1e;      /* 입력창, 칩, 호버 */
  --color-border: #23252a;         /* 기본 테두리 */
  --color-border-strong: #34363c;  /* 강조 테두리, 호버 테두리 */

  /* ── 색상: 글자 ── */
  --color-text: #f7f8f8;           /* 제목, 본문 강조 */
  --color-text-secondary: #8a8f98; /* 설명, 보조 문구 */
  --color-text-tertiary: #62666d;  /* 힌트, 캡션, placeholder */

  /* ── 색상: 버튼 ── */
  --color-primary-bg: #f7f8f8;     /* 흰색 알약 버튼 배경 */
  --color-primary-text: #08090a;
  --color-primary-bg-hover: #ffffff;
  --color-disabled-bg: #2a2c30;
  --color-disabled-text: #62666d;

  /* ── 색상: 감성 ── */
  --color-positive: #4cb782;       /* 긍정 = 초록 */
  --color-negative: #eb5757;       /* 부정 = 빨강 */
  --color-neutral: #f2c94c;        /* 중립 = 노랑 */
  --color-positive-soft: rgba(76, 183, 130, 0.12);
  --color-negative-soft: rgba(235, 87, 87, 0.12);
  --color-neutral-soft: rgba(242, 201, 76, 0.12);

  /* ── 색상: 기타 ── */
  --color-focus: #5e6ad2;          /* 키보드 포커스 테두리 */
  --color-error-bg: rgba(235, 87, 87, 0.08);
  --color-error-border: rgba(235, 87, 87, 0.35);

  /* ── 글꼴 ── */
  --font-sans: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo',
    'Malgun Gothic', 'Segoe UI', sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;

  /* ── 글자 크기 ── */
  --text-hero: clamp(2.5rem, 4.2vw + 1rem, 4.5rem); /* 40px ~ 72px */
  --text-title: 1.5rem;     /* 24px 패널 제목 */
  --text-lg: 1.125rem;      /* 18px 부제 */
  --text-md: 1rem;          /* 16px 본문 */
  --text-sm: 0.875rem;      /* 14px 버튼, 칩 */
  --text-xs: 0.8125rem;     /* 13px 캡션 */
  --text-result: 2.5rem;    /* 40px 신뢰도 숫자 */

  /* ── 자간·행간 ── */
  --tracking-hero: -0.035em;
  --tracking-title: -0.02em;
  --leading-tight: 1.08;
  --leading-normal: 1.6;

  /* ── 간격 (4px 단위) ── */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
  --space-9: 96px;

  /* ── 모서리 ── */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-pill: 9999px;

  /* ── 기타 ── */
  --header-height: 64px;
  --container-max: 1200px;
  --shadow-panel: 0 24px 64px rgba(0, 0, 0, 0.45);
  --transition-fast: 150ms ease;
}
```

### 3-1. 기본 스타일 규칙
- `html, body`: 배경 `--color-bg`, 글자 `--color-text`, 글꼴 `--font-sans`, `-webkit-font-smoothing: antialiased`.
- `box-sizing: border-box`를 모든 요소에 적용.
- 링크 밑줄 없음, 호버 시 `--color-text`로 밝아짐.
- `::selection` 배경 `rgba(94, 106, 210, 0.4)`.
- 키보드 포커스: `:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 2px; }` — `outline: none`만 단독으로 쓰는 것은 금지.

---

## 4. 페이지 레이아웃 (와이어프레임)

### 4-1. 데스크톱 (1024px 이상)

```
┌───────────────────────────────────────────────────────────────────────┐
│ ◎ 감정렌즈                          사용 방법   안내      [ 분석 시작 ] │ ← 헤더 64px, 하단 1px 선
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  문장 속 감정을                                                        │ ← 히어로 제목 (2줄)
│  한 번에 읽어내는 AI                                                   │
│                                                                       │
│  텍스트를 입력하면 긍정·부정·중립과 신뢰도, 판단 이유를 알려드려요.     New  예시로 체험하기 → │
│                                                                       │
│ ┌───────────────────────────────────────────────────────────────────┐ │ ← 앱 창 프레임
│ │ ┌───────────────────────────────────────┐ ┌─────────────────────┐ │ │
│ │ │ ◐ 새 분석                     0/1,000 │ │ ◎ 분석 결과  [OpenAI]│ │ │
│ │ │───────────────────────────────────────│ │─────────────────────│ │ │
│ │ │ 분석할 문장                            │ │                     │ │ │
│ │ │ ┌───────────────────────────────────┐ │ │  (상태별 내용)       │ │ │
│ │ │ │ textarea                          │ │ │  빈 상태 / 로딩 /    │ │ │
│ │ │ │                                   │ │ │  결과 / 오류         │ │ │
│ │ │ └───────────────────────────────────┘ │ │                     │ │ │
│ │ │ 예시  (긍정 예시)(부정 예시)(중립 예시) │ │                     │ │ │
│ │ │───────────────────────────────────────│ │                     │ │ │
│ │ │ Ctrl+Enter로 분석   [지우기] [분석하기] │ │                     │ │ │
│ │ └───────────────────────────────────────┘ └─────────────────────┘ │ │
│ └───────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  AI 분석 결과는 참고용이며 정확하지 않을 수 있어요.                      │ ← 푸터
└───────────────────────────────────────────────────────────────────────┘
```

### 4-2. 반응형 규칙

| 구간 | 폭 | 규칙 |
|---|---|---|
| 데스크톱 | ≥ 1024px | 앱 창 내부 2열 그리드 `grid-template-columns: 1.4fr 1fr`, 열 간격 `--space-3` |
| 태블릿 | 768~1023px | 1열(입력 패널 위, 결과 패널 아래). 헤더 메뉴 링크 유지 |
| 모바일 | < 768px | 1열. 좌우 여백 `--space-4`. 헤더의 메뉴 링크 2개 숨김(버튼만 남김). 히어로 오른쪽 링크는 부제 아래로 이동. 하단 버튼 영역에서 단축키 힌트 숨김 |

- 컨테이너: `max-width: var(--container-max)`, 가운데 정렬, 좌우 패딩 `--space-5`(모바일 `--space-4`).
- 어떤 폭에서도 **가로 스크롤이 생기면 안 된다.**

---

## 5. 영역별 상세 명세

### 5-1. 헤더 `<header class="site-header">`
- 높이 `--header-height`, `position: sticky; top: 0; z-index: 10;`
- 배경 `rgba(8, 9, 10, 0.8)` + `backdrop-filter: blur(12px)`, 하단 테두리 `1px solid var(--color-border)`.
- 왼쪽: 로고 = 인라인 SVG(파비콘과 같은 원 모양, 20×20) + 텍스트 `감정렌즈` (`--text-lg`, 굵기 600, 자간 `--tracking-title`).
- 오른쪽: 링크 `사용 방법`(→ `#analyzer`), `안내`(→ `#notice`) — `--text-sm`, `--color-text-secondary`, 간격 `--space-5`. 그 오른쪽에 **알약 버튼** `분석 시작`(→ 클릭 시 `#input-text`에 포커스).

### 5-2. 히어로 `<section class="hero">`
- 위 여백 `--space-9`, 아래 여백 `--space-8`(모바일: 위 `--space-8`, 아래 `--space-7`).
- 제목 `<h1>`: 두 줄 고정. 1줄 `문장 속 감정을`, 2줄 `한 번에 읽어내는 AI` (`<br>`로 줄바꿈).
  - `--text-hero`, 굵기 **700**, 자간 `--tracking-hero`, 행간 `--leading-tight`, 색 `--color-text`.
- 부제 `<p>`: `텍스트를 입력하면 긍정·부정·중립과 신뢰도, 판단 이유를 알려드려요.`
  - `--text-lg`, 굵기 400, 색 `--color-text-secondary`, 제목과 간격 `--space-6`.
- 부제와 같은 줄 오른쪽 끝: `New` (굵기 600, `--color-text`) + `예시로 체험하기 →` (`--color-text-secondary`). 클릭 시 `#analyzer`로 부드럽게 스크롤.

### 5-3. 앱 창 프레임 `<section id="analyzer" class="app-frame">`
- 배경 `--color-bg-elevated`, 테두리 `1px solid var(--color-border)`, 모서리 `--radius-xl`, 안쪽 여백 `--space-3`, 그림자 `--shadow-panel`.
- 위쪽에 은은한 빛: `background-image: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 40%);`

### 5-4. 입력 패널 `<div class="panel panel--input">`
- 배경 `--color-surface`, 테두리 `1px solid var(--color-border)`, 모서리 `--radius-lg`.
- **패널 머리줄**(높이 52px, 좌우 패딩 `--space-5`, 하단 테두리):
  - 왼쪽: 반쯤 채워진 원 아이콘(16px, 색 `--color-neutral`) + `새 분석` (`--text-sm`, 굵기 600).
  - 오른쪽: 글자 수 `<span id="char-count">0 / 1,000</span>` (`--text-xs`, `--color-text-tertiary`, `font-variant-numeric: tabular-nums`). 1,000자에 도달하면 색 `--color-negative`.
- **본문**(패딩 `--space-5`):
  - 라벨 `<label for="input-text">분석할 문장</label>` — `--text-title`, 굵기 600, 자간 `--tracking-title`, 아래 간격 `--space-3`.
  - 입력창 `<textarea id="input-text">`
    - placeholder: `예) 오늘 받은 택배 포장이 꼼꼼해서 기분이 좋았어요.`
    - `rows="6"`, `maxlength="1000"`, `resize: vertical`, `min-height: 160px`
    - 배경 `--color-surface-2`, 테두리 `1px solid var(--color-border)`, 모서리 `--radius-md`, 패딩 `--space-4`, 글자 `--text-md` 행간 `--leading-normal`.
    - 포커스 시 테두리 `--color-border-strong` + `:focus-visible` 규칙.
  - 예시 영역(위 간격 `--space-4`): 캡션 `예시` (`--text-xs`, `--color-text-tertiary`) + 칩 버튼 3개
    - `<button class="chip" data-example="positive">긍정 예시</button>` / `negative`→`부정 예시` / `neutral`→`중립 예시`
    - 칩: 높이 28px, 좌우 패딩 `--space-3`, 배경 `--color-surface-2`, 테두리 `1px solid var(--color-border)`, 모서리 `--radius-pill`, `--text-xs`, 색 `--color-text-secondary`. 호버 시 테두리 `--color-border-strong`, 글자 `--color-text`.
    - 칩 왼쪽에 6px 원형 점: 각각 감성 색.
- **패널 바닥줄**(패딩 `--space-4 --space-5`, 상단 테두리, `display:flex; justify-content: space-between; align-items:center`):
  - 왼쪽: 힌트 `Ctrl + Enter로 분석` (Mac이면 `⌘ + Enter로 분석`) — `--text-xs`, `--color-text-tertiary`. `<kbd>` 태그로 키 표시.
  - 오른쪽: `[지우기]`(고스트 버튼) + `[분석하기]`(주요 버튼), 간격 `--space-2`.

### 5-5. 결과 패널 `<div class="panel panel--result" aria-live="polite">`
- 입력 패널과 같은 배경·테두리·모서리.
- **패널 머리줄**: 왼쪽 로고 원 아이콘 + `분석 결과`(굵기 600), 오른쪽 배지 `OpenAI` (높이 22px, 패딩 `0 var(--space-2)`, 테두리 `1px solid var(--color-border-strong)`, 모서리 `--radius-sm`, `--text-xs`, `--color-text-secondary`).
- **본문**은 4가지 상태 중 하나만 보인다 (`docs/03` 참고). 각 상태는 `<div>`로 미리 만들어 두고 `hidden` 속성으로 전환한다.

| 상태 | 요소 id | 화면 내용 |
|---|---|---|
| 빈 상태 | `result-empty` | 가운데 정렬. 원 아이콘(32px, `--color-text-tertiary`) + `아직 분석한 문장이 없어요` (`--text-md`, 600) + `문장을 입력하고 분석하기를 눌러 보세요.` (`--text-sm`, `--color-text-secondary`). 모든 화면 폭에서 같은 문구 사용 |
| 로딩 | `result-loading` | 스켈레톤 막대 3개(높이 각 40px·12px·12px, 폭 40%·100%·70%, 배경 `--color-surface-2`, 모서리 `--radius-sm`, 반짝임 애니메이션 1.2s) + 문구 `AI가 문장을 읽고 있어요…` (`--text-sm`, `--color-text-secondary`) |
| 성공 | `result-success` | 5-6 참고 |
| 오류 | `result-error` | 5-7 참고 |

### 5-6. 성공 결과 카드 (`#result-success`)

```
┌───────────────────────────────┐
│ (●) 긍정                       │ ← 감성 배지
│                               │
│ 신뢰도                         │ ← 캡션
│ 87%          확신이 높아요      │ ← 큰 숫자 + 구간 안내
│ ████████████████████░░░░      │ ← 막대
│                               │
│ 분석 이유                      │ ← 캡션
│ '기대 이상'이라는 표현에서 …     │ ← 이유 문장
└───────────────────────────────┘
```

- **감성 배지** `#sentiment-badge`: 높이 32px, 좌우 패딩 `--space-3`, 모서리 `--radius-pill`, `--text-sm` 굵기 600.
  - 긍정: 배경 `--color-positive-soft`, 글자·점 `--color-positive`, 텍스트 `긍정`
  - 부정: 배경 `--color-negative-soft`, 글자·점 `--color-negative`, 텍스트 `부정`
  - 중립: 배경 `--color-neutral-soft`, 글자·점 `--color-neutral`, 텍스트 `중립`
  - 클래스로 구분: `.badge--positive`, `.badge--negative`, `.badge--neutral`
- **신뢰도 숫자** `#confidence-value`: `--text-result`, 굵기 700, 자간 `--tracking-title`, `tabular-nums`. 형식 `87%`.
- **구간 안내** `#confidence-label`: `--text-sm`, `--color-text-secondary` (문구는 PRD FR-04).
- **막대** `#confidence-bar` (바깥 트랙 + 안쪽 채움 `#confidence-fill`): 트랙 높이 8px, 배경 `--color-surface-2`, 모서리 `--radius-pill`. 채움 폭 = 신뢰도 %, 색 = 감성 색, `transition: width 400ms ease`. 트랙에 `role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="87"`.
- **캡션**(`신뢰도`, `분석 이유`): `--text-xs`, `--color-text-tertiary`, 굵기 500, 아래 간격 `--space-2`.
- **분석 이유** `#reason-text`: `--text-md`, 행간 `--leading-normal`, 색 `--color-text`.
- 요소 사이 세로 간격 `--space-5`.

### 5-7. 오류 카드 (`#result-error`, `role="alert"`)
- 배경 `--color-error-bg`, 테두리 `1px solid var(--color-error-border)`, 모서리 `--radius-md`, 패딩 `--space-4`.
- 첫 줄: 경고 아이콘(인라인 SVG 16px, `--color-negative`) + 제목 `#error-title` (`--text-md`, 600).
- 둘째 줄: 설명 `#error-message` (`--text-sm`, `--color-text-secondary`).
- 셋째 줄: 오류 코드 `#error-code` (`--font-mono`, `--text-xs`, `--color-text-tertiary`), 예: `오류 코드: AI_TIMEOUT`.
- 문구는 `docs/06`의 표를 그대로 사용.

### 5-8. 버튼

| 종류 | 클래스 | 스타일 |
|---|---|---|
| 주요(알약) | `.btn .btn--primary` | 높이 40px, 좌우 패딩 `--space-5`, 배경 `--color-primary-bg`, 글자 `--color-primary-text`, `--text-sm` 굵기 600, 모서리 `--radius-pill`. 호버: 배경 `--color-primary-bg-hover` |
| 주요-작은(헤더) | `.btn .btn--primary .btn--sm` | 높이 36px, 좌우 패딩 `--space-4` |
| 고스트 | `.btn .btn--ghost` | 높이 40px, 배경 투명, 테두리 `1px solid var(--color-border)`, 글자 `--color-text-secondary`, 모서리 `--radius-pill`. 호버: 배경 `--color-surface-2`, 글자 `--color-text` |
| 비활성 | `:disabled` | 배경 `--color-disabled-bg`, 글자 `--color-disabled-text`, `cursor: not-allowed`, 호버 효과 없음 |

- 로딩 중 '분석하기' 버튼: 글자 왼쪽에 14px 회전 스피너(테두리 2px, 0.8s 회전) + `분석 중…`.

### 5-9. 푸터 `<footer id="notice">`
- 위 여백 `--space-8`, 아래 여백 `--space-7`, 상단 테두리.
- 문구 2줄 (`--text-xs`, `--color-text-tertiary`):
  1. `AI 분석 결과는 참고용이며 정확하지 않을 수 있어요.`
  2. `입력한 문장은 저장되지 않으며, 분석을 위해 OpenAI로 전송됩니다.`

---

## 6. 움직임(애니메이션)

- 허용: 버튼 색 전환(`--transition-fast`), 신뢰도 막대 폭 변화(400ms), 스켈레톤 반짝임, 스피너 회전, 결과 카드 등장(투명도 0→1 + 위로 4px, 200ms).
- `@media (prefers-reduced-motion: reduce)`에서는 위 애니메이션을 **모두 끈다**(`animation: none; transition: none;`).
- 그 외 애니메이션은 추가하지 않는다.

---

## 7. `index.html` 필수 사항

- `<html lang="ko">`, `<meta charset="utf-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1">`
- `<title>감정렌즈 — AI 감성 분석</title>`
- `<meta name="description" content="문장을 입력하면 AI가 긍정·부정·중립과 신뢰도, 판단 이유를 알려드립니다.">`
- `<meta name="theme-color" content="#08090a">`
- `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`
- CSS: `/css/fonts.css` → `/css/style.css` 순서
- JS: `<script type="module" src="/js/app.js"></script>` (`</body>` 직전)
- 시맨틱 태그: `header`, `main`, `section`, `footer` 사용. `h1`은 페이지에 1개.

### 7-1. 필수 id 목록 (`app.js`가 사용하므로 이름 변경 금지)

| id | 요소 |
|---|---|
| `analyzer` | 앱 창 프레임 section |
| `input-text` | textarea |
| `char-count` | 글자 수 표시 span |
| `analyze-btn` | 분석하기 버튼 |
| `clear-btn` | 지우기 버튼 |
| `start-btn` | 헤더 '분석 시작' 버튼 |
| `shortcut-hint` | 단축키 힌트 문구 |
| `result-empty` | 빈 상태 |
| `result-loading` | 로딩 상태 |
| `result-success` | 성공 카드 |
| `result-error` | 오류 카드 |
| `sentiment-badge` / `sentiment-label` | 감성 배지 / 배지 안 글자 |
| `confidence-value` / `confidence-label` | 신뢰도 숫자 / 구간 안내 |
| `confidence-bar` / `confidence-fill` | 막대 트랙 / 채움 |
| `reason-text` | 분석 이유 |
| `error-title` / `error-message` / `error-code` | 오류 제목 / 설명 / 코드 |

---

## 8. 완료 기준 · 검증 기준

| ID | 확인 항목 | 기대 결과 |
|---|---|---|
| U-01 | 개발자도구 → Elements에서 `body`의 계산된 `font-family` | 첫 번째가 `Pretendard` |
| U-02 | 개발자도구 → Network → Font | `Pretendard-*.woff2` 파일만 로드(최대 4개: Regular/Medium/SemiBold/Bold) |
| U-03 | `style.css`에서 `:root` 밖의 `#` 색상 검색 | 0건 |
| U-04 | 360px 폭 | 가로 스크롤 없음, 헤더 메뉴 링크 숨김, 1열 |
| U-05 | 768px 폭 | 1열, 입력 패널 위·결과 패널 아래 |
| U-06 | 1280px 폭 | 2열, 와이어프레임 4-1과 배치 일치 |
| U-07 | Tab 키로 이동 | 모든 버튼·입력창에 파란 포커스 테두리 표시 |
| U-08 | 긍정/부정/중립 결과 | 각각 초록/빨강/노랑 배지와 막대 |
| U-09 | OS의 '동작 줄이기' 켜기 | 애니메이션 없음 |
| U-10 | 참고 화면의 로고·서비스명·영문 문구 | 페이지 어디에도 없음 |
