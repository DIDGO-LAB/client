import { SocialBackButton } from './SocialTrainingControls';
import './SocialTraining.css';

function SituationTutorial({ tutorial, onNext, onPrev }) {
  return (
    <section className="social-training-step is-clickable" onClick={onNext}>
      <SocialBackButton onClick={onPrev} />

      <div className="social-tutorial-box">{tutorial.description}</div>
    </section>
  );
}

export default SituationTutorial;
