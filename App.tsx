
import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from './utils/router';
import Layout from './components/Layout';
import AdminAutomationNotifications from './components/AdminAutomationNotifications';

const Home = lazy(() => import('./pages/Home'));
const BlogList = lazy(() => import('./pages/BlogList'));
const PostDetail = lazy(() => import('./pages/PostDetail'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const PostEditor = lazy(() => import('./pages/PostEditor'));
const SettingsEditor = lazy(() => import('./pages/SettingsEditor'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const CategoryManagement = lazy(() => import('./pages/CategoryManagement'));
const Mailbox = lazy(() => import('./pages/Mailbox'));

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center" role="status">
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
    <span className="sr-only">Đang tải trang...</span>
  </div>
);

// Scroll to top helper
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AdminAutomationNotifications />
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:id" element={<PostDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/create" element={<PostEditor />} />
          <Route path="/admin/edit/:id" element={<PostEditor />} />
          <Route path="/admin/settings" element={<SettingsEditor />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/categories" element={<CategoryManagement />} />
          <Route path="/admin/mailbox" element={<Mailbox />} />
          
          {/* 404 Fallback */}
          <Route path="*" element={
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
              <h1 className="text-6xl font-display font-bold text-cyan-400 mb-4">404</h1>
              <p className="text-xl text-gray-300 mb-8">Trang bạn tìm kiếm đã bị hố đen nuốt chửng.</p>
              <a href="/" className="px-6 py-3 bg-white/10 border border-white/20 rounded hover:bg-white/20 transition-colors text-white">
                Quay về Trạm Không Gian (Trang chủ)
              </a>
            </div>
          } />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
