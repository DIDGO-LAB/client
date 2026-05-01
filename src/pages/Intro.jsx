// src/pages/Intro.jsx
import React, { useState } from 'react';
import StartTypeSelect from "../components/intro/StartTypeSelect";
import DisabilitySelect from '../components/intro/DisabilitySelect';
import JobSelect from '../components/intro/JobSelect';
import GenderSelect from '../components/intro/GenderSelect';
import SignupForm from '../components/intro/SignupForm';
import '../components/intro/IntroStyles.css'; // 공통 스타일

function Intro() {
  const [step, setStep] = useState(1);

  const [totalData, setTotalData] = useState({
    disability: [],
    job: [],
    gender: [],
    userId: "",
    userName: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
    email: "",
  });

  // 다음페이지
  const handleNextPage = (newData) => {
    setTotalData((prev) => ({ ...prev, ...newData }));
    
    if (newData.startType === "usedBefore") {
      // 로그인 페이지로........... 하 setStep(어쩌구)
    } else {
      setStep((prev) => prev + 1);
    }
  };

  // 뒤로가기
  const handlePrevStep = () => {
    if (step > 1) {
        setStep((prev) => prev - 1);
    }
  };

  // 완료 버튼
  const handleFinalSubmit = (finalData) => {
    const completeData = { ...totalData, ...finalData };
    
 



  

    alert("회원가입이 완료되었습니다!");
  };

  return (
    <div className="App"> {/* 우리가 만든 1920x1080 도화지 */}
      {step === 1 && (
        <StartTypeSelect onNext={handleNextPage} />
      )}

      {step === 2 && (
        <DisabilitySelect onNext={handleNextPage} onPrev={handlePrevStep} />
      )}
      
      {step === 3 && (
        <JobSelect onNext={handleNextPage} onPrev={handlePrevStep} />
      )}
      
      {step === 4 && (
        <GenderSelect onNext={handleNextPage} onPrev={handlePrevStep} />
      )}
            
      {step === 5 && (
        <SignupForm onNext={handleFinalSubmit} onPrev={handlePrevStep} />
      )}

    </div>
  );
}

export default Intro;