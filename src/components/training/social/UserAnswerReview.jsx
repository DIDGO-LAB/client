import sasooImg from '../../../assets/Sasoo.png';
import ConversationLog from './ConversationLog';
import { SocialBackButton } from './SocialTrainingControls';
import './SocialTraining.css';

function UserAnswerReview({ tutorial, messages, onPrev }) {
  return (
    <section className="social-training-step">
      <SocialBackButton onClick={onPrev} />

      <div className="social-instruction-box">{tutorial.description}</div>

      <img src={sasooImg} alt="" className="social-sasoo-image" />
      <ConversationLog messages={messages} />
      <p className="social-loading-note">결과가 나오는 중입니다.</p>
    </section>
  );
}

export default UserAnswerReview;
