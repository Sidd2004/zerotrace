import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiClock, HiUser, HiEye } from 'react-icons/hi';
import { formatDate, truncateText, stripMarkdown } from '@/utils/helpers';
import GlassCard from '@/components/GlassCard';

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

/**
 * A responsive grid of 3–5 related blog post cards.
 * Renders below the comments section.
 *
 * @param {{ posts: object[] }} props
 */
export default function RelatedPosts({ posts }) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="py-12 bg-bg-primary" id="related-posts-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="font-heading font-bold text-2xl md:text-3xl mb-2">
            <span className="gradient-text">Related</span> Posts
          </h2>
          <p className="text-text-muted text-sm">
            More articles you might enjoy
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => {
            const tags =
              post.post_tags?.map((pt) => pt.tag?.name).filter(Boolean) || [];
            const excerpt =
              post.excerpt || truncateText(stripMarkdown(post.content), 120);

            return (
              <motion.div
                key={post.id}
                {...stagger}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Link to={`/blog/${post.slug}`} className="related-post-link">
                  <GlassCard className="h-full group cursor-pointer flex flex-col">
                    {/* Cover image */}
                    <div className="w-full h-40 rounded-lg overflow-hidden mb-4 -mt-1 bg-bg-card flex items-center justify-center">
                      <img
                        src={post.cover_image || '/favicon.png'}
                        alt={post.title}
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                          !post.cover_image
                            ? 'object-contain p-6 opacity-40'
                            : ''
                        }`}
                      />
                    </div>

                    {/* Title */}
                    <h3 className="font-heading font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    {excerpt && (
                      <p className="text-text-muted text-sm leading-relaxed mb-3 line-clamp-3">
                        {excerpt}
                      </p>
                    )}

                    {/* Tags */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={`${tag}-${idx}`}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary border border-primary/20"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-text-muted mt-auto pt-4 border-t border-border">
                      <div className="flex items-center gap-1.5">
                        <HiUser size={12} />
                        <span>
                          {post.author?.username || 'Anonymous'}
                        </span>
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
