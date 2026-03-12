import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import TipTapEditor from '@/components/TipTapEditor';
import { HiSave, HiEye, HiTrash } from 'react-icons/hi';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { generateSlug, stripMarkdown, truncateText } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function BlogEditor() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState('draft');
  const [saving, setSaving] = useState(false);
  const [postId, setPostId] = useState(null);
  const isEditing = !!slug;

  useEffect(() => {
    if (authLoading) return; // Wait for auth to initialize
    if (slug && user) fetchPost();
  }, [slug, authLoading, user]);

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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      toast.loading('Uploading image...', { id: 'upload' });
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `blog-covers/${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      setCoverImage(data.publicUrl);
      toast.success('Image uploaded successfully!', { id: 'upload' });
    } catch (error) {
      toast.error(`Upload failed: ${error.message}. Make sure 'blog-images' bucket exists!`, { id: 'upload' });
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

          {/* Cover Image Input */}
          <div className="mb-4 space-y-2">
            <div className="flex gap-4 items-center">
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="Cover image URL (optional)"
                className="flex-1 bg-bg-card border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
              />
              <span className="text-text-muted text-sm border-x border-border px-4 py-1">OR</span>
              <label className="flex items-center justify-center bg-bg-card border border-border rounded-xl px-6 py-3 text-sm text-text-primary cursor-pointer hover:border-primary/50 hover:bg-white/5 transition-all">
                <span className="font-medium">Upload File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

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

          {/* TipTap Editor */}
          <TipTapEditor
            value={content}
            onChange={setContent}
            placeholder="Start writing your post..."
          />
        </motion.div>
      </div>
    </div>
  );
}
