import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { trainingProgressApi } from '../api';
import level1Img from '../assets/level1.png';
import level2Img from '../assets/level2.png';
import level3Img from '../assets/level3.png';
import level4Img from '../assets/level4.png';
import level5Img from '../assets/level5.png';
import './Mainpage.css';

const TRAINING_TYPES = ['SOCIAL', 'SAFETY', 'DOCUMENT'];
const DEFAULT_PROGRESS = {
  SOCIAL: 1,
  SAFETY: 1,
  DOCUMENT: 1,
};

const levelImages = {
  1: level1Img,
  2: level2Img,
  3: level3Img,
  4: level4Img,
  5: level5Img,
};

const homeCards = [
  {
    trainingType: 'SOCIAL',
    title: '사회성 훈련',
    description: '직장 동료와 필요한 말을 차분히 주고받는 힘을 키워요.',
    path: '/training/social/job',
  },
  {
    trainingType: 'SAFETY',
    title: '안전 대처 훈련',
    description: '불편하거나 위험한 상황에 대처하는 힘을 키워요.',
    path: '/training/safety/scenarios',
  },
  {
    trainingType: 'DOCUMENT',
    title: '문서 이해 훈련',
    description: '문서를 읽고 중요한 정보를 찾는 힘을 키워요.',
    path: '/training/document',
  },
];

const clampLevel = (level) => {
  const numericLevel = Number(level);

  if (!Number.isFinite(numericLevel)) {
    return 1;
  }

  return Math.min(Math.max(Math.round(numericLevel), 1), 5);
};

const readItemLevel = (item) => item?.level ?? item?.currentLevel ?? item?.highestUnlockedLevel;

function Mainpage() {
  const navigate = useNavigate();
  const [progressByType, setProgressByType] = useState(DEFAULT_PROGRESS);
  const [isProgressLoading, setIsProgressLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const loadProgressSummary = async () => {
      setIsProgressLoading(true);

      try {
        const summary = await trainingProgressApi.getTrainingProgressSummary();
        const nextProgress = { ...DEFAULT_PROGRESS };

        if (Array.isArray(summary?.items)) {
          summary.items.forEach((item) => {
            if (TRAINING_TYPES.includes(item?.trainingType)) {
              nextProgress[item.trainingType] = clampLevel(readItemLevel(item));
            }
          });
        }

        if (!ignore) {
          setProgressByType(nextProgress);
        }
      } catch {
        if (!ignore) {
          setProgressByType(DEFAULT_PROGRESS);
        }
      } finally {
        if (!ignore) {
          setIsProgressLoading(false);
        }
      }
    };

    loadProgressSummary();

    return () => {
      ignore = true;
    };
  }, []);

  const cards = useMemo(
    () =>
      homeCards.map((card) => {
        const level = clampLevel(progressByType[card.trainingType]);

        return {
          ...card,
          level,
          image: levelImages[level],
        };
      }),
    [progressByType],
  );

  return (
    <>
      <Sidebar activeKey="main" />

      <main className="mainpage-content">
        <header className="home-page-header">
          <span>오늘의 성장</span>
          <h1>오늘 연습할 훈련을 골라 주세요</h1>
          <p>홈에서는 훈련별 성장 상태를 한눈에 확인할 수 있어요.</p>
        </header>

        <section className="home-seed-grid" aria-label="훈련별 새싹 성장 상태">
          {cards.map((card) => (
            <button
              className={`home-seed-card ${isProgressLoading ? 'is-loading' : ''}`}
              key={card.trainingType}
              type="button"
              onClick={() => navigate(card.path)}
              aria-busy={isProgressLoading}
              aria-label={`${card.title} 시작하기, 현재 ${card.level}단계`}
            >
              <div className="home-seed-card-copy">
                <strong>{card.title}</strong>
                <span>{card.description}</span>
              </div>
              <div className="home-seed-visual">
                <img src={card.image} alt={`${card.title} 현재 ${card.level}단계 새싹`} />
              </div>
              <p className="home-seed-level">{card.level} 단계</p>
            </button>
          ))}
        </section>
      </main>
    </>
  );
}

export default Mainpage;
