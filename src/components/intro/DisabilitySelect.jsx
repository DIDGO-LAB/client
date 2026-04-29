// src/components/intro/DisabilitySelect.jsx
import React from 'react';
import './IntroStyles.css';

function DisabilitySelect({ onNext }) {
  return (
    <div className="intro-page-wrapper">

      <h1 className="intro-main-text" style={{ left: '694px', top: '385px', width: '555px', textAlign: 'center' }}>
        장애 유형을 선택해주세요
      </h1>


      <button 
        className="intro_select-button" 
        style={{ left: '373px', top: '529px', width: '543px', height: '166px' }}
        onClick={() => onNext({ disabilities: ["정신적 장애"] })}
      >
        <span className="intro-button-text">정신적 장애</span>
      </button>


      <button 
        className="intro_select-button" 
        style={{ left: '1003px', top: '529px', width: '543px', height: '166px' }}
        onClick={() => onNext({ disabilities: ["신체적 장애"] })}
      >
        <span className="intro-button-text">신체적 장애</span>
      </button>
    </div>
  );
}

export default DisabilitySelect;