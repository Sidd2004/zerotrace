import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import TipTapEditor from '@/components/TipTapEditor';
import { HiSave, HiEye, HiTrash } from 'react-icons/hi';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { generateSlug, stripMarkdown, stripHtmlTags, truncateText } from '@/utils/helpers';
import toast from 'react-hot-toast';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import JSZip from 'jszip';

export default function BlogEditor() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState('draft');
  const [saving, setSaving] = useState(false);
  const [postId, setPostId] = useState(null);
  const isEditing = !!slug;

  const fetchTags = async () => {
    const { data } = await supabase.from('tags').select('id, name').order('name');
    if (data) setAvailableTags(data);
  };

  useEffect(() => {
    if (authLoading) return; // Wait for auth to initialize
    fetchTags();
    if (slug && user) fetchPost();
  }, [slug, authLoading, user]);

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        post_tags (
          tag:tags (id, name)
        )
      `)
      .eq('slug', slug)
      .eq('author_id', user?.id)
      .single();

    if (data) {
      setTitle(data.title);
      setContent(data.content || '');
      const existingTags = data.post_tags?.map(pt => pt.tag).filter(Boolean) || [];
      setSelectedTags(existingTags);
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
    // Tags are now handled via relation

    // Generate excerpt from HTML or markdown content
    const isHtml = content && content.trim().startsWith('<');
    const excerpt = truncateText(
      isHtml ? stripHtmlTags(content) : stripMarkdown(content),
      160
    );

    // Process external images — download and re-upload via PHP endpoint
    let processedContent = content;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const imgs = doc.querySelectorAll('img[src]');
      let changed = false;

      for (const img of imgs) {
        const src = img.getAttribute('src') || '';
        // Only process external URLs (not already on zerotrace.in or Cloudinary)
        if (/^https?:\/\//i.test(src) && !src.includes('zerotrace.in') && !src.includes('res.cloudinary.com')) {
          try {
            const response = await fetch(src);
            if (!response.ok) continue;
            const blob = await response.blob();
            // Determine extension from content type or URL
            const contentType = blob.type || '';
            const extMap = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
            const ext = extMap[contentType] || src.split('.').pop().split('?')[0].toLowerCase() || 'jpg';
            const uniqueName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
            const file = new File([blob], uniqueName, { type: contentType || 'image/jpeg' });

            const formData = new FormData();
            formData.append('image', file);
            
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData?.session?.access_token;

            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
            const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
            
            const uploadRes = await fetch(`${supabaseUrl}/functions/v1/upload-blog-image`, { 
              method: 'POST', 
              headers: { 
                'apikey': anonKey,
                ...(token ? { 'Authorization': `Bearer ${token}` } : { 'Authorization': `Bearer ${anonKey}` }) 
              },
              body: formData 
            });
            if (uploadRes.ok) {
              const data = await uploadRes.json();
              if (data.url) {
                img.setAttribute('src', data.url);
                changed = true;
              }
            }
          } catch (err) {
            console.warn(`Failed to download external image: ${src}`, err);
          }
        }
      }

      if (changed) {
        processedContent = doc.body.innerHTML;
      }
    } catch (err) {
      console.warn('External image processing error:', err);
    }

    const postData = {
      title: title.trim(),
      content: processedContent,
      cover_image: coverImage || null,
      excerpt,
      status: publishStatus,
      author_id: user.id,
    };

    try {
      let savedPostId = postId;
      if (isEditing && postId) {
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', postId);
        if (error) throw error;
      } else {
        postData.slug = postSlug;
        const { data, error } = await supabase.from('posts').insert(postData).select().single();
        if (error) throw error;
        savedPostId = data.id;
      }

      // Handle tags
      if (isEditing && postId) {
        await supabase.from('post_tags').delete().eq('post_id', savedPostId);
      }
      if (selectedTags.length > 0) {
        const tagInserts = selectedTags.map(tag => ({
          post_id: savedPostId,
          tag_id: tag.id
        }));
        await supabase.from('post_tags').insert(tagInserts);
      }

      toast.success(publishStatus === 'published' ? 'Post published!' : 'Post saved!');
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

  const handleSmartUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];

    try {
      if (imageExtensions.includes(ext)) {
        // Image file → upload via API as cover image
        toast.loading('Uploading cover image...', { id: 'smart-upload' });
        const formData = new FormData();
        formData.append('image', file);

        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

        const res = await fetch(`${supabaseUrl}/functions/v1/upload-blog-image`, { 
          method: 'POST', 
          headers: { 
            'apikey': anonKey,
            ...(token ? { 'Authorization': `Bearer ${token}` } : { 'Authorization': `Bearer ${anonKey}` }) 
          },
          body: formData 
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Upload failed (${res.status})`);
        }
        const data = await res.json();
        if (!data.url) throw new Error('Upload did not return a URL');
        setCoverImage(data.url);
        toast.success('Cover image uploaded!', { id: 'smart-upload' });

      } else if (ext === 'html' || ext === 'htm') {
        // HTML file → import into editor content
        toast.loading('Importing HTML...', { id: 'smart-upload' });
        const rawHtml = await file.text();
        const cleanHtml = DOMPurify.sanitize(rawHtml, {
          ADD_TAGS: ['img'],
          ADD_ATTR: ['src', 'alt', 'href', 'target', 'rel', 'class'],
        });
        setContent(cleanHtml);
        toast.success('HTML imported!', { id: 'smart-upload' });

      } else if (ext === 'md' || ext === 'markdown') {
        // Markdown file → convert to HTML and import
        toast.loading('Importing Markdown...', { id: 'smart-upload' });
        const text = await file.text();
        const html = await marked.parse(text);
        const cleanHtml = DOMPurify.sanitize(html);
        setContent(cleanHtml);
        toast.success('Markdown imported!', { id: 'smart-upload' });

      } else if (ext === 'zip') {
        // ZIP file → extract, find content, upload images
        toast.loading('Extracting ZIP...', { id: 'smart-upload' });
        const zip = await JSZip.loadAsync(file);
        const entries = Object.values(zip.files).filter((f) => !f.dir);

        let contentText = null;
        let contentExt = null;
        const imageBlobs = new Map();

        const allowedExts = ['.html', '.htm', '.md', '.markdown', '.png', '.jpg', '.jpeg', '.webp', '.gif'];
        const imgExts = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
        const contentExts = ['.md', '.markdown', '.html', '.htm'];

        for (const entry of entries) {
          const name = entry.name;
          if (name.includes('..') || name.startsWith('/')) continue;
          const baseName = name.split('/').pop().split('\\').pop();
          if (baseName.startsWith('.') || name.startsWith('__MACOSX')) continue;

          const fileExt = '.' + baseName.split('.').pop().toLowerCase();

          // Sanitization: strict allowlist
          if (!allowedExts.includes(fileExt)) continue;

          if (contentExts.includes(fileExt) && !contentText) {
            const data = await entry.async('arraybuffer');
            contentText = new TextDecoder().decode(data);
            contentExt = fileExt;
          } else if (imgExts.includes(fileExt)) {
            const data = await entry.async('arraybuffer');
            // Store using the full ZIP path (lowercase) instead of just basename
            imageBlobs.set(name.toLowerCase(), new Blob([data]));
          }
        }

        // Upload extracted images via API
        const uploadedUrls = new Map();
        let uploaded = 0;
        for (const [name, blob] of imageBlobs) {
          try {
            const mimeMap = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif' };
            const ext2 = '.' + name.split('.').pop().toLowerCase();
            const imgFile = new File([blob], name, { type: mimeMap[ext2] || 'application/octet-stream' });
            const formData = new FormData();
            formData.append('image', imgFile);

            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData?.session?.access_token;

            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
            const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

            const res = await fetch(`${supabaseUrl}/functions/v1/upload-blog-image`, { 
              method: 'POST', 
              headers: { 
                'apikey': anonKey,
                ...(token ? { 'Authorization': `Bearer ${token}` } : { 'Authorization': `Bearer ${anonKey}` }) 
              },
              body: formData 
            });
            if (res.ok) {
              const data = await res.json();
              if (data.url) {
                uploadedUrls.set(name, data.url);
                uploaded++;
              }
            }
          } catch (err) {
            console.warn(`Failed to upload ${name}:`, err);
          }
        }

        // Process content
        if (contentText) {
          let html;
          if (contentExt === '.html') {
            html = contentText;
          } else {
            html = await marked.parse(contentText);
          }

          // Rewrite local image paths to uploaded URLs
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const imgs = doc.querySelectorAll('img[src]');

          for (const img of imgs) {
            const src = img.getAttribute('src') || '';
            if (/^https?:\/\//i.test(src) || src.startsWith('data:')) continue;

            // Normalize path (replace backslashes, remove ./ and ../)
            let normalizedPath = src.replace(/\\/g, '/').toLowerCase();
            normalizedPath = normalizedPath.replace(/^\.\//, '');
            while (normalizedPath.startsWith('../')) {
              normalizedPath = normalizedPath.slice(3);
            }

            const imgBaseName = normalizedPath.split('/').pop();

            // Try to find the image in uploadedUrls, matching exact normalized path or fallback
            let hostedUrl = uploadedUrls.get(normalizedPath);
            if (!hostedUrl) {
              const matchingKey = Array.from(uploadedUrls.keys()).find(
                k => k === normalizedPath || k.endsWith('/' + normalizedPath) || k.endsWith('/' + imgBaseName) || k === imgBaseName
              );
              if (matchingKey) {
                hostedUrl = uploadedUrls.get(matchingKey);
              }
            }

            if (hostedUrl) {
              img.setAttribute('src', hostedUrl);
            }
          }

          html = doc.body.innerHTML;
          const cleanHtml = DOMPurify.sanitize(html, {
            ADD_TAGS: ['img'],
            ADD_ATTR: ['src', 'alt', 'href', 'target', 'rel', 'class'],
          });
          setContent(cleanHtml);
          toast.success(`ZIP imported! ${uploaded} image(s) uploaded.`, { id: 'smart-upload' });
        } else {
          toast.error('No .md or .html content found in ZIP.', { id: 'smart-upload' });
        }

      } else {
        toast.error('Unsupported file type. Use ZIP, HTML, MD, or image files.');
      }
    } catch (error) {
      toast.error(`Upload failed: ${error.message}`, { id: 'smart-upload' });
    }

    // Reset the input
    e.target.value = '';
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

          {/* Cover Image */}
          <div className="mb-6 space-y-2">
            <label className="block text-sm font-medium text-text-primary ml-1">
              Cover Image
            </label>
            <div className="flex flex-col md:flex-row gap-4 md:items-center">
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="Cover image URL (optional)"
                className="flex-1 bg-bg-card border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
              />
              <span className="hidden md:block text-text-muted text-sm border-x border-border px-4 py-1">OR</span>
              <span className="block md:hidden text-text-muted text-sm text-center">OR</span>
              <label className="flex items-center justify-center bg-bg-card border border-border rounded-xl px-6 py-3 text-sm text-text-primary cursor-pointer hover:border-primary/50 hover:bg-white/5 transition-all whitespace-nowrap">
                <span className="font-medium">Upload Cover Image</span>
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,image/*"
                  onChange={handleSmartUpload}
                  className="hidden"
                />
              </label>
            </div>
            {coverImage && (
              <div className="flex items-center gap-3 mt-2">
                <img src={coverImage} alt="Cover preview" className="w-20 h-14 rounded-lg object-cover border border-border" />
                <button
                  type="button"
                  onClick={() => setCoverImage('')}
                  className="text-xs text-error hover:text-error/80 transition-colors"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Import Writeup */}
          <div className="mb-6 space-y-2">
            <label className="block text-sm font-medium text-text-primary ml-1">
              Import Writeup
            </label>
            <div className="flex">
              <label className="flex w-full md:w-auto items-center justify-center bg-bg-card border border-border rounded-xl px-6 py-3 text-sm text-text-primary cursor-pointer hover:border-primary/50 hover:bg-white/5 transition-all">
                <span className="font-medium">Upload Writeup (ZIP / HTML / Markdown)</span>
                <input
                  type="file"
                  accept=".zip,.html,.htm,.md,.markdown"
                  onChange={handleSmartUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-text-muted text-xs ml-1 mt-1">
              Supports ZIP exports (Notion), HTML files, or Markdown writeups.
            </p>
          </div>

          {/* Tags */}
          <div className="mb-6 space-y-2">
            <label className="block text-sm font-medium text-text-primary ml-1">
              Select Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.some(t => t.id === tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedTags(selectedTags.filter(t => t.id !== tag.id));
                      } else {
                        setSelectedTags([...selectedTags, tag]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                      isSelected 
                        ? 'bg-primary/20 text-primary border-primary/50' 
                        : 'bg-bg-card text-text-muted border-border hover:border-primary/30'
                    }`}
                  >
                    {isSelected ? '[✓]' : '[ ]'} {tag.name}
                  </button>
                );
              })}
            </div>
            {availableTags.length === 0 && (
              <p className="text-text-muted text-xs ml-1">No tags available.</p>
            )}
          </div>

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
            placeholder="Write your blog content here... Supports Markdown and HTML"
          />
        </motion.div>
      </div>
    </div>
  );
}
