import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { userAPI } from '../api/services';
import { FiUser, FiLock, FiSun, FiMoon } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState({ username: user?.username || '', bio: user?.bio || '', location: user?.location || '', github: user?.github || '', linkedin: user?.linkedin || '', website: user?.website || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      const { data } = await userAPI.updateProfile(profile);
      updateUser(data.data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
    setSaving(false);
  };

  const handlePasswordChange = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passwords.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSaving(true);
    try {
      await userAPI.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
    setSaving(false);
  };

  return (
    <div className="page container" style={{ maxWidth: 720 }}>
      <h1 className="page-title" style={{ marginBottom: 24 }}>Settings</h1>

      <div className="tabs" style={{ marginBottom: 28 }}>
        <button className={`tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}><FiUser style={{ marginRight: 6 }} />Profile</button>
        <button className={`tab ${tab === 'password' ? 'active' : ''}`} onClick={() => setTab('password')}><FiLock style={{ marginRight: 6 }} />Password</button>
        <button className={`tab ${tab === 'appearance' ? 'active' : ''}`} onClick={() => setTab('appearance')}>Appearance</button>
      </div>

      {tab === 'profile' && (
        <div className="card">
          {[
            { key: 'username', label: 'Username', type: 'text' },
            { key: 'bio', label: 'Bio', type: 'textarea' },
            { key: 'location', label: 'Location', type: 'text' },
            { key: 'github', label: 'GitHub URL', type: 'url' },
            { key: 'linkedin', label: 'LinkedIn URL', type: 'url' },
            { key: 'website', label: 'Website', type: 'url' },
          ].map(({ key, label, type }) => (
            <div className="form-group" key={key}>
              <label className="form-label">{label}</label>
              {type === 'textarea' ? (
                <textarea className="form-input" value={profile[key]} onChange={(e) => setProfile({ ...profile, [key]: e.target.value })} rows={3} />
              ) : (
                <input type={type} className="form-input" value={profile[key]} onChange={(e) => setProfile({ ...profile, [key]: e.target.value })} />
              )}
            </div>
          ))}
          <button className="btn btn-primary" onClick={handleProfileSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      )}

      {tab === 'password' && (
        <div className="card">
          {[
            { key: 'currentPassword', label: 'Current Password' },
            { key: 'newPassword', label: 'New Password' },
            { key: 'confirmPassword', label: 'Confirm New Password' },
          ].map(({ key, label }) => (
            <div className="form-group" key={key}>
              <label className="form-label">{label}</label>
              <input type="password" className="form-input" value={passwords[key]} onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })} />
            </div>
          ))}
          <button className="btn btn-primary" onClick={handlePasswordChange} disabled={saving}>{saving ? 'Changing...' : 'Change Password'}</button>
        </div>
      )}

      {tab === 'appearance' && (
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Theme</h3>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-outline'}`} onClick={() => theme !== 'light' && toggleTheme()}>
              <FiSun size={16} /> Light
            </button>
            <button className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-outline'}`} onClick={() => theme !== 'dark' && toggleTheme()}>
              <FiMoon size={16} /> Dark
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
