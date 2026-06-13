import { Link } from 'react-router-dom';
import { FiCode, FiGithub, FiTwitter } from 'react-icons/fi';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner container">
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="logo-icon"><FiCode /></div>
            <span className="logo-text">CodeQuest<span className="logo-pro">Pro</span></span>
          </div>
          <p className="footer-tagline">Master algorithms. Compete globally. Code your future.</p>
        </div>
        <div className="footer-links">
          <div className="footer-col">
            <h4>Platform</h4>
            <Link to="/problems">Problems</Link>
            <Link to="/contests">Contests</Link>
            <Link to="/leaderboard">Leaderboard</Link>
          </div>
          <div className="footer-col">
            <h4>Account</h4>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/achievements">Achievements</Link>
            <Link to="/settings">Settings</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} CodeQuest Pro. Built for developers.</p>
          <div className="footer-socials">
            <a href="#" aria-label="GitHub"><FiGithub size={18} /></a>
            <a href="#" aria-label="Twitter"><FiTwitter size={18} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
