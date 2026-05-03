/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { safetyTrainingApi, socialTrainingApi } from '../../api';
import characterImg from '../../assets/Character_JIWOO.png';
import Sidebar from '../../components/layout/Sidebar';
import './TrainingPages.css';

const socialJobs = [
  { jobType: 'OFFICE', label: '사무직', description: '회사에서 동료와 대화하는 연습' },
  { jobType: 'SERVICE', label: '서비스직', description: '손님과 친절하게 소통하는 연습' },
  { jobType: 'MANUFACTURING', label: '생산직', description: '작업장에서 협력하는 연습' },
];

const safetyCategories = [
  { category: 'COMMUTE_SAFETY', label: '교통 안전', description: '길을 건너고 이동할 때 필요한 안전 훈련' },
  { category: 'WORKPLACE_SAFETY', label: '직장 안전', description: '일터에서 위험한 상황을 피하는 훈련' },
  { category: 'LIFE_SAFETY', label: '생활 안전', description: '일상에서 사고를 예방하는 훈련' },
];

const getErrorMessage = (error, fallback) => error?.message || fallback;

function TrainingShell({ activeKey = 'training', children }) {
  return (
    <>
      <Sidebar activeKey={activeKey} />
      <main className="training-content">{children}</main>
    </>
  );
}

