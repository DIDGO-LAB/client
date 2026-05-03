import { useEffect, useState } from 'react';
import { userApi } from '../api';
import ViewProfile from '../components/myPage/ViewProfile';
import EditProfile from '../components/myPage/EditProfile';
import { userEditToApiPayload, userFromApi } from '../utils/userProfile';

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

  if (isLoading && !userData) {
    return (
      <>
        <h1 style={{ position: 'absolute', left: '760px', top: '480px', fontSize: '48px' }}>
          불러오는 중...
        </h1>
      </>
    );
  }

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
          isSaving={isSaving}
        />
      )}
    </div>
  );
}

export default MyPage;
