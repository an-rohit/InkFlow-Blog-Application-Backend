import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signupApi, verifyEmailApi } from '../api/auth';
import { useToast } from '../components/Toast';

const STEPS = { REGISTER: 'register', OTP: 'otp' };

export default function RegisterPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(STEPS.REGISTER);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signupApi(form);
      setSuccess('A verification code was sent to your email!');
      setStep(STEPS.OTP);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyEmailApi({ email: form.email, otp });
      toast('Email verified! You can now log in. ✅');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card auth-card animate-scaleIn">
        <div className="auth-logo">
          <div className="auth-logo-icon">✍️</div>
          <span className="auth-logo-text">InkFlow</span>
        </div>

        {step === STEPS.REGISTER ? (
          <>
            <h1 className="auth-title">Create account</h1>
            <p className="auth-subtitle">Start your writing journey today</p>
            <form className="auth-form" onSubmit={handleRegister}>
              {error && <p className="error-msg">{error}</p>}

              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">Full Name</label>
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  className="form-input"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">Email</label>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  name="password"
                  type="password"
                  className="form-input"
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={loading}
                id="register-submit-btn"
              >
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="auth-title">Verify your email</h1>
            <p className="auth-subtitle">
              Enter the 6-digit code sent to <strong>{form.email}</strong>
            </p>
            <form className="auth-form" onSubmit={handleVerify}>
              {success && <p className="success-msg">{success}</p>}
              {error && <p className="error-msg">{error}</p>}

              <div className="form-group">
                <label className="form-label" htmlFor="otp-input">Verification Code</label>
                <input
                  id="otp-input"
                  type="text"
                  className="form-input"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                  style={{ letterSpacing: '0.3em', fontSize: '1.4rem', textAlign: 'center' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={loading}
                id="otp-submit-btn"
              >
                {loading ? 'Verifying…' : 'Verify Email'}
              </button>

              <button
                type="button"
                className="btn btn-ghost"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => { setStep(STEPS.REGISTER); setError(''); setSuccess(''); }}
              >
                ← Back
              </button>
            </form>
          </>
        )}

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in →</Link>
        </div>
      </div>
    </div>
  );
}
