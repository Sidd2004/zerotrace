import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import DOMPurify from 'dompurify';
import { HiArrowLeft, HiClock, HiUser } from 'react-icons/hi';
import { supabase } from '@/lib/supabase';
import { formatDate, stripMarkdown, truncateText } from '@/utils/helpers';
import LikeButton from '@/components/LikeButton';
import Comments from '@/components/Comments';
import GridBackground from '@/components/GridBackground';

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
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

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
    const postKeywords = post.tags?.length ? post.tags : [];
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
    if (post.tags?.length) {
      post.tags.forEach((tag) => setOgMeta('article:tag', tag));
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
          author:profiles(id, username, avatar_url, bio)
        `)
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error fetching single post:', error);
      } else if (data) {
        setPost(data);
      }
    } catch (err) {
      console.error('BlogPost fetchException:', err);
    } finally {
      setLoading(false);
    }
  };

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
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-text-muted hover:text-primary text-sm mb-8 transition-colors"
            >
              <HiArrowLeft size={16} />
              Back to Blog
            </Link>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                  >
                    {tag}
                  </span>
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
                <span>{formatDate(post.created_at)}</span>
              </div>
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
          </motion.article>

          {/* Comments */}
          <Comments postId={post.id} />
        </div>
      </section>
    </>
  );
}
