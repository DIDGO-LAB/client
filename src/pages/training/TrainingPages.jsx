/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { documentTrainingApi, safetyTrainingApi, socialTrainingApi, trainingProgressApi } from '../../api';
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

const toDialogLogs = (dialogues) =>
  dialogues.map((dialogue, index) => ({
    turnNo: index + 1,
    speaker: dialogue.speaker,
    speakerName: dialogue.speakerName,
    content: dialogue.message,
  }));

const safetyCategories = [
  { category: 'DAILY_SAFETY', label: '소중한 나\n지키기', description: '일상에서 나를 보호하는 훈련' },
  { category: 'WORKPLACE_SAFETY', label: '뽀득뽀득 건강\n지키기', description: '직장과 생활에서 경계를 지키는 훈련' },
  { category: 'COMMUTE_SAFETY', label: '안전하게\n씩씩하게\n걷기', description: '길을 건너고 이동할 때 필요한 안전 훈련' },
];

const safetyTypeLabels = {
  DAILY_SAFETY: '나를 지키기',
  WORKPLACE_SAFETY: '경계 지키기',
  COMMUTE_SAFETY: '이동 안전',
};

const getSafetyCategoryInfo = (category) =>
  safetyCategories.find((item) => item.category === category) || safetyCategories[0];

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

const getErrorMessage = (error, fallback) => error?.message || fallback;

function TrainingShell({ activeKey = 'training', fullScreen = false, children }) {
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
  return <div className="training-status">불러오는 중입니다.</div>;
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
        <PageHeader compact onBack={() => navigate('/training')} />
        <button className="social-help-button" type="button" aria-label="도움말">
          <strong>?</strong>
        </button>
        <div className="social-job-shell">
          <header className="social-job-intro">
            <span>사회성 훈련</span>
            <h1>어떤 직무 상황을 먼저 연습할까요?</h1>
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
      </section>
    </TrainingShell>
  );
}

