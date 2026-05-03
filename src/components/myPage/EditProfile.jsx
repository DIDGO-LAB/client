// src/components/myPage/EditProfile.jsx
import React, { useState } from 'react';
import './myPageStyles.css';
import backArrow from '../../assets/back_arrow.png';

function EditProfile({ userData, onSave, onPrev }) {
  const jobOptions = ['사무직', '단순노무직'];
  const initialJob = userData.job || '';
  const [formData, setFormData] = useState({
    password: userData.password || '',
    email: userData.email || '',
    disability: userData.disability || '',
    job: jobOptions.includes(initialJob) ? initialJob : '',
    customJob: jobOptions.includes(initialJob) ? '' : initialJob,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleJobSelect = (job) => {
    setFormData((prev) => ({
      ...prev,
      job,
      customJob: '',
    }));
  };

  const handleSave = () => {
    const finalJob = formData.customJob.trim() || formData.job;

    if (!formData.password.trim() || !formData.email.trim() || !formData.disability.trim() || !finalJob.trim()) {
      alert('비밀번호, 이메일, 장애유형, 희망직무를 모두 입력해주세요.');
      return;
    }

    onSave({
      ...userData,
      password: formData.password,
      email: formData.email,
      disability: formData.disability,
      job: finalJob,
    });
  };

  return (
    <div>
      <div className="mypage-info-box" style={{ left: '274px', top: '150px', width: '1055px', height: '779px' }}>
        <div className="info-item" style={{ left: '146px', top: '95px' }}>
          <span className="info-label">아이디</span>
          <span className="info-value">{userData.userId}</span>
        </div>

        <div className="info-item" style={{ left: '146px', top: '173px' }}>
          <span className="info-label">비밀번호</span>
          <input
            type="password"
            className="mypage-input-field"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
          />
        </div>

        <div className="info-item" style={{ left: '146px', top: '251px' }}>
          <span className="info-label">이름</span>
          <span className="info-value">{userData.userName}</span>
        </div>

        <div className="info-item" style={{ left: '146px', top: '329px' }}>
          <span className="info-label">생년월일</span>
          <span className="info-value">{userData.birthDate}</span>
        </div>

        <div className="info-item" style={{ left: '146px', top: '407px' }}>
          <span className="info-label">성별</span>
          <span className="info-value">{userData.gender}</span>
        </div>

        <div className="info-item" style={{ left: '146px', top: '485px' }}>
          <span className="info-label">이메일</span>
          <input
            type="email"
            className="mypage-input-field"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </div>

        <div className="info-item" style={{ left: '146px', top: '563px' }}>
          <span className="info-label">장애유형</span>
          <input
            className="mypage-input-field"
            value={formData.disability}
            onChange={(e) => handleChange('disability', e.target.value)}
          />
        </div>

        <div className="info-item" style={{ left: '146px', top: '641px' }}>
          <span className="info-label">희망직무</span>
          <div className="mypage-job-field">
            <div className="mypage-job-options">
              {jobOptions.map((job) => (
                <button
                  key={job}
                  type="button"
                  className={`mypage-job-button ${formData.job === job ? 'selected' : ''}`}
                  onClick={() => handleJobSelect(job)}
                >
                  {job}
                </button>
              ))}
            </div>
            <input
              className="mypage-input-field mypage-job-input"
              placeholder="직접 입력"
              value={formData.customJob}
              onChange={(e) => {
                handleChange('customJob', e.target.value);
                handleChange('job', '');
              }}
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        className="mypage-back-button"
        style={{ left: '139px', top: '110px', width: '75px', height: '80px' }}
        onClick={onPrev}
      >
        <img src={backArrow} alt="뒤로가기" className="mypage-back-image" />
      </button>

      <button
        type="button"
        className="mypage-submit-button"
        style={{ left: '1466px', top: '833px', width: '246px', height: '96px' }}
        onClick={handleSave}
      >
        <span className="mypage-button-text">저장</span>
      </button>
    </div>
  );
}

export default EditProfile;
