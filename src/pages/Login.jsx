// src/pages/Login.jsx
import React, { useState } from 'react';
import { loginAPI } from '../api/auth'; // 아까 만든 함수 불러오기

function Login() {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');

  const handleLogin = async () => {
    try {
      // API 명세서에 있는 필수값들 보내기
      const result = await loginAPI(id, pw, false);
      
      if (result.success) {
        alert(`${result.data.name}님, 환영합니다!`);
        // 여기서 다음 페이지(메인)로 이동하는 로직을 넣으면 됩니다.
      }
    } catch (err) {
      alert(`로그인 실패: ${err.error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>로그인 (임시 디자인)</h2>
      <input 
        placeholder="아이디" 
        value={id} 
        onChange={(e) => setId(e.target.value)} 
      /><br/>
      <input 
        type="password" 
        placeholder="비밀번호" 
        value={pw} 
        onChange={(e) => setPw(e.target.value)} 
      /><br/>
      <button onClick={handleLogin}>로그인하기</button>
    </div>
  );
}

export default Login;