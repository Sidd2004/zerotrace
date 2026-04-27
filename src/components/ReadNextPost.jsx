import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowRight, HiClock, HiUser } from 'react-icons/hi';
import { formatDate, truncateText, stripMarkdown } from '@/utils/helpers';

/**
 * A prominent "Read Next" CTA card shown at the end of a blog post.
 * Renders a single recommended post with cover image, title, excerpt, and tags.
 *
 * @param {{ post: object | null }} props
 */
export default function ReadNextPost({ post }) {
  if (!post) return null;

  const excerpt = post.excerpt || truncateText(stripMarkdown(post.content), 140);
  const tags = post.post_tags?.map((pt) => pt.tag?.name).filter(Boolean) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="mt-10"
    >
      {/* Section label */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
        <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">
          Read Next
        </span>
        <div className="h-px flex-1 bg-gradient-to-l from-primary/40 to-transparent" />
      </div>

      <Link
        to={`/blog/${post.slug}`}
        className="block group"
        id="read-next-link"
      >
        <div className="read-next-card glass-card p-0 overflow-hidden flex flex-col sm:flex-row">
          {/* Thumbnail */}
          <div className="sm:w-56 md:w-64 h-44 sm:h-auto flex-shrink-0 bg-bg-card overflow-hidden">
            <img
              src={post.cover_image || '/favicon.png'}
              alt={post.title}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                !post.cover_image ? 'object-contain p-8 opacity-30' : ''
              }`}
            />
          </div>

          {/* Content */}
          <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center">
            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary border border-primary/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h3 className="font-heading font-bold text-lg md:text-xl mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>

            {excerpt && (
              <p className="text-text-muted text-sm leading-relaxed mb-3 line-clamp-2">
                {excerpt}
              </p>
            )}

            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <HiUser size={12} />
                  {post.author?.username || 'Anonymous'}
                </span>
                <span className="flex items-center gap-1">
                  <HiClock size={12} />
                  {formatDate(post.created_at)}
                </span>
              </div>

              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                Read
                <HiArrowRight size={14} />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
