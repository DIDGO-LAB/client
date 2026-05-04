import feedbackCharacterImg from '../../../assets/Feedback_Character.png';
import ConversationLog from './ConversationLog';
import { SocialBackButton } from './SocialTrainingControls';
import './SocialTraining.css';

function TrainingResult({ tutorial, messages, result, onRestart, onPrev }) {
  const resultMessages = [...messages, ...(result.extraMessages ?? [])];

  return (
    <section className="social-training-step">
      <SocialBackButton onClick={onPrev} />

      <div className="social-result-chat">
        <div className="social-result-tutorial">{tutorial.description}</div>
        <ConversationLog messages={resultMessages} compact />
      </div>

      <aside className="social-score-panel">
        <div className="social-score-badge">{result.score}점</div>
        <div className="social-feedback-box">
          <strong>AI 피드백</strong>
          <p>{result.aiFeedback}</p>
        </div>
        <div className="social-feedback-box">
          <strong>추천 답변</strong>
          <p>{result.recommendedAnswer}</p>
          <img src={feedbackCharacterImg} alt="" className="social-feedback-character" />
        </div>
        <button type="button" className="social-restart-button" onClick={onRestart}>
          다시 연습하기
        </button>
      </aside>
    </section>
  );
}

export default TrainingResult;
