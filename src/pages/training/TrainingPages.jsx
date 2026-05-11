/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { documentTrainingApi, safetyTrainingApi, socialTrainingApi, trainingProgressApi } from '../../api';
import { resolveApiAssetUrl } from '../../api/client';
import characterImg from '../../assets/Character_JIWOO.png';
import backArrowImg from '../../assets/back_arrow.png';
import documentThumbnail from '../../assets/card/document_thumnail.png';
import safetyThumbnail from '../../assets/card/safety_thumnail.png';
import socialThumbnail from '../../assets/card/social_thumnail.png';
import Sidebar from '../../components/layout/Sidebar';
import './TrainingPages.css';

const socialJobs = [
  { jobType: 'OFFICE', label: '사무직', description: '회사에서 동료와 대화하는 연습' },
  { jobType: 'LABOR', label: '단순노무직', description: '작업장에서 협력하고 보고하는 연습' },
];

const getSocialJobLabel = (jobType) => socialJobs.find((job) => job.jobType === jobType)?.label || '사회성';

const socialScoreTypeLabels = {
  AI_EVALUATION: 'AI 평가',
};

const getSocialScoreTypeLabel = (scoreType) => socialScoreTypeLabels[scoreType] || 'AI 평가';

const normalizeSocialSpeaker = (speaker) => (speaker === 'PARTNER' ? 'AI' : speaker || 'AI');

const getSocialDialogueContent = (dialogue) => dialogue.content || dialogue.message || dialogue.text || '';

const toDialogLogs = (dialogues) =>
  dialogues.map((dialogue, index) => ({
    turnNo: index + 1,
    speaker: normalizeSocialSpeaker(dialogue.speaker),
    speakerName: dialogue.speakerName,
    content: getSocialDialogueContent(dialogue),
  }));

const hasUserDialogLog = (dialogLogs) =>
  dialogLogs.some((dialogue) => dialogue.speaker === 'USER' && dialogue.content.trim());

const getSocialOpeningScript = (voiceSession) =>
  voiceSession?.opening?.script || voiceSession?.openingScript || '';

const extractSocialCounterpartRequest = (text) => {
  if (!text) {
    return '';
  }

  const value = String(text).trim();
  const quotedMatches = [...value.matchAll(/["“”'‘’]([^"“”'‘’]+)["“”'‘’]/g)]
    .map((match) => match[1]?.trim())
    .filter(Boolean);

  if (quotedMatches.length > 0) {
    return quotedMatches[quotedMatches.length - 1];
  }

  return value;
};

const getSocialScenarioOpeningMessage = (scenario, voiceSession) =>
  extractSocialCounterpartRequest(getSocialOpeningScript(voiceSession)) ||
  extractSocialCounterpartRequest(scenario?.situationText) ||
  scenario?.backgroundText ||
  scenario?.title ||
  '상황을 확인하고 필요한 말을 연습합니다.';

const createFallbackSocialDialogues = (scenario, voiceSession) => {
  const openingScript = getSocialScenarioOpeningMessage(scenario, voiceSession);

  return [
    {
      speaker: 'AI',
      speakerName: scenario?.npcName || '상대',
      message: openingScript,
    },
    {
      speaker: 'USER',
      speakerName: scenario?.learnerName || '나',
      message: scenario?.recommendedAnswer || '상황을 확인했습니다. 필요한 내용을 차분히 말씀드리겠습니다.',
    },
  ];
};

const normalizeSocialScenario = (scenario, voiceSession) => ({
  ...scenario,
  description: scenario?.description || scenario?.backgroundText || scenario?.characterInfo,
  dialogues:
    Array.isArray(scenario?.dialogues) && scenario.dialogues.length > 0
      ? scenario.dialogues
      : createFallbackSocialDialogues(scenario, voiceSession),
});

const SOCIAL_VOICE_SAMPLE_RATE = 24000;
const SOCIAL_VOICE_RECORD_BUFFER_SIZE = 2048;

const encodeBase64 = (bytes) => {
  let binary = '';
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return window.btoa(binary);
};

const float32ToPcm16 = (samples, inputSampleRate, outputSampleRate = SOCIAL_VOICE_SAMPLE_RATE) => {
  if (!samples || samples.length === 0) {
    return new Int16Array(0);
  }

  const sampleRateRatio = inputSampleRate / outputSampleRate;

  if (!Number.isFinite(sampleRateRatio) || sampleRateRatio <= 1) {
    const pcm = new Int16Array(samples.length);
    for (let index = 0; index < samples.length; index += 1) {
      const clipped = Math.max(-1, Math.min(1, samples[index]));
      pcm[index] = clipped < 0 ? clipped * 0x8000 : clipped * 0x7fff;
    }
    return pcm;
  }

  const frameCount = Math.round(samples.length / sampleRateRatio);
  const pcm = new Int16Array(frameCount);

  for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
    const nextFrameOffset = Math.round((frameIndex + 1) * sampleRateRatio);
    let inputIndex = Math.round(frameIndex * sampleRateRatio);
    let sum = 0;
    let count = 0;

    while (inputIndex < nextFrameOffset && inputIndex < samples.length) {
      sum += samples[inputIndex];
      count += 1;
      inputIndex += 1;
    }

    const averaged = count > 0 ? sum / count : 0;
    const clipped = Math.max(-1, Math.min(1, averaged));
    pcm[frameIndex] = clipped < 0 ? clipped * 0x8000 : clipped * 0x7fff;
  }

  return pcm;
};

const float32ToPcm16Base64 = (samples, inputSampleRate) => {
  const pcm16 = float32ToPcm16(samples, inputSampleRate);
  if (!pcm16.length) {
    return '';
  }

  return encodeBase64(new Uint8Array(pcm16.buffer, pcm16.byteOffset, pcm16.byteLength));
};

