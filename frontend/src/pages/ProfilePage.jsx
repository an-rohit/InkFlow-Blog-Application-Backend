import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { updateMeApi, changePasswordApi, uploadProfileImageApi, updateProfileImageApi, deleteUserApi } from '../api/auth';

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [name, setName] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPw, setSavingPw] = useState(false);
  const [pwError, setPwError] = useState('');

  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleNameUpdate = async (e) => {
    e.preventDefault();
    setSavingName(true);
    try {
      // Backend: PATCH /auth/me expects { updatedName } not { name }
      await updateMeApi({ updatedName: name });
      setUser((prev) => ({ ...prev, name }));
      toast('Name updated ✅');
    } catch (err) {
      toast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setSavingName(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPwError('Passwords do not match');
      return;
    }
    setPwError('');
    setSavingPw(true);
    try {
      await changePasswordApi({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast('Password changed ✅');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Password change failed');
    } finally {
      setSavingPw(false);
    }
  };

  const handleProfileImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('profileImage', file);
    try {
      const fn = user?.profileImage ? updateProfileImageApi : uploadProfileImageApi;
      const res = await fn(fd);
      // Backend returns { profileImage: { url, public_id } }
      const imgObj = res.data?.profileImage;
      const newUrl = imgObj?.url || imgObj;
      if (newUrl) setUser((prev) => ({ ...prev, profileImage: newUrl }));
      toast('Profile picture updated ✅');
    } catch { toast('Image upload failed', 'error'); }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('This will permanently delete your account and all your data. Are you sure?')) return;
    setDeletingAccount(true);
    try {
      await deleteUserApi();
      await logout();
      navigate('/');
      toast('Account deleted');
    } catch { toast('Delete failed', 'error'); setDeletingAccount(false); }
  };

  const initials = (user?.name || 'U')[0].toUpperCase();

  return (
    <div className="page" style={{ paddingBottom: 80 }}>
      <div className="container" style={{ maxWidth: 720, paddingTop: 40 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, marginBottom: 8, color: 'var(--clr-text-1)' }}>
          👤 Profile Settings
        </h1>
        <p style={{ color: 'var(--clr-text-2)', marginBottom: 40 }}>Manage your account and preferences</p>

        {/* Avatar */}
        <div style={pp.section}>
          <h2 style={pp.sectionTitle}>Profile Picture</h2>
          <div style={pp.avatarRow}>
            <div style={pp.avatarWrap}>
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="avatar" style={{ width: 80, height: 80 }} />
              ) : (
                <div style={pp.avatarBig}>{initials}</div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => fileRef.current?.click()}
                id="upload-avatar-btn"
              >
                📷 Change Photo
              </button>
              <p style={{ fontSize: '0.75rem', color: 'var(--clr-text-3)' }}>JPG, PNG or WebP. Max 5MB.</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleProfileImage} id="avatar-input" />
          </div>
        </div>

        {/* Name */}
        <div style={pp.section}>
          <h2 style={pp.sectionTitle}>Display Name</h2>
          <form onSubmit={handleNameUpdate} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="profile-name">Name</label>
              <input
                id="profile-name"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm" disabled={savingName} id="save-name-btn">
              {savingName ? 'Saving…' : 'Save'}
            </button>
          </form>
          <p style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--clr-text-3)' }}>
            Email: <strong style={{ color: 'var(--clr-text-2)' }}>{user?.email}</strong>
          </p>
        </div>

        {/* Password */}
        <div style={pp.section}>
          <h2 style={pp.sectionTitle}>Change Password</h2>
          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {pwError && <p className="error-msg">{pwError}</p>}
            <div className="form-group">
              <label className="form-label" htmlFor="current-password">Current Password</label>
              <input
                id="current-password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="new-password">New Password</label>
              <input
                id="new-password"
                type="password"
                className="form-input"
                placeholder="Min 8 characters"
                value={passwords.newPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                required
                minLength={8}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirm-new-password">Confirm New Password</label>
              <input
                id="confirm-new-password"
                type="password"
                className="form-input"
                placeholder="Same as above"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))}
                required
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={savingPw} id="change-password-btn">
                {savingPw ? 'Updating…' : '🔒 Update Password'}
              </button>
            </div>
          </form>
        </div>

        {/* Danger zone */}
        <div style={{ ...pp.section, borderColor: 'rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.04)' }}>
          <h2 style={{ ...pp.sectionTitle, color: 'var(--clr-danger)' }}>⚠️ Danger Zone</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--clr-text-2)', marginBottom: 16 }}>
            Permanently delete your account and all your data. This action cannot be undone.
          </p>
          <button
            className="btn btn-danger"
            onClick={handleDeleteAccount}
            disabled={deletingAccount}
            id="delete-account-btn"
          >
            {deletingAccount ? 'Deleting…' : '🗑️ Delete My Account'}
          </button>
        </div>
      </div>
    </div>
  );
}

const pp = {
  section: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--clr-border)',
    borderRadius: 'var(--radius-xl)',
    padding: 28,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--clr-text-1)',
    marginBottom: 20,
  },
  avatarRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
  },
  avatarWrap: {
    flexShrink: 0,
  },
  avatarBig: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: 700,
    color: '#fff',
  },
};
