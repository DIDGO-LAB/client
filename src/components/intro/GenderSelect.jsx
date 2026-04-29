// src/components/intro/GenderSelect.jsx
import React from 'react';
import './IntroStyles.css';

function GenderSelect({ onNext }) {
  return (
    <div className="intro-page-wrapper">

      <h1 className="intro-main-text" style={{ left: '744px', top: '385px', width: '431px', textAlign: 'center' }}>
        성별을 선택해주세요.
      </h1>


      <button 
        className="intro_select-button" 
        style={{ left: '373px', top: '529px', width: '543px', height: '166px' }}
        onClick={() => onNext({ disabilities: ["남자"] })}
      >
        <span className="intro-button-text">남자</span>
      </button>


      <button 
        className="intro_select-button" 
        style={{ left: '1003px', top: '529px', width: '543px', height: '166px' }}
        onClick={() => onNext({ disabilities: ["여자"] })}
      >
        <span className="intro-button-text">여자</span>
      </button>
    </div>
  );
}

export default GenderSelect;