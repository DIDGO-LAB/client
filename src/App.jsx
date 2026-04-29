
// src/App.jsx
import "./App.css";
import React from "react";
import Intro from './pages/Intro';
function App() {
  // 버튼을 눌렀을 때 데이터가 잘 넘어오는지 확인하기 위한 가짜 함수
  const handleNext = (data) => {
    console.log("선택된 데이터:", data);
  };

  return (
    <div className="App">
      <Intro onNext={handleNext} />
    </div>
  );
}

export default App;