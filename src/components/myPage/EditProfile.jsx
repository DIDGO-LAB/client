import { useState } from 'react';
import './MyPageStyles.css';

const jobOptions = ['사무직', '단순노무직'];
const disabilityOptions = ['발달장애', '지체장애'];

function EditProfile({ userData, onSave, onPrev, isSaving = false }) {
  const initialJob = userData?.job || '';
  const [formData, setFormData] = useState({
    email: userData?.email || '',
    disability: userData?.disability || '',
    job: jobOptions.includes(initialJob) ? initialJob : '',
    customJob: jobOptions.includes(initialJob) ? '' : initialJob,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleJobSelect = (job) => {
    setFormData((prev) => ({
      ...prev,
      job,
      customJob: '',
    }));
  };

  const handleSave = () => {
    const finalJob = formData.customJob.trim() || formData.job;

    if (!formData.email.trim() || !formData.disability.trim() || !finalJob.trim()) {
      alert('이메일, 장애 유형, 희망 직무를 모두 입력해 주세요.');
      return;
    }

    onSave({
      ...userData,
      email: formData.email,
      disability: formData.disability,
      job: finalJob,
    });
  };

  return (
    <section className="mypage-panel">
      <div className="mypage-info-box mypage-edit-box">
        <div className="mypage-info-grid mypage-edit-grid">
          <div className="info-item">
            <span className="info-label">아이디</span>
            <span className="info-colon">:</span>
            <span className="info-value">{userData?.userId || '-'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">이름</span>
            <span className="info-colon">:</span>
            <span className="info-value">{userData?.userName || '-'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">생년월일</span>
            <span className="info-colon">:</span>
            <span className="info-value">{userData?.birthDate || '-'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">성별</span>
            <span className="info-colon">:</span>
            <span className="info-value">{userData?.gender || '-'}</span>
          </div>
          <label className="info-item">
            <span className="info-label">이메일</span>
            <span className="info-colon">:</span>
            <input
              type="email"
              className="mypage-input-field"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </label>
          <div className="info-item">
            <span className="info-label">장애유형</span>
            <span className="info-colon">:</span>
            <div className="mypage-job-options">
              {disabilityOptions.map((disability) => (
                <button
                  key={disability}
                  type="button"
                  className={`mypage-job-button ${formData.disability === disability ? 'selected' : ''}`}
                  onClick={() => handleChange('disability', disability)}
                >
                  {disability}
                </button>
              ))}
            </div>
          </div>
          <div className="info-item">
            <span className="info-label">희망직무</span>
            <span className="info-colon">:</span>
            <div className="mypage-job-field">
              <div className="mypage-job-options">
                {jobOptions.map((job) => (
                  <button
                    key={job}
                    type="button"
                    className={`mypage-job-button ${formData.job === job ? 'selected' : ''}`}
                    onClick={() => handleJobSelect(job)}
                  >
                    {job}
                  </button>
                ))}
              </div>
              <input
                className="mypage-input-field mypage-job-input"
                placeholder="직접 입력"
                value={formData.customJob}
                onChange={(e) => {
                  handleChange('customJob', e.target.value);
                  handleChange('job', '');
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <button type="button" className="mypage-submit-button" onClick={handleSave} disabled={isSaving}>
        <span className="mypage-button-text">{isSaving ? '저장 중' : '저장'}</span>
      </button>
      <button type="button" className="mypage-cancel-button" onClick={onPrev} disabled={isSaving}>
        취소
      </button>
    </section>
  );
}

export default EditProfile;
