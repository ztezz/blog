
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import BlogList from './pages/BlogList';
import PostDetail from './pages/PostDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import PostEditor from './pages/PostEditor';
import SettingsEditor from './pages/SettingsEditor';
import UserManagement from './pages/UserManagement';
import CategoryManagement from './pages/CategoryManagement';
import Mailbox from './pages/Mailbox';

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
      <Layout>
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
              <h1 className="text-6xl font-display font-bold text-space-neon mb-4">404</h1>
              <p className="text-xl text-gray-300 mb-8">Trang bạn tìm kiếm đã bị hố đen nuốt chửng.</p>
              <a href="/" className="px-6 py-3 bg-white/10 border border-white/20 rounded hover:bg-white/20 transition-colors text-white">
                Quay về Trạm Không Gian (Trang chủ)
              </a>
            </div>
          } />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
