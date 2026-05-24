import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPostByIdApi, deletePostApi, togglePublishApi } from '../api/posts';
import { toggleLikeApi, getLikeCountApi, checkLikedApi } from '../api/likes';
import { toggleBookmarkApi } from '../api/bookmarks';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import CommentSection from '../components/CommentSection';
import Loader from '../components/Loader';

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function PostDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getPostByIdApi(id);
        // Backend: GET /post/:id → { status, message, post }
        const p = res.data?.post || null;
        setPost(p);

        const lcRes = await getLikeCountApi(id);
        // Backend: GET /post/:id/likes/count → { status, message, likeCount }
        setLikeCount(lcRes.data?.likeCount ?? 0);

        if (user) {
          try {
            const likedRes = await checkLikedApi(id);
            // Backend: GET /post/:id/liked → { status, liked }
            setLiked(likedRes.data?.liked ?? false);
          } catch { /* not liked */ }
        }
      } catch {
        toast('Post not found', 'error');
        navigate('/');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user]);

  const handleLike = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await toggleLikeApi(id);
      setLiked((p) => !p);
      setLikeCount((c) => liked ? c - 1 : c + 1);
    } catch { toast('Failed to update like', 'error'); }
  };

  const handleBookmark = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await toggleBookmarkApi(id);
      setBookmarked((p) => !p);
      toast(bookmarked ? 'Removed from bookmarks' : 'Saved to bookmarks ✅');
    } catch { toast('Failed to update bookmark', 'error'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      await deletePostApi(id);
      toast('Post deleted');
      navigate('/my-posts');
    } catch { toast('Delete failed', 'error'); }
  };

  const handleTogglePublish = async () => {
    try {
      await togglePublishApi(post._id);
      setPost((p) => ({ ...p, published: !p.published }));
      toast(`Post ${post.published ? 'unpublished' : 'published'} ✅`);
    } catch { toast('Failed to update status', 'error'); }
  };

  if (loading) return <Loader />;
  if (!post) return null;

  const isOwner = user && (post.author?._id === user._id || post.author === user._id);
  const authorName = post.author?.name || 'Anonymous';
  // Images are stored as { url, public_id } objects
  const coverUrl = post.coverImage?.url || post.coverImage;
  const authorAvatarUrl = post.author?.profileImage?.url || post.author?.profileImage;

  return (
    <div className="page" style={{ paddingBottom: 80 }}>
      {/* Hero / Cover */}
      {coverUrl && (
        <div style={ps.heroWrap}>
          <img src={coverUrl} alt={post.title} style={ps.heroImg} />
          <div style={ps.heroOverlay} />
        </div>
      )}

      <div className="container" style={{ maxWidth: 820 }}>
        {/* Back */}
        <Link to="/" style={ps.backLink}>← All Posts</Link>

        {/* Title */}
        <h1 style={ps.title}>{post.title}</h1>

        {/* Meta */}
        <div style={ps.meta}>
          <div style={ps.authorRow}>
            {authorAvatarUrl ? (
              <img src={authorAvatarUrl} alt={authorName} className="avatar" style={{ width: 40, height: 40 }} />
            ) : (
              <div style={ps.authorDot}>{authorName[0].toUpperCase()}</div>
            )}
            <div>
              <div style={ps.authorName}>{authorName}</div>
              <div style={ps.dateRow}>
                {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                {!post.published && (
                  <span className="badge badge-red" style={{ marginLeft: 8 }}>Draft</span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={ps.actions}>
            <button
              style={{ ...ps.actionBtn, ...(liked ? ps.likedBtn : {}) }}
              onClick={handleLike}
              id="detail-like-btn"
            >
              {liked ? '❤️' : '🤍'} {likeCount}
            </button>
            <button
              style={{ ...ps.actionBtn, ...(bookmarked ? ps.bookmarkedBtn : {}) }}
              onClick={handleBookmark}
              id="detail-bookmark-btn"
            >
              {bookmarked ? '🔖' : '📌'}
            </button>

            {/* Owner controls */}
            {isOwner && (
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <Link to={`/edit-post/${post._id}`} className="btn btn-ghost" id="post-edit-btn">
                  ✏️ Edit Post
                </Link>
                <button className="btn btn-ghost" onClick={handleTogglePublish} id="post-publish-btn">
                  {post.published ? '📤 Unpublish' : '📢 Publish'}
                </button>
                <button className="btn btn-danger" onClick={handleDelete} id="post-delete-btn">
                  🗑️ Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="divider" />

        {/* Content */}
        <div style={ps.content}>
          {post.content?.split('\n').map((para, i) =>
            para.trim() ? <p key={i} style={{ marginBottom: '1.2em' }}>{para}</p> : <br key={i} />
          )}
        </div>

        <div className="divider" />

        {/* Comments */}
        <CommentSection postId={id} />
      </div>
    </div>
  );
}

const ps = {
  heroWrap: {
    width: '100%',
    height: 400,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 0,
  },
  heroImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to bottom, transparent 40%, var(--clr-bg))',
  },
  backLink: {
    display: 'inline-block',
    marginTop: 32,
    marginBottom: 20,
    color: 'var(--clr-text-3)',
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'color 0.2s',
    textDecoration: 'none',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
    fontWeight: 700,
    lineHeight: 1.3,
    marginBottom: 24,
    color: 'var(--clr-text-1)',
  },
  meta: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  authorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  authorDot: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  authorName: { fontWeight: 600, fontSize: '0.95rem', color: 'var(--clr-text-1)' },
  date: { fontSize: '0.8rem', color: 'var(--clr-text-3)', marginTop: 2 },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionBtn: {
    background: 'var(--clr-surface-2)',
    border: '1px solid var(--clr-border)',
    borderRadius: 'var(--radius-full)',
    padding: '6px 14px',
    fontSize: '0.875rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: 'var(--clr-text-2)',
    transition: 'all 0.2s',
    fontFamily: 'var(--font-sans)',
  },
  likedBtn: {
    borderColor: 'rgba(239,68,68,0.4)',
    background: 'rgba(239,68,68,0.1)',
    color: 'var(--clr-danger)',
  },
  bookmarkedBtn: {
    borderColor: 'rgba(124,58,237,0.4)',
    background: 'rgba(124,58,237,0.1)',
  },
  content: {
    fontSize: '1.05rem',
    lineHeight: 1.85,
    color: 'var(--clr-text-2)',
    letterSpacing: '0.01em',
  },
};
