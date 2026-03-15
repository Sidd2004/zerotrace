import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiSearch, HiClock, HiUser, HiEye } from 'react-icons/hi';
import GridBackground from '@/components/GridBackground';
import GlassCard from '@/components/GlassCard';
import { supabase } from '@/lib/supabase';
import { formatDate, truncateText, stripMarkdown } from '@/utils/helpers';

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(username, avatar_url),
          post_tags(tag:tags(name))
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching blog posts:', error);
      } else if (data) {
        setPosts(data);
      }
    } catch (err) {
      console.error('Blog fetchException:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get all unique tags
  const allTags = [...new Set(posts.flatMap((p) => 
    p.post_tags?.map(pt => pt.tag?.name).filter(Boolean) || []
  ))];

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const postTags = post.post_tags?.map(pt => pt.tag?.name).filter(Boolean) || [];
    const matchesSearch =
      !search ||
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      (post.content && post.content.toLowerCase().includes(search.toLowerCase()));
    const matchesTag =
      !selectedTag || postTags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <>
      {/* Hero */}
      <GridBackground className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading font-black text-4xl md:text-5xl lg:text-6xl mb-4"
          >
            <span className="gradient-text">Blog</span> & Writeups
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-text-secondary text-lg max-w-2xl mx-auto mb-10"
          >
            Technical writeups, security research, and insights from the community.
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-xl mx-auto relative"
          >
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-12 pr-4 py-3.5 bg-bg-card border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
            />
          </motion.div>
        </div>
      </GridBackground>

      <section className="py-12 bg-bg-secondary min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tags filter */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => setSelectedTag('')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  !selectedTag
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-bg-card border border-border text-text-muted hover:text-text-primary'
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedTag === tag
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-bg-card border border-border text-text-muted hover:text-text-primary'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Posts grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card p-6 animate-pulse">
                  <div className="h-4 bg-border rounded w-3/4 mb-4" />
                  <div className="h-3 bg-border rounded w-full mb-2" />
                  <div className="h-3 bg-border rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-text-muted text-lg mb-4">No posts found</p>
              <p className="text-text-muted text-sm">
                {search
                  ? 'Try adjusting your search query.'
                  : 'Be the first to publish a writeup!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  {...stagger}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <Link to={`/blog/${post.slug}`}>
                    <GlassCard className="h-full group cursor-pointer flex flex-col">
                      {/* Cover image — always shown, falls back to ZeroTrace logo */}
                      <div className="w-full h-40 rounded-lg overflow-hidden mb-4 -mt-1 bg-bg-card flex items-center justify-center">
                        <img
                          src={post.cover_image || '/favicon.png'}
                          alt={post.title}
                          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${!post.cover_image ? 'object-contain p-6 opacity-40' : ''}`}
                        />
                      </div>

                      {/* Title */}
                      <h2 className="font-heading font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h2>

                      {/* Excerpt / Preview snippet */}
                      <p className="text-text-muted text-sm leading-relaxed mb-3 line-clamp-3">
                        {post.excerpt || truncateText(stripMarkdown(post.content), 160)}
                      </p>

                      {/* Tags */}
                      {post.post_tags && post.post_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {post.post_tags.slice(0, 3).map((pt, idx) => {
                            if (!pt.tag?.name) return null;
                            return (
                              <span
                                key={`${pt.tag.name}-${idx}`}
                                className="px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary border border-primary/20"
                              >
                                {pt.tag.name}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-text-muted mt-auto pt-4 border-t border-border">
                        <div className="flex items-center gap-1.5">
                          <HiUser size={12} />
                          <span>{post.author?.username || 'Anonymous'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <HiClock size={12} />
                          <span>{formatDate(post.created_at)}</span>
                        </div>
                        {typeof post.views === 'number' && (
                          <div className="flex items-center gap-1.5 ml-auto">
                            <HiEye size={12} />
                            <span>{post.views}</span>
                          </div>
                        )}
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
