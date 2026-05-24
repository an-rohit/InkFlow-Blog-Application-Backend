import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllPostsApi } from '../api/posts';
import { toggleLikeApi, checkLikedApi } from '../api/likes';
import { toggleBookmarkApi } from '../api/bookmarks';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import Loader from '../components/Loader';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [likedSet, setLikedSet] = useState(new Set());
  const [bookmarkSet, setBookmarkSet] = useState(new Set());

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllPostsApi({ page, limit: 9, search: search || undefined, sort });
      // Backend returns: { allPost: [...], pagination: { totalPage, totalPost, currentPage, limit } }
      const list = Array.isArray(res.data?.allPost) ? res.data.allPost : [];
      const pagination = res.data?.pagination || {};
      setPosts(list);
      setTotalPages(pagination.totalPage || 1);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, sort]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleLike = async (postId) => {
    if (!user) { navigate('/login'); return; }
    try {
      await toggleLikeApi(postId);
      setLikedSet((prev) => {
        const next = new Set(prev);
        const wasLiked = next.has(postId);
        wasLiked ? next.delete(postId) : next.add(postId);
        // Update like count based on the PREVIOUS liked state
        setPosts((posts) =>
          posts.map((p) =>
            p._id === postId
              ? { ...p, likeCount: (p.likeCount ?? 0) + (wasLiked ? -1 : 1) }
              : p
          )
        );
        return next;
      });
    } catch { /* ignore */ }
  };

  const handleBookmark = async (postId) => {
    if (!user) { navigate('/login'); return; }
    try {
      await toggleBookmarkApi(postId);
      setBookmarkSet((prev) => {
        const next = new Set(prev);
        next.has(postId) ? next.delete(postId) : next.add(postId);
        return next;
      });
    } catch { /* ignore */ }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPosts();
  };

  return (
    <div className="page" style={{ paddingBottom: 80 }}>
      {/* Hero */}
      <div style={hp.hero}>
        <div style={hp.heroContent}>
          <div className="animate-fadeInUp">
            <span className="badge badge-purple" style={{ marginBottom: 16 }}>✨ Modern Blogging</span>
            <h1 style={hp.heroTitle}>
              Ideas worth<br />
              <span style={hp.heroAccent}>reading</span>
            </h1>
            <p style={hp.heroSubtitle}>
              Discover thoughtful stories, sharp perspectives, and deep dives from a community of passionate writers.
            </p>
            <div style={hp.heroCtas}>
              {user ? (
                <Link to="/create-post" className="btn btn-primary" id="hero-write-btn">✍️ Start Writing</Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary" id="hero-signup-btn">Get Started Free</Link>
                  <Link to="/login" className="btn btn-ghost" id="hero-login-btn">Sign In</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: 60 }}>
        {/* Search & Filter */}
        <div style={hp.toolbar}>
          <form onSubmit={handleSearch} style={hp.searchRow}>
            <input
              type="text"
              className="form-input"
              placeholder="Search posts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1 }}
              id="search-input"
            />
            <button type="submit" className="btn btn-primary btn-sm" id="search-btn">Search</button>
          </form>
          <select
            className="form-input"
            style={{ width: 'auto' }}
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            id="sort-select"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="popular">Most Liked</option>
          </select>
        </div>

        {/* Posts grid */}
        <div className="section-header">
          <h2 className="section-title">Latest Stories</h2>
          <span style={{ color: 'var(--clr-text-3)', fontSize: '0.875rem' }}>
            Page {page} of {totalPages}
          </span>
        </div>

        {loading ? (
          <Loader fullPage={false} />
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h2 className="empty-state-title">No posts found</h2>
            <p className="empty-state-desc">
              {search ? `No results for "${search}"` : 'Be the first to write something!'}
            </p>
            {user && <Link to="/create-post" className="btn btn-primary" style={{ marginTop: 8 }}>Write a Post</Link>}
          </div>
        ) : (
          <div className="posts-grid stagger">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onLike={() => handleLike(post._id)}
                onBookmark={() => handleBookmark(post._id)}
                isLiked={likedSet.has(post._id)}
                isBookmarked={bookmarkSet.has(post._id)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              id="pagination-prev"
            >← Prev</button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const pg = i + 1;
              return (
                <button
                  key={pg}
                  className={`pagination-btn ${page === pg ? 'active' : ''}`}
                  onClick={() => setPage(pg)}
                  id={`pagination-page-${pg}`}
                >
                  {pg}
                </button>
              );
            })}
            <button
              className="pagination-btn"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              id="pagination-next"
            >Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}

const hp = {
  hero: {
    paddingTop: 80,
    paddingBottom: 80,
    background: `
      radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124, 58, 237, 0.2) 0%, transparent 70%),
      radial-gradient(ellipse 50% 40% at 90% 70%, rgba(6, 182, 212, 0.1) 0%, transparent 70%)
    `,
    borderBottom: '1px solid var(--clr-border)',
  },
  heroContent: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 24px',
  },
  heroTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(2.5rem, 6vw, 5rem)',
    fontWeight: 700,
    lineHeight: 1.15,
    marginBottom: 20,
    color: 'var(--clr-text-1)',
  },
  heroAccent: {
    background: 'linear-gradient(135deg, var(--clr-primary-light), var(--clr-accent))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSubtitle: {
    fontSize: '1.1rem',
    color: 'var(--clr-text-2)',
    maxWidth: 520,
    lineHeight: 1.7,
    marginBottom: 32,
  },
  heroCtas: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
  },
  toolbar: {
    display: 'flex',
    gap: 12,
    marginBottom: 40,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  searchRow: {
    display: 'flex',
    gap: 8,
    flex: 1,
    minWidth: 240,
  },
};
