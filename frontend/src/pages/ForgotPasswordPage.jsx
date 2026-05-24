import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgetPasswordApi } from '../api/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgetPasswordApi({ email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card auth-card animate-scaleIn">
        <div className="auth-logo">
          <div className="auth-logo-icon">🔑</div>
          <span className="auth-logo-text">InkFlow</span>
        </div>
        <h1 className="auth-title">Forgot password?</h1>
        <p className="auth-subtitle">
          Enter your email and we&apos;ll send you a reset link
        </p>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📧</div>
            <p className="success-msg">
              Reset link sent! Check your inbox and follow the instructions.
            </p>
            <Link to="/login" className="btn btn-ghost" style={{ marginTop: 20, width: '100%', justifyContent: 'center' }}>
              ← Back to login
            </Link>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <p className="error-msg">{error}</p>}
            <div className="form-group">
              <label className="form-label" htmlFor="forgot-email">Email address</label>
              <input
                id="forgot-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={loading}
              id="forgot-submit-btn"
            >
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
            <Link to="/login" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
              ← Back to login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
