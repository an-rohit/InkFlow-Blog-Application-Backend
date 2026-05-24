import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostByIdApi, updatePostApi, updateCoverImageApi } from '../api/posts';
import { useToast } from '../components/Toast';
import Loader from '../components/Loader';

export default function EditPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({ title: '', content: '' });
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getPostByIdApi(id);
        // Backend: GET /post/:id → { status, message, post }
        const post = res.data?.post;
        setForm({ title: post?.title || '', content: post?.content || '' });
        // coverImage is stored as { url, public_id } on the backend
        const imgUrl = post?.coverImage?.url || post?.coverImage;
        if (imgUrl) setCoverPreview(imgUrl);
      } catch {
        toast('Could not load post', 'error');
        navigate('/my-posts');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await updatePostApi(id, form);
      if (coverFile) {
        const fd = new FormData();
        fd.append('coverImage', coverFile);
        await updateCoverImageApi(id, fd);
      }
      toast('Post updated! ✅');
      navigate(`/posts/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page" style={{ paddingBottom: 80 }}>
      <div className="container" style={{ maxWidth: 800, paddingTop: 40 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, marginBottom: 8, color: 'var(--clr-text-1)' }}>
          ✏️ Edit Post
        </h1>
        <p style={{ color: 'var(--clr-text-2)', marginBottom: 36 }}>Update your post content and cover image</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-xl)', padding: 32 }}>
          {error && <p className="error-msg">{error}</p>}

          {/* Cover image */}
          <div
            style={{ border: '2px dashed var(--clr-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', cursor: 'pointer', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => fileRef.current?.click()}
            id="edit-cover-dropzone"
          >
            {coverPreview ? (
              <img src={coverPreview} alt="Cover" style={{ width: '100%', height: 240, objectFit: 'cover' }} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 40 }}>
                <span style={{ fontSize: '2.5rem' }}>🖼️</span>
                <span style={{ color: 'var(--clr-text-3)', fontSize: '0.875rem' }}>Click to change cover image</span>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} id="edit-cover-input" />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-title">Title</label>
            <input
              id="edit-title"
              name="title"
              type="text"
              className="form-input"
              value={form.title}
              onChange={handleChange}
              required
              style={{ fontSize: '1.1rem' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-content">Content</label>
            <textarea
              id="edit-content"
              name="content"
              className="form-input"
              value={form.content}
              onChange={handleChange}
              required
              style={{ minHeight: 320, fontSize: '1rem', lineHeight: 1.7 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving} id="edit-post-submit-btn">
              {saving ? 'Saving…' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
