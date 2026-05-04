import { useState } from 'react';
import './IntroStyles.css';
import backArrow from '../../assets/back_arrow.png';

const jobOptions = [
  { value: '사무직', description: '자료 정리, 복사, 안내, 간단한 컴퓨터 업무' },
  { value: '단순노무직', description: '정리, 포장, 운반, 청소처럼 순서가 있는 업무' },
];

function JobSelect({ onNext, onPrev }) {
  const [selectedJob, setSelectedJob] = useState('');
  const isPresetJob = jobOptions.some((job) => job.value === selectedJob);

  const handleNextPage = () => {
    const finalJob = selectedJob.trim();

    if (!finalJob) {
      alert('희망 직무를 선택하거나 입력해 주세요.');
      return;
    }

    onNext({ job: finalJob });
  };

  return (
    <div className="intro-page-wrapper intro-step-page">
      <button className="intro-back-button" type="button" onClick={onPrev} aria-label="뒤로 가기">
        <img src={backArrow} alt="" className="intro-back-image" />
      </button>

      <section className="intro-step-card">
        <span className="intro-kicker">2단계</span>
        <h1 className="intro-main-text">연습하고 싶은 직무를 골라 주세요.</h1>
        <p className="intro-sub-text">나중에 내 정보에서 다시 바꿀 수 있습니다.</p>

        <div className="intro-choice-grid">
          {jobOptions.map((job) => (
            <button
              key={job.value}
              className={`intro_select-button ${selectedJob === job.value ? 'is-selected' : ''}`}
              type="button"
              onClick={() => setSelectedJob(job.value)}
            >
              <span className="intro-button-text">{job.value}</span>
              <small>{job.description}</small>
            </button>
          ))}
        </div>

        <input
          placeholder="다른 직무 직접 입력"
          className="intro-input-field intro-wide-input"
          value={isPresetJob ? '' : selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
        />

        <button className="intro-submit-button" type="button" onClick={handleNextPage}>
          <span className="intro-button-text">다음으로</span>
        </button>
      </section>
    </div>
  );
}

export default JobSelect;
