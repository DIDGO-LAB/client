import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import socialImg from '../assets/TrainMain_Social.png';
import safetyImg from '../assets/TrainMain_Safety.png';
import understandImg from '../assets/TrainMain_Understand.png';
import './TrainMain.css';

const trainingCards = [
  {
    label: '사회와 친해지기',
    image: socialImg,
    className: 'train-card-social',
    path: '/training/social',
  },
  {
    label: '안전교육 가이드',
    image: safetyImg,
    className: 'train-card-safety',
  },
  {
    label: '내용 쏙쏙 파악하기',
    image: understandImg,
    className: 'train-card-understand',
  },
];

function TrainMain() {
  const navigate = useNavigate();

  return (
    <>
      <Sidebar activeKey="training" />

      <main className="train-main-content">
        {trainingCards.map((card) => (
          <button
            key={card.label}
            type="button"
            className={`train-card ${card.className}`}
            onClick={() => card.path && navigate(card.path)}
          >
            <span className="train-card-title">{card.label}</span>
            <img src={card.image} alt="" className="train-card-image" />
          </button>
        ))}
      </main>
    </>
  );
}

export default TrainMain;
