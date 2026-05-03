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
    <StartTypeSelect onNext={handleNextPage} />
  );
}

export default Intro;
