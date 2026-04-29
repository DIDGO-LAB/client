// src/components/intro/JobSelect.jsx
import React from 'react';
import './IntroStyles.css';

function JobSelect({ onNext }) {
  return (
    <div className="intro-page-wrapper">

      <h1 className="intro-main-text" style={{ left: '703px', top: '286px', width: '513px', textAlign: 'center' }}>
        희망 직무를 선택해주세요.
      </h1>


      <button 
        className="intro_select-button" 
        style={{ left: '373px', top: '393px', width: '543px', height: '166px' }}
        onClick={() => onNext({ disabilities: ["사무직"] })}
      >
        <span className="intro-button-text">사무직</span>
      </button>


      <button 
        className="intro_select-button" 
        style={{ left: '1003px', top: '393px', width: '543px', height: '166px' }}
        onClick={() => onNext({ disabilities: ["단순 노무직"] })}
      >
        <span className="intro-button-text">단순 노무직</span>
      </button>


      <button 
        className="intro_select-button" 
        style={{ left: '373px', top: '627px', width: '1173px', height: '166px' }}
        onClick={() => onNext({ disabilities: ["기타"] })}
      >
        <span className="intro-button-text">기타</span>
      </button>

    </div>
  );
}

export default JobSelect;