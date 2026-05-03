import { useState } from 'react';
import './IntroStyles.css';
import backArrow from '../../assets/back_arrow.png';

function DisabilitySelect({ onNext, onPrev }) {
  const [selectedDisability, setSelectedDisability] = useState('');

  const handleNextPage = () => {
    if (!selectedDisability) {
      alert('장애 유형을 선택해주세요.');
      return;
    }

    onNext({ disability: selectedDisability });
  };

  return (
    <div className="intro-page-wrapper">
      <h1 className="intro-main-text" style={{ left: '694px', top: '385px', width: '531px', textAlign: 'center' }}>
        장애 유형을 선택해주세요.
      </h1>

      <button
        className="intro-back-button"
        style={{ left: '139px', top: '110px', width: '75px', height: '80px' }}
        onClick={onPrev}
      >
        <img src={backArrow} alt="뒤로가기" className="intro-back-image" />
      </button>

      <button
        className="intro_select-button"
        style={{
          left: '373px',
          top: '529px',
          width: '543px',
          height: '166px',
          backgroundColor: selectedDisability === '정신적 장애' ? 'rgba(251, 243, 196, 0.3)' : '#FFFFFE',
        }}
        onClick={() => setSelectedDisability('정신적 장애')}
      >
        <span className="intro-button-text">정신적 장애</span>
      </button>

      <button
        className="intro_select-button"
        style={{
          left: '1003px',
          top: '529px',
          width: '543px',
          height: '166px',
          backgroundColor: selectedDisability === '신체적 장애' ? 'rgba(251, 243, 196, 0.3)' : '#FFFFFE',
        }}
        onClick={() => setSelectedDisability('신체적 장애')}
      >
        <span className="intro-button-text">신체적 장애</span>
      </button>

      <button
        className="intro-submit-button"
        style={{ left: '1306px', top: '852px', width: '246px', height: '96px' }}
        onClick={handleNextPage}
      >
        <span className="intro-button-text">다음으로</span>
      </button>
    </div>
  );
}

export default DisabilitySelect;
