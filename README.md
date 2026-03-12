# ZeroTrace — Cybersecurity Community Platform

A modern full-stack cybersecurity community platform built with React, Vite, TailwindCSS, and Supabase.

## Features

- **Authentication** — Email/password signup, Google OAuth, email verification, password reset
- **Blog System** — Markdown editor, code syntax highlighting, cover images, tags, drafts
- **Engagement** — Like posts, threaded comments, nested replies
- **Dashboard** — Profile editing, post management, draft management
- **Community** — Focus areas, CTF events, hall of fame, join CTA
- **Contact Form** — SMTP email integration via Supabase Edge Functions
- **Newsletter** — Email subscription stored in database
- **Cybersecurity Theme** — Dark hacker aesthetic, glassmorphism, neon glows, gradient accents, Framer Motion animations

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Styling | TailwindCSS v4 |
| Animations | Framer Motion |
| Backend | Supabase (Auth, Database, API, Storage) |
| Email | SMTP via Supabase Edge Functions |
| Markdown | react-markdown + remark-gfm + rehype-highlight |
| Editor | @uiw/react-md-editor |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account ([supabase.com](https://supabase.com))

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Setup Database

1. Go to your Supabase project → **SQL Editor**
2. Paste the contents of `database.sql`
3. Click **Run** to create all tables, policies, and triggers

### 4. Configure Authentication

1. In Supabase → **Authentication** → **Providers**
2. Enable **Email** provider (with email confirmation if desired)
3. Enable **Google** provider (requires Google OAuth credentials)

### 5. Email & Contact Form Architecture

ZeroTrace no longer handles SMTP credentials directly in the frontend or via custom Edge Functions. All emails (Auth + Contact Form) are securely dispatched using **Supabase Custom SMTP** natively.

**a. Contact Form Flow**
1. User submits the form on the frontend (`/contact`).
2. Frontend sends an API request to the **Render Backend API** (`/render-api`).
3. The Render API validates, sanitizes, and inserts the message into the `contact_messages` Supabase table using a secured `SERVICE_ROLE_KEY`.
4. A Supabase Database Webhook (or Edge Function) listens for inserts on `contact_messages` and dispatches the native Admin Notification and User Acknowledgement emails via your Custom SMTP settings.

**b. Configure Frontend `.env`**  
The frontend only needs to know where the Render API lives:
```env
# The URL of your deployed Render backend API
VITE_API_URL=https://your-render-api-url.onrender.com
# Supabase Keys
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**c. Configure Render API `.env`**
Navigate to the `render-api` folder and set up its `.env`:
```env
PORT=10000
ALLOWED_ORIGINS=https://zerotrace.in
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**d. Authentication Emails**  
ZeroTrace includes custom HTML templates for authentication emails in `src/templates/email/`:
- `welcome.html`
- `verification.html`
- `reset.html`

To use these, go to your **Supabase Dashboard → Authentication → Email Templates**. Copy the raw HTML from these files and paste them into the respective boxes. Then configure **Supabase Custom SMTP** settings using your cPanel credentials.

### 6. Run Locally

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173)

## Build for Production

```bash
npm run build
```

This creates a `dist/` folder with static files ready for deployment.

## Deployment

### Yeta Hosting

1. Run `npm run build`
2. Upload the `dist/` folder to Yeta hosting panel

### Apache / Shared Hosting

1. Run `npm run build`
2. Upload contents of `dist/` to your `public_html` directory
3. Add this `.htaccess` file in the root:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── Comments.jsx
│   ├── Footer.jsx
│   ├── GlassCard.jsx
│   ├── GradientButton.jsx
│   ├── GridBackground.jsx
│   ├── LikeButton.jsx
│   ├── Navbar.jsx
│   ├── NewsletterForm.jsx
│   ├── ProtectedRoute.jsx
│   └── SectionHeading.jsx
├── hooks/            # React hooks & context
│   └── useAuth.jsx
├── layouts/          # Page layouts
│   └── MainLayout.jsx
├── lib/              # Library configs
│   ├── smtp.js
│   └── supabase.js
├── pages/            # Route pages
│   ├── Blog.jsx
│   ├── BlogEditor.jsx
│   ├── BlogPost.jsx
│   ├── Community.jsx
│   ├── Contact.jsx
│   ├── Dashboard.jsx
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   └── ResetPassword.jsx
├── styles/           # Global styles
│   └── index.css
├── utils/            # Utility functions
│   └── helpers.js
├── App.jsx           # Route definitions
└── main.jsx          # App entry point
```

## License

MIT
