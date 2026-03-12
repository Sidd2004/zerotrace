import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import MDEditor from '@uiw/react-md-editor';
import { HiSave, HiEye, HiTrash } from 'react-icons/hi';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { generateSlug, stripMarkdown, truncateText } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function BlogEditor() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState('draft');
  const [saving, setSaving] = useState(false);
  const [postId, setPostId] = useState(null);
  const isEditing = !!slug;

  useEffect(() => {
    if (slug) fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('author_id', user?.id)
      .single();

    if (data) {
      setTitle(data.title);
      setContent(data.content || '');
      setTags(data.tags ? data.tags.join(', ') : '');
      setCoverImage(data.cover_image || '');
      setStatus(data.status);
      setPostId(data.id);
    } else if (error) {
      toast.error('Post not found or not authorized');
      navigate('/dashboard');
    }
  };

  const handleSave = async (publishStatus = status) => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setSaving(true);
    const postSlug = generateSlug(title) + '-' + Date.now().toString(36);
    const tagArray = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const excerpt = truncateText(stripMarkdown(content), 160);

    const postData = {
      title: title.trim(),
      content,
      tags: tagArray,
      cover_image: coverImage || null,
      excerpt,
      status: publishStatus,
      author_id: user.id,
    };

    try {
      if (isEditing && postId) {
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', postId);
        if (error) throw error;
        toast.success(
          publishStatus === 'published' ? 'Post published!' : 'Post saved!'
        );
      } else {
        postData.slug = postSlug;
        const { error } = await supabase.from('posts').insert(postData);
        if (error) throw error;
        toast.success(
          publishStatus === 'published' ? 'Post published!' : 'Draft saved!'
        );
      }
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!postId || !confirm('Are you sure you want to delete this post?')) return;

    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) {
      toast.error('Failed to delete');
    } else {
      toast.success('Post deleted');
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-heading font-bold text-2xl">
              {isEditing ? 'Edit Post' : 'Write New Post'}
            </h1>
            <div className="flex items-center gap-3">
              {isEditing && (
                <button
                  onClick={handleDelete}
                  className="p-2.5 rounded-xl bg-error/10 text-error hover:bg-error/20 transition-all"
                  title="Delete post"
                >
                  <HiTrash size={18} />
                </button>
              )}
              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="btn-gradient-outline !py-2 !px-4 text-sm flex items-center gap-2"
              >
                <HiSave size={16} />
                Save Draft
              </button>
              <button
                onClick={() => handleSave('published')}
                disabled={saving}
                className="btn-gradient !py-2 !px-5 text-sm flex items-center gap-2"
              >
                <HiEye size={16} />
                Publish
              </button>
            </div>
          </div>

          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title..."
            className="w-full bg-transparent border-none text-3xl md:text-4xl font-heading font-bold text-text-primary placeholder:text-text-muted focus:outline-none mb-6"
          />

          {/* Cover Image URL */}
          <input
            type="url"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="Cover image URL (optional)"
            className="w-full bg-bg-card border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 mb-4 transition-colors"
          />

          {/* Tags */}
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (comma separated, e.g. web, xss, ctf)"
            className="w-full bg-bg-card border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 mb-6 transition-colors"
          />

          {/* Status */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm text-text-muted">Status:</span>
            {['draft', 'pending', 'published'].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                  status === s
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-bg-card border border-border text-text-muted hover:text-text-primary'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Markdown Editor */}
          <div data-color-mode="dark" className="mb-8">
            <MDEditor
              value={content}
              onChange={(val) => setContent(val || '')}
              height={500}
              preview="live"
              textareaProps={{
                placeholder: 'Write your post in Markdown...',
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
