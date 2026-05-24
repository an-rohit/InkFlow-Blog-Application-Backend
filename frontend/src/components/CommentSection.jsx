import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCommentsApi, addCommentApi, updateCommentApi, deleteCommentApi } from '../api/comments';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function CommentSection({ postId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');
  const [error, setError] = useState('');

  const fetchComments = async () => {
    try {
      const res = await getCommentsApi(postId);
      // Backend: GET /post/:id/comments → { status, message, postComment: [] }
      setComments(Array.isArray(res.data?.postComment) ? res.data.postComment : []);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComments(); }, [postId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await addCommentApi(postId, { content: text.trim() });
      setText('');
      fetchComments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (id) => {
    if (!editText.trim()) return;
    try {
      await updateCommentApi(id, { content: editText.trim() });
      setEditId(null);
      fetchComments();
    } catch { /* ignore */ }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteCommentApi(id);
      fetchComments();
    } catch { /* ignore */ }
  };

  return (
    <section style={cs.section}>
      <h3 style={cs.heading}>💬 Comments ({comments.length})</h3>

      {/* Add comment */}
      {user ? (
        <form onSubmit={handleAdd} style={cs.form}>
          <div style={cs.inputRow}>
            {(user.profileImage?.url || user.profileImage) ? (
              <img
                src={user.profileImage?.url || user.profileImage}
                alt={user.name}
                className="avatar"
                style={{ width: 36, height: 36, flexShrink: 0 }}
              />
            ) : (
              <div style={cs.authorDot}>{(user.name || 'U')[0].toUpperCase()}</div>
            )}
            <textarea
              style={cs.textarea}
              placeholder="Share your thoughts…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              id="comment-input"
            />
          </div>
          {error && <p style={{ color: 'var(--clr-danger)', fontSize: '0.8rem', marginTop: 4 }}>{error}</p>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={submitting || !text.trim()}
              id="comment-submit-btn"
            >
              {submitting ? 'Posting…' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <p style={cs.loginPrompt}>
          <a href="/login" style={{ color: 'var(--clr-primary-light)' }}>Log in</a> to join the conversation.
        </p>
      )}

      {/* List */}
      <div style={cs.list}>
        {loading ? (
          [1,2,3].map(i => (
            <div key={i} style={cs.skeletonCard}>
              <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="skeleton" style={{ width: 120, height: 12, borderRadius: 6 }} />
                <div className="skeleton" style={{ width: '90%', height: 10, borderRadius: 6 }} />
              </div>
            </div>
          ))
        ) : comments.length === 0 ? (
          <div style={cs.empty}>No comments yet. Be the first to share your thoughts!</div>
        ) : (
          comments.map((c) => {
            // Backend comment model uses 'author', not 'user'
            const isOwner = user && (c.author?._id === user._id || c.author === user._id);
            const authorName = c.author?.name || 'Anonymous';
            const authorAvatarUrl = c.author?.profileImage?.url || c.author?.profileImage;

            return (
              <div key={c._id} style={cs.commentCard}>
                <div style={cs.commentHeader}>
                  {authorAvatarUrl ? (
                    <img src={authorAvatarUrl} alt={authorName} className="avatar" style={{ width: 36, height: 36, flexShrink: 0 }} />
                  ) : (
                    <div style={cs.authorDot}>{authorName[0].toUpperCase()}</div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={cs.commentMeta}>
                      <span style={cs.commentAuthor}>{authorName}</span>
                      <span style={cs.commentTime}>{timeAgo(c.createdAt)}</span>
                    </div>
                    {editId === c._id ? (
                      <div style={{ marginTop: 8 }}>
                        <textarea
                          style={cs.textarea}
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={2}
                        />
                        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                          <button className="btn btn-primary btn-sm" onClick={() => handleEdit(c._id)}>Save</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setEditId(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <p style={cs.commentText}>{c.content}</p>
                    )}
                  </div>
                  {isOwner && editId !== c._id && (
                    <div style={cs.commentActions}>
                      <button
                        style={cs.commentActionBtn}
                        onClick={() => { setEditId(c._id); setEditText(c.content); }}
                        title="Edit"
                      >✏️</button>
                      <button
                        style={{ ...cs.commentActionBtn, color: 'var(--clr-danger)' }}
                        onClick={() => handleDelete(c._id)}
                        title="Delete"
                      >🗑️</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

const cs = {
  section: { marginTop: 48 },
  heading: {
    fontSize: '1.25rem',
    fontWeight: 700,
    marginBottom: 20,
    color: 'var(--clr-text-1)',
  },
  form: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--clr-border)',
    borderRadius: 'var(--radius-lg)',
    padding: 16,
    marginBottom: 24,
  },
  inputRow: { display: 'flex', gap: 12, alignItems: 'flex-start' },
  textarea: {
    flex: 1,
    background: 'var(--clr-surface-2)',
    border: '1px solid var(--clr-border)',
    borderRadius: 8,
    padding: '10px 12px',
    color: 'var(--clr-text-1)',
    fontSize: '0.9rem',
    fontFamily: 'var(--font-sans)',
    resize: 'vertical',
    minHeight: 72,
    width: '100%',
  },
  loginPrompt: {
    color: 'var(--clr-text-2)',
    fontSize: '0.875rem',
    padding: '12px 0',
  },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  skeletonCard: {
    display: 'flex',
    gap: 12,
    padding: 16,
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--clr-border)',
    borderRadius: 12,
  },
  empty: {
    color: 'var(--clr-text-2)',
    fontSize: '0.875rem',
    padding: '20px 0',
    textAlign: 'center',
  },
  commentCard: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--clr-border)',
    borderRadius: 12,
    padding: 16,
  },
  commentHeader: { display: 'flex', gap: 12, alignItems: 'flex-start' },
  authorDot: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.85rem',
    color: '#fff',
    flexShrink: 0,
  },
  commentMeta: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 },
  commentAuthor: { fontWeight: 600, fontSize: '0.875rem', color: 'var(--clr-text-1)' },
  commentTime: { fontSize: '0.75rem', color: 'var(--clr-text-3)' },
  commentText: { fontSize: '0.9rem', color: 'var(--clr-text-2)', lineHeight: 1.6 },
  commentActions: { display: 'flex', gap: 6, flexShrink: 0 },
  commentActionBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.85rem',
    padding: '2px 6px',
    borderRadius: 6,
    transition: 'background 0.2s',
  },
};
