import Sidebar from '../components/layout/Sidebar';
import level0Img from '../assets/level0.png'
import './Mainpage.css';

const featureCards = [
  { label: '사회와 친해지기', className: 'main-feature-social' },
  { label: '안전교육 가이드', className: 'main-feature-safety' },
  { label: '내용 쏙쏙 파악하기', className: 'main-feature-understand' },
];

function GroundMark({ className = '' }) {
  return (
    <div className={`ground-mark ${className}`} aria-hidden="true">
      <img src={level0Img} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

function Mainpage() {
  return (
    <div className="App">
      <Sidebar activeKey="main" />

      <main className="mainpage-content">
        {featureCards.map((card) => (
          <div key={card.label} className={`main-feature-box ${card.className}`}>
            <span className="main-feature-label">{card.label}</span>
          </div>
        ))}

        <GroundMark className="ground-mark-left" />
        <GroundMark className="ground-mark-right" />
        <GroundMark className="ground-mark-bottom" />
      </main>
    </div>
  );
}

export default Mainpage;
