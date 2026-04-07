import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/inventory', label: 'Inventory', icon: '📦' },
  { path: '/volunteers', label: 'Volunteers', icon: '🙋' },
  { path: '/dispatch', label: 'Dispatch', icon: '🚚' },
  { path: '/centers', label: 'Relief Centers', icon: '🏢' },
  { path: '/heatmap', label: 'Heatmap', icon: '🔥' },
  { path: '/analytics', label: 'Analytics', icon: '📈' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">🆘</span>
          <span className="logo-text">Relief Tracker</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div className="user-details">
            <span className="user-name">{user?.name}</span>
            <span className={`user-role ${user?.role}`}>{user?.role?.replace('_', ' ')}</span>
          </div>
        </div>
        <button className="logout-btn" onClick={logout} title="Logout">⏻</button>
      </div>
    </aside>
  );
}