function PageHeader({ title, subtitle, onBack }) {
  return (
    <header className="training-header">
      {onBack ? (
        <button className="training-back-button" type="button" onClick={onBack} aria-label="이전으로">
          ‹
        </button>
      ) : null}
      <div>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
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
      title: '사회와 친해지기',
      description: '상황에 맞게 말하고 대답하는 훈련',
      tone: 'mint',
      path: '/training/social/job',
    },
    {
      title: '안전교육 가이드',
      description: '위험한 상황을 보고 안전한 선택을 하는 훈련',
      tone: 'yellow',
      path: '/training/safety/types',
    },
    {
      title: '내용 쏙쏙 파악하기',
      description: '문서를 읽고 중요한 내용을 이해하는 훈련',
      tone: 'pink',
      path: null,
    },
  ];

  return (
    <TrainingShell>
      <PageHeader title="훈련 선택" subtitle="오늘 연습할 훈련을 선택해주세요." />
      <section className="training-select-grid" aria-label="훈련 목록">
        {cards.map((card) => (
          <button
            className={`training-select-card training-card-${card.tone}`}
            type="button"
            key={card.title}
            onClick={() => {
              if (card.path) {
                navigate(card.path);
              }
            }}
          >
            <div className="training-card-illustration">
              <img src={characterImg} alt="" />
            </div>
            <span>{card.title}</span>
            <small>{card.description}</small>
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
      setError(getErrorMessage(requestError, '직무를 선택하지 못했습니다.'));
    } finally {
      setSubmittingJob('');
    }
  };

  return (
    <TrainingShell>
      <PageHeader
        title="사회성 훈련"
        subtitle="연습하고 싶은 직무 상황을 선택해주세요."
        onBack={() => navigate('/training')}
      />
      {error ? <ErrorBlock message={error} /> : null}
      <section className="option-grid option-grid-three">
        {socialJobs.map((job) => (
          <button
            className="option-card"
            type="button"
            key={job.jobType}
            onClick={() => selectJob(job.jobType)}
            disabled={Boolean(submittingJob)}
          >
            <strong>{job.label}</strong>
            <span>{job.description}</span>
            <em>{submittingJob === job.jobType ? '선택 중' : '선택하기'}</em>
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
      setError(getErrorMessage(requestError, '시나리오를 불러오지 못했습니다.'));
      setStatus('error');
    }
  };

  useEffect(() => {
    loadScenarios();
  }, [jobType]);

  return (
    <TrainingShell>
      <PageHeader
        title="시나리오 선택"
        subtitle="연습할 대화 상황을 골라주세요."
        onBack={() => navigate('/training/social/job')}
      />
      {status === 'loading' ? <LoadingBlock /> : null}
      {status === 'error' ? <ErrorBlock message={error} onRetry={loadScenarios} /> : null}
      {status === 'ready' && scenarios.length === 0 ? <EmptyBlock message="선택할 수 있는 시나리오가 없습니다." /> : null}
      {status === 'ready' && scenarios.length > 0 ? (
        <section className="scenario-list">
          {scenarios.map((scenario) => (
            <button
              className="scenario-card"
              type="button"
              key={scenario.scenarioId}
              onClick={() =>
                navigate('/training/social/session', {
                  state: { jobType, scenarioId: scenario.scenarioId },
                })
              }
            >
              <span>{scenario.badge || '사회성'}</span>
              <strong>{scenario.title}</strong>
              <p>{scenario.description}</p>
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
      const result = await socialTrainingApi.completeSocialSession(session.sessionId, {
        dialogLogs: visibleDialogues.map((dialogue) => ({
          speaker: dialogue.speaker,
          message: dialogue.message,
        })),
      });
      navigate('/training/social/result', {
        state: {
          sessionId: session.sessionId,
          result,
        },
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError, '훈련 결과를 저장하지 못했습니다.'));
      setStatus('ready');
    }
  };

  return (
    <TrainingShell>
      <PageHeader
        title={scenario?.title || '사회성 훈련'}
        subtitle={scenario?.description || '대화를 천천히 따라가며 연습해보세요.'}
        onBack={() => navigate('/training/social/scenarios', { state: { jobType } })}
      />
      {status === 'loading' ? <LoadingBlock /> : null}
      {status === 'error' ? <ErrorBlock message={error} onRetry={loadSession} /> : null}
      {(status === 'ready' || status === 'saving') && scenario ? (
        <section className="training-stage social-stage">
          <div className="scene-area">
            <div className="scene-character scene-character-left">
              <img src={characterImg} alt="" />
              <span>{scenario.learnerName || '나'}</span>
            </div>
            <div className="scene-character scene-character-right">
              <div className="character-placeholder">{scenario.npcName?.slice(0, 1) || '상'}</div>
              <span>{scenario.npcName || '상대방'}</span>
            </div>
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
                다음 대화
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
    <TrainingShell>
      <PageHeader title="훈련 결과" subtitle="오늘의 사회성 훈련 결과입니다." onBack={() => navigate('/training/social/job')} />
      {status === 'loading' ? <LoadingBlock /> : null}
      {status === 'error' ? <ErrorBlock message={error} onRetry={loadResult} /> : null}
      {status === 'ready' ? (
        <ResultPanel
          score={result?.score ?? 0}
          title={result?.title || '대화 연습을 완료했어요'}
          feedback={result?.feedback || '상황에 맞게 대화를 이어가는 연습을 했습니다.'}
          onRetry={() => navigate('/training/social/job')}
          onHome={() => navigate('/training')}
        />
      ) : null}
    </TrainingShell>
  );
}

export function SafetyTypePage() {
  const navigate = useNavigate();

  return (
    <TrainingShell>
      <PageHeader
        title="안전훈련"
        subtitle="훈련할 안전 유형을 선택해주세요."
        onBack={() => navigate('/training')}
      />
      <section className="option-grid option-grid-three">
        {safetyCategories.map((item) => (
          <button
            className="option-card safety-option"
            type="button"
            key={item.category}
            onClick={() => navigate('/training/safety/scenarios', { state: { category: item.category } })}
          >
            <strong>{item.label}</strong>
            <span>{item.description}</span>
            <em>시작하기</em>
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
      setError(getErrorMessage(requestError, '안전훈련 시나리오를 불러오지 못했습니다.'));
      setStatus('error');
    }
  };

  useEffect(() => {
    loadScenarios();
  }, [category]);

  return (
    <TrainingShell>
      <PageHeader
        title="시나리오 선택"
        subtitle="안전하게 행동할 상황을 선택해주세요."
        onBack={() => navigate('/training/safety/types')}
      />
      {status === 'loading' ? <LoadingBlock /> : null}
      {status === 'error' ? <ErrorBlock message={error} onRetry={loadScenarios} /> : null}
      {status === 'ready' && scenarios.length === 0 ? <EmptyBlock message="선택할 수 있는 시나리오가 없습니다." /> : null}
      {status === 'ready' && scenarios.length > 0 ? (
        <section className="scenario-list">
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
              <span>{scenario.badge || '안전'}</span>
              <strong>{scenario.title}</strong>
              <p>{scenario.description}</p>
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
  const [selectedResult, setSelectedResult] = useState(null);
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
      setScene(sessionData.currentScene);
      setSelectedResult(null);
      setStatus('ready');
    } catch (requestError) {
      setError(getErrorMessage(requestError, '안전훈련을 시작하지 못했습니다.'));
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
      setSelectedResult(data.selectedResult);
      setScene(data.nextScene || scene);
      setStatus(data.completed ? 'completed' : 'feedback');
    } catch (requestError) {
      setError(getErrorMessage(requestError, '선택 결과를 저장하지 못했습니다.'));
      setStatus('ready');
    }
  };

  const goNext = async () => {
    if (status === 'completed') {
      try {
        const result = await safetyTrainingApi.completeSafetySession(sessionId);
        navigate('/training/safety/result', { state: { sessionId, result } });
      } catch (requestError) {
        setError(getErrorMessage(requestError, '훈련을 완료하지 못했습니다.'));
      }
      return;
    }

    setSelectedResult(null);
    setStatus('ready');
  };

  return (
    <TrainingShell>
      <PageHeader
        title={scene?.title || '안전훈련'}
        subtitle={scene?.situationText || '상황을 보고 안전한 선택을 골라주세요.'}
        onBack={() => navigate('/training/safety/scenarios', { state: { category } })}
      />
      {status === 'loading' ? <LoadingBlock /> : null}
      {status === 'error' ? <ErrorBlock message={error} onRetry={loadSession} /> : null}
      {scene && status !== 'loading' && status !== 'error' ? (
        <section className="training-stage safety-stage">
          <div className="safety-scene">
            <div className="safety-scene-visual">
              <div className="road-line" />
              <div className="signal-light">
                <span />
                <span />
                <span />
              </div>
              <div className="scene-character scene-character-center">
                <img src={characterImg} alt="" />
              </div>
            </div>
            <p>{scene.prompt}</p>
          </div>
          {selectedResult ? (
            <div className={`feedback-box ${selectedResult.correct ? 'is-correct' : 'is-wrong'}`}>
              <strong>{selectedResult.correct ? '잘 선택했어요' : '다시 생각해볼까요?'}</strong>
              <span>{selectedResult.message}</span>
              <button type="button" onClick={goNext}>
                {status === 'completed' ? '결과 보기' : '다음 상황'}
              </button>
            </div>
          ) : (
            <div className="choice-grid">
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
          )}
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
    <TrainingShell>
      <PageHeader title="훈련 결과" subtitle="오늘의 안전훈련 결과입니다." onBack={() => navigate('/training/safety/types')} />
      {status === 'loading' ? <LoadingBlock /> : null}
      {status === 'error' ? <ErrorBlock message={error} onRetry={loadResult} /> : null}
      {status === 'ready' ? (
        <ResultPanel
          score={result?.score ?? 0}
          title={result?.title || '안전훈련을 완료했어요'}
          feedback={result?.feedback || '위험한 상황에서 안전한 선택을 연습했습니다.'}
          onRetry={() => navigate('/training/safety/types')}
          onHome={() => navigate('/training')}
        />
      ) : null}
    </TrainingShell>
  );
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
