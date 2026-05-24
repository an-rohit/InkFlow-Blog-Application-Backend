import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div style={ts.container}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              ...ts.toast,
              ...(t.type === 'error' ? ts.error : t.type === 'warning' ? ts.warning : ts.success),
            }}
            className="animate-slideRight"
          >
            <span>{t.type === 'error' ? '❌' : t.type === 'warning' ? '⚠️' : '✅'}</span>
            <span style={ts.msg}>{t.message}</span>
            <button style={ts.close} onClick={() => removeToast(t.id)}>✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};

const ts = {
  container: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    zIndex: 9999,
    pointerEvents: 'none',
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 16px',
    borderRadius: 12,
    boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
    fontSize: '0.875rem',
    fontWeight: 500,
    maxWidth: 360,
    pointerEvents: 'auto',
  },
  msg: { flex: 1, color: 'var(--clr-text-1)' },
  close: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--clr-text-3)',
    fontSize: '0.75rem',
    padding: 2,
  },
  success: {
    background: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
  },
  error: {
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
  warning: {
    background: 'rgba(245, 158, 11, 0.15)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
  },
};
