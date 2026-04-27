import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

import { HiArrowLeft, HiClock, HiUser, HiEye, HiPencil, HiTrash, HiX } from 'react-icons/hi';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, stripMarkdown, truncateText } from '@/utils/helpers';
import LikeButton from '@/components/LikeButton';
import Comments from '@/components/Comments';
import GridBackground from '@/components/GridBackground';
import ReadNextPost from '@/components/ReadNextPost';
import RelatedPosts from '@/components/RelatedPosts';
import useRelatedPosts from '@/hooks/useRelatedPosts';

// ─── SEO helpers ─────────
function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setOgMeta(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function removeMeta(name) {
  document.querySelector(`meta[name="${name}"]`)?.remove();
}

function removeOgMeta(property) {
  document.querySelector(`meta[property="${property}"]`)?.remove();
}

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const { readNext, relatedPosts } = useRelatedPosts(post);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  // ─── Dynamic SEO meta tags ─────────
  useEffect(() => {
    if (!post) return;

    const description = post.excerpt || truncateText(stripMarkdown(post.content), 160) || '';
    const defaultKeywords = [
      'cybersecurity', 'ethical-hacking', 'penetration-testing',
      'vulnerability-research', 'ctf-writeups', 'exploit-development',
      'network-security', 'threat-intelligence', 'malware-analysis',
      'digital-forensics', 'bug-bounty'
    ];
    const postKeywords = post.post_tags?.map(pt => pt.tag?.name).filter(Boolean) || [];
    const allKeywords = [...new Set([...postKeywords, ...defaultKeywords])].join(', ');
    const authorName = post.author?.username || 'ZeroTrace';
    const postUrl = `https://zerotrace.in/blog/${post.slug}`;

    // Page title
    const originalTitle = document.title;
    document.title = `${post.title} — ZeroTrace`;

    // Standard meta tags
    setMeta('description', description);
    setMeta('keywords', allKeywords);
    setMeta('author', authorName);
    setMeta('robots', 'index, follow');

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', postUrl);

    // Open Graph tags
    setOgMeta('og:title', post.title);
    setOgMeta('og:description', description);
    setOgMeta('og:type', 'article');
    setOgMeta('og:url', postUrl);
    if (post.cover_image) setOgMeta('og:image', post.cover_image);

    // Article-specific OG tags
    setOgMeta('article:published_time', post.created_at);
    setOgMeta('article:author', authorName);
    if (post.post_tags?.length) {
      post.post_tags.forEach((pt) => {
        if (pt.tag?.name) setOgMeta('article:tag', pt.tag.name);
      });
    }

    // Twitter card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', post.title);
    setMeta('twitter:description', description);
    if (post.cover_image) setMeta('twitter:image', post.cover_image);

    // Cleanup on unmount
    return () => {
      document.title = originalTitle;
      removeMeta('keywords');
      removeMeta('author');
      removeMeta('robots');
      removeMeta('twitter:card');
      removeMeta('twitter:title');
      removeMeta('twitter:description');
      removeMeta('twitter:image');
      removeOgMeta('og:title');
      removeOgMeta('og:description');
      removeOgMeta('og:type');
      removeOgMeta('og:url');
      removeOgMeta('og:image');
      removeOgMeta('article:published_time');
      removeOgMeta('article:author');
      removeOgMeta('article:tag');
      document.querySelector('link[rel="canonical"]')?.remove();
      // Restore default description
      setMeta('description', 'ZeroTrace — A cybersecurity community platform for security professionals, CTF players, and ethical hackers.');
    };
  }, [post]);

  const fetchPost = async () => {
    if (!slug) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(id, username, avatar_url, bio),
          post_tags(tag:tags(id, name))
        `)
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error fetching single post:', error);
      } else if (data) {
        setPost(data);

        // Increment view counter
        const { error: rpcError } = await supabase.rpc('increment_post_views', { post_slug: slug });
        if (rpcError) {
          console.warn('Failed to increment views:', rpcError);
        }
      }
    } catch (err) {
      console.error('BlogPost fetchException:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    const { error } = await supabase.from('posts').delete().eq('id', post.id);
    if (!error) {
      navigate('/blog');
    }
  };

  const handleRemoveTag = async (tagId) => {
    if (!confirm('Remove this tag from the post?')) return;
    const { error } = await supabase.from('post_tags').delete().match({ post_id: post.id, tag_id: tagId });
    if (!error) {
      setPost({
        ...post,
        post_tags: post.post_tags.filter(pt => pt.tag?.id !== tagId)
      });
    }
  };

  // ─── Syntax Highlighting & Copy Button ─────────
  useEffect(() => {
    if (!post || !post.content) return;

    // Small delay to ensure React has flushed DOM updates for dangerouslySetInnerHTML
    const timer = setTimeout(() => {
      document.querySelectorAll('pre code').forEach((block) => {
        if (!block.dataset.highlighted) {
          hljs.highlightElement(block);
          block.dataset.highlighted = 'true';
        }

        const pre = block.parentNode;
        if (pre.tagName === 'PRE' && !pre.querySelector('.copy-btn')) {
          pre.style.position = 'relative';

          const btn = document.createElement('button');
          // Match existing dark theme / ZeroTrace UI buttons styling somewhat
          btn.className = 'copy-btn bg-bg-secondary text-text-muted hover:text-primary text-xs px-2.5 py-1 rounded absolute top-2 right-2 transition-colors border border-border font-medium cursor-pointer z-10';
          btn.innerText = 'Copy';
          btn.onclick = () => {
            navigator.clipboard.writeText(block.innerText);
            btn.innerText = 'Copied!';
            setTimeout(() => {
              btn.innerText = 'Copy';
            }, 2000);
          };
          
          pre.appendChild(btn);
        }
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [post?.content]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="font-heading font-bold text-2xl">Post not found</h2>
        <Link to="/blog" className="btn-gradient-outline text-sm">
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <GridBackground className="pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-8">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-text-muted hover:text-primary text-sm transition-colors"
              >
                <HiArrowLeft size={16} />
                Back to Blog
              </Link>
              
              {(user?.role === 'admin' || user?.id === post.author?.id) && (
                <div className="flex items-center gap-2">
                  <Link
                    to={`/edit/${post.slug}`}
                    className="p-1.5 rounded-lg bg-bg-card border border-border text-text-muted hover:text-primary hover:border-primary/30 transition-all font-medium text-xs flex items-center gap-1.5"
                  >
                    <HiPencil size={14} />
                    Edit
                  </Link>
                  <button
                    onClick={handleDeletePost}
                    className="p-1.5 rounded-lg bg-bg-card border border-border text-text-muted hover:text-error hover:border-error/30 transition-all font-medium text-xs flex items-center gap-1.5"
                  >
                    <HiTrash size={14} />
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* Tags */}
            {post.post_tags && post.post_tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.post_tags.map(({ tag }) => (
                  tag && (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                    >
                      {tag.name}
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleRemoveTag(tag.id)}
                          className="text-primary hover:text-error transition-colors"
                          title="Remove Tag"
                        >
                          <HiX size={10} />
                        </button>
                      )}
                    </span>
                  )
                ))}
              </div>
            )}

            <h1 className="font-heading font-black text-3xl md:text-4xl lg:text-5xl mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Author & Date */}
            <div className="flex items-center gap-6 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                {post.author?.avatar_url ? (
                  <img
                    src={post.author.avatar_url}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-xs font-bold">
                    <HiUser size={14} />
                  </div>
                )}
                <span className="font-medium">
                  {post.author?.username || 'Anonymous'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-text-muted">
                <HiClock size={14} />
                <span>Published: {formatDate(post.created_at)}</span>
              </div>
              {typeof post.views === 'number' && (
                <div className="flex items-center gap-1.5 text-text-muted">
                  <HiEye size={14} />
                  <span>{post.views} views</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </GridBackground>

      {/* Content */}
      <section className="py-12 bg-bg-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 md:p-10"
          >
            {/* Cover image */}
            {post.cover_image && (
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-auto rounded-xl mb-8"
              />
            )}

            {/* Blog content — supports both HTML (TipTap) and Markdown (legacy) */}
            <div className="blog-content">
              {post.content && post.content.trim().startsWith('<') ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(post.content),
                  }}
                />
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight, rehypeRaw]}
                >
                  {post.content || ''}
                </ReactMarkdown>
              )}
            </div>

            {/* Like button */}
            <div className="mt-10 pt-6 border-t border-border flex items-center gap-4">
              <LikeButton postId={post.id} />
              <span className="text-text-muted text-sm">
                Did you find this helpful?
              </span>
            </div>

            {/* Read Next */}
            <ReadNextPost post={readNext} />
          </motion.article>

          {/* Comments */}
          <Comments postId={post.id} />
        </div>
      </section>

      {/* Related Posts */}
      <RelatedPosts posts={relatedPosts} />
    </>
  );
}
