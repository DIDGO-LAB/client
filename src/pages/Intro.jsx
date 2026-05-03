import { useNavigate } from 'react-router-dom';
import StartTypeSelect from '../components/intro/StartTypeSelect';
import '../components/intro/IntroStyles.css';

function Intro() {
  const navigate = useNavigate();

  const handleNextPage = ({ startType }) => {
    if (startType === 'usedBefore') {
      navigate('/login');
      return;
    }

    navigate('/intro/disability', {
      state: {
        signupData: { startType },
      },
    });
  };

  return (
    <div className="App">
      <StartTypeSelect onNext={handleNextPage} />
    </div>
  );
}

export default Intro;
