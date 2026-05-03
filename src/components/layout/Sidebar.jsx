import { useNavigate } from 'react-router-dom';
import homeIcon from '../../assets/sidebar_home.png';
import noteIcon from '../../assets/sidebar_note.png';
import './Sidebar.css';

const navItems = [
  { key: 'main', label: '메인페이지', path: '/main', icon: homeIcon },
  { key: 'training', label: '훈련', path: '/training', icon: noteIcon },
  { key: 'history', label: '훈련이력', path: '/training-history', icon: noteIcon },
  { key: 'mypage', label: '마이페이지', path: '/mypage', icon: noteIcon },
];

function Sidebar({ activeKey = 'main' }) {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`sidebar-item ${activeKey === item.key ? 'is-active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <img src={item.icon} alt="" className="sidebar-custom-icon" />
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}

        <button type="button" className="sidebar-item" onClick={() => navigate('/intro/StartTypeSelect')}>
          <img src={noteIcon} alt="" className="sidebar-custom-icon" />
          <span className="sidebar-label">로그아웃</span>
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;
