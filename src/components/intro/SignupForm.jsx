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
    confirmPassword: "",
    birthDate: "",
    email: ""
  });

  const handleChange = (e, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  {/* 다 채워졌는지*/}
  const isAllFilled = Object.values(formData).every(value => value.trim() !== "");

  const handleSubmit = () => {
    const allFieldsFilled = Object.values(formData).every(value => value.trim() !== "");

    if (!allFieldsFilled) {
      alert("모든 정보를 입력해주세요.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다. 다시 확인해주세요.");
      return;
    }
    onNext(formData);
  };

  return (
    <div className="intro-page-wrapper">

      <h1 className="intro-main-text" style={{ left: '686px', top: '198px', width: '548px', textAlign: 'center' }}>
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
        style={{ left: '368px', top: '312px', width: '543px', height: '115px' }}
        value={formData.userId}
        onChange={(e) => handleChange(e, 'userId')}
      />

      <input 
        placeholder="이름"
        className="intro-input-field" 
        style={{ left: '1009px', top: '312px', width: '543px', height: '115px' }}
        value={formData.userName}
        onChange={(e) => handleChange(e, 'userName')}
      />

      <input 
        type="password"
        placeholder="비밀번호"
        className="intro-input-field" 
        style={{ left: '368px', top: '485px', width: '543px', height: '115px' }}
        value={formData.password}
        onChange={(e) => handleChange(e, 'password')}
      />
      
      <input 
        type="password"
        placeholder="비밀번호 확인"
        className="intro-input-field" 
        style={{ left: '1009px', top: '485px', width: '543px', height: '115px',
          borderColor: formData.confirmPassword && formData.password !== formData.confirmPassword ? 'red' : 'rgba(0, 0, 0, 0.25)'
         }}
        value={formData.confirmPassword}
        onChange={(e) => handleChange(e, 'confirmPassword')}
      />
      
      <input 
        placeholder="이메일"
        className="intro-input-field" 
        style={{ left: '368px', top: '662px', width: '543px', height: '115px' }}
        value={formData.email}
        onChange={(e) => handleChange(e, 'email')}
      />
      
      <input 
        placeholder="생년월일"
        className="intro-input-field" 
        style={{ left: '1009px', top: '662px', width: '543px', height: '115px' }}
        value={formData.birthDate}
        onChange={(e) => handleChange(e, 'birthDate')}
      />
      
      <button 
        className="intro-submit-button" 
        style={{ left: '1500px', top: '840px', width: '246px', height: '96px',
          opacity: isAllFilled ? 1 : 0.5, // 비활성화 시 반투명 처리
          cursor: isAllFilled ? 'pointer' : 'not-allowed'
         }}
        onClick={handleSubmit}
        disabled={!isAllFilled}
      >
        <span className="intro-button-text">완료</span>
      </button>

      <h1 className="intro-sub-text" style={{ left: '533px', top: '906px', width: '853px', textAlign: 'center' }}>
        딛고에 가입함으로써 딛고의 이용 약관 및 개인정보처리방침에 동의하게 됩니다.
      </h1>

    </div>
  );
}

export default SignupForm;