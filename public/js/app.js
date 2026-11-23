// ── 1. 상수 정의 ──
const MAX_LENGTH = 1000;
const API_URL = '/api/analyze';
const CLIENT_TIMEOUT_MS = 25000; // 서버 타임아웃(20초)보다 길게

const EXAMPLES = {
  positive: '배송도 빠르고 품질도 기대 이상이에요. 다음에 또 살게요!',
  negative: '두 번이나 문의했는데 아무 답이 없네요. 정말 실망입니다.',
  neutral: '내일 오후 3시에 회의실 B에서 주간 회의가 있습니다.'
};

const SENTIMENT_TEXT = {
  positive: '긍정',
  negative: '부정',
  neutral: '중립'
};

const ERROR_MESSAGES = {
  EMPTY_TEXT: {
    title: '문장을 입력해 주세요',
    message: '분석할 문장을 입력해 주세요.'
  },
  TEXT_TOO_LONG: {
    title: '문장이 너무 길어요',
    message: '1,000자 이하로 줄여서 다시 시도해 주세요.'
  },
  INVALID_REQUEST: {
    title: '요청을 처리할 수 없어요',
    message: '요청 형식이 올바르지 않아요. 페이지를 새로고침한 뒤 다시 시도해 주세요.'
  },
  METHOD_NOT_ALLOWED: {
    title: '요청을 처리할 수 없어요',
    message: '허용되지 않은 방식의 요청이에요. 페이지를 새로고침한 뒤 다시 시도해 주세요.'
  },
  SERVER_CONFIG_ERROR: {
    title: '서비스 설정에 문제가 있어요',
    message: '서버에 AI 연결 설정이 되어 있지 않아요. 관리자에게 문의해 주세요.'
  },
  AI_RATE_LIMITED: {
    title: '요청이 많아 잠시 쉬고 있어요',
    message: '사용량이 많거나 한도를 넘었어요. 잠시 후 다시 시도해 주세요.'
  },
  AI_TIMEOUT: {
    title: '응답이 너무 늦어요',
    message: 'AI 응답 시간이 초과됐어요. 잠시 후 다시 시도해 주세요.'
  },
  AI_REFUSED: {
    title: '이 문장은 분석할 수 없어요',
    message: 'AI가 이 문장의 분석을 거절했어요. 다른 문장으로 시도해 주세요.'
  },
  AI_BAD_RESPONSE: {
    title: '결과를 읽지 못했어요',
    message: 'AI 응답을 해석하지 못했어요. 다시 시도해 주세요.'
  },
  AI_UPSTREAM_ERROR: {
    title: 'AI 서비스에 연결하지 못했어요',
    message: 'AI 서비스에 일시적인 문제가 있어요. 잠시 후 다시 시도해 주세요.'
  },
  INTERNAL_ERROR: {
    title: '알 수 없는 문제가 생겼어요',
    message: '서버에서 예상하지 못한 오류가 발생했어요. 잠시 후 다시 시도해 주세요.'
  },
  NETWORK_ERROR: {
    title: '인터넷 연결을 확인해 주세요',
    message: '서버에 연결할 수 없어요. 네트워크 상태를 확인한 뒤 다시 시도해 주세요.'
  },
  UNKNOWN_ERROR: {
    title: '알 수 없는 문제가 생겼어요',
    message: '예상하지 못한 응답을 받았어요. 잠시 후 다시 시도해 주세요.'
  }
};

// ── 2. DOM 요소 참조 ──
const els = {
  analyzer: document.getElementById('analyzer'),
  inputText: document.getElementById('input-text'),
  charCount: document.getElementById('char-count'),
  analyzeBtn: document.getElementById('analyze-btn'),
  clearBtn: document.getElementById('clear-btn'),
  startBtn: document.getElementById('start-btn'),
  shortcutHint: document.getElementById('shortcut-hint'),
  resultEmpty: document.getElementById('result-empty'),
  resultLoading: document.getElementById('result-loading'),
  resultSuccess: document.getElementById('result-success'),
  resultError: document.getElementById('result-error'),
  sentimentBadge: document.getElementById('sentiment-badge'),
  sentimentLabel: document.getElementById('sentiment-label'),
  confidenceValue: document.getElementById('confidence-value'),
  confidenceLabel: document.getElementById('confidence-label'),
  confidenceBar: document.getElementById('confidence-bar'),
  confidenceFill: document.getElementById('confidence-fill'),
  reasonText: document.getElementById('reason-text'),
  errorTitle: document.getElementById('error-title'),
  errorMessage: document.getElementById('error-message'),
  errorCode: document.getElementById('error-code'),
  spinner: document.querySelector('#analyze-btn .spinner'),
  btnText: document.querySelector('#analyze-btn .btn-text'),
  exampleChips: document.querySelectorAll('.chip[data-example]'),
  heroLink: document.querySelector('.hero-link')
};

