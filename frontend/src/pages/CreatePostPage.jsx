import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPostApi, uploadCoverImageApi } from '../api/posts';
import { useToast } from '../components/Toast';

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({ title: '', content: '' });
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError('Title and content are required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await createPostApi(form);
      // Backend: POST /post/create → { status, message, post }
      const postId = res.data?.post?._id;

      if (coverFile && postId) {
        const fd = new FormData();
        fd.append('coverImage', coverFile);
        await uploadCoverImageApi(postId, fd);
      }

      toast('Post created successfully! 🎉');
      navigate(`/posts/${postId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ paddingBottom: 80 }}>
      <div className="container" style={{ maxWidth: 800, paddingTop: 40 }}>
        <h1 style={cp.pageTitle}>✍️ Write a New Post</h1>
        <p style={cp.pageSubtitle}>Share your thoughts, ideas, and stories with the world</p>

        <form onSubmit={handleSubmit} style={cp.form}>
          {error && <p className="error-msg">{error}</p>}

          {/* Cover image */}
          <div
            style={cp.coverDrop}
            onClick={() => fileRef.current?.click()}
            id="cover-image-dropzone"
          >
            {coverPreview ? (
              <img src={coverPreview} alt="Cover preview" style={cp.coverPreview} />
            ) : (
              <div style={cp.coverPlaceholder}>
                <span style={{ fontSize: '2.5rem' }}>🖼️</span>
                <span style={{ color: 'var(--clr-text-3)', fontSize: '0.875rem' }}>
                  Click to add a cover image
                </span>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFile}
              id="cover-image-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="post-title">Title</label>
            <input
              id="post-title"
              name="title"
              type="text"
              className="form-input"
              placeholder="Give your post an engaging title…"
              value={form.title}
              onChange={handleChange}
              required
              style={{ fontSize: '1.1rem' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="post-content">Content</label>
            <textarea
              id="post-content"
              name="content"
              className="form-input"
              placeholder="Tell your story…"
              value={form.content}
              onChange={handleChange}
              required
              style={{ minHeight: 320, fontSize: '1rem', lineHeight: 1.7 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              id="create-post-submit-btn"
            >
              {loading ? 'Publishing…' : '🚀 Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const cp = {
  pageTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '2rem',
    fontWeight: 700,
    marginBottom: 8,
    color: 'var(--clr-text-1)',
  },
  pageSubtitle: {
    color: 'var(--clr-text-2)',
    marginBottom: 36,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--clr-border)',
    borderRadius: 'var(--radius-xl)',
    padding: 32,
  },
  coverDrop: {
    border: '2px dashed var(--clr-border)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
    minHeight: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverPreview: {
    width: '100%',
    height: 240,
    objectFit: 'cover',
  },
  coverPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: 40,
  },
};