const base64ToPcm16 = (base64) => {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Int16Array(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
};

const pcm16ToFloat32 = (pcm16) => {
  const samples = new Float32Array(pcm16.length);

  for (let index = 0; index < pcm16.length; index += 1) {
    samples[index] = Math.max(-1, pcm16[index] / 0x8000);
  }

  return samples;
};

function SocialAiCharacter({ speaking }) {
  return (
    <>
      <img src={characterImg} alt="AI 사수 캐릭터" />
      <svg
        className={`social-character-mouth-svg ${speaking ? 'is-speaking' : ''}`}
        viewBox="0 0 100 80"
        aria-hidden="true"
      >
        <ellipse className="social-character-mouth-cover" cx="50" cy="35" rx="32" ry="23" />
        <ellipse className="social-character-mouth-open" cx="50" cy="40" rx="22" ry="15" />
      </svg>
    </>
  );
}

const getDocumentAnswerValue = (answers, question) => (question ? answers[question.questionId] : undefined);

const isDocumentShortAnswer = (question) =>
  question?.questionType === 'SHORT_ANSWER' || !Array.isArray(question?.choices) || question.choices.length === 0;

const isDocumentQuestionAnswered = (answers, question) => {
  const value = getDocumentAnswerValue(answers, question);

  if (isDocumentShortAnswer(question)) {
    return typeof value === 'string' && value.trim().length > 0;
  }

  return Boolean(value);
};

const toDocumentAnswerRequest = (question, answerValue) => {
  if (isDocumentShortAnswer(question)) {
    return {
      questionId: question.questionId,
      userAnswer: String(answerValue || '').trim(),
      choiceId: null,
    };
  }

  return {
    questionId: question.questionId,
    userAnswer: null,
    choiceId: answerValue,
  };
};

const hasDocumentAnswerDetails = (result) => {
  const items = result?.answers || result?.results || [];
  return items.some((item) => item.questionText || item.userAnswer);
};

const getLearningScenarioIndex = (scenarios) => {
  const explicitIndex = scenarios.findIndex(
    (scenario) =>
      scenario.recommended ||
      scenario.isRecommended ||
      scenario.current ||
      scenario.isCurrent ||
      scenario.next ||
      scenario.isNext ||
      ['RECOMMENDED', 'CURRENT', 'IN_PROGRESS', 'NEXT'].includes(scenario.status) ||
      ['RECOMMENDED', 'CURRENT', 'IN_PROGRESS', 'NEXT'].includes(scenario.trainingStatus),
  );

  if (explicitIndex >= 0) {
    return explicitIndex;
  }

  const incompleteIndex = scenarios.findIndex((scenario) => scenario.unlocked !== false && scenario.completed === false);
  return incompleteIndex >= 0 ? incompleteIndex : 0;
};

const safetyCategories = [
  { category: 'SEXUAL_EDUCATION', label: '소중한 나\n지키기', description: '일상에서 나를 보호하는 훈련' },
  { category: 'INFECTIOUS_DISEASE', label: '뽀득뽀득 건강\n지키기', description: '직장과 생활에서 경계를 지키는 훈련' },
  { category: 'COMMUTE_SAFETY', label: '안전하게\n씩씩하게\n걷기', description: '길을 건너고 이동할 때 필요한 안전 훈련' },
];

const safetyTypeLabels = {
  SEXUAL_EDUCATION: '나를 지키기',
  INFECTIOUS_DISEASE: '건강 지키기',
  COMMUTE_SAFETY: '이동 안전',
};

const getSafetyTypeLabel = (category) => safetyTypeLabels[category] || '안전 대처';

const documentLevelSubtitles = {
  1: '짧은 안내문에서 장소와 시간을 찾아요.',
  2: '업무 지시에서 해야 할 일을 골라요.',
  3: '공지사항에서 날짜와 준비물을 확인해요.',
  4: '금지사항과 주의사항을 구분해요.',
  5: '여러 문장을 읽고 일의 순서를 정리해요.',
};

const documentThemeLabels = {
  ANNOUNCEMENT: '공지사항',
  MANUAL: '매뉴얼',
  MESSENGER: '메신저',
};

const trainingTypes = [
  {
    type: 'SOCIAL',
    label: '사회성 훈련',
    path: '/training-history/social',
    visual: 'social',
    tone: 'mint',
    thumbnail: socialThumbnail,
  },
  {
    type: 'SAFETY',
    label: '안전 대처 훈련',
    path: '/training-history/safety',
    visual: 'safety',
    tone: 'yellow',
    thumbnail: safetyThumbnail,
  },
  {
    type: 'DOCUMENT',
    label: '문서 이해 훈련',
    path: '/training-history/document',
    visual: 'document',
    tone: 'pink',
    thumbnail: documentThumbnail,
  },
];

const historyTypeMap = {
  social: 'SOCIAL',
  safety: 'SAFETY',
  document: 'DOCUMENT',
};

const historyTypeSummary = {
  SOCIAL: {
    badge: '대화 복습',
    actionLabel: '대화 기록 자세히 보기',
    emptyFeedback: '상황에 맞는 말하기 흐름을 다시 확인해 보세요.',
  },
  SAFETY: {
    badge: '상황 복습',
    actionLabel: '대처 기록 자세히 보기',
    emptyFeedback: '어떤 선택이 안전했는지 다시 확인해 보세요.',
  },
  DOCUMENT: {
    badge: '문서 복습',
    actionLabel: '문서 풀이 자세히 보기',
    emptyFeedback: '정답 근거와 읽기 흐름을 다시 확인해 보세요.',
  },
};

const getErrorMessage = (error, fallback) => error?.message || fallback;

const looksCorruptedKoreanText = (value) =>
  typeof value === 'string' &&
  (/�|Ã|ë|ì|í|ê|Â|臾|議|쒖|댄|덈|꾨|낅|뒿|瑜|怨|쇰|좎|꽌|젴|멋관/.test(value) ||
    (value.match(/\?/g) || []).length >= 2);

const readableText = (value, fallback) => {
  const text =
    value && typeof value === 'object'
      ? value.summary || value.detailText || value.message || value.text
      : value;

  if (!text || looksCorruptedKoreanText(text)) {
    return fallback;
  }

  return text;
};

function TrainingShell({ activeKey = 'main', fullScreen = false, children }) {
  return (
    <>
      {!fullScreen ? <Sidebar activeKey={activeKey} /> : null}
      <main className={`training-content ${fullScreen ? 'training-content-full' : ''}`}>{children}</main>
    </>
  );
}

function PageHeader({ title, subtitle, onBack, compact = false, className = '' }) {
  return (
    <header className={`training-header ${compact ? 'training-header-compact' : ''} ${className}`.trim()}>
      {onBack ? (
        <button className="training-back-button" type="button" onClick={onBack} aria-label="훈련 목록">
          <img src={backArrowImg} alt="" />
        </button>
      ) : null}
      {title || subtitle ? (
        <div>
          {title ? <h1>{title}</h1> : null}
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      ) : null}
    </header>
  );
}

function LoadingBlock() {
  return (
    <div className="training-status training-status-loading" role="status">
      <span className="training-loading-dot" aria-hidden="true" />
      <span>불러오는 중입니다.</span>
    </div>
  );
}

function SafetySessionLoadingBlock() {
  return (
    <section className="safety-session-loading" role="status" aria-live="polite">
      <div className="safety-session-loading-card">
        <span className="safety-session-loading-badge">안전 대처 훈련</span>
        <h1>안전 상황을 준비하고 있어요</h1>
        <p>그림과 선택지를 곧 보여드릴게요.</p>
        <div className="safety-session-loading-steps" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </section>
  );
}

function ErrorBlock({ message, onRetry }) {
  return (
    <div className="training-status training-status-error">
      <span>{message}</span>
      {onRetry ? (
        <button type="button" onClick={onRetry}>
          다시 시도
        </button>
      ) : null}
    </div>
  );
}

function EmptyBlock({ message }) {
  return <div className="training-status">{message}</div>;
}

function TrainingHelpButton({ onClick }) {
  return (
    <button className="social-help-button" type="button" onClick={onClick} aria-label="도움말">
      <span aria-hidden="true">?</span>
      <strong>도움말</strong>
    </button>
  );
}

function TrainingHelpDialog({ open, onClose, title = '훈련 방법', images = [] }) {
  if (!open) {
    return null;
  }

  return (
    <div className="training-help-overlay" role="presentation" onClick={onClose}>
      <section
        className="training-help-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="training-help-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="training-help-dialog-header">
          <h2 id="training-help-title">{title}</h2>
          <button type="button" onClick={onClose} aria-label="도움말 닫기">
            닫기
          </button>
        </header>
        <div className="training-help-dialog-body">
          {images.map((image) => (
            <img className="training-help-image" src={image.src} alt={image.alt} key={image.src} />
          ))}
        </div>
      </section>
    </div>
  );
}

export function TrainingSelectPage() {
  const navigate = useNavigate();

  const cards = [
    {
      title: '사회성 훈련',
      description: '직장 동료와 말하고 부탁하는 연습',
      actionLabel: '훈련 시작',
      tone: 'mint',
      path: '/training/social/job',
      visual: 'social',
      thumbnail: socialThumbnail,
    },
    {
      title: '안전 대처 훈련',
      description: '안전 위협 상황에서 대처하는 연습',
      actionLabel: '훈련 시작',
      tone: 'yellow',
      path: '/training/safety/scenarios',
      visual: 'safety',
      thumbnail: safetyThumbnail,
    },
    {
      title: '문서 이해 훈련',
      description: '문서를 읽고 핵심 내용을 찾는 연습',
      actionLabel: '훈련 시작',
      tone: 'pink',
      path: '/training/document',
      visual: 'document',
      thumbnail: documentThumbnail,
    },
  ];

  return (
    <TrainingShell>
      <section className="menu-page-shell">
        <header className="menu-page-header">
          <span>훈련 선택</span>
          <h1>오늘 연습할 훈련을 골라 주세요</h1>
          <p>하나를 선택하면 상황을 보고 천천히 따라 하며 연습할 수 있습니다.</p>
        </header>
        <div className="training-select-grid is-training" aria-label="훈련 목록">
          {cards.map((card) => (
            <button
              className={`training-select-card training-card-${card.tone}`}
              type="button"
              key={card.title}
            onClick={() => {
              navigate(card.path);
            }}
          >
            <span>{card.title}</span>
            {card.description ? <small>{card.description}</small> : null}
            <div className={`training-card-illustration training-card-illustration-${card.visual}`} aria-hidden="true">
              <img src={card.thumbnail} alt="" />
            </div>
            <strong className="training-card-action">{card.actionLabel}</strong>
          </button>
        ))}
        </div>
      </section>
    </TrainingShell>
  );
}

export function SocialJobPage() {
  const navigate = useNavigate();
  const [submittingJob, setSubmittingJob] = useState('');
  const [error, setError] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const selectJob = async (jobType) => {
    setSubmittingJob(jobType);
    setError('');

    try {
      await socialTrainingApi.selectSocialJobType({ jobType });
      navigate('/training/social/scenarios', { state: { jobType } });
    } catch (requestError) {
      setError(getErrorMessage(requestError, '직무를 선택하지 못했습니다.'));
    } finally {
      setSubmittingJob('');
    }
  };

  return (
    <TrainingShell fullScreen>
      <section className="social-screen social-job-screen">
        <PageHeader compact className="social-module-back" onBack={() => navigate('/main')} />
        <TrainingHelpButton onClick={() => setIsHelpOpen(true)} />
        <div className="social-job-shell">
          <header className="social-job-intro">
            <span>사회성 훈련</span>
            <h1>어떤 직무 상황을 먼저 연습할까요</h1>
            <p>내가 자주 마주치는 업무 환경을 고르면 필요한 대화를 차분하게 연습할 수 있어요.</p>
          </header>
          {error ? <ErrorBlock message={error} /> : null}
          <div className="option-grid social-job-grid" aria-label="사회성 훈련 직무 선택">
            {socialJobs.map((job) => (
              <button
                className="option-card social-job-card"
                type="button"
                key={job.jobType}
                onClick={() => selectJob(job.jobType)}
                disabled={Boolean(submittingJob)}
              >
                <div className="social-job-card-copy">
                  <strong>{job.label}</strong>
                  <span>{job.description}</span>
                </div>
                <em>선택하기</em>
              </button>
            ))}
          </div>
        </div>
        <TrainingHelpDialog
          open={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
          title="사회성 훈련 방법"
          images={[
            { src: '/mock/help/social-training-help.png', alt: '사회성 대화 연습 화면 도움말' },
            { src: '/mock/help/social-result-help.png', alt: '사회성 훈련 결과 화면 도움말' },
          ]}
        />
      </section>
    </TrainingShell>
  );
}

export function SocialScenarioPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const jobType = location.state?.jobType || 'OFFICE';
  const scenarioListRef = useRef(null);
  const scenarioItemRefs = useRef({});
  const [scenarios, setScenarios] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const learningScenarioIndex = scenarios.length > 0 ? getLearningScenarioIndex(scenarios) : -1;

  const loadScenarios = async () => {
    setStatus('loading');
    setError('');

    try {
      const data = await socialTrainingApi.getSocialScenarios(jobType);
      setScenarios(Array.isArray(data) ? data : []);
      setStatus('ready');
    } catch (requestError) {
      setError(getErrorMessage(requestError, '시나리오를 불러오지 못했습니다.'));
      setStatus('error');
    }
  };

  useEffect(() => {
    loadScenarios();
  }, [jobType]);

  useEffect(() => {
    if (status !== 'ready' || learningScenarioIndex < 0) {
      return;
    }

    const list = scenarioListRef.current;
    const targetScenario = scenarios[learningScenarioIndex];
    const target = scenarioItemRefs.current[targetScenario?.scenarioId];

    if (!list || !target) {
      return;
    }

    requestAnimationFrame(() => {
      list.scrollTo({
        top: Math.max(target.offsetTop - list.offsetTop, 0),
        behavior: 'smooth',
      });
    });
  }, [status, learningScenarioIndex, scenarios]);

  return (
    <TrainingShell fullScreen>
      <section className="social-screen social-scenario-screen">
        <PageHeader compact className="social-module-back" onBack={() => navigate('/training/social/job')} />
        <div className="social-scenario-shell">
          <header className="social-scenario-intro">
            <span>{getSocialJobLabel(jobType)} 생활</span>
            <h1>어떤 상황을 연습할까요</h1>
            <p>지금 나에게 필요하거나 걱정되는 상황을 하나 골라보세요.</p>
          </header>
          <div className="scenario-list social-scenario-list" ref={scenarioListRef} aria-busy={status === 'loading'}>
            {status === 'loading' ? <LoadingBlock /> : null}
            {status === 'error' ? <ErrorBlock message={error} onRetry={loadScenarios} /> : null}
            {status === 'ready' && scenarios.length === 0 ? <EmptyBlock message="선택할 수 있는 시나리오가 없습니다." /> : null}
            {status === 'ready' && scenarios.length > 0
              ? scenarios.map((scenario, index) => (
                <button
                  className={`scenario-card social-scenario-card ${index === learningScenarioIndex ? 'is-learning-target' : ''}`}
                  type="button"
                  key={scenario.scenarioId}
                  ref={(element) => {
                    if (element) {
                      scenarioItemRefs.current[scenario.scenarioId] = element;
                    } else {
                      delete scenarioItemRefs.current[scenario.scenarioId];
                    }
                  }}
                  onClick={() =>
                    navigate('/training/social/session', {
                      state: { jobType, scenarioId: scenario.scenarioId },
                    })
                  }
                >
                  <span className="social-scenario-badge">상황 {index + 1}</span>
                  <strong>{scenario.title}</strong>
                  <p>{scenario.description || '상황에 맞는 말을 차분히 연습해요.'}</p>
                  <em>시작하기</em>
                </button>
              ))
              : null}
          </div>
        </div>
      </section>
    </TrainingShell>
  );
}

export function SocialSessionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const jobType = location.state?.jobType || 'OFFICE';
  const scenarioId = location.state?.scenarioId;
  const [scenario, setScenario] = useState(null);
  const [session, setSession] = useState(null);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState('loading');
  const [voicePhase, setVoicePhaseState] = useState('idle');
  const [error, setError] = useState('');
  const [voiceStatusText, setVoiceStatusText] = useState('');
  const [chatDialogues, setChatDialogues] = useState([]);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const chatThreadRef = useRef(null);
  const voiceSocketRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const processorNodeRef = useRef(null);
  const gainNodeRef = useRef(null);
  const playbackChainRef = useRef(Promise.resolve());
  const advanceAfterTurnRef = useRef(false);
  const isRecordingRef = useRef(false);
  const isMountedRef = useRef(false);
  const isCleaningUpRef = useRef(false);
  const pendingAutoStartRef = useRef(false);
  const voiceConnectPromiseRef = useRef(null);
  const voiceConnectResolveRef = useRef(null);
  const voiceConnectRejectRef = useRef(null);
  const voicePhaseRef = useRef('idle');
  const currentUserMessageIdRef = useRef(null);
  const currentAiMessageIdRef = useRef(null);
  const currentAiFinalHandledRef = useRef(false);
  const messageCounterRef = useRef(0);
  const openingAudioRef = useRef(null);
  const openingAudioObjectUrlRef = useRef('');
  const aiSpeakingStopTimerRef = useRef(null);
  const aiAudioPlayedThisTurnRef = useRef(false);

  const startAiSpeaking = () => {
    if (aiSpeakingStopTimerRef.current) {
      window.clearTimeout(aiSpeakingStopTimerRef.current);
      aiSpeakingStopTimerRef.current = null;
    }
    setIsAiSpeaking(true);
  };

  const stopAiSpeakingSoon = (delayMs = 180) => {
    if (aiSpeakingStopTimerRef.current) {
      window.clearTimeout(aiSpeakingStopTimerRef.current);
    }
    aiSpeakingStopTimerRef.current = window.setTimeout(() => {
      setIsAiSpeaking(false);
      aiSpeakingStopTimerRef.current = null;
    }, delayMs);
  };

  const visibleDialogues = useMemo(
    () => (chatDialogues.length > 0 ? chatDialogues : scenario?.dialogues?.slice(0, step + 1) || []),
    [chatDialogues, scenario, step],
  );
  const isLiveVoiceChat = chatDialogues.length > 0;
  const isLastStep = !isLiveVoiceChat && scenario?.dialogues ? step >= scenario.dialogues.length - 1 : false;
  const shouldAnimateAiCharacter = isAiSpeaking || voicePhase === 'processing';

  const setVoicePhase = (nextPhase) => {
    voicePhaseRef.current = nextPhase;
    setVoicePhaseState(nextPhase);
  };

  const playOpeningRequest = async (audioUrl) => {
    if (!audioUrl || typeof window === 'undefined') {
      return;
    }

    try {
      if (openingAudioRef.current) {
        openingAudioRef.current.pause();
      }
      if (openingAudioObjectUrlRef.current) {
        URL.revokeObjectURL(openingAudioObjectUrlRef.current);
        openingAudioObjectUrlRef.current = '';
      }

      const audioBlob = await socialTrainingApi.getSocialOpeningAudioBlob(audioUrl);
      const objectUrl = URL.createObjectURL(audioBlob);
      openingAudioObjectUrlRef.current = objectUrl;
      const audio = new Audio(objectUrl);
      openingAudioRef.current = audio;
      await audio.play();
    } catch {
      // Browser autoplay policies may block page-entry audio. The visible request text remains available.
    }
  };

  const nextMessageId = (prefix) => {
    messageCounterRef.current += 1;
    return `${prefix}-${messageCounterRef.current}`;
  };

  const upsertChatDialogue = (dialogueId, patch, { beforeId } = {}) => {
    setChatDialogues((currentDialogues) => {
      const index = currentDialogues.findIndex((dialogue) => dialogue.id === dialogueId);
      if (index < 0) {
        const nextDialogue = { id: dialogueId, ...patch };
        const beforeIndex = beforeId
          ? currentDialogues.findIndex((dialogue) => dialogue.id === beforeId)
          : -1;

        if (beforeIndex < 0) {
          return [...currentDialogues, nextDialogue];
        }

        return [
          ...currentDialogues.slice(0, beforeIndex),
          nextDialogue,
          ...currentDialogues.slice(beforeIndex),
        ];
      }

      return currentDialogues.map((dialogue, currentIndex) =>
        currentIndex === index ? { ...dialogue, ...patch } : dialogue,
      );
    });
  };

  const appendChatDialogueText = (dialogueId, patch, text) => {
    if (!text) {
      return;
    }

    setChatDialogues((currentDialogues) => {
      const index = currentDialogues.findIndex((dialogue) => dialogue.id === dialogueId);
      if (index < 0) {
        return [...currentDialogues, { id: dialogueId, ...patch, message: text }];
      }

      return currentDialogues.map((dialogue, currentIndex) =>
        currentIndex === index
          ? {
              ...dialogue,
              ...patch,
              message: `${getSocialDialogueContent(dialogue)}${text}`,
            }
          : dialogue,
      );
    });
  };

  const cleanupRecording = () => {
    isRecordingRef.current = false;

    if (processorNodeRef.current) {
      processorNodeRef.current.onaudioprocess = null;
      processorNodeRef.current.disconnect();
      processorNodeRef.current = null;
    }

    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }

    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const cleanupVoiceSession = () => {
    cleanupRecording();

    if (voiceSocketRef.current) {
      const socket = voiceSocketRef.current;
      voiceSocketRef.current = null;
      try {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;
        socket.close(1000, 'session cleanup');
      } catch {
        // Ignore cleanup errors.
      }
    }

    pendingAutoStartRef.current = false;
    voiceConnectPromiseRef.current = null;
    voiceConnectResolveRef.current = null;
    voiceConnectRejectRef.current = null;
    currentUserMessageIdRef.current = null;
    currentAiMessageIdRef.current = null;
    currentAiFinalHandledRef.current = false;
    aiAudioPlayedThisTurnRef.current = false;
    setIsAiSpeaking(false);
    if (aiSpeakingStopTimerRef.current) {
      window.clearTimeout(aiSpeakingStopTimerRef.current);
      aiSpeakingStopTimerRef.current = null;
    }
  };

  const sendVoiceEvent = (payload) => {
    const socket = voiceSocketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    socket.send(JSON.stringify(payload));
    return true;
  };

  const stopRecording = async ({ requestResponse = true } = {}) => {
    if (!isRecordingRef.current) {
      return;
    }

    cleanupRecording();
    setVoicePhase('processing');
    setVoiceStatusText('음성을 텍스트로 변환하고 있어요.');
    aiAudioPlayedThisTurnRef.current = false;
    startAiSpeaking();

    if (requestResponse) {
      sendVoiceEvent({
        type: 'audio.commit',
        sessionId: session?.sessionId,
      });
      sendVoiceEvent({
        type: 'response.request',
        sessionId: session?.sessionId,
      });
    }
  };

  const playAudioChunk = async (chunkBase64) => {
    if (!chunkBase64) {
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }

    const audioContext =
      audioContextRef.current || new AudioContextClass({ sampleRate: SOCIAL_VOICE_SAMPLE_RATE });
    audioContextRef.current = audioContext;

    if (audioContext.state === 'suspended') {
      try {
        await audioContext.resume();
      } catch {
        return;
      }
    }

    const pcm16 = base64ToPcm16(chunkBase64);
    const samples = pcm16ToFloat32(pcm16);
    if (!samples.length) {
      return;
    }

    const buffer = audioContext.createBuffer(1, samples.length, SOCIAL_VOICE_SAMPLE_RATE);
    buffer.getChannelData(0).set(samples);

    startAiSpeaking();

    await new Promise((resolve) => {
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.onended = () => {
        try {
          source.disconnect();
        } catch {
          // Ignore disconnect errors during shutdown.
        }
        resolve();
      };
      source.start();
    });

    stopAiSpeakingSoon();
  };

  const queueAudioPlayback = (chunkBase64) => {
    startAiSpeaking();
    aiAudioPlayedThisTurnRef.current = true;
    playbackChainRef.current = playbackChainRef.current
      .catch(() => undefined)
      .then(() => playAudioChunk(chunkBase64))
      .catch(() => undefined);
  };

  const finishTurn = () => {
    const shouldAdvance = advanceAfterTurnRef.current;
    const stopDelayMs = aiAudioPlayedThisTurnRef.current ? 160 : 1200;
    advanceAfterTurnRef.current = false;
    setVoicePhase('ready');

    if (shouldAdvance) {
      playbackChainRef.current = playbackChainRef.current
        .catch(() => undefined)
        .then(() => {
          stopAiSpeakingSoon(stopDelayMs);
          if (isMountedRef.current) {
            setStep((currentStep) => currentStep + 1);
          }
        })
        .catch(() => undefined);
    } else {
      playbackChainRef.current = playbackChainRef.current
        .catch(() => undefined)
        .then(() => stopAiSpeakingSoon(stopDelayMs))
        .catch(() => undefined);
    }
  };

  const showOpeningDialogue = (script) => {
    const message = getSocialScenarioOpeningMessage(scenario, { opening: { script } });
    upsertChatDialogue('opening', {
      speaker: 'AI',
      speakerName: scenario?.npcName || '상대',
      message,
    });
  };

  const showUserTranscript = (text) => {
    if (!text) {
      return;
    }

    const dialogueId = currentUserMessageIdRef.current || nextMessageId('user');
    currentUserMessageIdRef.current = dialogueId;
    upsertChatDialogue(dialogueId, {
      speaker: 'USER',
      speakerName: '나',
      message: text,
    }, {
      beforeId: currentAiMessageIdRef.current,
    });
    setVoiceStatusText('');
  };

  const showAiPartial = (text) => {
    startAiSpeaking();
    const dialogueId = currentAiMessageIdRef.current || nextMessageId('ai');
    currentAiMessageIdRef.current = dialogueId;
    appendChatDialogueText(dialogueId, {
      speaker: 'AI',
      speakerName: scenario?.npcName || '상대',
    }, text);
  };

  const showAiFinal = (text) => {
    if (!text) {
      return;
    }

    startAiSpeaking();

    if (currentAiFinalHandledRef.current) {
      return;
    }
    currentAiFinalHandledRef.current = true;

    const dialogueId = currentAiMessageIdRef.current || nextMessageId('ai');
    currentAiMessageIdRef.current = dialogueId;
    upsertChatDialogue(dialogueId, {
      speaker: 'AI',
      speakerName: scenario?.npcName || '상대',
      message: text,
    });
  };

  const handleVoiceMessage = (event) => {
    let payload;

    try {
      payload = JSON.parse(event.data);
    } catch {
      return;
    }

    switch (payload?.type) {
      case 'session.ready':
        if (isMountedRef.current) {
          setVoicePhase('ready');
        }
        voiceConnectResolveRef.current?.();
        voiceConnectPromiseRef.current = null;
        voiceConnectResolveRef.current = null;
        voiceConnectRejectRef.current = null;
        if (pendingAutoStartRef.current) {
          pendingAutoStartRef.current = false;
          beginRecording();
        }
        break;
      case 'opening.play':
        showOpeningDialogue(payload.script);
        break;
      case 'upstream.input_audio_buffer.committed':
        break;
      case 'upstream.response.created':
        startAiSpeaking();
        aiAudioPlayedThisTurnRef.current = false;
        currentAiMessageIdRef.current = payload.responseId ? `ai-${payload.responseId}` : nextMessageId('ai');
        currentAiFinalHandledRef.current = false;
        upsertChatDialogue(currentAiMessageIdRef.current, {
          speaker: 'AI',
          speakerName: scenario?.npcName || '상대',
          message: '응답을 준비하고 있어요.',
        });
        break;
      case 'transcript.partial':
      case 'text.out.partial':
        if (payload.speaker === 'USER') {
          showUserTranscript(payload.text);
        } else {
          startAiSpeaking();
          showAiPartial(payload.text);
        }
        break;
      case 'transcript.complete':
        if (payload.speaker === 'USER') {
          showUserTranscript(payload.finalText || payload.text);
        } else {
          startAiSpeaking();
          showAiFinal(payload.finalText || payload.text);
        }
        break;
      case 'audio.out':
        startAiSpeaking();
        queueAudioPlayback(payload.chunkBase64);
        break;
      case 'turn.complete':
        showAiFinal(payload.finalText);
        finishTurn();
        break;
      case 'upstream.response.done':
        showAiFinal(payload.finalText);
        finishTurn();
        break;
      case 'session.completed':
        if (isMountedRef.current) {
          cleanupVoiceSession();
          setVoicePhase(payload.status === 'COMPLETED' ? 'idle' : 'ready');
        }
        break;
      case 'error':
        if (isMountedRef.current) {
          setVoicePhase('error');
          setError(payload.message || '실시간 음성 연결에 실패했습니다.');
        }
        break;
      default:
        break;
    }
  };

  const connectVoiceSession = async () => {
    if (voiceSocketRef.current?.readyState === WebSocket.OPEN) {
      return voiceConnectPromiseRef.current || Promise.resolve();
    }

    if (voiceConnectPromiseRef.current) {
      return voiceConnectPromiseRef.current;
    }

    if (!session?.sessionId) {
      setVoicePhase('error');
      setError('실시간 음성 세션을 준비하지 못했습니다.');
      return Promise.reject(new Error('Missing social session id.'));
    }

    const shouldAutoStartAfterConnect = pendingAutoStartRef.current;
    cleanupVoiceSession();
    pendingAutoStartRef.current = shouldAutoStartAfterConnect;
    setVoicePhase('connecting');

    let voiceSessionData;
    try {
      voiceSessionData = await socialTrainingApi.prepareSocialVoiceSession(session.sessionId);
    } catch (requestError) {
      setVoicePhase('error');
      setError(getErrorMessage(requestError, '실시간 음성 세션을 준비하지 못했습니다.'));
      return Promise.reject(requestError);
    }

    if (!voiceSessionData?.realtime?.connectionToken) {
      setVoicePhase('error');
      setError('실시간 음성 세션을 준비하지 못했습니다.');
      return Promise.reject(new Error('Missing voice session token.'));
    }

    voiceConnectPromiseRef.current = new Promise((resolve, reject) => {
      voiceConnectResolveRef.current = resolve;
      voiceConnectRejectRef.current = reject;

      const socket = new WebSocket(
        socialTrainingApi.createSocialVoiceWebSocketUrl(voiceSessionData.realtime.connectionToken),
      );
      voiceSocketRef.current = socket;

      socket.onopen = () => {
        sendVoiceEvent({
          type: 'session.start',
          sessionId: session?.sessionId,
        });
      };

      socket.onmessage = handleVoiceMessage;

      socket.onerror = () => {
        if (!isMountedRef.current) {
          return;
        }
        setVoicePhase('error');
        setError('실시간 음성 연결에 실패했습니다.');
        pendingAutoStartRef.current = false;
        reject(new Error('Voice websocket error.'));
        voiceSocketRef.current = null;
        voiceConnectPromiseRef.current = null;
        voiceConnectResolveRef.current = null;
        voiceConnectRejectRef.current = null;
      };

      socket.onclose = () => {
        if (!isMountedRef.current || isCleaningUpRef.current) {
          return;
        }

        if (voicePhaseRef.current !== 'error') {
          setVoicePhase('error');
          setError('실시간 음성 연결이 종료되었습니다.');
        }
        pendingAutoStartRef.current = false;
        reject(new Error('Voice websocket closed.'));
        voiceSocketRef.current = null;
        voiceConnectPromiseRef.current = null;
        voiceConnectResolveRef.current = null;
        voiceConnectRejectRef.current = null;
      };
    });

    return voiceConnectPromiseRef.current;
  };

  const beginRecording = async () => {
    if (isRecordingRef.current || voicePhaseRef.current === 'connecting' || voicePhaseRef.current === 'processing') {
      return;
    }

    const socket = voiceSocketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setError('실시간 음성 연결이 아직 준비되지 않았습니다.');
      return;
    }

    const mediaDevices = navigator.mediaDevices;
    if (!mediaDevices?.getUserMedia) {
      setError('이 브라우저는 마이크 녹음을 지원하지 않습니다.');
      return;
    }

    try {
      setError('');
      const stream = await mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        stream.getTracks().forEach((track) => track.stop());
        setError('이 브라우저는 오디오 재생을 지원하지 않습니다.');
        return;
      }

      const audioContext = audioContextRef.current || new AudioContextClass({ sampleRate: SOCIAL_VOICE_SAMPLE_RATE });
      audioContextRef.current = audioContext;
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const sourceNode = audioContext.createMediaStreamSource(stream);
      const processorNode = audioContext.createScriptProcessor(SOCIAL_VOICE_RECORD_BUFFER_SIZE, 1, 1);
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0;

      processorNode.onaudioprocess = (event) => {
        if (!isRecordingRef.current) {
          return;
        }

        const inputBuffer = event.inputBuffer.getChannelData(0);
        const chunkBase64 = float32ToPcm16Base64(inputBuffer, audioContext.sampleRate);
        if (!chunkBase64) {
          return;
        }

        sendVoiceEvent({
          type: 'audio.chunk',
          sessionId: session?.sessionId,
          mimeType: 'audio/pcm',
          chunkBase64,
        });
      };

      sourceNode.connect(processorNode);
      processorNode.connect(gainNode);
      gainNode.connect(audioContext.destination);

      mediaStreamRef.current = stream;
      sourceNodeRef.current = sourceNode;
      processorNodeRef.current = processorNode;
      gainNodeRef.current = gainNode;
      isRecordingRef.current = true;
      currentUserMessageIdRef.current = nextMessageId('user');
      currentAiMessageIdRef.current = null;
      currentAiFinalHandledRef.current = false;
      setVoiceStatusText('듣고 있어요.');
      setVoicePhase('recording');
    } catch (requestError) {
      cleanupRecording();
      setVoicePhase('ready');
      setError(getErrorMessage(requestError, '마이크를 사용할 수 없습니다.'));
    }
  };

  const startRecording = async () => {
    const socket = voiceSocketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      pendingAutoStartRef.current = true;
      try {
        await connectVoiceSession();
      } catch {
        pendingAutoStartRef.current = false;
      }
      return;
    }

    await beginRecording();
  };

  const handleVoiceButtonClick = async () => {
    if (status === 'saving') {
      return;
    }

    if (voicePhase === 'recording') {
      advanceAfterTurnRef.current = !isLastStep;
      await stopRecording();
      return;
    }

    if (isLastStep) {
      await completeSession();
      return;
    }

    if (voicePhase !== 'ready') {
      return;
    }

    await startRecording();
  };

  const loadSession = async () => {
    if (!scenarioId) {
      navigate('/training/social/scenarios', { replace: true, state: { jobType } });
      return;
    }

    setStatus('loading');
    setError('');

    try {
      const [scenarioDetail, sessionData] = await Promise.all([
        socialTrainingApi.getSocialScenario(scenarioId),
        socialTrainingApi.startSocialSession({ jobType, scenarioId }),
      ]);

      setScenario(normalizeSocialScenario(scenarioDetail));
      setSession(sessionData);
      setVoicePhase('ready');
      currentUserMessageIdRef.current = null;
      currentAiMessageIdRef.current = null;
      const openingMessage = getSocialScenarioOpeningMessage(scenarioDetail);
      setChatDialogues([
        {
          id: 'opening',
          speaker: 'AI',
          speakerName: scenarioDetail?.npcName || '상대',
          message: openingMessage,
        },
      ]);
      setStep(0);
      setStatus('ready');

      try {
        const openingAudio = await socialTrainingApi.prepareSocialOpeningAudio(scenarioId);
        if (openingAudio?.script) {
          upsertChatDialogue('opening', {
            speaker: 'AI',
            speakerName: scenarioDetail?.npcName || '상대',
            message: openingAudio.script,
          });
        }
        if (openingAudio?.audioAssetStatus === 'READY') {
          await playOpeningRequest(openingAudio.audioUrl);
        }
      } catch {
        // Opening audio is helpful but not required to continue the training.
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError, '사회성 훈련을 시작하지 못했습니다.'));
      setStatus('error');
    }
  };

  useEffect(() => {
    loadSession();
  }, [scenarioId]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      isCleaningUpRef.current = true;
      cleanupVoiceSession();
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => undefined);
        audioContextRef.current = null;
      }
      if (openingAudioRef.current) {
        openingAudioRef.current.pause();
        openingAudioRef.current = null;
      }
      if (openingAudioObjectUrlRef.current) {
        URL.revokeObjectURL(openingAudioObjectUrlRef.current);
        openingAudioObjectUrlRef.current = '';
      }
      if (aiSpeakingStopTimerRef.current) {
        window.clearTimeout(aiSpeakingStopTimerRef.current);
        aiSpeakingStopTimerRef.current = null;
      }
      isCleaningUpRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (chatThreadRef.current) {
      chatThreadRef.current.scrollTop = chatThreadRef.current.scrollHeight;
    }
  }, [visibleDialogues.length]);

  const socialVoiceActionLabel = isLastStep
    ? voicePhase === 'recording'
      ? '녹음 종료'
      : status === 'saving'
        ? '저장 중'
        : voicePhase === 'connecting'
          ? '연결 중'
          : voicePhase === 'processing'
            ? '듣는 중'
            : '결과 보기'
    : voicePhase === 'recording'
      ? '녹음 종료'
      : voicePhase === 'connecting'
        ? '연결 중'
        : voicePhase === 'processing'
          ? '듣는 중'
          : '말하기';

  const completeSession = async () => {
    if (!session?.sessionId) {
      return;
    }

    setStatus('saving');
    setError('');

    try {
      const dialogLogs = toDialogLogs(chatDialogues);
      if (!hasUserDialogLog(dialogLogs)) {
        setError('대화 기록이 없어 피드백을 생성할 수 없습니다. 먼저 음성으로 대화를 진행해주세요.');
        setStatus('ready');
        return;
      }

      const result = await socialTrainingApi.completeSocialSession(session.sessionId, {
        dialogLogs,
      });
      cleanupVoiceSession();
      navigate('/training/social/result', {
        state: {
          sessionId: session.sessionId,
          result,
          scenario,
          jobType,
          scenarioId,
          dialogLogs,
        },
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError, '훈련 결과를 저장하지 못했습니다.'));
      setStatus('ready');
    }
  };

  return (
    <TrainingShell fullScreen>
      <PageHeader compact className="social-module-back" onBack={() => navigate('/training/social/scenarios', { state: { jobType } })} />
      <section className="training-stage social-stage social-session-stage">
        <p className="social-session-brief">
          {scenario?.situationText || scenario?.description || '대화 상황을 준비하고 있어요.'}
        </p>
        {status === 'loading' ? (
          <div className="dialogue-panel social-current-dialogue social-session-loading-panel">
            <div className="social-current-header">
              <span>사회성 대화 연습</span>
            </div>
            <LoadingBlock />
          </div>
        ) : null}
        {status === 'error' ? (
          <div className="dialogue-panel social-current-dialogue social-session-loading-panel">
            <div className="social-current-header">
              <span>사회성 대화 연습</span>
            </div>
            <ErrorBlock message={error} onRetry={loadSession} />
          </div>
        ) : null}
        {(status === 'ready' || status === 'saving') && scenario ? (
          <>
            {visibleDialogues.length > 0 ? (
            <div className="dialogue-panel social-current-dialogue">
              <div className="social-current-header">
                <span>사회성 대화 연습</span>
              </div>
              <div className="social-video-chat-thread" ref={chatThreadRef}>
                {visibleDialogues.map((dialogue, index) => (
                  <div
                    className={`dialogue-bubble ${dialogue.speaker === 'USER' ? 'is-user' : 'is-partner'}`}
                    key={`${step}-${dialogue.speaker}-${index}`}
                  >
                    <span>{getSocialDialogueContent(dialogue)}</span>
                  </div>
                ))}
              </div>
              <div className="training-actions social-mic-actions">
                <button
                  type="button"
                  className={`social-mic-button ${voicePhase === 'recording' ? 'is-recording' : ''}`}
                  onClick={handleVoiceButtonClick}
                  disabled={
                    status === 'saving' ||
                    voicePhase === 'connecting' ||
                    voicePhase === 'processing' ||
                    (voicePhase !== 'ready' && voicePhase !== 'recording')
                  }
                  aria-label={socialVoiceActionLabel}
                >
                  <span>{socialVoiceActionLabel}</span>
                </button>
                <button
                  type="button"
                  className="social-end-button"
                  onClick={completeSession}
                  disabled={
                    status === 'saving' ||
                    voicePhase === 'connecting' ||
                    voicePhase === 'recording' ||
                    voicePhase === 'processing'
                  }
                  aria-label="대화 종료 및 피드백 받기"
                >
                  <span>{status === 'saving' ? '저장 중' : '종료'}</span>
                </button>
              </div>
              {voiceStatusText ? <p className="social-voice-status">{voiceStatusText}</p> : null}
              <aside className="social-video-profile">
                <div className={`social-video-avatar ${shouldAnimateAiCharacter ? 'is-ai-speaking' : ''}`}>
                  <SocialAiCharacter speaking={shouldAnimateAiCharacter} />
                </div>
              </aside>
            </div>
            ) : null}
            {error ? <ErrorBlock message={error} /> : null}
          </>
        ) : null}
      </section>
    </TrainingShell>
  );
}

