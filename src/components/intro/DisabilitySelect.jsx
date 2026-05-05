import { useState } from 'react';
import './IntroStyles.css';
import backArrow from '../../assets/back_arrow.png';

const disabilityOptions = [
  { value: '발달장애', title: '발달장애', description: '이해하기 쉬운 단계별 안내를 중심으로 연습합니다.' },
  { value: '지체장애', title: '지체장애', description: '직장 상황에서 필요한 의사소통과 안전을 함께 연습합니다.' },
];

function DisabilitySelect({ onNext, onPrev }) {
  const [selectedDisability, setSelectedDisability] = useState('');

  const handleNextPage = () => {
    if (!selectedDisability) {
      alert('장애 유형을 선택해 주세요.');
      return;
    }

    onNext({ disability: selectedDisability });
  };

  return (
    <div className="intro-page-wrapper intro-step-page">
      <button className="intro-back-button" type="button" onClick={onPrev} aria-label="뒤로 가기">
        <img src={backArrow} alt="" className="intro-back-image" />
      </button>

      <section className="intro-step-card intro-disability-card">
        <div className="intro-disability-content">
          <span className="intro-kicker">1단계</span>
          <h1 className="intro-main-text">나에게 맞는 안내 방식을 선택해 주세요.</h1>
          <p className="intro-sub-text">선택한 정보는 훈련 문장과 예시를 더 쉽게 맞추는 데 사용됩니다.</p>

          <div className="intro-choice-grid">
            {disabilityOptions.map((option) => (
              <button
                key={option.value}
                className={`intro_select-button ${selectedDisability === option.value ? 'is-selected' : ''}`}
                type="button"
                onClick={() => setSelectedDisability(option.value)}
              >
                <span className="intro-button-text">{option.title}</span>
                <small>{option.description}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="intro-disability-actions">
          <button className="intro-submit-button" type="button" onClick={handleNextPage}>
            <span className="intro-button-text">다음으로</span>
          </button>
        </div>
      </section>
    </div>
  );
}

export default DisabilitySelect;
