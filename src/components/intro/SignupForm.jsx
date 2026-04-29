// src/components/intro/SignupForm.jsx
import React from 'react';
import { useState } from 'react';
import './IntroStyles.css';
import backArrow from '../../assets/back_arrow.png';

function SignupForm({ onNext, onPrev }) {
  const [formData, setFormData] = useState({
    userId: "",
    userName: "",
    password: "",
    birthDate: "",
    email: ""
  });

  const handleChange = (e, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = () => {
    onNext(formData);
  };

  return (
    <div className="intro-page-wrapper">

      <h1 className="intro-main-text" style={{ left: '686px', top: '169px', width: '548px', textAlign: 'center' }}>
        상세 정보를 입력해주세요.
      </h1>
      
      <button 
        className="intro-back-button" 
        style={{ left: '139px', top: '110px', width: '75px', height: '80px' }} 
        onClick={onPrev} 
      >
        <img src={backArrow} alt="뒤로가기" className="intro-back-image" />
      </button>


      <input 
        placeholder="아이디"
        className="intro-input-field" 
        style={{ left: '368px', top: '320px', width: '543px', height: '115px' }}
        value={formData.userId}
        onChange={(e) => handleChange(e, 'userId')}
      />

      <input 
        placeholder="이름"
        className="intro-input-field" 
        style={{ left: '1009px', top: '320px', width: '543px', height: '115px' }}
        value={formData.userName}
        onChange={(e) => handleChange(e, 'userName')}
      />

      <input 
        type="password"
        placeholder="비밀번호"
        className="intro-input-field" 
        style={{ left: '368px', top: '576px', width: '543px', height: '115px' }}
        value={formData.password}
        onChange={(e) => handleChange(e, 'password')}
      />
      
      <input 
        placeholder="생년월일(YYYYMMDD)"
        className="intro-input-field" 
        style={{ left: '1009px', top: '576px', width: '543px', height: '115px' }}
        value={formData.birthDate}
        onChange={(e) => handleChange(e, 'birthDate')}
      />
      
      <input 
        placeholder="이메일"
        className="intro-input-field" 
        style={{ left: '368px', top: '807px', width: '543px', height: '115px' }}
        value={formData.email}
        onChange={(e) => handleChange(e, 'email')}
      />
      
      <button 
        className="intro-submit-button" 
        style={{ left: '1306px', top: '852px', width: '246px', height: '96px' }}
        onClick={handleSubmit}
      >
        <span className="intro-button-text">완료</span>
      </button>

    </div>
  );
}

export default SignupForm;