// ── 3. 상태 관리 ──
let currentAbortController = null;
let isUserAborted = false;

const state = {
  status: 'idle', // 'idle' | 'loading' | 'success' | 'error'
  result: null,   // 성공 시 { sentiment, confidence, reason }
  error: null     // 실패 시 { code, title, message }
};

function setState(patch) {
  Object.assign(state, patch);
  render();
}

// ── 4. 검증 및 도우미 함수 ──
function validateInput(raw) {
  const text = raw.trim();
  if (text.length === 0) return 'EMPTY_TEXT';
  if (raw.length > MAX_LENGTH) return 'TEXT_TOO_LONG';
  return null;
}

function isValidResult(data) {
  return data
    && ['positive', 'negative', 'neutral'].includes(data.sentiment)
    && Number.isInteger(data.confidence)
    && data.confidence >= 0 && data.confidence <= 100
    && typeof data.reason === 'string'
    && data.reason.length > 0;
}

function getConfidenceLabel(confidence) {
  if (confidence >= 80) return '확신이 높아요';
  if (confidence >= 50) return '어느 정도 확신해요';
  return '판단이 애매해요';
}

function toErrorState(code) {
  const info = ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR;
  const resolvedCode = ERROR_MESSAGES[code] ? code : 'UNKNOWN_ERROR';
  return {
    code: resolvedCode,
    title: info.title,
    message: info.message
  };
}

// ── 5. 렌더링 함수 ──
function updateCharCount() {
  const len = els.inputText.value.length;
  els.charCount.textContent = `${len.toLocaleString('ko-KR')} / 1,000`;
  if (len >= MAX_LENGTH) {
    els.charCount.classList.add('is-limit');
  } else {
    els.charCount.classList.remove('is-limit');
  }
}

function updateAnalyzeButton() {
  const hasText = els.inputText.value.trim().length > 0;
  if (state.status === 'loading') {
    els.analyzeBtn.disabled = true;
    els.analyzeBtn.setAttribute('aria-busy', 'true');
    if (els.spinner) els.spinner.hidden = false;
    if (els.btnText) els.btnText.textContent = '분석 중…';
  } else {
    els.analyzeBtn.disabled = !hasText;
    els.analyzeBtn.removeAttribute('aria-busy');
    if (els.spinner) els.spinner.hidden = true;
    if (els.btnText) els.btnText.textContent = '분석하기';
  }
}

function renderSuccess() {
  const res = state.result;
  if (!res) return;

  const sentiment = res.sentiment;
  els.sentimentLabel.textContent = SENTIMENT_TEXT[sentiment] || sentiment;

  // 배지 클래스 업데이트
  els.sentimentBadge.className = 'badge';
  els.sentimentBadge.classList.add(`badge--${sentiment}`);

  // 신뢰도 정보
  els.confidenceValue.textContent = `${res.confidence}%`;
  els.confidenceLabel.textContent = getConfidenceLabel(res.confidence);

  // 막대 트랙 및 채움
  els.confidenceBar.setAttribute('aria-valuenow', String(res.confidence));
  els.confidenceFill.style.width = `${res.confidence}%`;
  els.confidenceFill.className = 'confidence-fill';
  els.confidenceFill.classList.add(`fill--${sentiment}`);

  // 분석 이유
  els.reasonText.textContent = res.reason;

  // 모바일 화면일 때 결과 패널로 자동 스크롤
  if (window.innerWidth < 1024) {
    els.resultSuccess.scrollIntoView({ block: 'nearest' });
  }
}

function renderError() {
  const err = state.error;
  if (!err) return;

  els.errorTitle.textContent = err.title;
  els.errorMessage.textContent = err.message;
  els.errorCode.textContent = `오류 코드: ${err.code}`;

  if (err.code === 'EMPTY_TEXT' || err.code === 'TEXT_TOO_LONG') {
    els.inputText.focus();
  }
}

function render() {
  // 결과 패널 영역 상태별 노출 제어
  els.resultEmpty.hidden = (state.status !== 'idle');
  els.resultLoading.hidden = (state.status !== 'loading');
  els.resultSuccess.hidden = (state.status !== 'success');
  els.resultError.hidden = (state.status !== 'error');

  if (state.status === 'success') {
    renderSuccess();
  } else if (state.status === 'error') {
    renderError();
  }

  updateAnalyzeButton();
}

