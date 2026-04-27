import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .reduce((acc, line) => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        value = value.replace(/^['"]|['"]$/g, '');
        acc[key] = value;
      }
      return acc;
    }, {});
  Object.assign(process.env, envConfig);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const SITE_URL = 'https://zerotrace.in';

const staticPages = [
  { url: '/', priority: 1.0, changefreq: 'weekly' },
  { url: '/blog', priority: 0.8, changefreq: 'weekly' },
  { url: '/community', priority: 0.7, changefreq: 'monthly' },
  { url: '/community/zerotrace-arena-ctf-1', priority: 0.8, changefreq: 'monthly' },
  { url: '/contact', priority: 0.8, changefreq: 'monthly' },
  // Cybersecurity Services
  { url: '/services/soc-setup', priority: 0.9, changefreq: 'monthly' },
  { url: '/services/vapt', priority: 0.9, changefreq: 'monthly' },
  { url: '/services/threat-detection', priority: 0.9, changefreq: 'monthly' },
  { url: '/services/security-audits', priority: 0.9, changefreq: 'monthly' },
  { url: '/services/siem-integration', priority: 0.9, changefreq: 'monthly' },
  { url: '/services/red-teaming', priority: 0.9, changefreq: 'monthly' },
  // AI Solutions
  { url: '/services/ai-automation', priority: 0.9, changefreq: 'monthly' },
  { url: '/services/ai-security-monitoring', priority: 0.9, changefreq: 'monthly' },
  { url: '/services/workflow-automation', priority: 0.9, changefreq: 'monthly' },
  { url: '/services/fine-tuned-models', priority: 0.9, changefreq: 'monthly' },
  { url: '/services/rag-enterprise-search', priority: 0.9, changefreq: 'monthly' },
];

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function(c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

async function generateSitemap() {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('slug, updated_at, created_at')
      .eq('status', 'published');

    if (error) {
      throw error;
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static pages
    for (const page of staticPages) {
      xml += `\n  <url>\n    <loc>${escapeXml(SITE_URL + page.url)}</loc>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>`;
    }

    // Add dynamic blog posts
    if (posts && posts.length > 0) {
      for (const post of posts) {
        const lastMod = post.updated_at || post.created_at || new Date().toISOString();
        const dateObj = new Date(lastMod);
        const validLastMod = isNaN(dateObj.getTime()) ? new Date().toISOString() : dateObj.toISOString();
        
        xml += `\n  <url>\n    <loc>${escapeXml(SITE_URL + '/blog/' + post.slug)}</loc>\n    <lastmod>${validLastMod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>`;
      }
    }

    xml += `\n</urlset>`;

    const publicDir = path.resolve(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const outputPath = path.join(publicDir, 'sitemap.xml');
    fs.writeFileSync(outputPath, xml, 'utf8');

    console.log(`✅ Sitemap successfully generated at public/sitemap.xml with ${staticPages.length} static pages and ${posts ? posts.length : 0} blog posts.`);
  } catch (err) {
    console.error('❌ Error generating sitemap:', err.message);
    process.exit(1);
  }
}

generateSitemap();
