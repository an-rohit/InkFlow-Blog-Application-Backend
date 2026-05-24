import { Link } from 'react-router-dom';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function truncate(str, n = 130) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n) + '…' : str;
}

export default function PostCard({ post, onLike, onBookmark, isLiked, isBookmarked }) {
  const authorName = post?.author?.name || 'Anonymous';
  const authorInitial = authorName[0].toUpperCase();
  // coverImage and profileImage are stored as { url, public_id } objects on the backend
  const coverUrl = post?.coverImage?.url || post?.coverImage;
  const authorAvatarUrl = post?.author?.profileImage?.url || post?.author?.profileImage;

  return (
    <article style={cardStyles.card} className="animate-fadeInUp">
      {/* Cover image */}
      {coverUrl && (
        <Link to={`/posts/${post._id}`} style={cardStyles.imageLink}>
          <img
            src={coverUrl}
            alt={post.title}
            style={cardStyles.image}
            loading="lazy"
          />
        </Link>
      )}

      <div style={cardStyles.body}>
        {/* Status badge */}
        <div style={cardStyles.meta}>
          {!post?.isPublished && (
            <span className="badge badge-red">Draft</span>
          )}
          <span style={cardStyles.date}>{formatDate(post?.createdAt)}</span>
        </div>

        {/* Title */}
        <Link to={`/posts/${post._id}`} style={cardStyles.titleLink}>
          <h2 style={cardStyles.title}>{post?.title}</h2>
        </Link>

        {/* Excerpt */}
        <p style={cardStyles.excerpt}>{truncate(post?.content)}</p>

        {/* Author + Actions */}
        <div style={cardStyles.footer}>
          <div style={cardStyles.author}>
            {authorAvatarUrl ? (
              <img
                src={authorAvatarUrl}
                alt={authorName}
                className="avatar"
                style={{ width: 32, height: 32 }}
              />
            ) : (
              <div style={cardStyles.authorPlaceholder}>{authorInitial}</div>
            )}
            <span style={cardStyles.authorName}>{authorName}</span>
          </div>

          <div style={cardStyles.actions}>
            {/* Like */}
            <button
              style={{
                ...cardStyles.actionBtn,
                ...(isLiked ? cardStyles.actionBtnActive : {}),
              }}
              onClick={onLike}
              id={`like-post-${post._id}`}
              title="Like"
            >
              {isLiked ? '❤️' : '🤍'} {post?.likeCount ?? 0}
            </button>

            {/* Bookmark */}
            <button
              style={{
                ...cardStyles.actionBtn,
                ...(isBookmarked ? cardStyles.bookmarkActive : {}),
              }}
              onClick={onBookmark}
              id={`bookmark-post-${post._id}`}
              title="Bookmark"
            >
              {isBookmarked ? '🔖' : '📌'}
            </button>

            {/* Read more */}
            <Link
              to={`/posts/${post._id}`}
              style={cardStyles.readMore}
              id={`read-post-${post._id}`}
            >
              Read →
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

const cardStyles = {
  card: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--clr-border)',
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'border-color 0.25s, transform 0.25s, box-shadow 0.25s',
    cursor: 'default',
  },
  imageLink: { display: 'block', overflow: 'hidden' },
  image: {
    width: '100%',
    height: 200,
    objectFit: 'cover',
    transition: 'transform 0.4s ease',
  },
  body: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    flex: 1,
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  date: {
    fontSize: '0.75rem',
    color: 'var(--clr-text-3)',
  },
  titleLink: { textDecoration: 'none' },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.15rem',
    fontWeight: 700,
    color: 'var(--clr-text-1)',
    lineHeight: 1.4,
    transition: 'color 0.2s',
  },
  excerpt: {
    fontSize: '0.875rem',
    color: 'var(--clr-text-2)',
    lineHeight: 1.65,
    flex: 1,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 8,
    flexWrap: 'wrap',
  },
  author: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  authorPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.8rem',
    color: '#fff',
    flexShrink: 0,
  },
  authorName: {
    fontSize: '0.8rem',
    fontWeight: 500,
    color: 'var(--clr-text-2)',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    background: 'var(--clr-surface-2)',
    border: '1px solid var(--clr-border)',
    borderRadius: 'var(--radius-full)',
    padding: '4px 10px',
    fontSize: '0.8rem',
    color: 'var(--clr-text-2)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    transition: 'all 0.2s',
  },
  actionBtnActive: {
    borderColor: 'rgba(239,68,68,0.4)',
    background: 'rgba(239,68,68,0.1)',
    color: 'var(--clr-danger)',
  },
  bookmarkActive: {
    borderColor: 'rgba(124,58,237,0.4)',
    background: 'rgba(124,58,237,0.1)',
  },
  readMore: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--clr-primary-light)',
    textDecoration: 'none',
    padding: '4px 10px',
    borderRadius: 'var(--radius-full)',
    border: '1px solid rgba(124,58,237,0.3)',
    background: 'rgba(124,58,237,0.08)',
    transition: 'all 0.2s',
  },
};
