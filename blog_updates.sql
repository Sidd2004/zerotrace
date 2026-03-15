-- =================================================================================
-- ZEROTRACE - BLOG SYSTEM UPDATES
-- Run this in the Supabase SQL Editor
-- =================================================================================

-- 1. Add views counter column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- 2. Create function to atomically increment post views
CREATE OR REPLACE FUNCTION increment_post_views(post_slug TEXT)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
UPDATE posts
SET views = views + 1
WHERE slug = post_slug;
$$;