export function SocialResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const sessionId = location.state?.sessionId;
  const scenario = location.state?.scenario;
  const jobType = location.state?.jobType || scenario?.jobType || 'OFFICE';
  const dialogLogs = location.state?.dialogLogs || [];
  const [result, setResult] = useState(location.state?.result || null);
  const scenarioId = location.state?.scenarioId || scenario?.scenarioId || result?.scenarioId;
  const [status, setStatus] = useState(result ? 'ready' : 'loading');
  const [error, setError] = useState('');
  const resultDialogues = dialogLogs.length > 0 ? dialogLogs : result?.dialogLogs || [];

  const loadResult = async () => {
    if (!sessionId) {
      setStatus('ready');
      return;
    }

    setStatus('loading');
    setError('');

    try {
      setResult(await socialTrainingApi.getSocialSessionDetail(sessionId));
      setStatus('ready');
    } catch (requestError) {
      setError(getErrorMessage(requestError, '결과를 불러오지 못했습니다.'));
      setStatus('error');
    }
  };

  useEffect(() => {
    if (!result) {
      loadResult();
    }
  }, [sessionId]);

  return (
    <TrainingShell fullScreen>
      <PageHeader compact className="social-module-back" onBack={() => navigate('/training/social/job')} />
      <section className="training-result-layout social-result-layout">
        <div className="social-result-left">
          <p className="social-result-situation">
            {scenario?.situationText || scenario?.description || result?.title || '사회성 훈련 결과를 정리하고 있어요.'}
          </p>
          <div className="social-result-dialogues" aria-busy={status === 'loading'}>
            {status === 'loading' ? <LoadingBlock /> : null}
            {status === 'error' ? <ErrorBlock message={error} onRetry={loadResult} /> : null}
            {status === 'ready'
              ? resultDialogues.slice(0, 4).map((dialogue) => (
                <p
                  className={`social-result-bubble ${
                    dialogue.speaker === 'USER' ? 'social-result-bubble-user' : 'social-result-bubble-ai'
                  }`}
                  key={`${dialogue.turnNo}-${dialogue.speaker}`}
                >
                  {dialogue.content}
                </p>
              ))
              : null}
          </div>
        </div>
        <aside className={`social-result-right ${status === 'loading' ? 'is-loading' : ''}`}>
          <div className="social-result-score">{status === 'ready' ? `${result?.score ?? 90}점` : '확인 중'}</div>
          <div className="social-result-feedback">
            <strong>AI 피드백</strong>
            <p>{status === 'ready' ? readableText(result?.feedback?.summary || result?.feedbackSummary || result?.feedback, '필요한 정보를 다시 확인하고 정리하는 흐름이 좋았습니다.') : '피드백을 불러오는 중입니다.'}</p>
          </div>
          <div className="social-result-recommendation">
            <strong>추천 답변</strong>
            <p>{status === 'ready' ? '필요한 내용을 다시 한번 확인하고 진행하겠습니다.' : '추천 답변을 준비하고 있습니다.'}</p>
            <img src={characterImg} alt="" />
          </div>
          <div className="social-result-actions">
            <button
              type="button"
              onClick={() => navigate('/training/social/session', { state: { jobType, scenarioId } })}
              disabled={status !== 'ready' || !scenarioId}
            >
              다시 연습하기
            </button>
            <button
              type="button"
              className="secondary-action"
              onClick={() => navigate('/training/social/scenarios', { state: { jobType } })}
              disabled={status !== 'ready'}
            >
              다른 상황 연습하기
            </button>
          </div>
        </aside>
      </section>
    </TrainingShell>
  );
}
export function SafetyTypePage() {
  const navigate = useNavigate();

  return (
    <TrainingShell fullScreen>
      <PageHeader compact className="safety-module-back" onBack={() => navigate('/main')} />
      <section className="safety-type-shell">
        <aside className="safety-type-intro">
          <span>안전 대처 훈련</span>
          <h1>오늘 연습할 안전 상황을 골라요</h1>
          <p>상황을 선택하면 장면을 보고, 어떤 행동이 안전한지 차근차근 연습합니다.</p>
          <strong>3가지 안전 영역</strong>
        </aside>
        <div className="option-grid safety-type-grid">
          {safetyCategories.map((item) => (
            <button
              className="option-card safety-option safety-type-card"
              type="button"
              key={item.category}
              onClick={() => navigate('/training/safety/scenarios', { state: { category: item.category } })}
            >
              <div className="safety-type-card-copy">
                <strong>{safetyTypeLabels[item.category] || item.label}</strong>
                <span>{item.description}</span>
              </div>
              <em>선택하기</em>
            </button>
          ))}
        </div>
      </section>
    </TrainingShell>
  );
}

