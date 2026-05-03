import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import Intro from './pages/Intro';
import DisabilitySelect from './components/intro/DisabilitySelect';
import JobSelect from './components/intro/JobSelect';
import GenderSelect from './components/intro/GenderSelect';
import SignupForm from './components/intro/SignupForm';
import Sidebar from './components/layout/Sidebar';
import Login from './pages/Login';
import Mainpage from './pages/Mainpage';
import MyPage from './pages/MyPage';

function ComingSoonPage({ activeKey, title }) {
  return (
    <div className="App">
      <Sidebar activeKey={activeKey} />
      <main style={{ position: 'absolute', left: '516px', top: 0, width: '1404px', height: '1080px' }}>
        <h1 style={{ margin: '160px 0 0 140px', fontSize: '48px' }}>{title}</h1>
      </main>
    </div>
  );
}

function IntroStepRoutes() {
  const navigate = useNavigate();
  const location = useLocation();
  const signupData = location.state?.signupData ?? {};

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
            onNext={(data) => {
              console.log('회원가입 데이터:', { ...signupData, ...data });
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
      <Route path="/main" element={<Mainpage />} />
      <Route path="/training" element={<ComingSoonPage activeKey="training" title="훈련" />} />
      <Route path="/training-history" element={<ComingSoonPage activeKey="history" title="훈련이력" />} />
      <Route path="/mypage" element={<MyPage onPrev={() => navigate('/main')} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
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
