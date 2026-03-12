import { useState } from 'react';
import { HiMail } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('newsletter')
        .insert([{ email }]);

      if (error) {
        if (error.code === '23505') {
          throw new Error('You are already subscribed!');
        }
        throw error;
      }

      toast.success('Subscribed successfully!');
      setEmail('');
    } catch (error) {
      toast.error(error.message || 'Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="w-full pl-9 pr-4 py-2.5 bg-bg-card border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn-gradient !py-2.5 !px-4 text-sm whitespace-nowrap"
      >
        {loading ? '...' : 'Subscribe'}
      </button>
    </form>
  );
}
