// src/components/intro/JobSelect.jsx
import React from 'react';
import { useState } from 'react';
import './IntroStyles.css';
import backArrow from '../../assets/back_arrow.png';

function JobSelect({ onNext, onPrev }) {
  const [selectedJob, setSelectedJob] = useState("");

  const handleNextPage = () => {
    if (!selectedJob.trim()) {
      alert("희망 직무를 선택하거나 입력해주세요.");
      return;
    }
    onNext({ job: [selectedJob] });
  };

  return (
    <div className="intro-page-wrapper">

      <h1 className="intro-main-text" style={{ left: '703px', top: '286px', width: '513px', textAlign: 'center' }}>
        희망 직무를 선택해주세요.
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
        style={{ left: '373px', top: '393px', width: '543px', height: '166px',
          border: selectedJob === "사무직" ? "5px solid #CDEF7E" : "5px solid rgba(0, 0, 0, 0.25)"
         }}
        
        onClick={() => setSelectedJob("사무직")}
      >
        <span className="intro-button-text">사무직</span>
      </button>


      <button 
        className="intro_select-button" 
        style={{ left: '1003px', top: '393px', width: '543px', height: '166px',
                 border: selectedJob === "단순 노무직" ? "5px solid #CDEF7E" : "5px solid rgba(0, 0, 0, 0.25)" }}
        onClick={() => setSelectedJob("단순 노무직")}
      >
        <span className="intro-button-text">단순 노무직</span>
      </button>


      <input 
        placeholder="기타 직무 직접 입력"
        className="intro-input-field" 
        style={{ left: '373px', top: '627px', width: '1173px', height: '166px', textAlign: 'center' }}
        value={selectedJob === "사무직" || selectedJob === "단순 노무직" ? "" : selectedJob}
        onChange={(e) => setSelectedJob(e.target.value)}
      />


      <button className="intro-submit-button" style={{ left: '1306px', top: '852px', width: '246px', height: '96px' }} onClick={handleNextPage}>
        <span className="intro-button-text">다음으로</span>
      </button>

    </div>
  );
}

export default JobSelect;