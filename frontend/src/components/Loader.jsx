export default function Loader({ fullPage = true, size = 48 }) {
  const spinnerStyle = {
    width: size,
    height: size,
    border: `3px solid rgba(124, 58, 237, 0.2)`,
    borderTopColor: 'var(--clr-primary)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  };

  if (fullPage) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        background: 'var(--clr-bg)',
      }}>
        <div style={spinnerStyle} />
        <p style={{ color: 'var(--clr-text-3)', fontSize: '0.875rem' }}>Loading…</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
      <div style={spinnerStyle} />
    </div>
  );
}
