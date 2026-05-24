import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyPostsApi, deletePostApi, togglePublishApi } from '../api/posts';
import { useToast } from '../components/Toast';
import Loader from '../components/Loader';

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MyPostsPage() {
  const { toast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyPosts = async () => {
    try {
      const res = await getMyPostsApi();
      // Backend: GET /post/me/post → { status, message, post } (array)
      setPosts(Array.isArray(res.data?.post) ? res.data.post : []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyPosts(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await deletePostApi(id);
      toast('Post deleted');
      setPosts((p) => p.filter((post) => post._id !== id));
    } catch { toast('Delete failed', 'error'); }
  };

  const handleTogglePublish = async (post) => {
    try {
      await togglePublishApi(post._id);
      setPosts((prev) =>
        prev.map((p) => p._id === post._id ? { ...p, published: !p.published } : p)
      );
      toast(`Post ${post.published ? 'unpublished' : 'published'} ✅`);
    } catch { toast('Failed to update status', 'error'); }
  };

  if (loading) return <Loader />;

  return (
    <div className="page" style={{ paddingBottom: 80 }}>
      <div className="container" style={{ paddingTop: 40 }}>
        <div className="section-header">
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, color: 'var(--clr-text-1)' }}>
              📝 My Posts
            </h1>
            <p style={{ color: 'var(--clr-text-2)', marginTop: 4 }}>{posts.length} post{posts.length !== 1 ? 's' : ''}</p>
          </div>
          <Link to="/create-post" className="btn btn-primary" id="my-posts-create-btn">
            + New Post
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✍️</div>
            <h2 className="empty-state-title">No posts yet</h2>
            <p className="empty-state-desc">Write your first post and share it with the world!</p>
            <Link to="/create-post" className="btn btn-primary" style={{ marginTop: 8 }}>Create Post</Link>
          </div>
        ) : (
          <div style={mp.table}>
            {posts.map((post) => (
              <div key={post._id} style={mp.row} className="animate-fadeInUp">
                {/* Cover thumb */}
                <div style={mp.thumb}>
                  {(post.coverImage?.url || post.coverImage) ? (
                    <img src={post.coverImage?.url || post.coverImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                  ) : (
                    <div style={mp.thumbPlaceholder}>📷</div>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link to={`/posts/${post._id}`} style={{ textDecoration: 'none' }}>
                    <h3 style={mp.postTitle}>{post.title}</h3>
                  </Link>
                  <div style={mp.postMeta}>
                    <span>{formatDate(post.createdAt)}</span>
                    <span>·</span>
                    <span>❤️ {post.likeCount ?? 0}</span>
                    <span>·</span>
                    <span
                      className={`badge ${post.published ? 'badge-green' : 'badge-red'}`}
                    >
                      {post.published ? '✅ Published' : '📝 Draft'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={mp.actions}>
                  <Link to={`/edit-post/${post._id}`} className="btn btn-ghost btn-sm" id={`edit-btn-${post._id}`}>✏️</Link>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleTogglePublish(post)}
                    id={`publish-btn-${post._id}`}
                    title={post.published ? 'Unpublish' : 'Publish'}
                  >
                    {post.published ? '📤' : '📢'}
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(post._id)}
                    id={`delete-btn-${post._id}`}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const mp = {
  table: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--clr-border)',
    borderRadius: 'var(--radius-lg)',
    transition: 'border-color 0.2s, background 0.2s',
  },
  thumb: {
    width: 80,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    flexShrink: 0,
    background: 'var(--clr-surface-2)',
  },
  thumbPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
  },
  postTitle: {
    fontWeight: 600,
    fontSize: '0.95rem',
    color: 'var(--clr-text-1)',
    marginBottom: 4,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  postMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: '0.8rem',
    color: 'var(--clr-text-3)',
    flexWrap: 'wrap',
  },
  actions: {
    display: 'flex',
    gap: 6,
    flexShrink: 0,
  },
};
