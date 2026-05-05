import './IntroStyles.css';
import characterImg from '../../assets/Character_JIWOO.png';

function StartTypeSelect({ onNext }) {
  return (
    <div className="intro-page-wrapper intro-start-page">
      <section className="intro-hero-panel" aria-label="서비스 시작">
        <div className="intro-hero-copy">
          <span className="intro-kicker">취업 준비 훈련 서비스</span>
          <h1>딛고에 오신걸 환영합니다.</h1>
          <p>내 속도에 맞춰 직장 생활을 연습해요.</p>
        </div>

        <img
          src={characterImg}
          alt="훈련을 안내하는 캐릭터"
          className="intro-character-img intro-start-character"
        />

        <div className="intro-start-actions">
          <button
            className="intro_select-button intro-primary-choice"
            type="button"
            onClick={() => onNext({ startType: 'newbie' })}
          >
            <span className="intro-button-text">처음 사용해요</span>
            <small>나에게 맞는 훈련 설정을 먼저 고를게요.</small>
          </button>

          <button
            className="intro_select-button intro-secondary-choice"
            type="button"
            onClick={() => onNext({ startType: 'usedBefore' })}
          >
            <span className="intro-button-text">사용해 봤어요</span>
            <small>로그인하고 이어서 훈련할게요.</small>
          </button>
        </div>
      </section>
    </div>
  );
}

export default StartTypeSelect;
