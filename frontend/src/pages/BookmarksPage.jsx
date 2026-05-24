import { useState, useEffect } from 'react';
import { getMyBookmarksApi } from '../api/bookmarks';
import { toggleBookmarkApi } from '../api/bookmarks';
import PostCard from '../components/PostCard';
import Loader from '../components/Loader';
import { useToast } from '../components/Toast';

export default function BookmarksPage() {
  const { toast } = useToast();
  const [bookmarks, setBookmarks] = useState([]);
  const [bookmarkSet, setBookmarkSet] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getMyBookmarksApi();
        // Backend: GET /bookmarks → { status, message, userBookmarks }
        const data = res.data?.userBookmarks || [];
        // data might be posts directly or { post: ... } objects
        const posts = data.map((b) => b.post || b);
        setBookmarks(posts.filter(Boolean));
        setBookmarkSet(new Set(posts.map((p) => p._id)));
      } catch {
        setBookmarks([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleBookmark = async (postId) => {
    try {
      await toggleBookmarkApi(postId);
      setBookmarkSet((prev) => {
        const next = new Set(prev);
        next.has(postId) ? next.delete(postId) : next.add(postId);
        return next;
      });
      // Remove from list when unbookmarked
      setBookmarks((prev) => prev.filter((p) => {
        if (bookmarkSet.has(postId)) return p._id !== postId;
        return true;
      }));
      toast('Bookmark updated');
    } catch { toast('Failed to update bookmark', 'error'); }
  };

  if (loading) return <Loader />;

  return (
    <div className="page" style={{ paddingBottom: 80 }}>
      <div className="container" style={{ paddingTop: 40 }}>
        <div className="section-header">
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, color: 'var(--clr-text-1)' }}>
              🔖 Bookmarks
            </h1>
            <p style={{ color: 'var(--clr-text-2)', marginTop: 4 }}>
              {bookmarks.length} saved post{bookmarks.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {bookmarks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔖</div>
            <h2 className="empty-state-title">No bookmarks yet</h2>
            <p className="empty-state-desc">Save posts you love and find them here anytime</p>
          </div>
        ) : (
          <div className="posts-grid stagger">
            {bookmarks.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onBookmark={() => handleBookmark(post._id)}
                isBookmarked={bookmarkSet.has(post._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
