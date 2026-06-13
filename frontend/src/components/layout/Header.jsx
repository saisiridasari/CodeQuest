import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FiCode, FiSun, FiMoon, FiMenu, FiX, FiChevronDown, FiUser, FiSettings, FiLogOut, FiShield, FiBell } from 'react-icons/fi';
import './Header.css';

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => { setMenuOpen(false); setDropdownOpen(false); }, [location]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/problems', label: 'Problems' },
    { to: '/contests', label: 'Contests' },
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/achievements', label: 'Achievements' },
  ];

  return (
    <header className="header">
      <div className="header-inner container">
        <Link to="/" className="header-logo">
          <div className="logo-icon"><FiCode /></div>
          <span className="logo-text">CodeQuest<span className="logo-pro">Pro</span></span>
        </Link>

        <nav className={`header-nav ${menuOpen ? 'open' : ''}`}>
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className={`nav-link ${location.pathname.startsWith(link.to) ? 'active' : ''}`}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <button className="btn-icon theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
          </button>

          {user ? (
            <>
              <Link to="/notifications" className="btn-icon notif-btn" aria-label="Notifications">
                <FiBell size={18} />
              </Link>
              <div className="user-menu" ref={dropdownRef}>
                <button className="user-menu-trigger" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <div className="user-avatar-sm">{user.username?.[0]?.toUpperCase() || 'U'}</div>
                  <span className="user-name">{user.username}</span>
                  <FiChevronDown size={14} className={`chevron ${dropdownOpen ? 'rotated' : ''}`} />
                </button>
                {dropdownOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <div className="dropdown-user-info">
                        <p className="dropdown-username">{user.username}</p>
                        <p className="dropdown-level">Level {user.level} · {user.xp} XP</p>
                      </div>
                    </div>
                    <div className="dropdown-divider" />
                    <Link to="/dashboard" className="dropdown-item"><FiUser size={16} /> Dashboard</Link>
                    <Link to={`/profile/${user.username}`} className="dropdown-item"><FiUser size={16} /> Profile</Link>
                    <Link to="/settings" className="dropdown-item"><FiSettings size={16} /> Settings</Link>
                    {isAdmin && <Link to="/admin" className="dropdown-item"><FiShield size={16} /> Admin Panel</Link>}
                    <div className="dropdown-divider" />
                    <button className="dropdown-item logout-item" onClick={handleLogout}><FiLogOut size={16} /> Log out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost">Log in</Link>
              <Link to="/register" className="btn btn-primary">Sign up</Link>
            </div>
          )}

          <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
