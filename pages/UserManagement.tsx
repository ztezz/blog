
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit, Save, X, User as UserIcon, Shield } from 'lucide-react';
import { getUsers, saveUser, deleteUser, isAuthenticated, getCurrentUser } from '../utils/storage';
import { User } from '../types';

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser] = useState<User | null>(getCurrentUser());
  const [loading, setLoading] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<User>({
    id: '',
    username: '',
    password: '',
    displayName: '',
    role: 'editor'
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/admin');
      return;
    }
    loadUsers();
  }, [navigate]);

  const loadUsers = async () => {
    const data = await getUsers();
    setUsers(data);
  };

  const handleEdit = (user: User) => {
    setFormData(user);
    setIsEditing(true);
  };

  const handleCreate = () => {
    setFormData({
      id: `user-${Date.now()}`,
      username: '',
      password: '',
      displayName: '',
      role: 'editor'
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (id === currentUser?.id) {
      alert("Bạn không thể xóa tài khoản đang đăng nhập!");
      return;
    }
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      await deleteUser(id);
      loadUsers();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      alert("Vui lòng nhập tên đăng nhập và mật khẩu");
      return;
    }
    setLoading(true);
    await saveUser(formData);
    await loadUsers();
    setLoading(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/admin/dashboard')} 
              className="text-gray-400 hover:text-sky-600 dark:hover:text-white mr-4 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Quản Lý Người Dùng</h1>
          </div>
          
          {!isEditing && (
            <button 
              onClick={handleCreate}
              className="flex items-center px-4 py-2 bg-sky-500 dark:bg-cyan-400 text-white dark:text-slate-950 rounded font-bold hover:bg-sky-600 dark:hover:bg-cyan-300 transition-colors shadow-lg shadow-sky-500/30 dark:shadow-[0_0_10px_rgba(34,211,238,0.3)]"
            >
              <Plus size={18} className="mr-2" /> Thêm người dùng
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User List */}
          <div className="lg:col-span-2 space-y-4">
            {users.map((user) => (
              <div key={user.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl p-5 flex items-center justify-between hover:border-sky-300 dark:hover:border-cyan-400/30 transition-all group shadow-sm dark:shadow-none">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${user.role === 'admin' ? 'bg-sky-500 dark:bg-cyan-400 text-white dark:text-slate-950' : 'bg-purple-500 dark:bg-purple-400 text-white'}`}>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-slate-900 dark:text-white font-bold text-lg flex items-center">
                      {user.displayName}
                      {user.role === 'admin' && <Shield size={14} className="ml-2 text-sky-500 dark:text-cyan-400" />}
                    </h3>
                    <p className="text-slate-500 dark:text-gray-400 text-sm">@{user.username}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEdit(user)}
                    className="p-2 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-400/10 rounded transition-colors"
                    title="Sửa"
                  >
                    <Edit size={18} />
                  </button>
                  {user.id !== currentUser?.id && (
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="p-2 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-400/10 rounded transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Edit/Create Form Side */}
          <div className="lg:col-span-1">
             {isEditing ? (
               <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/20 rounded-xl p-6 sticky top-24 shadow-2xl">
                 <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
                   {formData.id.includes('new') ? 'Tạo tài khoản' : 'Cập nhật tài khoản'}
                 </h3>
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-gray-400 mb-1">Tên hiển thị</label>
                      <input 
                        type="text" 
                        value={formData.displayName}
                        onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                         className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/20 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:border-sky-500 dark:focus:border-cyan-400 outline-none"
                        placeholder="VD: Quản trị viên"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-gray-400 mb-1">Tên đăng nhập</label>
                      <input 
                        type="text" 
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/20 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:border-sky-500 dark:focus:border-cyan-400 outline-none"
                        placeholder="VD: admin"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-gray-400 mb-1">Mật khẩu</label>
                      <input 
                        type="text" 
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/20 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:border-sky-500 dark:focus:border-cyan-400 outline-none"
                        placeholder="••••••"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-gray-400 mb-1">Quyền hạn</label>
                      <select
                         value={formData.role}
                         onChange={(e) => setFormData({...formData, role: e.target.value as 'admin' | 'editor'})}
                         className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/20 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:border-sky-500 dark:focus:border-cyan-400 outline-none"
                      >
                        <option value="admin">Admin (Toàn quyền)</option>
                        <option value="editor">Editor (Biên tập)</option>
                      </select>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button 
                        type="submit" 
                        disabled={loading}
                        className="flex-1 bg-sky-500 dark:bg-cyan-400 text-white dark:text-slate-950 font-bold py-2 rounded hover:bg-sky-600 dark:hover:bg-cyan-300 transition-colors flex justify-center items-center disabled:opacity-50"
                      >
                        <Save size={16} className="mr-2" /> {loading ? '...' : 'Lưu'}
                      </button>
                      <button 
                        type="button" 
                        onClick={handleCancel}
                        className="flex-1 bg-transparent border border-slate-300 dark:border-white/20 text-slate-600 dark:text-gray-300 font-bold py-2 rounded hover:bg-slate-100 dark:hover:bg-white/10 transition-colors flex justify-center items-center"
                      >
                        <X size={16} className="mr-2" /> Hủy
                      </button>
                    </div>
                 </form>
               </div>
             ) : (
               <div className="bg-white/50 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center h-full text-slate-400 dark:text-gray-500 min-h-[200px]">
                 <UserIcon size={48} className="mb-4 opacity-20" />
                 <p>Chọn một người dùng để sửa hoặc nhấn "Thêm người dùng" để tạo mới.</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
