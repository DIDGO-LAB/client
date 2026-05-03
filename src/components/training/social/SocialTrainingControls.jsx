import backArrow from '../../../assets/back_arrow.png';
import helpImg from '../../../assets/Help.png';
import micImg from '../../../assets/MIC.png';

export function SocialBackButton({ onClick }) {
  const handleClick = (event) => {
    event.stopPropagation();
    onClick?.();
  };

  return (
    <button
      type="button"
      className="social-back-button"
      onClick={handleClick}
      aria-label="back"
    >
      <img src={backArrow} alt="" className="social-back-image" />
    </button>
  );
}

export function SocialHelpButton() {
  return (
    <button type="button" className="social-help-button" aria-label="help">
      <img src={helpImg} alt="" />
    </button>
  );
}

export function SocialMicButton({ onClick, className = '' }) {
  return (
    <button
      type="button"
      className={`social-mic-button ${className}`}
      onClick={onClick}
      aria-label="start recording"
    >
      <img src={micImg} alt="" />
    </button>
  );
}
