import './MyPageStyles.css';

const profileRows = [
  ['아이디', 'userId'],
  ['이름', 'userName'],
  ['생년월일', 'birthDate'],
  ['성별', 'gender'],
  ['이메일', 'email'],
  ['희망직무', 'job'],
];

function ViewProfile({ userData, onEditClick }) {
  return (
    <section className="mypage-panel">
      <div className="mypage-info-box">
        <div className="mypage-info-grid">
          {profileRows.map(([label, key]) => (
            <div className="info-item" key={key}>
              <span className="info-label">{label}</span>
              <span className="info-colon">:</span>
              <span className="info-value">{userData?.[key] || '-'}</span>
            </div>
          ))}
        </div>
      </div>

      <button type="button" className="mypage-submit-button" onClick={onEditClick}>
        <span className="mypage-button-text">수정</span>
      </button>
    </section>
  );
}

export default ViewProfile;
