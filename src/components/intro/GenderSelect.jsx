import { useState } from 'react';
import './IntroStyles.css';
import backArrow from '../../assets/back_arrow.png';

const genderOptions = ['남성', '여성'];

function GenderSelect({ onNext, onPrev }) {
  const [selectedGender, setSelectedGender] = useState('');

  const handleNextPage = () => {
    if (!selectedGender) {
      alert('성별을 선택해 주세요.');
      return;
    }

    onNext({ gender: selectedGender });
  };

  return (
    <div className="intro-page-wrapper intro-step-page">
      <button className="intro-back-button" type="button" onClick={onPrev} aria-label="뒤로 가기">
        <img src={backArrow} alt="" className="intro-back-image" />
      </button>

      <section className="intro-step-card intro-gender-card">
        <div className="intro-gender-content">
          <h1 className="intro-main-text">성별을 선택해 주세요</h1>
          <p className="intro-sub-text">프로필 정보로만 사용됩니다.</p>

          <div className="intro-choice-grid intro-choice-grid-compact">
            {genderOptions.map((gender) => (
              <button
                key={gender}
                className={`intro_select-button ${selectedGender === gender ? 'is-selected' : ''}`}
                type="button"
                onClick={() => setSelectedGender(gender)}
              >
                <span className="intro-button-text">{gender}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="intro-gender-actions">
          <button className="intro-submit-button" type="button" onClick={handleNextPage}>
            <span className="intro-button-text">다음으로</span>
          </button>
        </div>
      </section>
    </div>
  );
}

export default GenderSelect;
