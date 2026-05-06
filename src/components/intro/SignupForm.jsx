import { useState } from 'react';
import './IntroStyles.css';
import backArrow from '../../assets/back_arrow.png';

function SignupForm({ onNext, onPrev }) {
  const [formData, setFormData] = useState({
    userId: '',
    userName: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e, field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const isAllFilled = Object.values(formData).every((value) => value.trim() !== '');

  const handleSubmit = async () => {
    if (!isAllFilled) {
      alert('모든 정보를 입력해 주세요.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다. 다시 확인해 주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      await onNext(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="intro-page-wrapper intro-step-page">
      <button className="intro-back-button" type="button" onClick={onPrev} aria-label="뒤로 가기">
        <img src={backArrow} alt="" className="intro-back-image" />
      </button>

      <section className="intro-step-card intro-signup-card">
        <div className="intro-signup-copy">
          <span className="intro-kicker">마지막 단계</span>
          <h1 className="intro-main-text">계정 정보를 입력해 주세요</h1>
          <p className="intro-sub-text">훈련 기록을 저장하고 이어서 연습할 때 필요합니다.</p>
          <p className="intro-consent-text">
            회원가입을 진행하면 서비스 이용 약관과 개인정보 처리 방침에 동의한 것으로 봅니다.
          </p>
        </div>

        <div className="intro-signup-form-panel">
          <div className="intro-form-grid">
            <input
              placeholder="아이디"
              className="intro-input-field"
              value={formData.userId}
              onChange={(e) => handleChange(e, 'userId')}
            />
            <input
              placeholder="이름"
              className="intro-input-field"
              value={formData.userName}
              onChange={(e) => handleChange(e, 'userName')}
            />
            <input
              type="password"
              placeholder="비밀번호"
              className="intro-input-field"
              value={formData.password}
              onChange={(e) => handleChange(e, 'password')}
            />
            <input
              type="password"
              placeholder="비밀번호 확인"
              className={`intro-input-field ${
                formData.confirmPassword && formData.password !== formData.confirmPassword ? 'has-error' : ''
              }`}
              value={formData.confirmPassword}
              onChange={(e) => handleChange(e, 'confirmPassword')}
            />
            <input
              placeholder="이메일"
              className="intro-input-field"
              value={formData.email}
              onChange={(e) => handleChange(e, 'email')}
            />
            <input
              placeholder="생년월일 예: 2000-01-01"
              className="intro-input-field"
              value={formData.birthDate}
              onChange={(e) => handleChange(e, 'birthDate')}
            />
          </div>

          <div className="intro-signup-actions">
            <button
              className="intro-submit-button"
              type="button"
              onClick={handleSubmit}
              disabled={!isAllFilled || isSubmitting}
            >
              <span className="intro-button-text">{isSubmitting ? '처리 중' : '완료'}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SignupForm;
