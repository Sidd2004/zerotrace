-- =================================================================================
-- ZEROTRACE - ADMIN ROLE & TAG MANAGEMENT SYSTEM
-- Run this in the Supabase SQL Editor
-- =================================================================================

-- 1. Extend Profiles Table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 2. Create Tags Table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Post-Tags Relationship Table
CREATE TABLE IF NOT EXISTS post_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(post_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_post_tags_post ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag ON post_tags(tag_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

-- 5. Admin Post Management Policies
-- Admins can update or delete any post.
CREATE POLICY "Admins manage posts"
ON posts
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 6. Admin Comment Moderation Policies
-- Admins can delete any comment.
CREATE POLICY "Admins delete comments"
ON comments
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 7. Tag Permissions
-- Admins manage tags (all operations).
CREATE POLICY "Admins manage tags"
ON tags
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Normal users may read tags.
CREATE POLICY "Users read tags"
ON tags
FOR SELECT
USING (true);

-- 8. Post-Tags Permissions
-- Admins can manage all post_tags.
CREATE POLICY "Admins manage post_tags"
ON post_tags
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Authors can manage post_tags for their own posts.
CREATE POLICY "Authors manage their post_tags"
ON post_tags
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM posts
    WHERE posts.id = post_tags.post_id
    AND posts.author_id = auth.uid()
  )
);

-- Users can read post_tags.
CREATE POLICY "Users read post_tags"
ON post_tags
FOR SELECT
USING (true);