export function SafetyScenarioPage() {
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const loadScenarios = async () => {
    setStatus('loading');
    setError('');

    try {
      const scenarioGroups = await Promise.all(
        safetyCategories.map(async (categoryInfo) => {
          const data = await safetyTrainingApi.getSafetyScenarios(categoryInfo.category);
          return (Array.isArray(data) ? data : []).map((scenario) => ({
            ...scenario,
            category: categoryInfo.category,
            categoryLabel: safetyTypeLabels[categoryInfo.category] || categoryInfo.label,
            categoryDescription: categoryInfo.description,
          }));
        })
      );
      setScenarios(scenarioGroups.flat());
      setStatus('ready');
    } catch (requestError) {
      setError(getErrorMessage(requestError, '안전 훈련 시나리오를 불러오지 못했습니다.'));
      setStatus('error');
    }
  };

  useEffect(() => {
    loadScenarios();
  }, []);

  return (
    <TrainingShell fullScreen>
      <PageHeader
        compact
        className="safety-module-back"
        onBack={() => navigate('/main')}
      />
      <TrainingHelpButton onClick={() => setIsHelpOpen(true)} />
      <section className="safety-scenario-shell">
        <aside className="safety-scenario-intro">
          <span>안전 대처 훈련</span>
          <h1>연습할 안전 상황을 바로 선택해요</h1>
          <p>카테고리를 먼저 고르지 않고, 실제로 마주칠 수 있는 상황을 바로 선택해 훈련을 시작합니다.</p>
        </aside>
        <div className="safety-scenario-panel">
          <header className="safety-scenario-panel-header">
            <span>전체 안전 상황</span>
            <strong>{status === 'ready' ? `${scenarios.length}개 상황` : '상황 확인 중'}</strong>
          </header>
          <div className="scenario-list safety-scenario-list" aria-busy={status === 'loading'}>
            {status === 'loading' ? <LoadingBlock /> : null}
            {status === 'error' ? <ErrorBlock message={error} onRetry={loadScenarios} /> : null}
            {status === 'ready' && scenarios.length === 0 ? <EmptyBlock message="선택할 수 있는 시나리오가 없습니다." /> : null}
            {status === 'ready' && scenarios.length > 0
              ? scenarios.map((scenario, index) => (
                <button
                  className="scenario-card safety-scenario-card"
                  type="button"
                  key={`${scenario.category}-${scenario.scenarioId}`}
                  onClick={() =>
                    navigate('/training/safety/session', {
                      state: { category: scenario.category, scenarioId: scenario.scenarioId },
                    })
                  }
                >
                  <span>{scenario.categoryLabel || scenario.badge || `상황 ${index + 1}`}</span>
                  <strong>{scenario.title}</strong>
                  <p>{scenario.description || scenario.categoryDescription || '안전한 행동을 선택하는 연습입니다.'}</p>
                  <em>시작하기</em>
                </button>
              ))
              : null}
          </div>
        </div>
      </section>
      <TrainingHelpDialog
        open={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="안전 대처 훈련 방법"
        images={[
          { src: '/mock/help/safety-training-help.png', alt: '안전 대처 훈련 상황 설명 화면 도움말' },
          { src: '/mock/help/safety-choice-help.png', alt: '안전 대처 훈련 선택 화면 도움말' },
          { src: '/mock/help/safety-result-help.png', alt: '안전 대처 훈련 결과 화면 도움말' },
        ]}
      />
    </TrainingShell>
  );
}

export function SafetySessionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const scenarioId = location.state?.scenarioId;
  const category = location.state?.category;
  const [sessionId, setSessionId] = useState(null);
  const [scene, setScene] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const loadSession = async () => {
    if (!scenarioId) {
      navigate('/training/safety/scenarios', { replace: true });
      return;
    }
    setStatus('loading');
    setError('');
    try {
      const sessionData = await safetyTrainingApi.startSafetySession({ scenarioId });
      setSessionId(sessionData.sessionId);
      setScene(sessionData.scene);
      setStatus('ready');
    } catch (requestError) {
      setError(getErrorMessage(requestError, '\uC548\uC804 \uD6C8\uB828\uC744 \uC2DC\uC791\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.'));
      setStatus('error');
    }
  };
  useEffect(() => {
    loadSession();
  }, [scenarioId]);

  const finishSafetySession = async (selectedResult) => {
    const completion = await safetyTrainingApi.completeSafetySession(sessionId);
    navigate('/training/safety/result', {
      state: {
        sessionId,
        result: {
          ...completion,
          ...selectedResult,
          scenarioId,
          category,
          completed: completion.completed ?? true,
        },
      },
    });
  };

  const selectChoice = async (choiceId) => {
    if (!sessionId || !scene || status === 'saving') {
      return;
    }
    setStatus('saving');
    setError('');
    try {
      const data = await safetyTrainingApi.goToNextSafetyScene(sessionId, {
        sceneId: scene.sceneId,
        choiceId,
      });
      if (data.completed) {
        await finishSafetySession(data.result);
        return;
      }
      setScene(data.nextScene || scene);
      setStatus('ready');
    } catch (requestError) {
      setError(getErrorMessage(requestError, '\uC120\uD0DD \uACB0\uACFC\uB97C \uCC98\uB9AC\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.'));
      setStatus('ready');
    }
  };

  const goNextScene = async () => {
    if (!sessionId || !scene || status === 'saving') {
      return;
    }

    setStatus('saving');
    setError('');

    try {
      const data = await safetyTrainingApi.advanceSafetyScene(sessionId, {
        sceneId: scene.sceneId,
      });

      if (data.completed) {
        await finishSafetySession(data.result);
        return;
      }

      setScene(data.nextScene || scene);
      setStatus('ready');
    } catch (requestError) {
      setError(getErrorMessage(requestError, '다음 장면으로 이동하지 못했습니다.'));
      setStatus('ready');
    }
  };

  const hasChoices = Array.isArray(scene?.choices) && scene.choices.length > 0;
  const canTapToContinue = !hasChoices && status !== 'saving';
  const handleStageContinue = () => {
    if (canTapToContinue) {
      goNextScene();
    }
  };

  const handleStageKeyDown = (event) => {
    if (!canTapToContinue) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      goNextScene();
    }
  };

  return (
    <TrainingShell fullScreen>
      <PageHeader
        compact
        className="safety-module-back safety-session-back"
        onBack={() => navigate('/training/safety/scenarios')}
      />
      {status === 'loading' ? <SafetySessionLoadingBlock /> : null}
      {status === 'error' ? <ErrorBlock message={error} onRetry={loadSession} /> : null}
      {scene && status !== 'loading' && status !== 'error' ? (
        <section
          className={`training-stage safety-stage safety-session-stage ${hasChoices ? 'has-decision-panel' : ''} ${canTapToContinue ? 'is-tap-to-continue' : ''}`}
          onClick={handleStageContinue}
          onKeyDown={handleStageKeyDown}
          role={canTapToContinue ? 'button' : undefined}
          tabIndex={canTapToContinue ? 0 : undefined}
          aria-label={canTapToContinue ? '다음 장면으로 이동' : undefined}
        >
          <img className="safety-stage-image" src={resolveApiAssetUrl(scene.imageUrl)} alt={scene.imageAlt || ''} />
          {scene.questionText && !hasChoices ? <div className="safety-question-bubble">{scene.questionText}</div> : null}
          {!hasChoices ? (
            <div className="safety-caption">
              <strong>{scene.screenInfo || scene.title || '\uC548\uC804 \uD6C8\uB828'}</strong>
              {canTapToContinue ? <span className="safety-continue-hint">다음으로 넘어가려면 화면 아무데나 클릭하세요</span> : null}
              <span>{scene.situationText}</span>
            </div>
          ) : null}
          {hasChoices ? (
            <div className="safety-decision-panel">
              <div className="safety-panel-prompt">
                <strong>{scene.screenInfo || scene.title || '\uC0C1\uD669'}</strong>
                <span>{scene.situationText}</span>
                {scene.questionText ? <em>{scene.questionText}</em> : null}
              </div>
              <div className="safety-choice-overlay">
                {scene.choices?.map((choice) => (
                  <button
                    type="button"
                    key={choice.choiceId}
                    onClick={() => selectChoice(choice.choiceId)}
                    disabled={status === 'saving'}
                  >
                    {choice.text}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {error ? <ErrorBlock message={error} /> : null}
        </section>
      ) : null}
    </TrainingShell>
  );
}
export function SafetyResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const sessionId = location.state?.sessionId;
  const [result, setResult] = useState(location.state?.result || null);
  const scenarioId = location.state?.scenarioId || result?.scenarioId;
  const category = location.state?.category || result?.category;
  const [status, setStatus] = useState(result ? 'ready' : 'loading');
  const [error, setError] = useState('');
  const loadResult = async () => {
    if (!sessionId) {
      setStatus('ready');
      return;
    }
    setStatus('loading');
    setError('');
    try {
      setResult(await safetyTrainingApi.getSafetySessionDetail(sessionId));
      setStatus('ready');
    } catch (requestError) {
      setError(getErrorMessage(requestError, '\uACB0\uACFC\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.'));
      setStatus('error');
    }
  };
  useEffect(() => {
    if (!result || (sessionId && !hasDocumentAnswerDetails(result))) {
      loadResult();
    }
  }, [sessionId]);
  return (
    <TrainingShell fullScreen>
      <PageHeader compact className="safety-module-back safety-result-back" onBack={() => navigate('/training/safety/scenarios')} />
      {status === 'loading' ? <LoadingBlock /> : null}
      {status === 'error' ? <ErrorBlock message={error} onRetry={loadResult} /> : null}
      {status === 'ready' ? (
        <section className={`safety-result-layout ${result?.correct ? 'is-correct' : 'is-wrong'}`}>
          <img
            className="safety-result-image"
            src={resolveApiAssetUrl(result?.feedbackImageUrl || result?.latestSceneImageUrl)}
            alt={result?.feedbackImageAlt || result?.latestSceneImageAlt || ''}
          />
          <div className="safety-result-content">
            <div className="safety-result-summary">
              <strong>{result?.title || (result?.correct ? '\uC798\uD588\uC5B4\uC694!' : '\uB2E4\uC2DC \uC0DD\uAC01\uD574\uBCFC\uAE4C\uC694?')}</strong>
              <p>{readableText(result?.resultText || result?.feedback, '선택 결과를 확인해 주세요.')}</p>
              <span>{readableText(result?.effectText || result?.feedback, '상황을 보고 안전한 선택을 연습했습니다.')}</span>
            </div>
            <div className="safety-result-actions">
              <button
                type="button"
                onClick={() => navigate('/training/safety/session', { state: { category, scenarioId } })}
                disabled={!scenarioId}
              >
                다시 연습하기
              </button>
              <button type="button" className="secondary-action" onClick={() => navigate('/training/safety/scenarios', { state: { category } })}>
                다른 상황 연습하기
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </TrainingShell>
  );
}

function DocumentThemePreview({ question }) {
  const theme = question?.theme || 'ANNOUNCEMENT';

  if (theme === 'MANUAL') {
    return (
      <div className="document-theme-preview document-theme-manual">
        <header>
          <span />
          <strong>업무 매뉴얼</strong>
        </header>
        <div className="manual-toolbar">
          <span>파일</span>
          <span>편집</span>
          <span>보기</span>
          <span>삽입</span>
          <span>서식</span>
          <em>100%</em>
          <em>Noto Sans KR</em>
          <em>11</em>
        </div>
        <div className="manual-document">
          <aside>
            <strong>문서 탭</strong>
            <p>{question.title}</p>
            <span>I. 목적</span>
            <span>II. 적용 범위</span>
            <span>III. 사용 방법</span>
            <span>IV. 주의사항</span>
          </aside>
          <article>
            <h3>{question.title}</h3>
            <p>{question.documentText}</p>
          </article>
        </div>
      </div>
    );
  }

  if (theme === 'MESSENGER') {
    return (
      <div className="document-theme-preview document-theme-messenger">
        <aside className="messenger-sidebar">
          <strong>DIDGO COMPANY</strong>
          <span>홈</span>
          <span>공지사항</span>
          <span className="is-active">업무 채팅</span>
          <span>업무 매뉴얼</span>
          <span>자료 공유</span>
          <em>설정</em>
        </aside>
        <section className="messenger-list">
          <header>
            <strong>업무 채팅</strong>
            <span>⌕</span>
          </header>
          <div className="messenger-empty">
            <span>•••</span>
            <strong>{question.title}</strong>
          </div>
        </section>
        <section className="messenger-room">
          <header>
            <strong>업무 채팅</strong>
            <span>⌕  ☎  ⋮</span>
          </header>
          <div className="messenger-bubble">
            <strong>{question.title}</strong>
            <p>{question.documentText}</p>
          </div>
          <footer>메시지 입력...</footer>
        </section>
      </div>
    );
  }

  return (
    <div className="document-theme-preview document-theme-announcement">
      <header>
        <strong>DIDGO COMPANY</strong>
        <nav>
          <span>회사소개</span>
          <span>사업소개</span>
          <span>인재채용</span>
          <span>고객센터</span>
        </nav>
        <em>검색어를 입력하세요</em>
      </header>
      <div className="announcement-hero">
        <strong>공지사항</strong>
        <span>DIDGO 컴퍼니의 새로운 소식을 알려드립니다.</span>
      </div>
      <article>
        <h3>{question.title}</h3>
        <p>{question.documentText}</p>
      </article>
      <footer>DIDGO COMPANY</footer>
    </div>
  );
}

export function DocumentStartPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const loadProgress = async () => {
    setStatus('loading');
    setError('');

    try {
      setProgress(await documentTrainingApi.getDocumentProgress());
      setStatus('ready');
    } catch (requestError) {
      setError(getErrorMessage(requestError, '문서 이해 진행 정보를 불러오지 못했습니다.'));
      setStatus('error');
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  const currentLevel = progress?.currentLevel || 1;
  const highestLevel = progress?.highestUnlockedLevel || currentLevel;
  const levels =
    progress?.levels?.length > 0
      ? progress.levels
      : Array.from({ length: Math.max(highestLevel, 1) }, (_, index) => {
          const level = index + 1;
          return {
            level,
            subtitle:
              level === currentLevel
                ? '지금 이어서 진행하기 좋은 단계입니다.'
                : documentLevelSubtitles[level] || '이전에 열어둔 단계를 다시 연습합니다.',
            unlocked: level <= highestLevel,
            recommended: level === currentLevel,
          };
        });
  const unlockedLevelCount = levels.filter((levelInfo) => levelInfo.unlocked !== false).length;

  return (
    <TrainingShell fullScreen>
      <PageHeader
        compact
        className="document-module-back"
        onBack={() => navigate('/main')}
      />
      <TrainingHelpButton onClick={() => setIsHelpOpen(true)} />
      <section className="document-start-shell">
        <aside className="document-start-intro">
          <span>문서 이해 훈련</span>
          <h2>읽고, 생각하는 연습</h2>
          <p>안내문에서 중요한 문장을 고르고 질문에 답하며 필요한 정보를 찾는 흐름을 익힙니다.</p>
          <div className="document-progress-card">
            <strong>{status === 'ready' ? `${currentLevel}단계` : '확인 중'}</strong>
            <span>추천 단계</span>
          </div>
        </aside>
        <div className="document-level-panel">
          <header className="document-level-panel-header">
            <span>선택 가능한 단계</span>
            <strong>{status === 'ready' ? `${unlockedLevelCount}/${levels.length}개 해금` : '단계 확인 중'}</strong>
          </header>
          <div className="option-grid document-level-grid" aria-busy={status === 'loading'}>
            {status === 'loading' ? <LoadingBlock /> : null}
            {status === 'error' ? <ErrorBlock message={error} onRetry={loadProgress} /> : null}
            {status === 'ready'
              ? levels.map((levelInfo) => {
                const level = levelInfo.level;
                const isUnlocked = levelInfo.unlocked !== false;
                const isRecommended = levelInfo.recommended || level === currentLevel;
                return (
                  <button
                    className={`option-card document-option ${isRecommended ? 'is-current' : ''} ${
                      isUnlocked ? '' : 'is-locked'
                    }`}
                    type="button"
                    key={level}
                    onClick={() => {
                      if (isUnlocked) {
                        navigate('/training/document/session', { state: { level } });
                      }
                    }}
                    disabled={!isUnlocked}
                    aria-disabled={!isUnlocked}
                  >
                    <div className="document-option-copy">
                      <strong>{levelInfo.title || `${level}단계`}</strong>
                      <span>{levelInfo.subtitle || documentLevelSubtitles[level] || '문서 내용을 차근차근 확인합니다.'}</span>
                    </div>
                    <em>{isUnlocked ? (isRecommended ? '추천' : '복습') : '잠김'}</em>
                  </button>
                );
              })
              : null}
          </div>
        </div>
      </section>
      <TrainingHelpDialog
        open={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="문서 이해 훈련 방법"
        images={[
          { src: '/mock/help/document-training-quiz-help.png', alt: '문서 이해 훈련 문제 풀이 화면 도움말' },
          { src: '/mock/help/document-training-result-help.png', alt: '문서 이해 훈련 결과 화면 도움말' },
        ]}
      />
    </TrainingShell>
  );
}

export function DocumentSessionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const level = location.state?.level || 1;
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const loadSession = async () => {
    setStatus('loading');
    setError('');

    try {
      const data = await documentTrainingApi.startDocumentSession({ level });
      setSession(data);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setStatus('ready');
    } catch (requestError) {
      setError(getErrorMessage(requestError, '문서 이해 훈련을 시작하지 못했습니다.'));
      setStatus('error');
    }
  };

  useEffect(() => {
    loadSession();
  }, [level]);

  const questions = session?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswerValue = getDocumentAnswerValue(answers, currentQuestion);
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const allAnswered = questions.length > 0 && questions.every((question) => isDocumentQuestionAnswered(answers, question));
  const answeredCount = questions.filter((question) => isDocumentQuestionAnswered(answers, question)).length;
  const currentQuestionAnswered = currentQuestion ? isDocumentQuestionAnswered(answers, currentQuestion) : false;
  const currentQuestionIsShortAnswer = isDocumentShortAnswer(currentQuestion);

  const submitAnswers = async () => {
    if (!session?.sessionId || !allAnswered) {
      return;
    }

    setStatus('saving');
    setError('');

    try {
      const result = await documentTrainingApi.submitDocumentAnswers(session.sessionId, {
        answers: questions.map((question) => toDocumentAnswerRequest(question, answers[question.questionId])),
      });
      navigate('/training/document/result', {
        state: {
          sessionId: session.sessionId,
          result,
          level,
        },
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError, '답변을 제출하지 못했습니다.'));
      setStatus('ready');
    }
  };

  const goToNextQuestion = () => {
    if (!currentQuestion || !currentQuestionAnswered || status === 'saving') {
      return;
    }

    if (isLastQuestion) {
      submitAnswers();
      return;
    }

    setCurrentQuestionIndex((index) => Math.min(index + 1, questions.length - 1));
  };

  const goToPreviousQuestion = () => {
    setCurrentQuestionIndex((index) => Math.max(index - 1, 0));
  };

  return (
    <TrainingShell fullScreen>
      <section className="document-session-shell">
        <header className="document-session-topbar">
          <button type="button" onClick={() => navigate('/training/document')} aria-label="단계 선택으로 돌아가기">
            ←
          </button>
          <div>
            <strong>문서 이해 훈련</strong>
            <p>왼쪽 문서를 천천히 읽고 알맞은 답을 골라 주세요.</p>
          </div>
          <span>
            {questions.length > 0 ? `${currentQuestionIndex + 1}/${questions.length} 문제` : '문제 확인 중'}
          </span>
        </header>
        <div className="document-session-progress" aria-label={`총 ${questions.length}문제 중 ${answeredCount}문제 선택`}>
          {questions.map((question, index) => (
              <span
                className={`${index === currentQuestionIndex ? 'is-current' : ''} ${
                  answers[question.questionId] ? 'is-answered' : ''
                }`}
                key={question.questionId}
              />
          ))}
        </div>
        <div className="document-session-layout" aria-busy={status === 'loading'}>
          {status === 'loading' ? <LoadingBlock /> : null}
          {status === 'error' ? <ErrorBlock message={error} onRetry={loadSession} /> : null}
          {(status === 'ready' || status === 'saving') && session && currentQuestion ? (
            <>
            <DocumentThemePreview question={currentQuestion} />
            <aside className="document-session-question">
              <div className="document-question-meta">
                <span>{documentThemeLabels[currentQuestion.theme] || '문서'}</span>
                <em>{level}단계</em>
              </div>
              <p>{currentQuestionIsShortAnswer ? '문서 내용을 보고 답을 입력하세요.' : '문서 내용과 같은 답을 하나 고르세요.'}</p>
              <strong>{currentQuestion.questionText}</strong>
              {currentQuestionIsShortAnswer ? (
                <input
                  className="document-answer-input"
                  type="text"
                  value={currentAnswerValue || ''}
                  onChange={(event) =>
                    setAnswers((currentAnswers) => ({
                      ...currentAnswers,
                      [currentQuestion.questionId]: event.target.value,
                    }))
                  }
                  placeholder="답을 입력해 주세요"
                />
              ) : (
                <div className="document-choice-grid">
                  {currentQuestion.choices?.map((choice, index) => (
                    <button
                      className={currentAnswerValue === choice.choiceId ? 'is-selected' : ''}
                      type="button"
                      key={choice.choiceId}
                      onClick={() =>
                        setAnswers((currentAnswers) => ({
                          ...currentAnswers,
                          [currentQuestion.questionId]: choice.choiceId,
                        }))
                      }
                    >
                      <span>{index + 1}</span>
                      <strong>{choice.text}</strong>
                    </button>
                  ))}
                </div>
              )}
              <div className="document-session-actions">
                <button type="button" className="document-prev-button" onClick={goToPreviousQuestion} disabled={currentQuestionIndex === 0}>
                  이전 문제
                </button>
                <button
                  className="document-next-button"
                  type="button"
                  onClick={goToNextQuestion}
                  disabled={!currentQuestionAnswered || status === 'saving'}
                >
                  {status === 'saving' ? '제출 중' : isLastQuestion ? '결과 보기' : '다음 문제'}
                </button>
              </div>
            </aside>
            </>
          ) : null}
        </div>
        {error && status !== 'error' ? <ErrorBlock message={error} /> : null}
      </section>
    </TrainingShell>
  );
}

export function DocumentResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const sessionId = location.state?.sessionId;
  const resultLevel = location.state?.level || location.state?.result?.level || location.state?.result?.playedLevel || 1;
  const [result, setResult] = useState(location.state?.result || null);
  const [status, setStatus] = useState(result ? 'ready' : 'loading');
  const [error, setError] = useState('');

  const loadResult = async () => {
    if (!sessionId) {
      setStatus('ready');
      return;
    }

    setStatus('loading');
    setError('');

    try {
      setResult(await documentTrainingApi.getDocumentSessionDetail(sessionId));
      setStatus('ready');
    } catch (requestError) {
      setError(getErrorMessage(requestError, '결과를 불러오지 못했습니다.'));
      setStatus('error');
    }
  };

  useEffect(() => {
    if (!result) {
      loadResult();
    }
  }, [sessionId]);

  const correctCount = result?.correctCount ?? result?.answerSummary?.correctCount ?? 0;
  const totalCount = result?.totalCount ?? result?.answerSummary?.totalCount ?? 0;
  const score = result?.score ?? 0;
  const resultMessage =
    score >= 80
      ? '문서에서 필요한 정보를 잘 찾았습니다.'
      : score >= 60
        ? '중요한 문장을 다시 확인하면 더 좋아집니다.'
        : '문서를 한 줄씩 천천히 읽는 연습을 다시 해봅시다.';
  const resultItems = result?.results || result?.answers || [];

  return (
    <TrainingShell fullScreen>
      <section className="document-result-shell">
        <button className="document-result-back" type="button" onClick={() => navigate('/training/document')}>
          ←
        </button>
        <div className="document-result-card" aria-busy={status === 'loading'}>
          {status === 'loading' ? <LoadingBlock /> : null}
          {status === 'error' ? <ErrorBlock message={error} onRetry={loadResult} /> : null}
          {status === 'ready' ? (
            <>
              <div className="document-result-score">
                <span>{score}</span>
                <small>점</small>
              </div>
              <div className="document-result-copy">
                <span>문서 이해 훈련 결과</span>
                <h1>오늘은 {totalCount}문제 중 {correctCount}문제를 맞혔어요</h1>
                <p>{resultMessage}</p>
              </div>
              <div className="document-result-summary">
                {Array.from({ length: totalCount || 5 }, (_, index) => {
                const item = resultItems[index];
                return (
                  <span className={item?.correct ? 'is-correct' : 'is-wrong'} key={`${item?.questionId || index}`}>
                    {index + 1}
                  </span>
                );
                })}
              </div>
              {resultItems.length > 0 ? (
                <div className="document-result-detail-list">
                  {resultItems.map((item, index) => (
                    <article className={`document-history-answer ${item.correct ? 'is-correct' : 'is-wrong'}`} key={item.questionId || index}>
                      <div className="document-history-answer-head">
                        <span>{index + 1}</span>
                        <em>{item.correct ? '정답' : '오답'}</em>
                        <strong>{item.correct ? '맞혔어요' : '다시 확인해요'}</strong>
                      </div>
                      <h2>{item.questionText || `문제 ${index + 1}`}</h2>
                      <dl>
                        <div>
                          <dt>내 답</dt>
                          <dd>{item.userAnswer || '응답 없음'}</dd>
                        </div>
                        <div>
                          <dt>정답</dt>
                          <dd>{item.correctAnswer}</dd>
                        </div>
                      </dl>
                      <p>{item.explanation || '해설이 준비되지 않았습니다.'}</p>
                    </article>
                  ))}
                </div>
              ) : null}
              <div className="document-result-actions">
                <button type="button" onClick={() => navigate('/training/document/session', { state: { level: resultLevel } })}>
                  다시 연습하기
                </button>
                <button type="button" className="secondary-action" onClick={() => navigate('/training/document')}>
                  다른 문제 풀기
                </button>
              </div>
            </>
          ) : null}
        </div>
      </section>
    </TrainingShell>
  );
}

export function TrainingHistorySelectPage() {
  const navigate = useNavigate();

  return (
    <TrainingShell activeKey="history">
      <section className="menu-page-shell">
        <header className="menu-page-header">
          <span>훈련 기록</span>
          <h1>지난 훈련을 다시 살펴봐요</h1>
          <p>지난 훈련 결과를 다시 보고, 다음 연습을 준비할 수 있습니다.</p>
        </header>
        <div className="training-select-grid history-select-grid is-history" aria-label="훈련 이력 유형">
          {trainingTypes.map((item) => (
            <button
              className={`training-select-card history-select-card training-card-${item.tone}`}
              type="button"
              key={item.type}
              onClick={() => navigate(item.path)}
            >
              <span>{item.label}</span>
              <small>지난 {item.label} 훈련 결과를 확인해요</small>
              <div className={`training-card-illustration training-card-illustration-${item.visual}`} aria-hidden="true">
                <img src={item.thumbnail} alt="" />
              </div>
              <strong className="training-card-action">기록 보기</strong>
            </button>
          ))}
        </div>
      </section>
    </TrainingShell>
  );
}

export function TrainingHistoryListPage() {
  const navigate = useNavigate();
  const { type = 'social' } = useParams();
  const selectedType = historyTypeMap[type] || 'SOCIAL';
  const [history, setHistory] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const selectedLabel = trainingTypes.find((item) => item.type === selectedType)?.label || '훈련';

  const loadHistory = async () => {
    setStatus('loading');
    setError('');

    try {
      setHistory(await trainingProgressApi.getTrainingSessions({ type: selectedType, page: 0, size: 10 }));
      setSelectedSession(null);
      setStatus('ready');
    } catch (requestError) {
      setError(getErrorMessage(requestError, '훈련 이력을 불러오지 못했습니다.'));
      setStatus('error');
    }
  };

  useEffect(() => {
    loadHistory();
  }, [selectedType]);

  const sessions = history?.sessions || [];
  const detailSession = selectedSession || sessions[0];
  const summaryContent = historyTypeSummary[selectedType] || historyTypeSummary.SOCIAL;
  const historyLoadingProps = {
    selectedSession: detailSession,
    onBack: () => navigate('/training-history'),
    onSelect: setSelectedSession,
    isLoading: status === 'loading',
    error: status === 'error' ? error : '',
    onRetry: loadHistory,
  };

  return (
    <TrainingShell fullScreen>
      {selectedType !== 'DOCUMENT' && selectedType !== 'SOCIAL' && selectedType !== 'SAFETY' ? (
        <PageHeader compact onBack={() => navigate('/training-history')} />
      ) : null}
      {status === 'ready' && sessions.length === 0 && selectedType !== 'SOCIAL' && selectedType !== 'SAFETY' && selectedType !== 'DOCUMENT' ? <EmptyBlock message={`${selectedLabel} 훈련 이력이 없습니다.`} /> : null}
      {(status === 'loading' || status === 'error') && selectedType === 'SOCIAL' ? <SocialHistoryList sessions={[]} {...historyLoadingProps} /> : null}
      {(status === 'loading' || status === 'error') && selectedType === 'SAFETY' ? <SafetyHistoryList sessions={[]} {...historyLoadingProps} /> : null}
      {(status === 'loading' || status === 'error') && selectedType === 'DOCUMENT' ? <DocumentHistoryList sessions={[]} {...historyLoadingProps} /> : null}
      {status === 'ready' && selectedType === 'DOCUMENT' ? (
        <DocumentHistoryList
          sessions={sessions}
          selectedSession={detailSession}
          onBack={() => navigate('/training-history')}
          onSelect={setSelectedSession}
          onStart={() => navigate('/training/document')}
          onDetail={() =>
            navigate(`/training-history/document/${detailSession.sessionId}`, {
              state: {
                session: detailSession,
                type: selectedType,
              },
            })
          }
        />
      ) : null}
      {status === 'ready' && selectedType === 'SOCIAL' ? (
        <SocialHistoryList
          sessions={sessions}
          selectedSession={detailSession}
          onBack={() => navigate('/training-history')}
          onSelect={setSelectedSession}
          onStart={() => navigate('/training/social/job')}
          onDetail={() =>
            navigate(`/training-history/social/${detailSession.sessionId}`, {
              state: {
                session: detailSession,
                type: selectedType,
              },
            })
          }
        />
      ) : null}
      {status === 'ready' && selectedType === 'SAFETY' ? (
        <SafetyHistoryList
          sessions={sessions}
          selectedSession={detailSession}
          onBack={() => navigate('/training-history')}
          onSelect={setSelectedSession}
          onStart={() => navigate('/training/safety/scenarios')}
          onDetail={() =>
            navigate(`/training-history/safety/${detailSession.sessionId}`, {
              state: {
                session: detailSession,
                type: selectedType,
              },
            })
          }
        />
      ) : null}
      {status === 'ready' && selectedType !== 'DOCUMENT' && selectedType !== 'SOCIAL' && selectedType !== 'SAFETY' && sessions.length > 0 ? (
        <section className="history-list-shell">
          <div className="history-list-column">
            <div className="history-list-header">
              <div>
                <strong>{selectedLabel}</strong>
                <p>최근 완료한 훈련을 눌러서 내용을 다시 살펴보세요.</p>
              </div>
              <span>{sessions.length}개 기록</span>
            </div>
            <div className="history-list" aria-label={`${selectedLabel} 훈련 이력`}>
              {sessions.map((session) => (
                <button
                  className={`history-item ${(selectedSession || sessions[0])?.sessionId === session.sessionId ? 'is-selected' : ''}`}
                  type="button"
                  key={`${session.trainingType}-${session.sessionId}`}
                  onClick={() => setSelectedSession(session)}
                >
                  <span>{formatHistoryDate(session.completedAt)}</span>
                  <div className="history-item-copy">
                    <strong>{session.scenarioTitle || session.title || '시나리오 제목'}</strong>
                    <small>{session.feedbackSummary || session.situationText || '훈련 요약이 아직 없습니다.'}</small>
                  </div>
                  <em>{session.score ?? session.accuracyRate ?? '-'}점</em>
                </button>
              ))}
            </div>
          </div>
          <aside className={`history-preview-card history-preview-${selectedType.toLowerCase()}`}>
            <strong className="history-preview-badge">{summaryContent.badge}</strong>
            <h2>{detailSession?.scenarioTitle || detailSession?.title || '시나리오 제목'}</h2>
            <div className="history-preview-score">{detailSession?.score ?? detailSession?.accuracyRate ?? '-'}점</div>
            <p className="history-preview-situation">{detailSession?.situationText || '상황 설명이 아직 없습니다.'}</p>
            <div className="history-preview-feedback">
              <strong>AI 피드백</strong>
              <p>{detailSession?.feedbackSummary || summaryContent.emptyFeedback}</p>
            </div>
            <button
              className="history-detail-button"
              type="button"
              onClick={() =>
                navigate('/training-history/detail', {
                  state: {
                    session: detailSession,
                    type: selectedType,
                  },
                })
              }
            >
              {summaryContent.actionLabel}
            </button>
          </aside>
        </section>
      ) : null}
    </TrainingShell>
  );
}

export function TrainingHistoryDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { type: routeType, sessionId: routeSessionId } = useParams();
  const session = location.state?.session;
  const selectedType = routeType ? historyTypeMap[routeType] || 'SOCIAL' : location.state?.type || session?.trainingType || 'SOCIAL';
  const title = session?.scenarioTitle || session?.title || '시나리오 제목';
  const score = session?.score ?? session?.accuracyRate ?? 0;

  if (selectedType === 'DOCUMENT') {
    return (
      <DocumentHistoryDetail
        sessionId={Number(routeSessionId || session?.sessionId)}
        summary={session}
        onBack={() => navigate('/training-history/document')}
        onRetry={() => navigate('/training/document')}
      />
    );
  }

  if (selectedType === 'SOCIAL') {
    return (
      <SocialHistoryDetail
        sessionId={Number(routeSessionId || session?.sessionId)}
        summary={session}
        onBack={() => navigate('/training-history/social')}
        onRetry={() => navigate('/training/social/job')}
      />
    );
  }

  if (selectedType === 'SAFETY') {
    return (
      <SafetyHistoryDetail
        sessionId={Number(routeSessionId || session?.sessionId)}
        summary={session}
        onBack={() => navigate('/training-history/safety')}
        onRetry={() => navigate('/training/safety/scenarios')}
      />
    );
  }

  return (
    <TrainingShell fullScreen>
      <PageHeader compact onBack={() => navigate(`/training-history/${selectedType.toLowerCase()}`)} />
      <section className="history-detail-panel">
        <div className="history-detail-main">
          <div className="history-detail-row">
            <span>{formatHistoryDate(session?.completedAt)}</span>
            <strong>{title}</strong>
            <em>{score}점</em>
          </div>
          <div className="history-detail-situation">
            {session?.situationText || '상황 설명이 아직 없습니다.'}
          </div>
          <div className="history-dialogue history-dialogue-user">상황을 먼저 확인하고 필요한 내용을 다시 물어봤어요.</div>
          <div className="history-dialogue history-dialogue-ai">좋아요. 필요한 정보를 확인한 뒤 행동을 정리하면 더 자연스럽습니다.</div>
          <div className="history-dialogue history-dialogue-user">확인한 내용을 바탕으로 다시 진행하겠습니다.</div>
        </div>
        <aside className="history-feedback-panel">
          <strong>AI 피드백</strong>
          <p>{session?.feedbackSummary || '상황에 맞는 대응을 차분하게 이어갔습니다.'}</p>
          <strong>추천 답변</strong>
          <p>필요한 내용을 다시 확인하고 차분하게 이어서 진행하겠습니다.</p>
          <img src={characterImg} alt="" />
        </aside>
      </section>
    </TrainingShell>
  );
}

function SafetyHistoryList({ sessions, selectedSession, onBack, onSelect, onDetail, onStart, isLoading = false, error = '', onRetry }) {
  const latestSession = sessions[0];
  const totalScore = sessions.reduce((sum, session) => sum + (session.score ?? session.accuracyRate ?? 0), 0);
  const averageScore = sessions.length > 0 ? Math.round(totalScore / sessions.length) : 0;
  const totalCorrect = sessions.reduce((sum, session) => sum + (session.correctCount || 0), 0);
  const totalQuestions = sessions.reduce((sum, session) => sum + (session.totalCount || 0), 0);
  const hasSessions = sessions.length > 0;
  const [detail, setDetail] = useState(null);
  const [detailStatus, setDetailStatus] = useState(selectedSession?.sessionId ? 'loading' : 'idle');
  const [detailError, setDetailError] = useState('');
  const previewActions = detail?.actions?.slice(0, 2) || [];

  const loadSelectedDetail = async () => {
    if (!selectedSession?.sessionId) {
      setDetail(null);
      setDetailStatus('idle');
      return;
    }

    setDetailStatus('loading');
    setDetailError('');

    try {
      setDetail(await safetyTrainingApi.getSafetySessionDetail(selectedSession.sessionId));
      setDetailStatus('ready');
    } catch (requestError) {
      setDetail(null);
      setDetailError(getErrorMessage(requestError, '상세 기록을 불러오지 못했습니다.'));
      setDetailStatus('error');
    }
  };

  useEffect(() => {
    loadSelectedDetail();
  }, [selectedSession?.sessionId]);

  return (
    <section className="safety-history-shell">
      <button className="safety-history-back" type="button" onClick={onBack} aria-label="훈련 이력 선택으로 돌아가기">
        ‹
      </button>
      <header className="safety-history-header">
        <span>안전 대처 기록</span>
        <h1>위험한 순간에 어떤 선택을 했는지 다시 봐요</h1>
        <p>지난 안전 상황을 보며 잘 대처한 행동과 다음에 더 안전하게 선택할 행동을 확인할 수 있습니다.</p>
      </header>

      <div className="safety-history-summary">
        <article>
          <span>최근 점수</span>
          <strong>{isLoading || !hasSessions ? '-' : `${latestSession?.score ?? 0}점`}</strong>
        </article>
        <article>
          <span>평균 점수</span>
          <strong>{isLoading || !hasSessions ? '-' : `${averageScore}점`}</strong>
        </article>
        <article>
          <span>나를 지키는 선택</span>
          <strong>
            {isLoading || !hasSessions ? '-' : `${totalCorrect}/${totalQuestions || '-'}`}
          </strong>
        </article>
      </div>

      <div className="safety-history-layout">
        <div className="safety-history-list" aria-label="안전 대처 훈련 기록" aria-busy={isLoading}>
          {isLoading ? <LoadingBlock /> : null}
          {error ? <ErrorBlock message={error} onRetry={onRetry} /> : null}
          {!isLoading && !error && !hasSessions ? (
            <div className="safety-history-empty-state">
              <span>첫 안전 선택을 기다리고 있어요</span>
              <strong>아직 완료한 안전 대처 훈련이 없어요</strong>
              <p>훈련을 마치면 위험한 순간에 어떤 선택을 했는지 이곳에서 다시 볼 수 있습니다.</p>
            </div>
          ) : null}
          {!isLoading && !error ? sessions.map((session) => {
            const isSelected = selectedSession?.sessionId === session.sessionId;
            return (
              <button
                className={`safety-history-card ${isSelected ? 'is-selected' : ''}`}
                type="button"
                key={session.sessionId}
                onClick={() => onSelect(session)}
              >
                <div>
                  <span>{formatHistoryDate(session.completedAt)}</span>
                  <strong>{session.scenarioTitle || '안전 대처 훈련'}</strong>
                  <p>{readableText(session.feedbackSummary, '위험한 상황에서 나를 지키는 선택을 연습했습니다.')}</p>
                </div>
                <div className="safety-history-card-meta">
                  <em>{getSafetyTypeLabel(session.category)}</em>
                  <strong>{session.score ?? 0}점</strong>
                  {session.totalCount ? <span>{session.correctCount ?? 0}/{session.totalCount}</span> : null}
                </div>
              </button>
            );
          }) : null}
        </div>

        <aside className="safety-history-preview">
          <div className="safety-history-preview-score">
            <span>{getSafetyTypeLabel(selectedSession?.category)}</span>
            <strong>{hasSessions ? `${detail?.score ?? selectedSession?.score ?? 0}점` : '-'}</strong>
          </div>
          <h2>{selectedSession?.scenarioTitle || detail?.title || (hasSessions ? '안전 대처 훈련' : '첫 안전 훈련을 시작해 볼까요')}</h2>
          <p>{readableText(detail?.feedback?.summary || detail?.feedback || selectedSession?.feedbackSummary, hasSessions ? '상세 기록에서 선택한 행동을 확인해 보세요.' : '훈련을 완료하면 안전한 선택과 다시 볼 선택이 여기에 표시됩니다.')}</p>

          {isLoading ? <div className="safety-history-preview-state">기록 목록을 불러오는 중입니다.</div> : null}
          {!isLoading && detailStatus === 'idle' && hasSessions ? <div className="safety-history-preview-state">기록을 선택하면 상세 내용이 표시됩니다.</div> : null}
          {!isLoading && !hasSessions ? (
            <div className="safety-history-preview-state safety-history-empty-preview">
              <span>안전 대처 훈련을 마치면 점수, 선택한 행동, 다음 연습 포인트를 한 번에 볼 수 있어요.</span>
            </div>
          ) : null}
          {!isLoading && detailStatus === 'loading' ? <div className="safety-history-preview-state">상세 기록을 불러오는 중입니다.</div> : null}
          {!isLoading && detailStatus === 'error' ? (
            <div className="safety-history-preview-state is-error">
              <span>{detailError}</span>
              <button type="button" onClick={loadSelectedDetail}>
                다시 불러오기
              </button>
            </div>
          ) : null}
          {!isLoading && detailStatus === 'ready' ? (
            <>
              {detail?.latestSceneImageUrl ? (
                <img className="safety-history-preview-image" src={detail.latestSceneImageUrl} alt={detail.latestSceneImageAlt || ''} />
              ) : null}
              {previewActions.length > 0 ? (
                <div className="safety-history-preview-actions">
                  {previewActions.map((action, index) => (
                    <div className={action.correct ? 'is-correct' : 'is-wrong'} key={`${action.sceneId ?? 'scene'}-${index}`}>
                      <span>{action.correct ? '나를 지키는 선택' : '다시 볼 선택'}</span>
                      <p>{action.selectedChoice || action.situationText}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </>
          ) : null}
          <button
            className="safety-history-detail-button"
            type="button"
            onClick={hasSessions ? onDetail : onStart}
            disabled={(hasSessions && !selectedSession?.sessionId) || isLoading}
          >
            {hasSessions ? '선택 행동 자세히 보기' : '첫 안전 훈련 시작하기'}
          </button>
        </aside>
      </div>
    </section>
  );
}

function SafetyHistoryDetail({ sessionId, summary, onBack, onRetry }) {
  const [detail, setDetail] = useState(null);
  const [status, setStatus] = useState(sessionId ? 'loading' : 'error');
  const [error, setError] = useState(sessionId ? '' : '훈련 기록을 찾을 수 없습니다.');
  const score = detail?.score ?? summary?.score ?? 0;
  const correctCount = detail?.choiceSummary?.correctCount ?? summary?.correctCount ?? 0;
  const totalCount = detail?.choiceSummary?.totalCount ?? summary?.totalCount ?? detail?.actions?.length ?? 0;
  const actions = detail?.actions || [];
  const feedbackSummary = readableText(detail?.feedback?.summary || detail?.feedback || summary?.feedbackSummary, '위험한 상황에서 나를 지키는 선택을 연습했습니다.');
  const feedbackDetail = readableText(detail?.feedback?.detailText || detail?.effectText, '상황을 다시 보며 어떤 행동이 안전했는지 확인해 보세요.');

  const loadDetail = async () => {
    if (!sessionId) {
      setStatus('error');
      setError('훈련 기록을 찾을 수 없습니다.');
      return;
    }

    setStatus('loading');
    setError('');

    try {
      setDetail(await safetyTrainingApi.getSafetySessionDetail(sessionId));
      setStatus('ready');
    } catch (requestError) {
      setError(getErrorMessage(requestError, '상세 기록을 불러오지 못했습니다.'));
      setStatus('error');
    }
  };

  useEffect(() => {
    loadDetail();
  }, [sessionId]);

  return (
    <TrainingShell fullScreen>
      <section className="safety-history-detail-shell">
        <button className="safety-history-back" type="button" onClick={onBack} aria-label="안전 대처 기록으로 돌아가기">
          ‹
        </button>
        <header className="safety-history-detail-header">
          <span>{getSafetyTypeLabel(summary?.category)}</span>
          <h1>{summary?.scenarioTitle || detail?.title || '안전 대처 훈련'}</h1>
          <p>{feedbackSummary}</p>
        </header>

        <div className="safety-history-detail-layout">
          <aside className="safety-history-detail-score">
            <div>
              <strong>{score}</strong>
              <span>점</span>
            </div>
            <p>
              {totalCount}개 상황 중 {correctCount}개 안전 선택
            </p>
            {detail?.latestSceneImageUrl ? (
              <img src={detail.latestSceneImageUrl} alt={detail.latestSceneImageAlt || ''} />
            ) : null}
          </aside>

          <div className="safety-history-review">
            <section className="safety-history-action-list" aria-label="지난 안전 선택">
              {status === 'loading' ? <LoadingBlock /> : null}
              {status === 'error' ? <ErrorBlock message={error} onRetry={loadDetail} /> : null}
              {status === 'ready' && actions.length > 0 ? (
                actions.map((action, index) => (
                  <article className={`safety-history-action ${action.correct ? 'is-correct' : 'is-wrong'}`} key={`${action.sceneId ?? 'scene'}-${index}`}>
                    <div className="safety-history-action-head">
                      <span>{index + 1}</span>
                      <em>{action.correct ? '나를 지키는 선택' : '다시 볼 선택'}</em>
                    </div>
                    <h2>{action.situationText}</h2>
                    <p>{action.selectedChoice || '선택 기록이 없습니다.'}</p>
                  </article>
                ))
              ) : null}
              {status === 'ready' && actions.length === 0 ? (
                <div className="safety-history-empty-action">선택 기록을 불러오면 여기에 표시됩니다.</div>
              ) : null}
            </section>

            <section className="safety-history-coaching">
              <article>
                <span>AI 피드백</span>
                <p>{feedbackSummary}</p>
              </article>
              <article>
                <span>다음 연습 포인트</span>
                <p>{feedbackDetail}</p>
              </article>
            </section>
          </div>
        </div>

        <div className="safety-history-detail-actions">
          <button className="secondary-action" type="button" onClick={onBack}>
            목록으로
          </button>
          <button type="button" onClick={onRetry}>
            다시 연습하기
          </button>
        </div>
      </section>
    </TrainingShell>
  );
}

function SocialHistoryList({ sessions, selectedSession, onBack, onSelect, onDetail, onStart, isLoading = false, error = '', onRetry }) {
  const latestSession = sessions[0];
  const totalScore = sessions.reduce((sum, session) => sum + (session.score ?? session.accuracyRate ?? 0), 0);
  const averageScore = sessions.length > 0 ? Math.round(totalScore / sessions.length) : 0;
  const hasSessions = sessions.length > 0;
  const [detail, setDetail] = useState(null);
  const [detailStatus, setDetailStatus] = useState(selectedSession?.sessionId ? 'loading' : 'idle');
  const [detailError, setDetailError] = useState('');
  const previewLogs = detail?.dialogLogs?.slice(-3) || [];

  const loadSelectedDetail = async () => {
    if (!selectedSession?.sessionId) {
      setDetail(null);
      setDetailStatus('idle');
      return;
    }

    setDetailStatus('loading');
    setDetailError('');

    try {
      setDetail(await socialTrainingApi.getSocialSessionDetail(selectedSession.sessionId));
      setDetailStatus('ready');
    } catch (requestError) {
      setDetail(null);
      setDetailError(getErrorMessage(requestError, '상세 기록을 불러오지 못했습니다.'));
      setDetailStatus('error');
    }
  };

  useEffect(() => {
    loadSelectedDetail();
  }, [selectedSession?.sessionId]);

  return (
    <section className="social-history-shell">
      <button className="social-history-back" type="button" onClick={onBack} aria-label="훈련 이력 선택으로 돌아가기">
        ‹
      </button>
      <header className="social-history-header">
        <span>사회성 훈련 기록</span>
        <h1>상황별 대화 습관을 다시 확인해요</h1>
        <p>지난 대화를 보며 잘한 표현, 다시 연습할 표현, 다음에 쓸 말을 한 화면에서 볼 수 있습니다.</p>
      </header>

      <div className="social-history-summary">
        <article>
          <span>최근 점수</span>
          <strong>{isLoading || !hasSessions ? '-' : `${latestSession?.score ?? 0}점`}</strong>
        </article>
        <article>
          <span>평균 점수</span>
          <strong>{isLoading || !hasSessions ? '-' : `${averageScore}점`}</strong>
        </article>
        <article>
          <span>훈련 횟수</span>
          <strong>{isLoading ? '-' : sessions.length}회</strong>
        </article>
      </div>

      <div className="social-history-layout">
        <div className="social-history-list" aria-label="사회성 훈련 기록" aria-busy={isLoading}>
          {isLoading ? <LoadingBlock /> : null}
          {error ? <ErrorBlock message={error} onRetry={onRetry} /> : null}
          {!isLoading && !error && !hasSessions ? (
            <div className="social-history-empty-state">
              <span>첫 기록을 기다리고 있어요</span>
              <strong>아직 완료한 사회성 훈련이 없어요</strong>
              <p>훈련을 마치면 대화 기록과 AI 피드백이 이곳에 차곡차곡 쌓입니다.</p>
            </div>
          ) : null}
          {!isLoading && !error ? sessions.map((session) => {
            const isSelected = selectedSession?.sessionId === session.sessionId;
            return (
              <button
                className={`social-history-card ${isSelected ? 'is-selected' : ''}`}
                type="button"
                key={session.sessionId}
                onClick={() => onSelect(session)}
              >
                <div>
                  <span>{formatHistoryDate(session.completedAt)}</span>
                  <strong>{session.scenarioTitle || '사회성 훈련'}</strong>
                  <p>{readableText(session.feedbackSummary, '상황에 맞는 표현을 차분하게 이어갔습니다.')}</p>
                </div>
                <div className="social-history-card-meta">
                  <em>{getSocialScoreTypeLabel(session.scoreType)}</em>
                  <strong>{session.score ?? 0}점</strong>
                </div>
              </button>
            );
          }) : null}
        </div>

        <aside className="social-history-preview">
          <div className="social-history-preview-score">
            <span>{getSocialScoreTypeLabel(detail?.scoreType)}</span>
            <strong>{hasSessions ? `${detail?.score ?? selectedSession?.score ?? 0}점` : '-'}</strong>
          </div>
          <h2>{selectedSession?.scenarioTitle || (hasSessions ? '사회성 훈련' : '첫 훈련을 시작해 볼까요')}</h2>
          <p>{readableText(detail?.feedback?.summary || detail?.feedback || selectedSession?.feedbackSummary, hasSessions ? 'AI 피드백을 확인해 보세요.' : '상황별 대화를 연습하면 여기에 복습할 내용이 표시됩니다.')}</p>
          {isLoading ? <div className="social-history-preview-state">기록 목록을 불러오는 중입니다.</div> : null}
          {!isLoading && detailStatus === 'idle' && hasSessions ? <div className="social-history-preview-state">기록을 선택하면 상세 내용이 표시됩니다.</div> : null}
          {!isLoading && !hasSessions ? (
            <div className="social-history-preview-state social-history-empty-preview">
              <span>대화 연습을 완료하면 점수, 대화 흐름, 다음 연습 포인트를 한 번에 볼 수 있어요.</span>
            </div>
          ) : null}
          {!isLoading && detailStatus === 'loading' ? <div className="social-history-preview-state">상세 기록을 불러오는 중입니다.</div> : null}
          {!isLoading && detailStatus === 'error' ? (
            <div className="social-history-preview-state is-error">
              <span>{detailError}</span>
              <button type="button" onClick={loadSelectedDetail}>
                다시 불러오기
              </button>
            </div>
          ) : null}
          {!isLoading && detailStatus === 'ready' ? (
            <div className="social-history-preview-dialogues">
              {previewLogs.map((log, index) => (
                <div className={`social-history-bubble ${log.speaker === 'USER' ? 'is-user' : 'is-partner'}`} key={`${log.turnNo ?? 'turn'}-${log.speaker}-${index}`}>
                  <span>{log.speaker === 'USER' ? '나' : '상대'}</span>
                  {log.content}
                </div>
              ))}
            </div>
          ) : null}
          <button
            className="social-history-detail-button"
            type="button"
            onClick={hasSessions ? onDetail : onStart}
            disabled={(hasSessions && !selectedSession?.sessionId) || isLoading}
          >
            {hasSessions ? '자세히 복습하기' : '첫 사회성 훈련 시작하기'}
          </button>
        </aside>
      </div>
    </section>
  );
}

function SocialHistoryDetail({ sessionId, summary, onBack, onRetry }) {
  const [detail, setDetail] = useState(null);
  const [status, setStatus] = useState(sessionId ? 'loading' : 'error');
  const [error, setError] = useState(sessionId ? '' : '훈련 기록을 찾을 수 없습니다.');
  const score = detail?.score ?? summary?.score ?? summary?.accuracyRate ?? 0;
  const logs = detail?.dialogLogs || [];

  const loadDetail = async () => {
    if (!sessionId) {
      setStatus('error');
      setError('훈련 기록을 찾을 수 없습니다.');
      return;
    }

    setStatus('loading');
    setError('');

    try {
      setDetail(await socialTrainingApi.getSocialSessionDetail(sessionId));
      setStatus('ready');
    } catch (requestError) {
      setError(getErrorMessage(requestError, '상세 기록을 불러오지 못했습니다.'));
      setStatus('error');
    }
  };

  useEffect(() => {
    loadDetail();
  }, [sessionId]);

  return (
    <TrainingShell fullScreen>
      <section className="social-history-detail-shell">
        <button className="social-history-back" type="button" onClick={onBack} aria-label="사회성 훈련 기록으로 돌아가기">
          ‹
        </button>
        <header className="social-history-detail-header">
          <span>{formatHistoryDate(summary?.completedAt)}</span>
          <h1>{summary?.scenarioTitle || '사회성 훈련 복습'}</h1>
          <p>{readableText(detail?.feedback?.summary || detail?.feedback || summary?.feedbackSummary, '지난 대화의 AI 피드백을 확인해 보세요.')}</p>
        </header>

        <div className="social-history-detail-layout">
          <aside className="social-history-detail-score">
            <em>{getSocialScoreTypeLabel(detail?.scoreType)}</em>
            <div>
              <strong>{score}</strong>
              <span>점</span>
            </div>
            <p>대화 {logs.length}턴 복습</p>
          </aside>

          <div className="social-history-review">
            <section className="social-history-dialogue-list" aria-label="지난 대화 내용">
              {status === 'loading' ? <LoadingBlock /> : null}
              {status === 'error' ? <ErrorBlock message={error} onRetry={loadDetail} /> : null}
              {status === 'ready' && logs.length > 0 ? (
                logs.map((log, index) => (
                  <article className={`social-history-detail-bubble ${log.speaker === 'USER' ? 'is-user' : 'is-partner'}`} key={`${log.turnNo ?? 'turn'}-${log.speaker}-${index}`}>
                    <span>{log.speaker === 'USER' ? '내 말' : '상대방'}</span>
                    <p>{log.content}</p>
                  </article>
                ))
              ) : null}
              {status === 'ready' && logs.length === 0 ? (
                <div className="social-history-empty-dialogue">대화 기록을 불러오면 여기에 표시됩니다.</div>
              ) : null}
            </section>

            <section className="social-history-coaching">
              <article>
                <span>AI 피드백</span>
                <p>{readableText(detail?.feedback?.summary || detail?.feedback || summary?.feedbackSummary, '상황에 맞는 표현을 차분하게 이어갔습니다.')}</p>
              </article>
              <article>
                <span>상세 코칭</span>
                <p>{readableText(detail?.feedback?.detailText, '대화 내용을 다시 보며 어떤 표현이 좋았는지 확인해 보세요.')}</p>
              </article>
            </section>
          </div>
        </div>

        <div className="social-history-detail-actions">
          <button className="secondary-action" type="button" onClick={onBack}>
            목록으로
          </button>
          <button type="button" onClick={onRetry}>
            다시 연습하기
          </button>
        </div>
      </section>
    </TrainingShell>
  );
}

function DocumentHistoryList({ sessions, selectedSession, onBack, onSelect, onDetail, onStart, isLoading = false, error = '', onRetry }) {
  const latestSession = sessions[0];
  const totalScore = sessions.reduce((sum, session) => sum + (session.score ?? session.accuracyRate ?? 0), 0);
  const averageScore = sessions.length > 0 ? Math.round(totalScore / sessions.length) : 0;
  const totalCorrect = sessions.reduce((sum, session) => sum + (session.correctCount || 0), 0);
  const totalQuestions = sessions.reduce((sum, session) => sum + (session.totalCount || 0), 0);
  const hasSessions = sessions.length > 0;

  return (
    <section className="document-history-shell">
      <button className="document-history-back" type="button" onClick={onBack} aria-label="훈련 기록 선택으로 돌아가기">
        ‹
      </button>
      <header className="document-history-header">
        <span>문서 이해 기록</span>
        <h1>어떤 문서를 잘 읽었는지 확인해요</h1>
        <p>지난 문제를 다시 보며 자주 틀린 문서 유형과 필요한 정보를 찾는 연습을 이어갈 수 있습니다.</p>
      </header>
      <div className="document-history-summary">
        <article>
          <span>최근 점수</span>
          <strong>{isLoading || !hasSessions ? '-' : `${latestSession?.score ?? 0}점`}</strong>
        </article>
        <article>
          <span>평균 점수</span>
          <strong>{isLoading || !hasSessions ? '-' : `${averageScore}점`}</strong>
        </article>
        <article>
          <span>누적 정답</span>
          <strong>
            {isLoading || !hasSessions ? '-' : `${totalCorrect}/${totalQuestions || '-'}`}
          </strong>
        </article>
      </div>
      <div className="document-history-list" aria-label="문서 이해 훈련 기록" aria-busy={isLoading}>
        {isLoading ? <LoadingBlock /> : null}
        {error ? <ErrorBlock message={error} onRetry={onRetry} /> : null}
        {!isLoading && !error && !hasSessions ? (
          <div className="document-history-empty-state">
            <span>첫 문서 풀이를 기다리고 있어요</span>
            <strong>아직 완료한 문서 이해 훈련이 없어요</strong>
            <p>훈련을 마치면 읽은 문서 유형, 정답 근거, 다시 볼 문제가 이곳에 정리됩니다.</p>
          </div>
        ) : null}
        {!isLoading && !error ? sessions.map((session) => {
          const isSelected = selectedSession?.sessionId === session.sessionId;
          return (
            <button
              className={`document-history-card ${isSelected ? 'is-selected' : ''}`}
              type="button"
              key={session.sessionId}
                onClick={() => onSelect(session)}
              >
                <div>
                  <span>{formatHistoryDate(session.completedAt)}</span>
                  <strong>{readableText(session.scenarioTitle, '문서 이해 훈련')}</strong>
                  <p>{readableText(session.feedbackSummary, '정답 근거와 읽기 흐름을 다시 확인해 보세요.')}</p>
                </div>
                <div className="document-history-card-meta">
                  <em>{session.playedLevel || 1}단계</em>
                <strong>{session.score ?? 0}점</strong>
              </div>
            </button>
          );
        }) : null}
      </div>
      <button
        className="document-history-detail-button"
        type="button"
        onClick={hasSessions ? onDetail : onStart}
        disabled={(hasSessions && !selectedSession?.sessionId) || isLoading}
      >
        {hasSessions ? '선택한 기록 자세히 보기' : '첫 문서 이해 훈련 시작하기'}
      </button>
    </section>
  );
}

function DocumentHistoryDetail({ sessionId, summary, onBack, onRetry }) {
  const [detail, setDetail] = useState(null);
  const [status, setStatus] = useState(sessionId ? 'loading' : 'error');
  const [error, setError] = useState(sessionId ? '' : '훈련 기록을 찾을 수 없습니다.');
  const score = detail?.score ?? summary?.score ?? 0;
  const correctCount = detail?.answerSummary?.correctCount ?? summary?.correctCount ?? 0;
  const totalCount = detail?.answerSummary?.totalCount ?? summary?.totalCount ?? 0;
  const answers = detail?.answers || [];
  const message =
    score >= 80
      ? '문서의 핵심 정보를 잘 찾았습니다.'
      : score >= 60
        ? '문서 속 시간, 장소, 해야 할 일을 다시 확인해 보세요.'
        : '짧은 문장부터 천천히 읽고 답을 찾는 연습이 필요합니다.';

  const loadDetail = async () => {
    if (!sessionId) {
      setStatus('error');
      setError('훈련 기록을 찾을 수 없습니다.');
      return;
    }

    setStatus('loading');
    setError('');

    try {
      setDetail(await documentTrainingApi.getDocumentSessionDetail(sessionId));
      setStatus('ready');
    } catch (requestError) {
      setError(getErrorMessage(requestError, '상세 기록을 불러오지 못했습니다.'));
      setStatus('error');
    }
  };

  useEffect(() => {
    loadDetail();
  }, [sessionId]);

  return (
    <TrainingShell fullScreen>
      <section className="document-history-detail-shell">
        <button className="document-result-back" type="button" onClick={onBack}>
          ←
        </button>
        <header className="document-history-detail-header">
          <span>문서 이해 상세 기록</span>
          <h1>{readableText(summary?.scenarioTitle, '문서 이해 훈련')}</h1>
          <p>{message}</p>
        </header>
        <div className="document-history-detail-layout">
          <aside className="document-history-detail-score">
            <div>
              <strong>{score}</strong>
              <span>점</span>
            </div>
            <p>
              {totalCount}문제 중 {correctCount}문제 정답
            </p>
            <em>{summary?.playedLevel || 1}단계</em>
          </aside>
          <div className="document-history-answer-list" aria-busy={status === 'loading'}>
            {status === 'loading' ? <LoadingBlock /> : null}
            {status === 'error' ? <ErrorBlock message={error} onRetry={loadDetail} /> : null}
            {status === 'ready' && answers.length > 0
              ? answers.map((answer, index) => (
                <article className={`document-history-answer ${answer.correct ? 'is-correct' : 'is-wrong'}`} key={answer.questionId}>
                  <div className="document-history-answer-head">
                    <span>{index + 1}</span>
                    <em>문제</em>
                    <strong>{answer.correct ? '정답' : '복습 필요'}</strong>
                  </div>
                  <h2>{answer.questionText}</h2>
                  <dl>
                    <div>
                      <dt>내가 고른 답</dt>
                      <dd>{answer.userAnswer || '-'}</dd>
                    </div>
                    <div>
                      <dt>정답</dt>
                      <dd>{answer.correctAnswer || '-'}</dd>
                    </div>
                  </dl>
                  <p>{answer.explanation}</p>
                </article>
              ))
              : null}
            {status === 'ready' && answers.length === 0 ? <EmptyBlock message="상세 기록이 없습니다." /> : null}
          </div>
        </div>
        <div className="document-history-detail-actions">
          <button type="button" onClick={onRetry}>
            다시 연습하기
          </button>
          <button type="button" className="secondary-action" onClick={onBack}>
            기록 목록
          </button>
        </div>
      </section>
    </TrainingShell>
  );
}
function formatHistoryDate(value) {
  if (!value) {
    return '00.00.00';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '00.00.00';
  }

  return [
    String(date.getFullYear()).slice(-2),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('.');
}
