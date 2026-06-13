import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div style={{
      minHeight: 'calc(100vh - var(--header-height) - 200px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: 40,
    }}>
      <div>
        <div style={{
          fontSize: '6rem',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          marginBottom: 8,
        }}>
          <span className="gradient-text">404</span>
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
          Page not found
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: 28, maxWidth: 400 }}>
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary btn-lg"><FiArrowLeft size={16} /> Go Home</Link>
          <Link to="/problems" className="btn btn-secondary btn-lg">Browse Problems</Link>
        </div>
      </div>
    </div>
  );
}
