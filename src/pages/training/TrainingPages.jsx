/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { documentTrainingApi, safetyTrainingApi, socialTrainingApi, trainingProgressApi } from '../../api';
import characterImg from '../../assets/Character_JIWOO.png';
import backArrowImg from '../../assets/back_arrow.png';
import Sidebar from '../../components/layout/Sidebar';
import './TrainingPages.css';

const socialJobs = [
  { jobType: 'OFFICE', label: '사무직', description: '회사에서 동료와 대화하는 연습' },
  { jobType: 'LABOR', label: '단순노무직', description: '작업장에서 협력하고 보고하는 연습' },
];

const safetyCategories = [
  { category: 'DAILY_SAFETY', label: '소중한 나\n지키기', description: '일상에서 나를 보호하는 훈련' },
  { category: 'WORKPLACE_SAFETY', label: '뽀득뽀득 건강\n지키기', description: '직장과 생활에서 경계를 지키는 훈련' },
  { category: 'COMMUTE_SAFETY', label: '안전하게\n씩씩하게\n걷기', description: '길을 건너고 이동할 때 필요한 안전 훈련' },
];

const trainingTypes = [
  { type: 'SOCIAL', label: '사회성 키워가기', path: '/training-history/social', visual: 'social' },
  { type: 'SAFETY', label: '안전교육 가이드', path: '/training-history/safety', visual: 'safety' },
  { type: 'DOCUMENT', label: '내용 쏙쏙 파악하기', path: '/training-history/document', visual: 'document' },
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

function PageHeader({ title, subtitle, onBack, compact = false }) {
  return (
    <header className={`training-header ${compact ? 'training-header-compact' : ''}`}>
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
  return <div className="training-status">遺덈윭?ㅻ뒗 以묒엯?덈떎.</div>;
}

function ErrorBlock({ message, onRetry }) {
  return (
    <div className="training-status training-status-error">
      <span>{message}</span>
      {onRetry ? (
        <button type="button" onClick={onRetry}>
          ?ㅼ떆 ?쒕룄
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
      title: '사회성 키워가기',
      description: '',
      tone: 'mint',
      path: '/training/social/job',
      visual: 'social',
    },
    {
      title: '안전교육 가이드',
      description: '',
      tone: 'yellow',
      path: '/training/safety/types',
      visual: 'safety',
    },
    {
      title: '내용 쏙쏙 파악하기',
      description: '',
      tone: 'pink',
      path: '/training/document',
      visual: 'document',
    },
  ];

  return (
    <TrainingShell>
      <PageHeader title="훈련 선택" subtitle="오늘 연습할 훈련을 선택해 주세요." />
      <section className="training-select-grid" aria-label="?덈젴 紐⑸줉">
        {cards.map((card) => (
          <button
            className={`training-select-card training-card-${card.tone}`}
            type="button"
            key={card.title}
            onClick={() => {
              navigate(card.path);
            }}
          >
            <div className={`training-card-illustration training-card-illustration-${card.visual}`} aria-hidden="true">
              <img src={characterImg} alt="" />
            </div>
            <span>{card.title}</span>
            {card.description ? <small>{card.description}</small> : null}
          </button>
        ))}
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
      setError(getErrorMessage(requestError, '吏곷Т瑜??좏깮?섏? 紐삵뻽?듬땲??'));
    } finally {
      setSubmittingJob('');
    }
  };

  return (
    <TrainingShell fullScreen>
      <PageHeader
        compact
        onBack={() => navigate('/training')}
      />
      {error ? <ErrorBlock message={error} /> : null}
      <section className="option-grid social-job-grid">
        {socialJobs.map((job) => (
          <button
            className="option-card social-job-card"
            type="button"
            key={job.jobType}
            onClick={() => selectJob(job.jobType)}
            disabled={Boolean(submittingJob)}
          >
            <strong>{job.label}</strong>
          </button>
        ))}
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
      setError(getErrorMessage(requestError, '?쒕굹由ъ삤瑜?遺덈윭?ㅼ? 紐삵뻽?듬땲??'));
      setStatus('error');
    }
  };

  useEffect(() => {
    loadScenarios();
  }, [jobType]);

  return (
    <TrainingShell fullScreen>
      <PageHeader
        compact
        onBack={() => navigate('/training/social/job')}
      />
      {status === 'loading' ? <LoadingBlock /> : null}
      {status === 'error' ? <ErrorBlock message={error} onRetry={loadScenarios} /> : null}
      {status === 'ready' && scenarios.length === 0 ? <EmptyBlock message="?좏깮?????덈뒗 ?쒕굹由ъ삤媛 ?놁뒿?덈떎." /> : null}
      {status === 'ready' && scenarios.length > 0 ? (
        <section className="scenario-list social-scenario-list">
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
              <span>?곹솴 {index + 1}</span>
              <strong>{scenario.title}</strong>
            </button>
          ))}
        </section>
      ) : null}
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
      setError(getErrorMessage(requestError, '?ы쉶???덈젴???쒖옉?섏? 紐삵뻽?듬땲??'));
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
      const result = await socialTrainingApi.completeSocialSession(session.sessionId, {
        dialogLogs: visibleDialogues.map((dialogue, index) => ({
          turnNo: index + 1,
          speaker: dialogue.speaker,
          content: dialogue.message,
        })),
      });
      navigate('/training/social/result', {
        state: {
          sessionId: session.sessionId,
          result,
        },
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError, '?덈젴 寃곌낵瑜???ν븯吏 紐삵뻽?듬땲??'));
      setStatus('ready');
    }
  };

  return (
    <TrainingShell fullScreen>
      <PageHeader
        compact
        onBack={() => navigate('/training/social/scenarios', { state: { jobType } })}
      />
      {status === 'loading' ? <LoadingBlock /> : null}
      {status === 'error' ? <ErrorBlock message={error} onRetry={loadSession} /> : null}
      {(status === 'ready' || status === 'saving') && scenario ? (
        <section className="training-stage social-stage social-session-stage">
          <div className="social-session-brief">
            {scenario.situationText || scenario.description || '?곹솴??蹂닿퀬 ?뚮쭪寃???듯빐蹂댁꽭??'}
          </div>
          <div className="dialogue-panel">
            {visibleDialogues.map((dialogue, index) => (
              <div
                className={`dialogue-bubble ${dialogue.speaker === 'USER' ? 'is-user' : 'is-partner'}`}
                key={`${dialogue.speaker}-${index}`}
              >
                <strong>{dialogue.speakerName}</strong>
                <span>{dialogue.message}</span>
              </div>
            ))}
          </div>
          {error ? <ErrorBlock message={error} /> : null}
          <div className="training-actions">
            {!isLastStep ? (
              <button type="button" onClick={() => setStep((currentStep) => currentStep + 1)}>
                ?ㅼ쓬 ???
              </button>
            ) : (
              <button type="button" onClick={completeSession} disabled={status === 'saving'}>
                {status === 'saving' ? '저장 중' : '결과 보기'}
              </button>
            )}
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
            <div className="social-result-score">{result?.score ?? 90}점</div>
            <h2>{result?.title || '대화를 잘 마무리했어요.'}</h2>
            <p>{result?.feedback || '상황에 맞는 요청과 확인을 차분하게 이어갔습니다.'}</p>
          </div>
          <aside className="social-result-right">
            <div className="social-result-feedback">
              <strong>AI 피드백</strong>
              <p>{result?.feedback || '필요한 정보를 다시 확인하고 정리하는 흐름이 좋았습니다.'}</p>
            </div>
            <div className="social-result-recommendation">
              <strong>추천 답변</strong>
              <p>필요한 내용을 다시 한번 확인하고 진행하겠습니다.</p>
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
      <PageHeader
        compact
        onBack={() => navigate('/training')}
      />
      <section className="option-grid safety-type-grid">
        {safetyCategories.map((item) => (
          <button
            className="option-card safety-option safety-type-card"
            type="button"
            key={item.category}
            onClick={() => navigate('/training/safety/scenarios', { state: { category: item.category } })}
          >
            <strong>{item.label}</strong>
          </button>
        ))}
      </section>
    </TrainingShell>
  );
}

export function SafetyScenarioPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const category = location.state?.category || 'COMMUTE_SAFETY';
  const [scenarios, setScenarios] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const loadScenarios = async () => {
    setStatus('loading');
    setError('');

    try {
      const data = await safetyTrainingApi.getSafetyScenarios(category);
      setScenarios(Array.isArray(data) ? data : []);
      setStatus('ready');
    } catch (requestError) {
      setError(getErrorMessage(requestError, '?덉쟾?덈젴 ?쒕굹由ъ삤瑜?遺덈윭?ㅼ? 紐삵뻽?듬땲??'));
      setStatus('error');
    }
  };

  useEffect(() => {
    loadScenarios();
  }, [category]);

  return (
    <TrainingShell fullScreen>
      <PageHeader
        compact
        onBack={() => navigate('/training/safety/types')}
      />
      {status === 'loading' ? <LoadingBlock /> : null}
      {status === 'error' ? <ErrorBlock message={error} onRetry={loadScenarios} /> : null}
      {status === 'ready' && scenarios.length === 0 ? <EmptyBlock message="?좏깮?????덈뒗 ?쒕굹由ъ삤媛 ?놁뒿?덈떎." /> : null}
      {status === 'ready' && scenarios.length > 0 ? (
        <section className="scenario-list safety-scenario-list">
          {scenarios.map((scenario) => (
            <button
              className="scenario-card safety-scenario-card"
              type="button"
              key={scenario.scenarioId}
              onClick={() =>
                navigate('/training/safety/session', {
                  state: { category, scenarioId: scenario.scenarioId },
                })
              }
            >
              <strong>{scenario.title}</strong>
            </button>
          ))}
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
      navigate('/training/safety/scenarios', { replace: true, state: { category } });
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
      <PageHeader compact onBack={() => navigate('/training/safety/scenarios', { state: { category } })} />
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
      <PageHeader compact onBack={() => navigate('/training/safety/types')} />
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
            <button type="button" onClick={() => navigate('/training/safety/types')}>
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
      setError(getErrorMessage(requestError, '臾몄꽌 ?댄빐 吏꾪뻾 ?뺣낫瑜?遺덈윭?ㅼ? 紐삵뻽?듬땲??'));
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
    <TrainingShell>
      <PageHeader
        title="臾몄꽌 ?댄빐 ?덈젴"
        subtitle="?덈궡臾몄쓣 ?쎄퀬 以묒슂???댁슜??李얠븘蹂댁꽭??"
        onBack={() => navigate('/training')}
      />
      {status === 'loading' ? <LoadingBlock /> : null}
      {status === 'error' ? <ErrorBlock message={error} onRetry={loadProgress} /> : null}
      {status === 'ready' ? (
        <section className="option-grid document-level-grid">
          {levels.map((level) => (
            <button
              className={`option-card document-option ${level === currentLevel ? 'is-current' : ''}`}
              type="button"
              key={level}
              onClick={() => navigate('/training/document/session', { state: { level } })}
            >
              <strong>{level}?④퀎</strong>
              <span>{level === currentLevel ? '異붿쿇 ?④퀎?낅땲??' : '?ㅼ떆 ?곗뒿?????덈뒗 ?④퀎?낅땲??'}</span>
              <em>?쒖옉?섍린</em>
            </button>
          ))}
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
      setError(getErrorMessage(requestError, '臾몄꽌 ?댄빐 ?덈젴???쒖옉?섏? 紐삵뻽?듬땲??'));
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
      setError(getErrorMessage(requestError, '?듬????쒖텧?섏? 紐삵뻽?듬땲??'));
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
                <span>{question.title || `臾몄꽌 ${index + 1}`}</span>
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
      setError(getErrorMessage(requestError, '寃곌낵瑜?遺덈윭?ㅼ? 紐삵뻽?듬땲??'));
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
      <PageHeader title="?덈젴 寃곌낵" subtitle="?ㅻ뒛??臾몄꽌 ?댄빐 ?덈젴 寃곌낵?낅땲??" onBack={() => navigate('/training/document')} />
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
      <section className="training-select-grid history-select-grid" aria-label="?덈젴 ?대젰 ?좏삎">
        {trainingTypes.map((item) => (
          <button
            className="training-select-card history-select-card"
            type="button"
            key={item.type}
            onClick={() => navigate(item.path)}
          >
            <span>{item.label}</span>
            <div className={`training-card-illustration training-card-illustration-${item.visual}`} aria-hidden="true">
              <img src={characterImg} alt="" />
            </div>
          </button>
        ))}
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

  const selectedLabel = trainingTypes.find((item) => item.type === selectedType)?.label || '?덈젴';

  const loadHistory = async () => {
    setStatus('loading');
    setError('');

    try {
      setHistory(await trainingProgressApi.getTrainingSessions({ type: selectedType, page: 0, size: 10 }));
      setSelectedSession(null);
      setStatus('ready');
    } catch (requestError) {
      setError(getErrorMessage(requestError, '?덈젴 ?대젰??遺덈윭?ㅼ? 紐삵뻽?듬땲??'));
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
      {status === 'ready' && sessions.length === 0 ? <EmptyBlock message={`${selectedLabel} ?덈젴 ?대젰???놁뒿?덈떎.`} /> : null}
      {status === 'ready' && sessions.length > 0 ? (
        <section className="history-list-shell">
          <div className="history-list" aria-label={`${selectedLabel} ?덈젴 ?대젰`}>
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
            ?곸꽭蹂닿린
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





