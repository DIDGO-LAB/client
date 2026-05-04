import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import { authApi, tokenStorage } from './api';
import Intro from './pages/Intro';
import DisabilitySelect from './components/intro/DisabilitySelect';
import JobSelect from './components/intro/JobSelect';
import GenderSelect from './components/intro/GenderSelect';
import SignupForm from './components/intro/SignupForm';
import Login from './pages/Login';
import Mainpage from './pages/Mainpage';
import MyPage from './pages/MyPage';
import {
  DocumentResultPage,
  DocumentSessionPage,
  DocumentStartPage,
  SafetyResultPage,
  SafetyScenarioPage,
  SafetySessionPage,
  SocialJobPage,
  SocialResultPage,
  SocialScenarioPage,
  SocialSessionPage,
  TrainingHistoryDetailPage,
  TrainingHistoryListPage,
  TrainingHistorySelectPage,
  TrainingSelectPage,
} from './pages/training/TrainingPages';
import { signupFormToApiPayload } from './utils/userProfile';

const getApiErrorMessage = (error, fallback) => error?.message || fallback;

function ProtectedRoute({ children }) {
  if (!tokenStorage.getAccessToken()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function IntroStepRoutes() {
  const navigate = useNavigate();
  const location = useLocation();
  const signupData = location.state?.signupData ?? {};
  const [viewportScale, setViewportScale] = useState(() => {
    if (typeof window === 'undefined') {
      return 1;
    }

    return Math.max(0.1, Math.min(window.innerWidth / 1920, window.innerHeight / 1080, 1));
  });

  useEffect(() => {
    const updateViewportScale = () => {
      setViewportScale(Math.max(0.1, Math.min(window.innerWidth / 1920, window.innerHeight / 1080, 1)));
    };

    updateViewportScale();
    window.addEventListener('resize', updateViewportScale);

    return () => {
      window.removeEventListener('resize', updateViewportScale);
    };
  }, []);

  const goNext = (path, newData = {}) => {
    navigate(path, {
      state: {
        signupData: {
          ...signupData,
          ...newData,
        },
      },
    });
  };

  return (
    <div className="app-shell">
      <div
        className="app-viewport"
        style={{
          width: `${1920 * viewportScale}px`,
          height: `${1080 * viewportScale}px`,
        }}
      >
        <div className="App" style={{ transform: `scale(${viewportScale})` }}>
        <Routes>
          <Route path="/" element={<Intro />} />
          <Route
            path="/intro/disability"
            element={
              <DisabilitySelect
                onNext={(data) => goNext('/intro/job', data)}
                onPrev={() => navigate('/')}
              />
            }
          />
          <Route
            path="/intro/job"
            element={
              <JobSelect
                onNext={(data) => goNext('/intro/gender', data)}
                onPrev={() => navigate('/intro/disability', { state: { signupData } })}
              />
            }
          />
          <Route
            path="/intro/gender"
            element={
              <GenderSelect
                onNext={(data) => goNext('/signup', data)}
                onPrev={() => navigate('/intro/job', { state: { signupData } })}
              />
            }
          />
          <Route
            path="/signup"
            element={
              <SignupForm
                onNext={async (data) => {
                  const completeData = { ...signupData, ...data };

                  try {
                    await authApi.signup(signupFormToApiPayload(completeData));
                  } catch (error) {
                    alert(getApiErrorMessage(error, '회원가입에 실패했습니다.'));
                    return;
                  }

                  alert('회원가입이 완료되었습니다.');
                  navigate('/login');
                }}
                onPrev={() => navigate('/intro/gender', { state: { signupData } })}
              />
            }
          />
          <Route
            path="/login"
            element={<Login onPrev={() => navigate(-1)} onLogin={() => navigate('/main')} />}
          />
          <Route
            path="/main"
            element={
              <ProtectedRoute>
                <Mainpage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/training"
            element={
              <ProtectedRoute>
                <TrainingSelectPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/training/social/job"
            element={
              <ProtectedRoute>
                <SocialJobPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/training/social/scenarios"
            element={
              <ProtectedRoute>
                <SocialScenarioPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/training/social/session"
            element={
              <ProtectedRoute>
                <SocialSessionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/training/social/result"
            element={
              <ProtectedRoute>
                <SocialResultPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/training/safety/types"
            element={<Navigate to="/training/safety/scenarios" replace />}
          />
          <Route
            path="/training/safety/scenarios"
            element={
              <ProtectedRoute>
                <SafetyScenarioPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/training/safety/session"
            element={
              <ProtectedRoute>
                <SafetySessionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/training/safety/result"
            element={
              <ProtectedRoute>
                <SafetyResultPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/training/document"
            element={
              <ProtectedRoute>
                <DocumentStartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/training/document/session"
            element={
              <ProtectedRoute>
                <DocumentSessionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/training/document/result"
            element={
              <ProtectedRoute>
                <DocumentResultPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/training-history"
            element={
              <ProtectedRoute>
                <TrainingHistorySelectPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/training-history/:type"
            element={
              <ProtectedRoute>
                <TrainingHistoryListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/training-history/detail"
            element={
              <ProtectedRoute>
                <TrainingHistoryDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mypage"
            element={
              <ProtectedRoute>
                <MyPage onPrev={() => navigate('/main')} onAuthRequired={() => navigate('/login')} />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </div>
    </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <IntroStepRoutes />
    </BrowserRouter>
  );
}

export default App;
