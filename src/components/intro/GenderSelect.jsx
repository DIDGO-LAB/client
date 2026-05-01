// src/components/intro/GenderSelect.jsx
import React from 'react';
import { useState } from 'react';
import './IntroStyles.css';
import backArrow from '../../assets/back_arrow.png';

function GenderSelect({ onNext, onPrev }) {
  const [selectedGender, setSelectedGender] = useState("");

  const handleNextPage = () => {
    if (!selectedGender) {
      alert("성별을 선택해주세요.");
      return;
    }
    onNext({ gender: [selectedGender] });
  };

  return (
    <div className="intro-page-wrapper">

      <h1 className="intro-main-text" style={{ left: '744px', top: '385px', width: '431px', textAlign: 'center' }}>
        성별을 선택해주세요.
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
        style={{ left: '373px', top: '529px', width: '543px', height: '166px',
                 backgroundColor: selectedGender === "남성" ? "rgba(251, 243, 196, 0.3)" : "#FFFFFE" }}
        onClick={() => setSelectedGender("남성")}
      >
        <span className="intro-button-text">남성</span>
      </button>


      <button 
        className="intro_select-button" 
        style={{ left: '1003px', top: '529px', width: '543px', height: '166px',
                 backgroundColor: selectedGender === "여성" ? " rgba(251, 243, 196, 0.3)" : "#FFFFFE" }}
        onClick={() => setSelectedGender("여성")}
      >
        <span className="intro-button-text">여성</span>
      </button>


      <button className="intro-submit-button" style={{ left: '1306px', top: '852px', width: '246px', height: '96px' }} onClick={handleNextPage}>
        <span className="intro-button-text">다음으로</span>
      </button>

    </div>
  );
}

export default GenderSelect;