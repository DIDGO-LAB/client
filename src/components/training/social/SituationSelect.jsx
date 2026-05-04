import { SocialBackButton } from './SocialTrainingControls';
import './SocialTraining.css';

function SituationSelect({ jobContent, onSelectSituation, onPrev }) {
  return (
    <section className="social-training-step">
      <SocialBackButton onClick={onPrev} />

      <article className="social-situation-intro">
        <strong>{jobContent.introTitle}</strong>
        <p>{jobContent.introDescription}</p>
      </article>

      <div className="social-situation-list">
        {jobContent.situations.map((situation, index) => (
          <div key={situation.id} className="social-situation-row">
            <span className="social-situation-index">상황 {index + 1}</span>
            <button
              type="button"
              className="social-situation-card"
              onClick={() => onSelectSituation(situation.id)}
            >
              {situation.label}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default SituationSelect;
