
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus, LogOut, Settings, Users, Mail, Layers } from 'lucide-react';
import { getPosts, deletePost, logout, isAuthenticated } from '../utils/storage';
import { BlogPost } from '../types';

const AdminDashboard: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/admin');
      return;
    }
    loadPosts();
  }, [navigate]);

  const loadPosts = async () => {
    const data = await getPosts();
    setPosts(data);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa bài viết này?')) {
      await deletePost(id);
      loadPosts();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Bảng Điều Khiển</h1>
          <div className="flex flex-wrap gap-3 items-center justify-center">
            <Link 
              to="/admin/create" 
              className="flex items-center px-4 py-2 bg-sky-500 dark:bg-space-neon text-white dark:text-space-900 rounded font-bold hover:bg-sky-600 dark:hover:bg-white transition-colors"
            >
              <Plus size={18} className="mr-2" /> Viết bài mới
            </Link>
            <div className="h-6 w-px bg-slate-300 dark:bg-white/20 hidden md:block"></div>
            
            <Link 
              to="/admin/mailbox" 
              className="flex items-center px-4 py-2 bg-white dark:bg-space-800 text-slate-700 dark:text-white border border-slate-300 dark:border-white/20 rounded font-bold hover:bg-slate-100 dark:hover:bg-space-700 hover:text-sky-600 dark:hover:text-space-neon transition-colors"
            >
              <Mail size={18} className="mr-2" /> Hộp thư
            </Link>
            
            <Link 
              to="/admin/users" 
              className="flex items-center px-4 py-2 bg-white dark:bg-space-800 text-slate-700 dark:text-white border border-slate-300 dark:border-white/20 rounded font-bold hover:bg-slate-100 dark:hover:bg-space-700 hover:text-sky-600 dark:hover:text-space-neon transition-colors"
            >
              <Users size={18} className="mr-2" /> Users
            </Link>

             <Link 
              to="/admin/categories" 
              className="flex items-center px-4 py-2 bg-white dark:bg-space-800 text-slate-700 dark:text-white border border-slate-300 dark:border-white/20 rounded font-bold hover:bg-slate-100 dark:hover:bg-space-700 hover:text-sky-600 dark:hover:text-space-neon transition-colors"
            >
              <Layers size={18} className="mr-2" /> Danh mục
            </Link>

            <Link 
              to="/admin/settings" 
              className="flex items-center px-4 py-2 bg-white dark:bg-space-800 text-slate-700 dark:text-white border border-slate-300 dark:border-white/20 rounded font-bold hover:bg-slate-100 dark:hover:bg-space-700 hover:text-sky-600 dark:hover:text-space-neon transition-colors"
            >
              <Settings size={18} className="mr-2" /> Cài đặt
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-500/10 transition-colors ml-2"
            >
              <LogOut size={18} className="mr-2" /> Thoát
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-space-800 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-lg dark:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-100 dark:bg-space-900 border-b border-slate-200 dark:border-white/10">
                  <th className="p-4 text-slate-500 dark:text-gray-400 font-medium">Tiêu đề</th>
                  <th className="p-4 text-slate-500 dark:text-gray-400 font-medium">Danh mục</th>
                  <th className="p-4 text-slate-500 dark:text-gray-400 font-medium">Ngày đăng</th>
                  <th className="p-4 text-slate-500 dark:text-gray-400 font-medium text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-slate-800 dark:text-white">
                      <div className="truncate max-w-[300px]">{post.title}</div>
                    </td>
                    <td className="p-4 text-sky-600 dark:text-space-neon">{post.category}</td>
                    <td className="p-4 text-slate-600 dark:text-gray-400">{post.date}</td>
                    <td className="p-4 flex justify-end space-x-3">
                      <Link 
                        to={`/admin/edit/${post.id}`} 
                        className="p-2 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-400/10 rounded transition-colors"
                        title="Sửa"
                      >
                        <Edit size={18} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(post.id)}
                        className="p-2 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-400/10 rounded transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500 dark:text-gray-500">Chưa có bài viết nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
