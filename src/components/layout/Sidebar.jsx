import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api';
import homeIcon from '../../assets/sidebar_home.png';
import noteIcon from '../../assets/sidebar_note.png';
import './Sidebar.css';

const navItems = [
  { key: 'main', label: '홈', path: '/main', icon: homeIcon },
  { key: 'training', label: '훈련', path: '/training', icon: noteIcon },
  { key: 'history', label: '기록', path: '/training-history', icon: noteIcon },
  { key: 'mypage', label: '내 정보', path: '/mypage', icon: noteIcon },
];

function Sidebar({ activeKey = 'main' }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      alert(error?.message || '로그아웃 요청에 실패했습니다. 다시 로그인해 주세요.');
    } finally {
      navigate('/');
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span>Job Step</span>
        <strong>직업 훈련</strong>
      </div>

      <nav className="sidebar-nav" aria-label="주요 메뉴">
        {navItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`sidebar-item sidebar-item-${item.key} ${activeKey === item.key ? 'is-active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="sidebar-icon-frame">
              <img src={item.icon} alt="" className="sidebar-custom-icon" />
            </span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <button type="button" className="sidebar-logout" onClick={handleLogout}>
        로그아웃
      </button>
    </aside>
  );
}

export default Sidebar;
