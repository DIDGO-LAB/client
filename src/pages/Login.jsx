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
      alert('아이디와 비밀번호를 입력해주세요.');
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
    <>
      <h1
        className="login-main-text"
        style={{ left: '891px', top: '169px', width: '138px', textAlign: 'center' }}
      >
        로그인
      </h1>

      <button
        className="login-back-button"
        style={{ left: '139px', top: '110px', width: '75px', height: '80px' }}
        onClick={onPrev}
      >
        <img src={backArrow} alt="뒤로가기" className="login-back-image" />
      </button>

      <input
        placeholder="아이디"
        className="login-input-field"
        style={{ left: '368px', top: '336px', width: '1173px', height: '115px', textAlign: 'center' }}
        value={loginInfo.userId}
        onChange={(e) => handleChange(e, 'userId')}
      />

      <input
        placeholder="비밀번호"
        className="login-input-field"
        style={{ left: '368px', top: '556px', width: '1173px', height: '115px', textAlign: 'center' }}
        type="password"
        value={loginInfo.password}
        onChange={(e) => handleChange(e, 'password')}
      />

      <button
        className="login-submit-button"
        style={{
          left: '368px',
          top: '752px',
          width: '1173px',
          height: '115px',
          opacity: isSubmitting ? 0.5 : 1,
        }}
        onClick={handleLogin}
        disabled={isSubmitting}
      >
        <span className="login-button-text">{isSubmitting ? '로그인 중...' : '로그인'}</span>
      </button>
    </>
  );
}

export default Login;
