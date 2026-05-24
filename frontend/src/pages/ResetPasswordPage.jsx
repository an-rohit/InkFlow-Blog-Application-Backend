import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPasswordApi } from '../api/auth';
import { useToast } from '../components/Toast';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ token: searchParams.get('token') || '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await resetPasswordApi({ token: form.token, newPassword: form.newPassword });
      toast('Password reset successfully! Please log in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed — token may be expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card auth-card animate-scaleIn">
        <div className="auth-logo">
          <div className="auth-logo-icon">🔒</div>
          <span className="auth-logo-text">InkFlow</span>
        </div>
        <h1 className="auth-title">Reset password</h1>
        <p className="auth-subtitle">Choose a new secure password</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <p className="error-msg">{error}</p>}

          {!searchParams.get('token') && (
            <div className="form-group">
              <label className="form-label" htmlFor="reset-token">Reset Token</label>
              <input
                id="reset-token"
                name="token"
                type="text"
                className="form-input"
                placeholder="Paste your reset token"
                value={form.token}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="reset-new-password">New Password</label>
            <input
              id="reset-new-password"
              name="newPassword"
              type="password"
              className="form-input"
              placeholder="Min 8 characters"
              value={form.newPassword}
              onChange={handleChange}
              required
              minLength={8}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reset-confirm-password">Confirm Password</label>
            <input
              id="reset-confirm-password"
              name="confirmPassword"
              type="password"
              className="form-input"
              placeholder="Same as above"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}
            id="reset-submit-btn"
          >
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
          <Link to="/login" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
            ← Back to login
          </Link>
        </form>
      </div>
    </div>
  );
}
