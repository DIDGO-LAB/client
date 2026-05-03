import './IntroStyles.css';
import characterImg from '../../assets/Character_JIWOO.png';

function StartTypeSelect({ onNext }) {
  return (
    <div className="intro-page-wrapper">
      <img
        src={characterImg}
        alt="캐릭터"
        className="intro-character-img"
        style={{ left: '474px', top: '392px', width: '366px', height: '428px' }}
      />

      <button
        className="intro_select-button"
        style={{
          left: '1073px',
          top: '517px',
          width: '355px',
          height: '89px',
          backgroundColor: '#FBF3C4',
          borderColor: '#F4E695',
        }}
        onClick={() => onNext({ startType: 'newbie' })}
      >
        <span className="intro-button-text">처음 사용해요</span>
      </button>

      <button
        className="intro_select-button"
        style={{
          left: '1073px',
          top: '641px',
          width: '355px',
          height: '89px',
          backgroundColor: '#E8FABF',
          borderColor: '#CDEF7E',
        }}
        onClick={() => onNext({ startType: 'usedBefore' })}
      >
        <span className="intro-button-text">사용해 봤어요</span>
      </button>
    </div>
  );
}

export default StartTypeSelect;
