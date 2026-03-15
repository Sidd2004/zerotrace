import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiReply, HiPencil, HiTrash, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { timeAgo, getInitials } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function Comments({ postId }) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          author:profiles(id, username, avatar_url, role)
        `)
        .eq('post_id', postId)
        .eq('status', 'visible')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[Comments] Error fetching comments:', error);
      } else if (data) {
        setComments(data);
      }
    } catch (err) {
      console.error('[Comments] Exception fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e, parentId = null) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to comment');
      return;
    }
    if (!newComment.trim()) return;

    setSubmitting(true);
    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      author_id: user.id,
      content: newComment.trim(),
      parent_comment_id: parentId,
    });

    if (error) {
      toast.error('Failed to post comment');
    } else {
      toast.success('Comment posted!');
      setNewComment('');
      fetchComments();
    }
    setSubmitting(false);
  };

  const handleDelete = async (commentId) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (!error) {
      toast.success('Comment deleted');
      fetchComments();
    }
  };

  const handleHide = async (commentId) => {
    const { error } = await supabase
      .from('comments')
      .update({ status: 'hidden' })
      .eq('id', commentId);

    if (!error) {
      toast.success('Comment hidden');
      fetchComments();
    }
  };

  // Build comment tree
  const rootComments = comments.filter((c) => !c.parent_comment_id);
  const getReplies = (parentId) =>
    comments.filter((c) => c.parent_comment_id === parentId);

  return (
    <div className="mt-12">
      <h3 className="font-heading font-bold text-xl mb-6">
        Comments ({comments.length})
      </h3>

      {/* New comment form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={user ? 'Write a comment...' : 'Login to comment'}
          disabled={!user}
          rows={3}
          className="w-full bg-bg-card border border-border rounded-xl p-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors resize-none"
        />
        <div className="flex justify-end mt-3">
          <button
            type="submit"
            disabled={!user || submitting || !newComment.trim()}
            className="btn-gradient !py-2 !px-6 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Comments list */}
      {loading ? (
        <div className="text-center py-8 text-text-muted">Loading comments...</div>
      ) : rootComments.length === 0 ? (
        <div className="text-center py-8 text-text-muted">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="space-y-4">
          {rootComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={getReplies(comment.id)}
              allComments={comments}
              user={user}
              profile={profile}
              postId={postId}
              onDelete={handleDelete}
              onHide={handleHide}
              onRefresh={fetchComments}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentItem({
  comment,
  replies,
  allComments,
  user,
  profile,
  postId,
  onDelete,
  onHide,
  onRefresh,
  depth = 0,
}) {
  const [showReplies, setShowReplies] = useState(true);
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editText, setEditText] = useState(comment.content);

  const isAuthor = user?.id === comment.author_id;
  const isAdmin = user?.role === 'admin' || profile?.role === 'admin';
  const nestedReplies = allComments.filter(
    (c) => c.parent_comment_id === comment.id
  );

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      author_id: user.id,
      content: replyText.trim(),
      parent_comment_id: comment.id,
    });

    if (!error) {
      toast.success('Reply posted!');
      setReplyText('');
      setReplying(false);
      onRefresh();
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editText.trim()) return;

    const { error } = await supabase
      .from('comments')
      .update({ content: editText.trim() })
      .eq('id', comment.id);

    if (!error) {
      toast.success('Comment updated');
      setEditing(false);
      onRefresh();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${depth > 0 ? 'ml-6 md:ml-10 pl-4 border-l border-border' : ''}`}
    >
      <div className="glass-card p-4 !rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-xs font-bold">
              {comment.author?.avatar_url ? (
                <img
                  src={comment.author.avatar_url}
                  alt=""
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getInitials(comment.author?.username)
              )}
            </div>
            <div>
              <span className="text-sm font-medium text-text-primary">
                {comment.author?.username || 'Anonymous'}
              </span>
              {comment.author?.role === 'admin' && (
                <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded font-medium">
                  Admin
                </span>
              )}
              <span className="text-xs text-text-muted ml-2">
                {timeAgo(comment.created_at)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {user && (
              <button
                onClick={() => setReplying(!replying)}
                className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all"
                title="Reply"
              >
                <HiReply size={14} />
              </button>
            )}
            {isAuthor && (
              <button
                onClick={() => setEditing(!editing)}
                className="p-1.5 rounded-lg text-text-muted hover:text-accent-blue hover:bg-accent-blue/10 transition-all"
                title="Edit"
              >
                <HiPencil size={14} />
              </button>
            )}
            {(isAuthor || isAdmin) && (
              <button
                onClick={() => onDelete(comment.id)}
                className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-all"
                title="Delete"
              >
                <HiTrash size={14} />
              </button>
            )}
            {isAdmin && !isAuthor && (
              <button
                onClick={() => onHide(comment.id)}
                className="p-1.5 rounded-lg text-text-muted hover:text-warning hover:bg-warning/10 transition-all text-[10px] font-medium"
                title="Hide"
              >
                Hide
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {editing ? (
          <form onSubmit={handleEdit}>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={2}
              className="w-full bg-bg-primary border border-border rounded-lg p-3 text-sm text-text-primary focus:outline-none focus:border-primary/50 resize-none"
            />
            <div className="flex gap-2 mt-2">
              <button type="submit" className="btn-gradient !py-1.5 !px-4 text-xs">
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setEditText(comment.content);
                }}
                className="btn-gradient-outline !py-1.5 !px-4 text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-text-secondary leading-relaxed">
            {comment.content}
          </p>
        )}

        {/* Reply form */}
        <AnimatePresence>
          {replying && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleReply}
              className="mt-3 overflow-hidden"
            >
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                rows={2}
                className="w-full bg-bg-primary border border-border rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 resize-none"
              />
              <div className="flex gap-2 mt-2">
                <button type="submit" className="btn-gradient !py-1.5 !px-4 text-xs">
                  Reply
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReplying(false);
                    setReplyText('');
                  }}
                  className="btn-gradient-outline !py-1.5 !px-4 text-xs"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Nested replies */}
      {nestedReplies.length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-1 text-xs text-text-muted hover:text-primary transition-colors mb-2 ml-2"
          >
            {showReplies ? <HiChevronUp size={14} /> : <HiChevronDown size={14} />}
            {nestedReplies.length} {nestedReplies.length === 1 ? 'reply' : 'replies'}
          </button>
          <AnimatePresence>
            {showReplies && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                {nestedReplies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    replies={[]}
                    allComments={allComments}
                    user={user}
                    profile={profile}
                    postId={postId}
                    onDelete={onDelete}
                    onHide={onHide}
                    onRefresh={onRefresh}
                    depth={depth + 1}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
