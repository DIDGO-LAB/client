// src/components/myPage/ViewProfile.jsx
import React from 'react';
import './myPageStyles.css';
import backArrow from '../../assets/back_arrow.png';

function ViewProfile({ userData, onEditClick, onPrev }) {
  return (
    <div>
      <div className="mypage-info-box" style={{ left: '274px', top: '150px', width: '1055px', height: '779px' }}>
        <div className="info-item" style={{ left: '146px', top: '95px' }}>
          <span className="info-label">아이디</span>
          <span className="info-value">{userData.userId}</span>
        </div>

        <div className="info-item" style={{ left: '146px', top: '173px' }}>
          <span className="info-label">비밀번호</span>
          <span className="info-value">{userData.password}</span>
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
          <span className="info-value">{userData.email}</span>
        </div>

        <div className="info-item" style={{ left: '146px', top: '563px' }}>
          <span className="info-label">장애유형</span>
          <span className="info-value">{userData.disability}</span>
        </div>

        <div className="info-item" style={{ left: '146px', top: '641px' }}>
          <span className="info-label">희망직무</span>
          <span className="info-value">{userData.job}</span>
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
        onClick={onEditClick}
      >
        <span className="mypage-button-text">수정</span>
      </button>
    </div>
  );
}

export default ViewProfile;
