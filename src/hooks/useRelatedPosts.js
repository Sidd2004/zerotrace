import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Extract significant words from text for similarity comparison.
 * Filters out short words (<4 chars) and common stop words.
 */
function extractKeywords(text) {
  if (!text) return new Set();
  const stopWords = new Set([
    'this', 'that', 'with', 'from', 'your', 'have', 'will', 'been',
    'they', 'them', 'their', 'what', 'when', 'where', 'which', 'about',
    'into', 'more', 'some', 'than', 'very', 'just', 'also', 'does',
  ]);
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !stopWords.has(w))
  );
}

/**
 * Compute a relevance score between two posts.
 * Higher score = more relevant.
 */
function computeRelevanceScore(currentPost, candidatePost) {
  let score = 0;

  // ── Tag overlap (highest weight: 10 points per shared tag) ──
  const currentTags = new Set(
    currentPost.post_tags?.map((pt) => pt.tag?.name?.toLowerCase()).filter(Boolean) || []
  );
  const candidateTags = new Set(
    candidatePost.post_tags?.map((pt) => pt.tag?.name?.toLowerCase()).filter(Boolean) || []
  );

  let tagOverlap = 0;
  for (const tag of candidateTags) {
    if (currentTags.has(tag)) tagOverlap++;
  }
  score += tagOverlap * 10;

  // ── Title word similarity (medium weight: up to 5 points) ──
  const currentWords = extractKeywords(currentPost.title);
  const candidateWords = extractKeywords(candidatePost.title);

  if (currentWords.size > 0 && candidateWords.size > 0) {
    let overlap = 0;
    for (const word of candidateWords) {
      if (currentWords.has(word)) overlap++;
    }
    const union = new Set([...currentWords, ...candidateWords]).size;
    const similarity = union > 0 ? overlap / union : 0;
    score += similarity * 5;
  }

  // ── Recency bonus (low weight: up to 2 points) ──
  if (candidatePost.created_at) {
    const ageMs = Date.now() - new Date(candidatePost.created_at).getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    // Posts within 30 days get up to 2 bonus points, decaying linearly
    score += Math.max(0, 2 - (ageDays / 30) * 2);
  }

  return score;
}

/**
 * Hook: Fetch all published posts and compute Read Next + Related Posts
 * for the given current post.
 *
 * @param {object|null} currentPost — the fully loaded post object
 * @returns {{ readNext: object|null, relatedPosts: object[], loading: boolean }}
 */
export default function useRelatedPosts(currentPost) {
  const [readNext, setReadNext] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentPost?.id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchAndCompute() {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            id, title, slug, excerpt, cover_image, created_at, views,
            author:profiles(username, avatar_url),
            post_tags(tag:tags(name))
          `)
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (cancelled) return;
        if (error) {
          console.warn('useRelatedPosts fetch error:', error);
          setLoading(false);
          return;
        }

        // Filter out current post
        const candidates = (data || []).filter((p) => p.id !== currentPost.id);

        if (candidates.length === 0) {
          setReadNext(null);
          setRelatedPosts([]);
          setLoading(false);
          return;
        }

        // Score and sort
        const scored = candidates
          .map((p) => ({ ...p, _score: computeRelevanceScore(currentPost, p) }))
          .sort((a, b) => b._score - a._score);

        // Read Next = top 1
        const next = scored[0];
        setReadNext(next);

        // Related Posts = next 3–5 (excluding Read Next)
        const related = scored.slice(1, 6);
        setRelatedPosts(related);
      } catch (err) {
        console.warn('useRelatedPosts exception:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    setLoading(true);
    fetchAndCompute();

    return () => {
      cancelled = true;
    };
  }, [currentPost?.id]);

  return { readNext, relatedPosts, loading };
}
