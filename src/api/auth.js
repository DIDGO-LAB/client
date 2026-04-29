// // src/api/auth.js
// import axios from 'axios';

// // 서버 기본 주소 설정 (API 명세서 기준)
// const API_BASE_URL = 'http://your-server-address.com/api'; 

// export const loginAPI = async (loginId, password, rememberMe) => {
//   try {
//     const response = await axios.post(`${API_BASE_URL}/auth/login`, {
//       loginId: loginId,
//       password: password,
//       rememberMe: rememberMe
//     });
    
//     // 성공 시 데이터 반환 (명세서의 success, data 구조)
//     return response.data; 
//   } catch (error) {
//     // 실패 시 에러 던지기
//     throw error.response ? error.response.data : new Error('서버 연결 실패');
//   }
// };