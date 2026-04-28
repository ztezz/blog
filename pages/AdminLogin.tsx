
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Lock } from 'lucide-react';
import { login } from '../utils/storage';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const success = await login(username, password);
    if (success) {
      navigate('/admin/dashboard');
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không đúng!');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-space-800 p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-space-neon/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-space-purple/10 rounded-full blur-2xl"></div>

        <div className="flex justify-center mb-6 relative z-10">
          <div className="p-4 bg-space-neon/10 rounded-full border border-space-neon/30 shadow-[0_0_15px_rgba(102,252,241,0.2)]">
            <ShieldCheck size={40} className="text-space-neon" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-white mb-6 font-display tracking-wide">Truy cập Quản Trị</h2>
        
        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          <div>
            <label className="block text-sm text-gray-400 mb-2 font-medium">Tên đăng nhập</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-space-900 border border-white/20 rounded-lg py-3 pl-10 pr-4 text-white focus:border-space-neon focus:ring-1 focus:ring-space-neon outline-none transition-all placeholder-gray-600"
                placeholder="Nhập username..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2 font-medium">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-space-900 border border-white/20 rounded-lg py-3 pl-10 pr-4 text-white focus:border-space-neon focus:ring-1 focus:ring-space-neon outline-none transition-all placeholder-gray-600"
                placeholder="Nhập mật khẩu..."
              />
            </div>
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-gradient-to-r from-space-neon to-space-accent text-space-900 font-bold py-3 rounded-lg hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] hover:text-white transition-all transform hover:-translate-y-0.5 ${loading ? 'opacity-70 cursor-wait' : ''}`}
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
