import { useState } from 'react';
import './Login.css';
import backArrow from '../assets/back_arrow.png';

function Login({ onPrev, onLogin }) {
  const [loginInfo, setLoginInfo] = useState({
    userId: '',
    password: '',
  });

  const handleChange = (e, field) => {
    setLoginInfo((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleLogin = () => {
    if (!loginInfo.userId.trim() || !loginInfo.password.trim()) {
      alert('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    console.log('로그인 시도 데이터:', loginInfo);
    alert(`${loginInfo.userId}님 환영합니다.`);
    onLogin();
  };

  return (
    <div className="App">
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
        style={{ left: '368px', top: '752px', width: '1173px', height: '115px' }}
        onClick={handleLogin}
      >
        <span className="login-button-text">로그인</span>
      </button>
    </div>
  );
}

export default Login;
