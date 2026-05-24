import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '40px 24px',
      background: `
        radial-gradient(ellipse 60% 50% at 50% 0%, rgba(124, 58, 237, 0.15) 0%, transparent 70%),
        var(--clr-bg)
      `,
    }}>
      <div style={{ fontSize: '6rem', marginBottom: 16, animation: 'pulse 2s ease infinite' }}>404</div>
      <h1 style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '2.5rem',
        fontWeight: 700,
        color: 'var(--clr-text-1)',
        marginBottom: 12,
      }}>
        Page not found
      </h1>
      <p style={{ color: 'var(--clr-text-2)', maxWidth: 400, marginBottom: 32, lineHeight: 1.7 }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <Link to="/" className="btn btn-primary" id="not-found-home-btn">← Back to Home</Link>
      </div>
    </div>
  );
}