export function SocialScenarioPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const jobType = location.state?.jobType || 'OFFICE';
  const [scenarios, setScenarios] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

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

  return (
    <TrainingShell fullScreen>
      <section className="social-screen social-scenario-screen">
        <PageHeader compact onBack={() => navigate('/training/social/job')} />
        {status === 'loading' ? <LoadingBlock /> : null}
        {status === 'error' ? <ErrorBlock message={error} onRetry={loadScenarios} /> : null}
        {status === 'ready' && scenarios.length === 0 ? <EmptyBlock message="선택할 수 있는 시나리오가 없습니다." /> : null}
        {status === 'ready' && scenarios.length > 0 ? (
          <div className="social-scenario-shell">
            <header className="social-scenario-intro">
              <span>{getSocialJobLabel(jobType)} 생활</span>
              <h1>어떤 상황을 연습할까요?</h1>
              <p>지금 나에게 필요하거나 걱정되는 상황을 하나 골라보세요.</p>
            </header>
            <div className="scenario-list social-scenario-list">
              {scenarios.slice(0, 3).map((scenario, index) => (
                <button
                  className="scenario-card social-scenario-card"
                  type="button"
                  key={scenario.scenarioId}
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
              ))}
            </div>
          </div>
        ) : null}
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
  const [error, setError] = useState('');

  const visibleDialogues = useMemo(() => scenario?.dialogues?.slice(0, step + 1) || [], [scenario, step]);
  const currentDialogue = visibleDialogues.at(-1);
  const isLastStep = scenario?.dialogues ? step >= scenario.dialogues.length - 1 : false;

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
      setScenario(scenarioDetail);
      setSession(sessionData);
      setStep(0);
      setStatus('ready');
    } catch (requestError) {
      setError(getErrorMessage(requestError, '사회성 훈련을 시작하지 못했습니다.'));
      setStatus('error');
    }
  };

  useEffect(() => {
    loadSession();
  }, [scenarioId]);

  const completeSession = async () => {
    if (!session?.sessionId) {
      return;
    }

    setStatus('saving');
    setError('');

    try {
      const dialogLogs = toDialogLogs(visibleDialogues);
      const result = await socialTrainingApi.completeSocialSession(session.sessionId, {
        dialogLogs,
      });
      navigate('/training/social/result', {
        state: {
          sessionId: session.sessionId,
          result,
          scenario,
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
      <PageHeader compact onBack={() => navigate('/training/social/scenarios', { state: { jobType } })} />
      {status === 'loading' ? <LoadingBlock /> : null}
      {status === 'error' ? <ErrorBlock message={error} onRetry={loadSession} /> : null}
      {(status === 'ready' || status === 'saving') && scenario ? (
        <section className="training-stage social-stage social-session-stage">
          <p className="social-session-brief">
            {scenario.situationText || scenario.description || '상황을 보고 차분하게 대화해 보세요.'}
          </p>
          <div className="social-session-character" aria-hidden="true">
            <img src={characterImg} alt="" />
          </div>
          {currentDialogue ? (
            <div className="dialogue-panel social-current-dialogue">
              <div className={`dialogue-bubble ${currentDialogue.speaker === 'USER' ? 'is-user' : 'is-partner'}`}>
                <strong>{currentDialogue.speakerName}</strong>
                <span>{currentDialogue.message}</span>
              </div>
            </div>
          ) : null}
          <div className="social-step-indicator" aria-label={`대화 ${step + 1}/${scenario.dialogues?.length || 1}`}>
            {step + 1} / {scenario.dialogues?.length || 1}
          </div>
          {error ? <ErrorBlock message={error} /> : null}
          <div className="social-session-controls">
            <div className="training-actions social-mic-actions">
              {!isLastStep ? (
                <button type="button" onClick={() => setStep((currentStep) => currentStep + 1)} aria-label="음성 녹음 후 다음 대화">
                  <span>녹음하기</span>
                </button>
              ) : (
                <button type="button" onClick={completeSession} disabled={status === 'saving'} aria-label="결과 보기">
                  <span>{status === 'saving' ? '저장 중' : '결과 보기'}</span>
                </button>
              )}
            </div>
          </div>
        </section>
      ) : null}
    </TrainingShell>
  );
}

export function SocialResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const sessionId = location.state?.sessionId;
  const scenario = location.state?.scenario;
  const dialogLogs = location.state?.dialogLogs || [];
  const [result, setResult] = useState(location.state?.result || null);
  const [status, setStatus] = useState(result ? 'ready' : 'loading');
  const [error, setError] = useState('');
  const resultDialogues = dialogLogs.length > 0 ? dialogLogs : [];

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
      <PageHeader compact onBack={() => navigate('/training/social/job')} />
      {status === 'loading' ? <LoadingBlock /> : null}
      {status === 'error' ? <ErrorBlock message={error} onRetry={loadResult} /> : null}
      {status === 'ready' ? (
        <section className="training-result-layout social-result-layout">
          <div className="social-result-left">
            <p className="social-result-situation">
              {scenario?.situationText || scenario?.description || result?.title || '사회성 훈련을 마쳤습니다.'}
            </p>
            <div className="social-result-dialogues">
              {resultDialogues.slice(0, 4).map((dialogue) => (
                <p
                  className={`social-result-bubble ${
                    dialogue.speaker === 'USER' ? 'social-result-bubble-user' : 'social-result-bubble-ai'
                  }`}
                  key={`${dialogue.turnNo}-${dialogue.speaker}`}
                >
                  {dialogue.content}
                </p>
              ))}
            </div>
          </div>
          <aside className="social-result-right">
            <div className="social-result-score">{result?.score ?? 90}점</div>
            <div className="social-result-feedback">
              <strong>AI 피드백</strong>
              <p>{result?.feedback || '필요한 정보를 다시 확인하고 정리하는 흐름이 좋았습니다.'}</p>
            </div>
            <div className="social-result-recommendation">
              <strong>추천 답변</strong>
              <p>필요한 내용을 다시 한번 확인하고 진행하겠습니다.</p>
              <img src={characterImg} alt="" />
            </div>
            <button type="button" onClick={() => navigate('/training/social/job')}>
              다시 선택하기
            </button>
          </aside>
        </section>
      ) : null}
    </TrainingShell>
  );
}
export function SafetyTypePage() {
  const navigate = useNavigate();

  return (
    <TrainingShell fullScreen>
      <PageHeader compact onBack={() => navigate('/training')} />
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
        onBack={() => navigate('/training')}
      />
      {status === 'loading' ? <LoadingBlock /> : null}
      {status === 'error' ? <ErrorBlock message={error} onRetry={loadScenarios} /> : null}
      {status === 'ready' && scenarios.length === 0 ? <EmptyBlock message="선택할 수 있는 시나리오가 없습니다." /> : null}
      {status === 'ready' && scenarios.length > 0 ? (
        <section className="safety-scenario-shell">
          <aside className="safety-scenario-intro">
            <span>안전 대처 훈련</span>
            <h1>연습할 안전 상황을 바로 선택해요</h1>
            <p>카테고리를 먼저 고르지 않고, 실제로 마주칠 수 있는 상황을 바로 선택해 훈련을 시작합니다.</p>
          </aside>
          <div className="safety-scenario-panel">
            <header className="safety-scenario-panel-header">
              <span>전체 안전 상황</span>
              <strong>{scenarios.length}개 상황</strong>
            </header>
            <div className="scenario-list safety-scenario-list">
              {scenarios.map((scenario, index) => (
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
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </TrainingShell>
  );
}

export function SafetySessionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const category = location.state?.category || 'COMMUTE_SAFETY';
  const scenarioId = location.state?.scenarioId;
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
  const selectChoice = async (choiceId) => {
    if (!sessionId || !scene) {
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
        navigate('/training/safety/result', { state: { sessionId, result: data.result } });
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
    if (!sessionId || !scene) {
      return;
    }

    setStatus('saving');
    setError('');

    try {
      const data = await safetyTrainingApi.goToNextSafetyScene(sessionId, {
        sceneId: scene.sceneId,
      });

      if (data.completed) {
        navigate('/training/safety/result', { state: { sessionId, result: data.result } });
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
  return (
    <TrainingShell fullScreen>
      <PageHeader
        compact
        className="safety-session-back"
        onBack={() => navigate('/training/safety/scenarios')}
      />
      {status === 'loading' ? <LoadingBlock /> : null}
      {status === 'error' ? <ErrorBlock message={error} onRetry={loadSession} /> : null}
      {scene && status !== 'loading' && status !== 'error' ? (
        <section className="training-stage safety-stage safety-session-stage">
          <img className="safety-stage-image" src={scene.imageUrl} alt={scene.imageAlt || ''} />
          {scene.questionText ? <div className="safety-question-bubble">{scene.questionText}</div> : null}
          <div className="safety-caption">
            <strong>{scene.screenInfo || scene.title || '\uC548\uC804 \uD6C8\uB828'}</strong>
            <span>{scene.situationText}</span>
          </div>
          <div className="safety-choice-overlay">
            {hasChoices
              ? scene.choices?.map((choice) => (
                  <button
                    type="button"
                    key={choice.choiceId}
                    onClick={() => selectChoice(choice.choiceId)}
                    disabled={status === 'saving'}
                  >
                    {choice.text}
                  </button>
                ))
              : (
                <button type="button" className="safety-continue-button" onClick={goNextScene} disabled={status === 'saving'}>
                  다음
                </button>
              )}
          </div>
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
    if (!result) {
      loadResult();
    }
  }, [sessionId]);
  return (
    <TrainingShell fullScreen>
      <PageHeader compact className="safety-result-back" onBack={() => navigate('/training/safety/scenarios')} />
      {status === 'loading' ? <LoadingBlock /> : null}
      {status === 'error' ? <ErrorBlock message={error} onRetry={loadResult} /> : null}
      {status === 'ready' ? (
        <section className={`safety-result-layout ${result?.correct ? 'is-correct' : 'is-wrong'}`}>
          <img
            className="safety-result-image"
            src={result?.feedbackImageUrl || result?.latestSceneImageUrl}
            alt={result?.feedbackImageAlt || result?.latestSceneImageAlt || ''}
          />
          <div className="safety-result-content">
            <div className="safety-result-summary">
              <strong>{result?.title || (result?.correct ? '\uC798\uD588\uC5B4\uC694!' : '\uB2E4\uC2DC \uC0DD\uAC01\uD574\uBCFC\uAE4C\uC694?')}</strong>
              <p>{result?.resultText || result?.feedback}</p>
              <span>{result?.effectText || result?.feedback}</span>
            </div>
            <button type="button" onClick={() => navigate('/training/safety/scenarios')}>
              {'\uB2E4\uC2DC \uC120\uD0DD\uD558\uAE30'}
            </button>
          </div>
        </section>
      ) : null}
    </TrainingShell>
  );
}
export function DocumentStartPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

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
  const levels = Array.from({ length: Math.max(highestLevel, 1) }, (_, index) => index + 1);

  return (
    <TrainingShell fullScreen>
      <PageHeader
        compact
        onBack={() => navigate('/training')}
      />
      {status === 'loading' ? <LoadingBlock /> : null}
      {status === 'error' ? <ErrorBlock message={error} onRetry={loadProgress} /> : null}
      {status === 'ready' ? (
        <section className="document-start-shell">
          <aside className="document-start-intro">
            <span>문서 이해 훈련</span>
            <h2>읽고, 찾고, 확인하는 연습</h2>
            <p>안내문에서 중요한 문장을 고르고 질문에 답하며 필요한 정보를 찾는 흐름을 익힙니다.</p>
            <div className="document-progress-card">
              <strong>{currentLevel}단계</strong>
              <span>추천 단계</span>
            </div>
          </aside>
          <div className="document-level-panel">
            <header className="document-level-panel-header">
              <span>선택 가능한 단계</span>
              <strong>{levels.length}개 단계</strong>
            </header>
            <div className="option-grid document-level-grid">
              {levels.map((level) => (
                <button
                  className={`option-card document-option ${level === currentLevel ? 'is-current' : ''}`}
                  type="button"
                  key={level}
                  onClick={() => navigate('/training/document/session', { state: { level } })}
                >
                  <div className="document-option-copy">
                    <strong>{level}단계</strong>
                    <span>{level === currentLevel ? '지금 이어서 진행하기 좋은 단계입니다.' : '이전에 열어둔 단계를 다시 연습합니다.'}</span>
                  </div>
                  <em>{level === currentLevel ? '추천' : '복습'}</em>
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </TrainingShell>
  );
}

export function DocumentSessionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const level = location.state?.level || 1;
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const loadSession = async () => {
    setStatus('loading');
    setError('');

    try {
      const data = await documentTrainingApi.startDocumentSession({ level });
      setSession(data);
      setAnswers({});
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
  const allAnswered = questions.length > 0 && questions.every((question) => answers[question.questionId]);

  const submitAnswers = async () => {
    if (!session?.sessionId || !allAnswered) {
      return;
    }

    setStatus('saving');
    setError('');

    try {
      const result = await documentTrainingApi.submitDocumentAnswers(session.sessionId, {
        answers: questions.map((question) => ({
          questionId: question.questionId,
          userAnswer: null,
          choiceId: answers[question.questionId],
        })),
      });
      navigate('/training/document/result', {
        state: {
          sessionId: session.sessionId,
          result,
        },
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError, '답변을 제출하지 못했습니다.'));
      setStatus('ready');
    }
  };

  return (
    <TrainingShell>
      <PageHeader
        title="문서 문제 풀기"
        subtitle={`${level}단계 문서를 읽고 답을 골라 주세요.`}
        onBack={() => navigate('/training/document')}
      />
      {status === 'loading' ? <LoadingBlock /> : null}
      {status === 'error' ? <ErrorBlock message={error} onRetry={loadSession} /> : null}
      {(status === 'ready' || status === 'saving') && session ? (
        <section className="document-stage">
          {questions.map((question, index) => (
            <article className="document-question" key={question.questionId}>
              <div className="document-paper">
                <span>{question.title || `문서 ${index + 1}`}</span>
                <p>{question.documentText}</p>
              </div>
              <div className="document-answer-panel">
                <strong>{question.questionText}</strong>
                <div className="document-choice-grid">
                  {question.choices?.map((choice) => (
                    <button
                      className={answers[question.questionId] === choice.choiceId ? 'is-selected' : ''}
                      type="button"
                      key={choice.choiceId}
                      onClick={() =>
                        setAnswers((currentAnswers) => ({
                          ...currentAnswers,
                          [question.questionId]: choice.choiceId,
                        }))
                      }
                    >
                      {choice.text}
                    </button>
                  ))}
                </div>
              </div>
            </article>
          ))}
          {error ? <ErrorBlock message={error} /> : null}
          <div className="training-actions">
            <button type="button" onClick={submitAnswers} disabled={!allAnswered || status === 'saving'}>
              {status === 'saving' ? '제출 중' : '답변 제출'}
            </button>
          </div>
        </section>
      ) : null}
    </TrainingShell>
  );
}

export function DocumentResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const sessionId = location.state?.sessionId;
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

  return (
    <TrainingShell>
      <PageHeader title="훈련 결과" subtitle="오늘의 문서 이해 훈련 결과입니다." onBack={() => navigate('/training/document')} />
      {status === 'loading' ? <LoadingBlock /> : null}
      {status === 'error' ? <ErrorBlock message={error} onRetry={loadResult} /> : null}
      {status === 'ready' ? (
        <ResultPanel
          score={result?.score ?? 0}
          title="문서 이해 훈련을 마쳤어요."
          feedback={`${totalCount}문제 중 ${correctCount}문제를 맞혔습니다.`}
          onRetry={() => navigate('/training/document')}
          onHome={() => navigate('/training')}
        />
      ) : null}
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
          <h1>어떤 새싹이 자랐는지 살펴봐요</h1>
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
              <strong className="history-card-badge">지난 기록</strong>
              <span>{item.label}</span>
              <small>지난 {item.label} 훈련 결과를 확인해요</small>
              <div className={`training-card-illustration training-card-illustration-${item.visual}`} aria-hidden="true">
                <img src={item.thumbnail} alt="" />
              </div>
              <div className="history-card-meta">
                <em>점수와 피드백 확인</em>
                <strong>기록 보기</strong>
              </div>
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

  return (
    <TrainingShell fullScreen>
      <PageHeader compact onBack={() => navigate('/training-history')} />
      {status === 'loading' ? <LoadingBlock /> : null}
      {status === 'error' ? <ErrorBlock message={error} onRetry={loadHistory} /> : null}
      {status === 'ready' && sessions.length === 0 ? <EmptyBlock message={`${selectedLabel} 훈련 이력이 없습니다.`} /> : null}
      {status === 'ready' && sessions.length > 0 ? (
        <section className="history-list-shell">
          <div className="history-list" aria-label={`${selectedLabel} 훈련 이력`}>
            {sessions.map((session) => (
              <button
                className={`history-item ${(selectedSession || sessions[0])?.sessionId === session.sessionId ? 'is-selected' : ''}`}
                type="button"
                key={`${session.trainingType}-${session.sessionId}`}
                onClick={() => setSelectedSession(session)}
              >
                <span>{formatHistoryDate(session.completedAt)}</span>
                <strong>{session.scenarioTitle || session.title || '시나리오 제목'}</strong>
                <em>{session.score ?? session.accuracyRate ?? '-'}점</em>
              </button>
            ))}
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
            상세보기
          </button>
        </section>
      ) : null}
    </TrainingShell>
  );
}

export function TrainingHistoryDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = location.state?.session;
  const selectedType = location.state?.type || session?.trainingType || 'SOCIAL';
  const title = session?.scenarioTitle || session?.title || '시나리오 제목';
  const score = session?.score ?? session?.accuracyRate ?? 0;

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

function ResultPanel({ score, title, feedback, onRetry, onHome }) {
  return (
    <section className="result-panel">
      <div className="result-score">
        <span>{score}</span>
        <small>점</small>
      </div>
      <h2>{title}</h2>
      <p>{feedback}</p>
      <div className="training-actions">
        <button type="button" onClick={onRetry}>
          다시 훈련하기
        </button>
        <button type="button" className="secondary-action" onClick={onHome}>
          훈련 선택
        </button>
      </div>
    </section>
  );
}
