import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Home from '@/pages/Home';
import Community from '@/pages/Community';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import Contact from '@/pages/Contact';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ResetPassword from '@/pages/ResetPassword';

/* Lazy-loaded routes for better performance */
const BlogEditor = lazy(() => import('@/pages/BlogEditor'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const ServicePage = lazy(() => import('@/pages/ServicePage'));
const ZeroTraceArenaCTF1 = lazy(() => import('@/pages/ZeroTraceArenaCTF1'));

function LazyFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/community" element={<Community />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/services/:slug"
          element={
            <Suspense fallback={<LazyFallback />}>
              <ServicePage />
            </Suspense>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LazyFallback />}>
                <Dashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/write"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LazyFallback />}>
                <BlogEditor />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit/:slug"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LazyFallback />}>
                <BlogEditor />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/community/zerotrace-arena-ctf-1"
          element={
            <Suspense fallback={<LazyFallback />}>
              <ZeroTraceArenaCTF1 />
            </Suspense>
          }
        />
        {/* Catch-all route to fallback unknown URLs to home instead of blank screen */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
