import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    ...(user
      ? [
          { to: '/my-posts', label: 'My Posts' },
          { to: '/bookmarks', label: 'Bookmarks' },
        ]
      : []),
  ];

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <div style={styles.logoIcon}>✍️</div>
          <span style={styles.logoText}>InkFlow</span>
        </Link>

        {/* Desktop links */}
        <div style={styles.links}>
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              style={({ isActive }) => ({
                ...styles.link,
                ...(isActive ? styles.linkActive : {}),
              })}
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Right side */}
        <div style={styles.right}>
          {user ? (
            <>
              <Link to="/create-post" className="btn btn-primary btn-sm">
                + Write
              </Link>
              <div style={{ position: 'relative' }} ref={dropRef}>
                <button style={styles.avatarBtn} onClick={() => setMenuOpen((p) => !p)} id="nav-avatar-btn">
                  {/* profileImage is stored as { url, public_id } on backend */}
                  {(user.profileImage?.url || user.profileImage) ? (
                    <img
                      src={user.profileImage?.url || user.profileImage}
                      alt={user.name}
                      className="avatar"
                      style={{ width: 36, height: 36 }}
                    />
                  ) : (
                    <div style={styles.avatarPlaceholder}>
                      {(user.name || 'U')[0].toUpperCase()}
                    </div>
                  )}
                </button>
                {menuOpen && (
                  <div className="dropdown-menu">
                    <div style={styles.dropUser}>
                      <div style={styles.dropName}>{user.name}</div>
                      <div style={styles.dropEmail}>{user.email}</div>
                    </div>
                    <div style={{ height: 1, background: 'var(--clr-border)', margin: '4px 0' }} />
                    <Link to="/profile" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                      👤 Profile
                    </Link>
                    <Link to="/my-posts" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                      📝 My Posts
                    </Link>
                    <Link to="/bookmarks" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                      🔖 Bookmarks
                    </Link>
                    <div style={{ height: 1, background: 'var(--clr-border)', margin: '4px 0' }} />
                    <button className="dropdown-item danger" onClick={handleLogout} id="nav-logout-btn">
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button style={styles.hamburger} className="nav-hamburger" onClick={() => setMobileOpen((p) => !p)} id="nav-hamburger">
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={styles.mobileMenu}>
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              style={styles.mobileLink}
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
          {user ? (
            <>
              <Link to="/create-post" style={styles.mobileLink} onClick={() => setMobileOpen(false)}>✍️ Write</Link>
              <Link to="/profile" style={styles.mobileLink} onClick={() => setMobileOpen(false)}>👤 Profile</Link>
              <button style={{ ...styles.mobileLink, color: 'var(--clr-danger)', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }} onClick={handleLogout}>🚪 Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.mobileLink} onClick={() => setMobileOpen(false)}>Log in</Link>
              <Link to="/register" style={styles.mobileLink} onClick={() => setMobileOpen(false)}>Sign up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    background: 'rgba(10, 10, 15, 0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--clr-border)',
  },
  inner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 24px',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 24,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    textDecoration: 'none',
    flexShrink: 0,
  },
  logoIcon: {
    width: 36,
    height: 36,
    background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem',
  },
  logoText: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.4rem',
    fontWeight: 700,
    background: 'linear-gradient(135deg, var(--clr-primary-light), var(--clr-accent))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  links: {
    display: 'flex',
    gap: 4,
    flex: 1,
  },
  link: {
    padding: '6px 14px',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.9rem',
    fontWeight: 500,
    color: 'var(--clr-text-2)',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
  },
  linkActive: {
    color: 'var(--clr-primary-light)',
    background: 'rgba(124, 58, 237, 0.12)',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginLeft: 'auto',
  },
  avatarBtn: {
    background: 'none',
    border: '2px solid var(--clr-border)',
    borderRadius: '50%',
    padding: 0,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    overflow: 'hidden',
    transition: 'border-color 0.2s',
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.9rem',
    color: '#fff',
  },
  dropUser: {
    padding: '12px 16px 8px',
  },
  dropName: {
    fontWeight: 600,
    fontSize: '0.9rem',
    color: 'var(--clr-text-1)',
  },
  dropEmail: {
    fontSize: '0.75rem',
    color: 'var(--clr-text-3)',
    marginTop: 2,
  },
  hamburger: {
    background: 'none',
    border: 'none',
    color: 'var(--clr-text-2)',
    fontSize: '1.2rem',
    cursor: 'pointer',
    padding: 8,
    display: 'none',   // shown via CSS .nav-hamburger class on small screens
  },
  mobileMenu: {
    display: 'flex',
    flexDirection: 'column',
    padding: '12px 24px 16px',
    borderTop: '1px solid var(--clr-border)',
    gap: 4,
  },
  mobileLink: {
    display: 'block',
    padding: '10px 14px',
    borderRadius: 8,
    color: 'var(--clr-text-2)',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: 500,
  },
};
