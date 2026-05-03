import React, { useState } from 'react';
import ViewProfile from '../components/myPage/ViewProfile';
import EditProfile from '../components/myPage/EditProfile';

function MyPage({ onPrev }) {
  const [isEdit, setIsEdit] = useState(false);
  const [userData, setUserData] = useState({
    userId: 'minkyeong123',
    password: 'password123',
    userName: '차민경',
    birthDate: '2000-01-01',
    gender: '여성',
    email: 'test@test.com',
    disability: '지체장애',
    job: '사무직',
  });

  const handleBack = () => {
    if (isEdit) {
      setIsEdit(false);
      return;
    }

    if (onPrev) {
      onPrev();
      return;
    }

    window.history.back();
  };

  const handleSave = (newData) => {
    setUserData(newData);
    setIsEdit(false);
  };

  return (
    <div>
      {!isEdit ? (
        <ViewProfile
          userData={userData}
          onEditClick={() => setIsEdit(true)}
          onPrev={handleBack}
        />
      ) : (
        <EditProfile
          userData={userData}
          onSave={handleSave}
          onPrev={handleBack}
        />
      )}
    </div>
  );
}

export default MyPage;
