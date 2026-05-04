import { useEffect, useState } from 'react';
import { userApi } from '../api';
import Sidebar from '../components/layout/Sidebar';
import ViewProfile from '../components/myPage/ViewProfile';
import EditProfile from '../components/myPage/EditProfile';
import { userEditToApiPayload, userFromApi } from '../utils/userProfile';
import '../components/myPage/MyPageStyles.css';

function MyPage({ onPrev, onAuthRequired }) {
  const [isEdit, setIsEdit] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    userApi
      .getMe()
      .then((response) => {
        if (isMounted) {
          setUserData(userFromApi(response));
        }
      })
      .catch((error) => {
        if (error?.status === 401 && onAuthRequired) {
          onAuthRequired();
          return;
        }

        alert(error?.message || '내 정보를 불러오지 못했습니다.');
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [onAuthRequired]);

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

  const handleSave = async (newData) => {
    setIsSaving(true);

    try {
      await userApi.updateMe(userEditToApiPayload(newData));
      const response = await userApi.getMe();
      setUserData(userFromApi(response));
      setIsEdit(false);
    } catch (error) {
      if (error?.status === 401 && onAuthRequired) {
        onAuthRequired();
        return;
      }

      alert(error?.message || '내 정보 수정에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Sidebar activeKey="mypage" />

      <main className="mypage-shell">
        <header className="mypage-header">
          <span>내 정보</span>
          <h1>내 정보를 확인해요</h1>
          <p>취업 준비에 필요한 기본 정보를 확인하고, 이메일과 희망 직무를 수정할 수 있어요.</p>
        </header>

        {isLoading && !userData ? (
          <section className="mypage-info-box mypage-loading">불러오는 중입니다.</section>
        ) : !isEdit ? (
          <ViewProfile userData={userData} onEditClick={() => setIsEdit(true)} />
        ) : (
          <EditProfile userData={userData} onSave={handleSave} onPrev={handleBack} isSaving={isSaving} />
        )}
      </main>
    </>
  );
}

export default MyPage;
