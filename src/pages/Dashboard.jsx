import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiPencil,
  HiDocumentText,
  HiEye,
  HiTrash,
  HiLogout,
  HiPlus,
  HiClock,
} from 'react-icons/hi';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatDate, getInitials } from '@/utils/helpers';
import GlassCard from '@/components/GlassCard';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, profile, loading: authLoading, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to initialize
    if (!user) {
      setLoading(false);
      return;
    }
    fetchPosts();
  }, [authLoading, user]);

  const fetchPosts = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching dashboard posts:', error);
        toast.error('Failed to load posts');
      } else if (data) {
        setPosts(data);
      }
    } catch (err) {
      console.error('Dashboard fetchException:', err);
      toast.error('An unexpected error occurred while loading posts');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async () => {
    const { error } = await updateProfile({
      username,
      bio,
      avatar_url: avatarUrl,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Profile updated!');
      setEditingProfile(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Delete this post?')) return;
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (!error) {
      toast.success('Post deleted');
      fetchPosts();
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast.success('Logged out');
    navigate('/');
  };

  const publishedPosts = posts.filter((p) => p.status === 'published');
  const draftPosts = posts.filter((p) => p.status !== 'published');

  const tabs = [
    { id: 'posts', label: 'My Posts', count: publishedPosts.length },
    { id: 'drafts', label: 'Drafts', count: draftPosts.length },
    { id: 'profile', label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-bg-primary pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-lg font-bold">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  getInitials(profile?.username)
                )}
              </div>
              <div>
                <h1 className="font-heading font-bold text-2xl">
                  {profile?.username || 'User'}
                </h1>
                <p className="text-text-muted text-sm">{profile?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/write"
                className="btn-gradient !py-2 !px-5 text-sm flex items-center gap-2"
              >
                <HiPlus size={16} />
                New Post
              </Link>
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl bg-bg-card border border-border text-text-muted hover:text-error hover:border-error/30 transition-all"
                title="Logout"
              >
                <HiLogout size={18} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-8 p-1 bg-bg-card rounded-xl border border-border w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary/20 text-primary'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-1.5 text-xs opacity-60">({tab.count})</span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {(activeTab === 'posts' || activeTab === 'drafts') && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12 text-text-muted">Loading...</div>
              ) : (activeTab === 'posts' ? publishedPosts : draftPosts).length === 0 ? (
                <div className="text-center py-12">
                  <HiDocumentText className="mx-auto text-text-muted mb-4" size={48} />
                  <p className="text-text-muted mb-4">
                    {activeTab === 'posts'
                      ? 'No published posts yet'
                      : 'No drafts'}
                  </p>
                  <Link to="/write" className="btn-gradient text-sm">
                    Write Your First Post
                  </Link>
                </div>
              ) : (
                (activeTab === 'posts' ? publishedPosts : draftPosts).map(
                  (post, i) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <GlassCard hover={false} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                post.status === 'published'
                                  ? 'bg-success/10 text-success'
                                  : post.status === 'pending'
                                  ? 'bg-warning/10 text-warning'
                                  : 'bg-text-muted/10 text-text-muted'
                              }`}
                            >
                              {post.status}
                            </span>
                          </div>
                          <h3 className="font-heading font-semibold text-base truncate">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
                            <HiClock size={12} />
                            <span>{formatDate(post.created_at)}</span>
                            {post.tags &&
                              post.tags.length > 0 &&
                              post.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-1.5 py-0.5 rounded bg-bg-card text-text-muted text-[10px]"
                                >
                                  {tag}
                                </span>
                              ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {post.status === 'published' && (
                            <Link
                              to={`/blog/${post.slug}`}
                              className="p-2 rounded-lg bg-bg-card border border-border text-text-muted hover:text-accent-blue hover:border-accent-blue/30 transition-all"
                              title="View"
                            >
                              <HiEye size={16} />
                            </Link>
                          )}
                          <Link
                            to={`/edit/${post.slug}`}
                            className="p-2 rounded-lg bg-bg-card border border-border text-text-muted hover:text-primary hover:border-primary/30 transition-all"
                            title="Edit"
                          >
                            <HiPencil size={16} />
                          </Link>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="p-2 rounded-lg bg-bg-card border border-border text-text-muted hover:text-error hover:border-error/30 transition-all"
                            title="Delete"
                          >
                            <HiTrash size={16} />
                          </button>
                        </div>
                      </GlassCard>
                    </motion.div>
                  )
                )
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <GlassCard hover={false}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading font-semibold text-lg">
                  Profile Settings
                </h3>
                {!editingProfile && (
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="btn-gradient-outline !py-1.5 !px-4 text-sm flex items-center gap-2"
                  >
                    <HiPencil size={14} />
                    Edit
                  </button>
                )}
              </div>

              {editingProfile ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-text-secondary mb-1.5">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-text-secondary mb-1.5">
                      Avatar URL
                    </label>
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-text-secondary mb-1.5">
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      placeholder="Tell us about yourself..."
                      className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 resize-none transition-colors"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleProfileSave}
                      className="btn-gradient !py-2 !px-6 text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingProfile(false);
                        setUsername(profile?.username || '');
                        setBio(profile?.bio || '');
                        setAvatarUrl(profile?.avatar_url || '');
                      }}
                      className="btn-gradient-outline !py-2 !px-6 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-text-muted uppercase tracking-wider">
                      Username
                    </label>
                    <p className="text-text-primary font-medium">
                      {profile?.username || '—'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-text-muted uppercase tracking-wider">
                      Bio
                    </label>
                    <p className="text-text-secondary text-sm">
                      {profile?.bio || 'No bio set'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-text-muted uppercase tracking-wider">
                      Role
                    </label>
                    <p className="text-text-primary text-sm capitalize">
                      {profile?.role || 'user'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-text-muted uppercase tracking-wider">
                      Member Since
                    </label>
                    <p className="text-text-secondary text-sm">
                      {formatDate(profile?.created_at)}
                    </p>
                  </div>
                </div>
              )}
            </GlassCard>
          )}
        </motion.div>
      </div>
    </div>
  );
}
