import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value) env[key] = value.join('=');
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkViews() {
  const slug = process.argv[2] || 'tcs-hackquest-s10-round-1-writeup-mmnqxvdo';
  const { data, error } = await supabase.from('posts').select('slug, views').eq('slug', slug).single();
  if (error) {
    console.error('Error fetching views:', error);
    return;
  }
  console.log(`Views for ${data.slug}: ${data.views}`);
}

checkViews();
