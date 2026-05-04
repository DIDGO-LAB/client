import { SocialBackButton } from './SocialTrainingControls';
import './SocialTraining.css';

function TutorialSelect({ situation, onSelectTutorial, onPrev }) {
  return (
    <section className="social-training-step">
      <SocialBackButton onClick={onPrev} />

      <article className="social-situation-intro">
        <strong>{situation.label}</strong>
        <p>이 상황에서 연습할 튜토리얼을 하나 골라보세요.</p>
      </article>

      <div className="social-situation-list">
        {situation.tutorials.map((tutorial, index) => (
          <div key={tutorial.id} className="social-situation-row">
            <span className="social-situation-index">튜토리얼 {index + 1}</span>
            <button
              type="button"
              className="social-situation-card"
              onClick={() => onSelectTutorial(tutorial.id)}
            >
              {tutorial.label}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TutorialSelect;
