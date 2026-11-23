# 01. 프로젝트 생성 지침

> 목적: 에이전트가 **똑같은 폴더 구조와 설정 파일**을 만들도록 정확히 지정합니다.
> 여기 없는 파일/폴더는 만들지 않습니다.

---

## 1. 준비물 (사람이 미리 해 둘 것)

| 준비물 | 확인 방법 | 비고 |
|---|---|---|
| Node.js 24.x | 터미널에서 `node -v` → `v24.`로 시작 | https://nodejs.org 에서 LTS 설치 |
| Vercel 계정 | https://vercel.com 로그인 가능 | GitHub 계정으로 가입 권장 |
| OpenAI API 키 | https://platform.openai.com/api-keys 에서 발급 | `sk-`로 시작하는 문자열. 남에게 보여주지 말 것 |
| Git / GitHub 저장소 | `git --version` | 배포를 GitHub 연동으로 할 경우 필요 |

---

## 2. 최종 폴더 구조 (이대로 생성)

```
mood-lens/
├─ AGENTS.md                  # 에이전트 작업 규칙
├─ PRD.md                     # 제품 요구사항
├─ docs/                      # 세부 구현 문서 (01~08)
│
├─ public/                    # 브라우저에 그대로 전달되는 정적 파일
│  ├─ index.html              # 화면 구조 (단 1개 페이지)
│  ├─ favicon.svg             # 파비콘 (인라인 도형 SVG)
│  ├─ css/
│  │  ├─ fonts.css            # Pretendard @font-face (docs/02 그대로 복사)
│  │  └─ style.css            # 디자인 토큰 + 전체 스타일
│  └─ js/
│     └─ app.js               # 화면 동작 전부
│
├─ api/
│  └─ analyze.js              # Vercel Function: POST /api/analyze
│
├─ lib/                       # 서버 전용 공통 코드 (브라우저로 전달되지 않음)
│  ├─ errors.js               # 오류 코드·HTTP 상태·한국어 문구 정의
│  ├─ validate.js             # 입력 검증
│  └─ openai.js               # OpenAI Responses API 호출 + 응답 정리
│
├─ tests/                     # 자동 테스트 (node --test)
│  ├─ validate.test.js
│  ├─ openai.test.js
│  └─ analyze.test.js
│
├─ .env.example               # 환경 변수 예시 (값은 비움)
├─ .gitignore
├─ package.json
└─ vercel.json
```

### 폴더 역할을 쉽게 말하면
- **public/** = 손님이 보는 가게 진열대. 누구나 볼 수 있으므로 비밀은 절대 두지 않음.
- **api/** = 주문 창구. 브라우저가 "이 문장 분석해 주세요"라고 요청하는 곳.
- **lib/** = 주방. 창구(api)가 실제 일을 맡기는 곳. 브라우저에서는 보이지 않음.
- **tests/** = 품질 검사실. 코드가 제대로 동작하는지 자동으로 확인.

---

## 3. 설정 파일 내용 (그대로 작성)

### 3-1. `package.json`

```json
{
  "name": "mood-lens",
  "version": "1.0.0",
  "private": true,
  "description": "OpenAI 기반 감성 분석 웹 서비스",
  "type": "module",
  "engines": {
    "node": "24.x"
  },
  "scripts": {
    "dev": "npx vercel dev",
    "test": "node --test \"tests/*.test.js\""
  }
}
```

- `dependencies`, `devDependencies`는 **만들지 않는다.**
- `npm run dev`는 `npx`로 Vercel CLI를 그때그때 내려받아 실행한다. `vercel`을 프로젝트 의존성에 넣지 않는다.

### 3-2. `vercel.json`

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "outputDirectory": "public",
  "functions": {
    "api/analyze.js": {
      "maxDuration": 30
    }
  }
}
```

- `outputDirectory: "public"` → `public/` 폴더만 웹에 공개된다. (`AGENTS.md`, `docs/` 등은 공개되지 않음)
- `maxDuration: 30` → 서버 함수는 최대 30초까지 실행. (OpenAI 대기 20초 + 여유)

### 3-3. `.env.example`

```dotenv
# OpenAI API 키 (필수). 실제 값은 .env.local 또는 Vercel 환경 변수에만 넣으세요.
OPENAI_API_KEY=

# 사용할 모델 (선택). 비워 두면 lib/openai.js의 기본값을 사용합니다.
OPENAI_MODEL=
```

### 3-4. `.gitignore`

```gitignore
node_modules/
.env
.env.local
.env.*.local
.vercel/
.DS_Store
```

### 3-5. `public/favicon.svg`

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#08090a"/>
  <circle cx="16" cy="16" r="9" fill="none" stroke="#f7f8f8" stroke-width="2.5"/>
  <circle cx="16" cy="16" r="3.5" fill="#4cb782"/>
</svg>
```

---

## 4. 환경 변수

| 이름 | 필수 | 기본값 | 설명 |
|---|---|---|---|
| `OPENAI_API_KEY` | ✅ | 없음 | OpenAI API 키. 없으면 서버는 `SERVER_CONFIG_ERROR`를 반환 |
| `OPENAI_MODEL` | ❌ | `gpt-6-luna` | 사용할 모델 ID. 빈 문자열이면 기본값 사용 (`docs/05` 참고) |

- 로컬: 프로젝트 루트에 `.env.local` 파일을 만들고 `OPENAI_API_KEY=sk-...` 형태로 넣는다. `vercel dev`가 자동으로 읽는다.
- 배포: Vercel 대시보드 → Project → Settings → Environment Variables 에 등록 (`docs/07`).

---

## 5. 로컬에서 실행하기 (사람용 안내)

```bash
# 1) 프로젝트 폴더로 이동
cd mood-lens

# 2) Vercel 로그인 (처음 한 번만)
npx vercel login

# 3) 프로젝트 연결 (처음 한 번만, 질문에는 기본값 Enter)
npx vercel link

# 4) .env.local 만들기 (.env.example 복사 후 키 입력)
cp .env.example .env.local
#   → 편집기로 열어 OPENAI_API_KEY=sk-... 입력

# 5) 개발 서버 실행
npx vercel dev
#   → 터미널에 표시되는 주소(보통 http://localhost:3000)를 브라우저로 열기

# 6) 자동 테스트 실행 (API 키 없이도 동작)
npm test
```

---

## 6. 완료 기준

- [ ] 2장의 폴더 구조와 **파일 이름·위치가 정확히 일치**한다.
- [ ] 3장의 설정 파일 내용이 **글자 그대로** 들어가 있다.
- [ ] `npm test` 명령이 오류 없이 실행된다.
- [ ] `npx vercel dev` 실행 후 `http://localhost:3000` 에서 `index.html`이 열린다.
- [ ] `http://localhost:3000/AGENTS.md` 로 접속하면 **404**가 나온다(비공개 확인).

## 7. 검증 방법

| ID | 방법 | 기대 결과 |
|---|---|---|
| S-01 | `node -v` | `v24.`로 시작 |
| S-02 | `cat package.json` 에서 `dependencies` 검색 | 없음 |
| S-03 | `git status` 로 `.env.local` 표시 여부 확인 | 목록에 나타나지 않음(무시됨) |
| S-04 | 브라우저로 `/` 접속 | 페이지 표시 |
| S-05 | 브라우저로 `/AGENTS.md`, `/lib/openai.js` 접속 | 둘 다 404 |
