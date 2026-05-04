import sasooImg from '../../../assets/Sasoo.png';
import ConversationLog from './ConversationLog';
import { SocialBackButton, SocialMicButton } from './SocialTrainingControls';
import './SocialTraining.css';

function ConversationPractice({
  tutorial,
  messages,
  isConversationActive,
  onStartConversation,
  onPrev,
}) {
  return (
    <section className="social-training-step">
      <SocialBackButton onClick={onPrev} />

      <div className="social-instruction-box">{tutorial.description}</div>

      {/* TODO: 캐릭터 입모양 애니메이션이 필요하면 is-speaking 클래스나 프레임 이미지를 이 영역에 연결하세요. */}
      <img
        src={sasooImg}
        alt=""
        className={`social-sasoo-image ${isConversationActive ? 'is-speaking' : ''}`}
      />
      <ConversationLog messages={messages} />
      <SocialMicButton className="social-mic-right" onClick={onStartConversation} />
    </section>
  );
}

export default ConversationPractice;
