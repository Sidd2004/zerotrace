import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiHeart } from 'react-icons/hi';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function LikeButton({ postId }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    fetchLikes();
  }, [postId, user]);

  const fetchLikes = async () => {
    try {
      const { count: likeCount } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);
      setCount(likeCount || 0);

      if (user) {
        const { data } = await supabase
          .from('post_likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .maybeSingle();
        setLiked(!!data);
      }
    } catch (err) {
      console.error('[LikeButton] Error fetching likes:', err);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }

    setAnimating(true);
    setTimeout(() => setAnimating(false), 600);

    if (liked) {
      setLiked(false);
      setCount((prev) => Math.max(0, prev - 1));
      await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);
    } else {
      setLiked(true);
      setCount((prev) => prev + 1);
      await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: user.id });
    }
  };

  return (
    <motion.button
      onClick={handleLike}
      whileTap={{ scale: 0.9 }}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 ${
        liked
          ? 'bg-primary/10 border-primary/30 text-primary'
          : 'bg-bg-card border-border text-text-secondary hover:text-primary hover:border-primary/20'
      }`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={liked ? 'liked' : 'unliked'}
          initial={{ scale: 0.5, rotate: -30 }}
          animate={{
            scale: animating ? [1, 1.4, 1] : 1,
            rotate: 0,
          }}
          transition={{ duration: 0.4 }}
        >
          <HiHeart
            size={20}
            className={liked ? 'fill-primary text-primary' : ''}
          />
        </motion.div>
      </AnimatePresence>
      <span className="text-sm font-medium">{count}</span>
    </motion.button>
  );
}
