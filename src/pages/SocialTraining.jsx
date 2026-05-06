import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConversationPractice from '../components/training/social/ConversationPractice';
import JobTypeSelect from '../components/training/social/JobTypeSelect';
import SituationSelect from '../components/training/social/SituationSelect';
import SituationTutorial from '../components/training/social/SituationTutorial';
import { SOCIAL_TRAINING_CONTENT } from '../components/training/social/SocialTrainingData';
import TrainingResult from '../components/training/social/TrainingResult';
import TutorialSelect from '../components/training/social/TutorialSelect';
import UserAnswerReview from '../components/training/social/UserAnswerReview';

const steps = [
  'jobTypeSelect',
  'situationSelect',
  'tutorialSelect',
  'situationTutorial',
  'conversationPractice',
  'userAnswerReview',
  'trainingResult',
];

function SocialTraining() {
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedSituationId, setSelectedSituationId] = useState(null);
  const [selectedTutorialId, setSelectedTutorialId] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [conversationResult, setConversationResult] = useState(null);
  const [isConversationActive, setIsConversationActive] = useState(false);
  const autoAdvanceTimerRef = useRef(null);
  const mockBackendTimerRef = useRef(null);
  const navigate = useNavigate();

  const selectedJobContent = selectedJobId ? SOCIAL_TRAINING_CONTENT[selectedJobId] : null;
  const selectedSituation = selectedJobContent?.situations.find(
    (situation) => situation.id === selectedSituationId
  );
  const selectedTutorial = selectedSituation?.tutorials.find(
    (tutorial) => tutorial.id === selectedTutorialId
  );

  const goNext = () => {
    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  };

  const goPrev = () => {
    if (stepIndex === 0) {
      navigate('/main');
      return;
    }

    setStepIndex((current) => current - 1);
  };

  const handleSelectJob = (jobId) => {
    setSelectedJobId(jobId);
    setSelectedSituationId(null);
    setSelectedTutorialId(null);
    goNext();
  };

  const handleSelectSituation = (situationId) => {
    setSelectedSituationId(situationId);
    setSelectedTutorialId(null);
    setConversationMessages([]);
    setConversationResult(null);
    setIsConversationActive(false);
    goNext();
  };

  const handleSelectTutorial = (tutorialId) => {
    setSelectedTutorialId(tutorialId);
    setConversationMessages([]);
    setConversationResult(null);
    setIsConversationActive(false);
    goNext();
  };

  const restart = () => {
    setSelectedJobId(null);
    setSelectedSituationId(null);
    setSelectedTutorialId(null);
    setConversationMessages([]);
    setConversationResult(null);
    setIsConversationActive(false);
    setStepIndex(0);
  };

  const handleConversationEnded = ({ messages, result }) => {
    setConversationMessages(messages);
    setConversationResult(result);
    setIsConversationActive(false);
    setStepIndex(steps.indexOf('userAnswerReview'));
  };

  const startConversation = () => {
    if (isConversationActive || !selectedTutorial) {
      return;
    }

    setIsConversationActive(true);
    setConversationMessages(selectedTutorial.mockMessages.slice(0, 1));

    // TODO: 여기에서 백엔드 대화 시작 API 또는 WebSocket/SSE 구독을 연결하세요.
    // 백엔드가 캐릭터/사용자별 messages와 "대화 종료" 신호를 보내면
    // handleConversationEnded({ messages, result })를 호출하면 됩니다.
    mockBackendTimerRef.current = window.setTimeout(() => {
      handleConversationEnded({
        messages: selectedTutorial.mockMessages,
        result: selectedTutorial.mockBackendResult,
      });
    }, 1800);
  };

  useEffect(() => {
    if (steps[stepIndex] !== 'userAnswerReview') {
      return undefined;
    }

    autoAdvanceTimerRef.current = window.setTimeout(() => {
      setStepIndex(steps.indexOf('trainingResult'));
    }, 1400);

    return () => {
      window.clearTimeout(autoAdvanceTimerRef.current);
    };
  }, [stepIndex]);

  useEffect(() => {
    return () => {
      window.clearTimeout(autoAdvanceTimerRef.current);
      window.clearTimeout(mockBackendTimerRef.current);
    };
  }, []);

  if (stepIndex > 0 && !selectedJobContent) {
    return <JobTypeSelect onSelectJob={handleSelectJob} onPrev={() => navigate('/main')} />;
  }

  if (stepIndex > 1 && !selectedSituation) {
    return (
      <SituationSelect
        jobContent={selectedJobContent}
        onSelectSituation={handleSelectSituation}
        onPrev={goPrev}
      />
    );
  }

  if (stepIndex > 2 && !selectedTutorial) {
    return (
      <TutorialSelect
        situation={selectedSituation}
        onSelectTutorial={handleSelectTutorial}
        onPrev={goPrev}
      />
    );
  }

  switch (steps[stepIndex]) {
    case 'jobTypeSelect':
      return <JobTypeSelect onSelectJob={handleSelectJob} onPrev={goPrev} />;
    case 'situationSelect':
      return (
        <SituationSelect
          jobContent={selectedJobContent}
          onSelectSituation={handleSelectSituation}
          onPrev={goPrev}
        />
      );
    case 'tutorialSelect':
      return (
        <TutorialSelect
          situation={selectedSituation}
          onSelectTutorial={handleSelectTutorial}
          onPrev={goPrev}
        />
      );
    case 'situationTutorial':
      return <SituationTutorial tutorial={selectedTutorial} onNext={goNext} onPrev={goPrev} />;
    case 'conversationPractice':
      return (
        <ConversationPractice
          tutorial={selectedTutorial}
          messages={conversationMessages}
          isConversationActive={isConversationActive}
          onStartConversation={startConversation}
          onPrev={goPrev}
        />
      );
    case 'userAnswerReview':
      return (
        <UserAnswerReview
          tutorial={selectedTutorial}
          messages={conversationMessages}
          onPrev={goPrev}
        />
      );
    case 'trainingResult':
      return (
        <TrainingResult
          tutorial={selectedTutorial}
          messages={conversationMessages}
          result={conversationResult ?? selectedTutorial.mockBackendResult}
          onRestart={restart}
          onPrev={goPrev}
        />
      );
    default:
      return null;
  }
}

export default SocialTraining;
