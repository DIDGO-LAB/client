import { useState } from 'react';
import { authApi } from '../api';
import './Login.css';
import backArrow from '../assets/back_arrow.png';

function Login({ onPrev, onLogin }) {
  const [loginInfo, setLoginInfo] = useState({
    userId: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e, field) => {
    setLoginInfo((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleLogin = async () => {
    if (!loginInfo.userId.trim() || !loginInfo.password.trim()) {
      alert('아이디와 비밀번호를 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authApi.login({
        loginId: loginInfo.userId,
        password: loginInfo.password,
        rememberMe: false,
      });

      alert(`${response.user?.name || loginInfo.userId}님 환영합니다.`);
      onLogin();
    } catch (error) {
      alert(error?.message || '로그인에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <button className="login-back-button" type="button" onClick={onPrev} aria-label="뒤로 가기">
        <img src={backArrow} alt="" className="login-back-image" />
      </button>

      <section className="login-panel">
        <div className="login-heading">
          <span>다시 시작하기</span>
          <h1 className="login-main-text">로그인</h1>
          <p>훈련 기록과 현재 단계를 불러옵니다.</p>
        </div>

        <div className="login-form">
          <input
            placeholder="아이디"
            className="login-input-field"
            value={loginInfo.userId}
            onChange={(e) => handleChange(e, 'userId')}
          />

          <input
            placeholder="비밀번호"
            className="login-input-field"
            type="password"
            value={loginInfo.password}
            onChange={(e) => handleChange(e, 'password')}
          />

          <button className="login-submit-button" type="button" onClick={handleLogin} disabled={isSubmitting}>
            <span className="login-button-text">{isSubmitting ? '로그인 중' : '로그인'}</span>
          </button>
        </div>
      </section>
    </main>
  );
}

export default Login;