// ── 6. 서버 통신 로직 ──
async function requestAnalysis() {
  if (state.status === 'loading') return;

  const raw = els.inputText.value;
  const validationError = validateInput(raw);
  if (validationError) {
    setState({
      status: 'error',
      error: toErrorState(validationError),
      result: null
    });
    return;
  }

  const text = raw.trim();
  isUserAborted = false;
  currentAbortController = new AbortController();
  const timeoutId = setTimeout(() => {
    currentAbortController.abort();
  }, CLIENT_TIMEOUT_MS);

  setState({ status: 'loading', error: null });

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: currentAbortController.signal
    });

    clearTimeout(timeoutId);

    let body;
    try {
      body = await response.json();
    } catch {
      setState({
        status: 'error',
        error: toErrorState('UNKNOWN_ERROR'),
        result: null
      });
      return;
    }

    if (body?.ok === true && isValidResult(body.data)) {
      setState({
        status: 'success',
        result: body.data,
        error: null
      });
    } else if (body?.ok === true) {
      setState({
        status: 'error',
        error: toErrorState('AI_BAD_RESPONSE'),
        result: null
      });
    } else {
      const code = body?.error?.code;
      setState({
        status: 'error',
        error: toErrorState(code || 'UNKNOWN_ERROR'),
        result: null
      });
    }
  } catch (error) {
    clearTimeout(timeoutId);

    if (isUserAborted) {
      // 사용자가 지우기 등으로 취소한 경우 오류로 표시하지 않음
      return;
    }

    if (error?.name === 'AbortError') {
      setState({
        status: 'error',
        error: toErrorState('AI_TIMEOUT'),
        result: null
      });
    } else {
      setState({
        status: 'error',
        error: toErrorState('NETWORK_ERROR'),
        result: null
      });
    }
  } finally {
    currentAbortController = null;
  }
}

// ── 7. 이벤트 바인딩 ──
function bindEvents() {
  // 글자 수 계산 및 버튼 활성화 상태 갱신
  els.inputText.addEventListener('input', () => {
    updateCharCount();
    updateAnalyzeButton();
  });

  // 단축키 (Ctrl+Enter / Cmd+Enter)
  els.inputText.addEventListener('keydown', (event) => {
    if (event.isComposing) return;
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      requestAnalysis();
    }
  });

  // 분석하기 버튼 클릭
  els.analyzeBtn.addEventListener('click', () => {
    requestAnalysis();
  });

  // 지우기 버튼 클릭
  els.clearBtn.addEventListener('click', () => {
    if (currentAbortController) {
      isUserAborted = true;
      currentAbortController.abort();
    }
    els.inputText.value = '';
    updateCharCount();
    setState({
      status: 'idle',
      result: null,
      error: null
    });
    els.inputText.focus();
  });

  // 예시 칩 버튼 클릭
  els.exampleChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const key = chip.dataset.example;
      if (EXAMPLES[key]) {
        els.inputText.value = EXAMPLES[key];
        updateCharCount();
        updateAnalyzeButton();
        els.inputText.focus();
      }
    });
  });

  // 헤더 분석 시작 버튼
  if (els.startBtn) {
    els.startBtn.addEventListener('click', () => {
      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      els.analyzer.scrollIntoView({
        behavior: isReduced ? 'auto' : 'smooth',
        block: 'start'
      });
      els.inputText.focus();
    });
  }

  // 히어로 예시 링크 부드러운 스크롤
  if (els.heroLink) {
    els.heroLink.addEventListener('click', (event) => {
      event.preventDefault();
      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      els.analyzer.scrollIntoView({
        behavior: isReduced ? 'auto' : 'smooth',
        block: 'start'
      });
    });
  }
}

// ── 8. 초기화 ──
function init() {
  const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent || navigator.platform);
  if (els.shortcutHint) {
    els.shortcutHint.textContent = '';
    const kbd = document.createElement('kbd');
    kbd.textContent = isMac ? '⌘' : 'Ctrl';
    const kbdEnter = document.createElement('kbd');
    kbdEnter.textContent = 'Enter';
    els.shortcutHint.appendChild(kbd);
    els.shortcutHint.appendChild(document.createTextNode(' + '));
    els.shortcutHint.appendChild(kbdEnter);
    els.shortcutHint.appendChild(document.createTextNode('로 분석'));
  }

  bindEvents();
  render();
}

init();
