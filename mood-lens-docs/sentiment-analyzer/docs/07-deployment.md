# 07. Vercel 배포 지침

> 목적: 내 컴퓨터에서 만든 서비스를 **인터넷 주소로 공개**합니다.
> 배포 방식은 두 가지 중 **방법 A(GitHub 연동)** 를 기본으로 합니다.

---

## 1. 배포 전 점검 (모두 체크 후 진행)

- [ ] `npm test` 실패 0개
- [ ] `docs/08`의 수동 점검 M-01~M-14 로컬 통과
- [ ] `.env.local`이 `git status`에 나타나지 않음
- [ ] `public/` 폴더에서 `sk-` 검색 결과 0건
- [ ] OpenAI 대시보드 → Limits 에서 **월 사용 한도(budget)** 설정 완료

---

## 2. 방법 A — GitHub 연동 배포 (권장)

1. GitHub에 새 저장소를 만들고 프로젝트를 올린다.
   ```bash
   git init
   git add .
   git commit -m "feat: 감정렌즈 첫 버전"
   git branch -M main
   git remote add origin https://github.com/<내아이디>/mood-lens.git
   git push -u origin main
   ```
2. https://vercel.com/new 접속 → **Import Git Repository**에서 `mood-lens` 선택.
3. 설정 화면에서 아래처럼 맞춘다.

   | 항목 | 값 |
   |---|---|
   | Framework Preset | **Other** |
   | Root Directory | `./` |
   | Build Command | 비워 둠 (Override 끔) |
   | Output Directory | `public` (vercel.json에 이미 지정) |
   | Install Command | 비워 둠 |

4. **Environment Variables** 펼치기 → 아래 입력 후 Add.

   | Key | Value | Environments |
   |---|---|---|
   | `OPENAI_API_KEY` | `sk-...` (내 키) | Production, Preview, Development 모두 체크 |
   | `OPENAI_MODEL` | (선택) 비워 두면 기본 모델 | 필요 시만 |

5. **Deploy** 클릭 → 1~2분 후 `https://mood-lens-xxxx.vercel.app` 형태의 주소가 생긴다.
6. 이후 `main` 브랜치에 push하면 **자동으로 다시 배포**된다.

## 3. 방법 B — CLI로 직접 배포

```bash
npx vercel login                       # 처음 한 번
npx vercel link                        # 프로젝트 연결
npx vercel env add OPENAI_API_KEY      # 값 입력, 환경은 Production·Preview·Development 선택
npx vercel --prod                      # 운영 배포
```

---

## 4. 환경 변수를 나중에 바꿨을 때

- Vercel 대시보드 → Project → **Settings → Environment Variables**에서 수정.
- **환경 변수는 새로 배포해야 반영된다.** Deployments 탭 → 최신 배포의 `⋯` → **Redeploy**.

## 5. Node.js 버전

- `package.json`의 `"engines": { "node": "24.x" }`로 고정되어 있다. Vercel 프로젝트 설정의 Node.js 버전도 **24.x**인지 확인한다(Settings → Build and Deployment → Node.js Version).

---

## 6. 문제 해결 (사람용)

| 증상 | 원인 | 해결 |
|---|---|---|
| 화면은 뜨는데 분석하면 "서비스 설정에 문제가 있어요" | 환경 변수 미등록 또는 등록 후 재배포 안 함 | 4장대로 등록 후 Redeploy |
| "요청이 많아 잠시 쉬고 있어요"가 계속 뜸 | OpenAI 결제 수단 없음/한도 초과 | OpenAI 대시보드 Billing·Limits 확인 |
| "AI 서비스에 연결하지 못했어요"가 계속 뜸 | 키가 잘못됐거나(401) 모델 ID가 없음(404) | Vercel → Logs 에서 `AI_UPSTREAM_ERROR` 옆 상태값 확인 → 키 재발급 또는 `OPENAI_MODEL` 확인 |
| 페이지가 404 | Output Directory 설정 오류 | `vercel.json`의 `outputDirectory: "public"` 확인 |
| `/api/analyze`가 404 | `api/analyze.js` 위치 오류 | 프로젝트 **루트**의 `api/` 폴더인지 확인 (`public/api` 아님) |

로그 보는 법: Vercel 대시보드 → Project → **Logs** 탭.

---

## 7. 배포 후 점검 (완료 기준)

| ID | 확인 | 기대 결과 |
|---|---|---|
| D-01 | 배포 주소 접속 | 페이지 정상 표시, 콘솔 오류 0개 |
| D-02 | PRD AC-02~AC-04 예시 문장 3개 분석 | 긍정 / 부정 / 중립 |
| D-03 | 배포 주소 + `/AGENTS.md`, `/lib/openai.js` | 404 |
| D-04 | 개발자도구 Network에서 `/api/analyze` 요청·응답 확인 | `sk-` 문자열 없음, 응답 헤더 `Cache-Control: no-store` |
| D-05 | 휴대폰으로 배포 주소 접속 후 분석 | 1열 레이아웃, 정상 결과 |
