import { JOB_TYPES } from './SocialTrainingData';
import { SocialBackButton, SocialHelpButton } from './SocialTrainingControls';
import './SocialTraining.css';

function JobTypeSelect({ onSelectJob, onPrev }) {
  return (
    <section className="social-training-step">
      <SocialBackButton onClick={onPrev} />
      <SocialHelpButton />

      <div className="social-job-options">
        {JOB_TYPES.map((job) => (
          <button
            key={job.id}
            type="button"
            className="social-choice-button"
            onClick={() => onSelectJob(job.id)}
          >
            {job.label}
          </button>
        ))}
      </div>
    </section>
  );
}

export default JobTypeSelect;
