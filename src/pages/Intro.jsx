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

    navigate('/intro/job', {
      state: {
        signupData: { startType, disability: '지적장애' },
      },
    });
  };

  return (
    <StartTypeSelect onNext={handleNextPage} />
  );
}

export default Intro;
