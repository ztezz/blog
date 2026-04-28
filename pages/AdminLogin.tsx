
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Lock, Zap } from 'lucide-react';
import { login } from '../utils/storage';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
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
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(10deg); opacity: 0.5; }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(20px) rotate(-10deg); opacity: 0.5; }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 15px rgba(34, 211, 238, 0.2); }
          50% { box-shadow: 0 0 30px rgba(34, 211, 238, 0.6); }
        }
        @keyframes glow-border {
          0%, 100% { border-color: rgba(34, 211, 238, 0.3); box-shadow: 0 0 0px rgba(34, 211, 238, 0); }
          50% { border-color: rgba(34, 211, 238, 0.8); box-shadow: inset 0 0 10px rgba(34, 211, 238, 0.1); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes button-shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes floating-particle {
          0% { transform: translateY(100vh) translateX(0) scale(1); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(100px) scale(0); opacity: 0; }
        }
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-scale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes text-glow {
          0%, 100% { text-shadow: 0 0 10px rgba(34, 211, 238, 0.3); }
          50% { text-shadow: 0 0 20px rgba(34, 211, 238, 0.8); }
        }
        @keyframes wave {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-10px); }
          75% { transform: translateY(10px); }
        }
        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(50px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(50px) rotate(-360deg); }
        }
        @keyframes blur-glow {
          0%, 100% { filter: blur(0px) brightness(1); }
          50% { filter: blur(10px) brightness(1.2); }
        }
        @keyframes icon-bounce {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.1) translateY(-10px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-reverse {
          animation: float-reverse 5s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .animate-glow-border {
          animation: glow-border 2s ease-in-out infinite;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        .login-card {
          animation: slide-up 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .form-input-focus {
          position: relative;
        }
        .form-input-focus::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, rgba(34, 211, 238, 0), rgba(34, 211, 238, 0.3), rgba(34, 211, 238, 0));
          border-radius: 0.5rem;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
          z-index: -1;
        }
        .particle {
          position: fixed;
          pointer-events: none;
          border-radius: 50%;
        }
        .particle-sm { width: 2px; height: 2px; }
        .particle-md { width: 4px; height: 4px; }
        .particle-lg { width: 6px; height: 6px; }
        .animate-text-glow {
          animation: text-glow 3s ease-in-out infinite;
        }
        .animate-icon-bounce {
          animation: icon-bounce 2s ease-in-out infinite;
        }
        .animate-pulse-scale {
          animation: pulse-scale 2s ease-in-out infinite;
        }
      `}</style>

      {/* Floating particles background - non-interactive */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="particle particle-sm bg-cyan-400/40 dark:bg-cyan-400/30"
            style={{
              left: Math.random() * 100 + '%',
              animation: `floating-particle ${5 + Math.random() * 5}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
        {[...Array(10)].map((_, i) => (
          <div
            key={`particle-md-${i}`}
            className="particle particle-md bg-purple-400/30 dark:bg-purple-400/20"
            style={{
              left: Math.random() * 100 + '%',
              animation: `floating-particle ${8 + Math.random() * 4}s linear infinite`,
              animationDelay: `${Math.random() * 8}s`,
            }}
          />
        ))}
      </div>
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 relative overflow-hidden">
        {/* Full overlay to prevent gaps */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/2 to-slate-900/5 dark:from-transparent dark:via-slate-900/10 dark:to-slate-900/20 pointer-events-none"></div>
        
        {/* Animated background elements - More layers */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-40 h-40 bg-sky-400/5 dark:bg-cyan-400/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-purple-400/5 dark:bg-purple-400/5 rounded-full blur-3xl animate-float-reverse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-32 left-1/3 w-48 h-48 bg-blue-400/5 dark:bg-cyan-400/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute -bottom-10 -right-10 w-52 h-52 bg-purple-500/5 dark:bg-purple-400/5 rounded-full blur-3xl animate-float-reverse" style={{ animationDelay: '1.5s' }}></div>
          
          {/* Extra animated orbs */}
          <div className="absolute top-1/2 -left-20 w-32 h-32 bg-cyan-400/3 dark:bg-cyan-400/3 rounded-full blur-3xl animate-pulse-scale"></div>
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-blue-400/3 dark:bg-blue-400/3 rounded-full blur-3xl" style={{ animation: 'float 6s ease-in-out infinite', animationDelay: '2s' }}></div>
        </div>

        {/* Main login card with enhanced effects */}
        <div className="login-card max-w-md w-full bg-white dark:bg-slate-900/80 backdrop-blur-sm p-8 rounded-3xl border border-slate-200 dark:border-cyan-400/20 shadow-2xl relative overflow-hidden z-10 hover:shadow-[0_0_50px_rgba(34,211,238,0.15)] transition-all duration-500">
          
          {/* Animated gradient border glow - Enhanced */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/10 to-purple-400/0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Premium animated background glow */}
          <div className="absolute inset-0 rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.1), transparent 70%)' }}></div>

          {/* Decorative background elements inside card - More animated */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-sky-400/5 dark:bg-cyan-400/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-purple-500/5 dark:bg-purple-400/5 rounded-full blur-3xl animate-float-reverse"></div>
          
          {/* Extra decorative elements */}
          <div className="absolute top-0 left-1/2 w-32 h-32 bg-cyan-400/5 dark:bg-cyan-400/5 rounded-full blur-2xl animate-pulse-scale" style={{ animationDelay: '0.5s' }}></div>

          <div className="relative z-10">
            {/* Icon with enhanced animation */}
            <div className="flex justify-center mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="relative">
                {/* Orbiting dots */}
                <div className="absolute -inset-8 animate-pulse-scale" style={{ animationDuration: '3s' }}>
                  <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full -translate-x-1/2" style={{ opacity: 0.3 }}></div>
                  <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-purple-400 rounded-full" style={{ opacity: 0.3 }}></div>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-sky-100 to-blue-100 dark:from-cyan-400/20 dark:to-cyan-400/10 rounded-full border border-sky-300 dark:border-cyan-400/40 animate-pulse-glow relative group hover:scale-110 transition-transform duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 rounded-full blur-xl transition-opacity duration-300"></div>
                  <ShieldCheck size={48} className="text-sky-600 dark:text-cyan-300 relative animate-icon-bounce" />
                </div>
              </div>
            </div>

            {/* Title with text glow effect */}
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-sky-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent mb-2 font-display tracking-wide animate-slide-up animate-text-glow" style={{ animationDelay: '0.2s' }}>
              Truy cập Quản Trị
            </h2>
            <p className="text-center text-slate-500 dark:text-gray-400 text-sm mb-8 animate-slide-up font-medium" style={{ animationDelay: '0.3s' }}>
              ✨ Đăng nhập để quản lý nội dung
            </p>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Username field */}
              <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <label className="block text-sm text-slate-600 dark:text-gray-300 mb-3 font-medium flex items-center gap-2 hover:text-cyan-500 transition-colors">
                  <User size={16} className="text-sky-500 dark:text-cyan-400 animate-pulse" />
                  Tên đăng nhập
                </label>
                <div className={`relative transition-all duration-300 group ${focusedField === 'username' ? 'form-input-focus' : ''}`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur"></div>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full bg-slate-50 dark:bg-slate-900/50 border-2 rounded-xl py-3 pl-4 pr-4 text-slate-900 dark:text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:focus:ring-cyan-400/30 outline-none transition-all placeholder-slate-400 dark:placeholder-gray-600 backdrop-blur-sm relative z-10 ${
                      focusedField === 'username' 
                        ? 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)] dark:border-cyan-400' 
                        : 'border-slate-200 dark:border-white/10 hover:border-cyan-300 dark:hover:border-cyan-400/50'
                    }`}
                    placeholder="Nhập username..."
                  />
                  {focusedField === 'username' && (
                    <Zap size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 animate-pulse z-20" />
                  )}
                </div>
              </div>

              {/* Password field */}
              <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <label className="block text-sm text-slate-600 dark:text-gray-300 mb-3 font-medium flex items-center gap-2 hover:text-cyan-500 transition-colors">
                  <Lock size={16} className="text-sky-500 dark:text-cyan-400 animate-pulse" />
                  Mật khẩu
                </label>
                <div className={`relative transition-all duration-300 group ${focusedField === 'password' ? 'form-input-focus' : ''}`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur"></div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full bg-slate-50 dark:bg-slate-900/50 border-2 rounded-xl py-3 pl-4 pr-4 text-slate-900 dark:text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:focus:ring-cyan-400/30 outline-none transition-all placeholder-slate-400 dark:placeholder-gray-600 backdrop-blur-sm relative z-10 ${
                      focusedField === 'password' 
                        ? 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)] dark:border-cyan-400' 
                        : 'border-slate-200 dark:border-white/10 hover:border-cyan-300 dark:hover:border-cyan-400/50'
                    }`}
                    placeholder="Nhập mật khẩu..."
                  />
                  {focusedField === 'password' && (
                    <Zap size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 animate-pulse z-20" />
                  )}
                </div>
              </div>
              
              {/* Error message with animation */}
              {error && (
                <div className="bg-red-500/10 dark:bg-red-500/10 border-2 border-red-500/50 dark:border-red-400/50 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm text-center font-medium animate-slide-up shadow-lg">
                  ⚠️ {error}
                </div>
              )}
              
              {/* Submit button - Premium version */}
              <button 
                type="submit" 
                disabled={loading}
                className={`w-full relative py-3 rounded-xl font-bold text-white dark:text-slate-950 transition-all transform duration-200 overflow-hidden group mt-6 animate-slide-up ${
                  loading 
                    ? 'opacity-70 cursor-wait' 
                    : 'hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] dark:hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:-translate-y-1 active:scale-95'
                }`}
                style={{ animationDelay: '0.6s' }}
              >
                <div className={`absolute inset-0 bg-gradient-to-r from-sky-500 via-blue-500 to-sky-600 dark:from-cyan-400 dark:via-cyan-300 dark:to-blue-400 transition-all duration-300 ${loading ? '' : 'group-hover:shadow-inner'}`}></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 group-hover:animate-shimmer" style={{ backgroundSize: '200% 100%', animation: loading ? 'none' : 'button-shimmer 2s infinite' }}></div>
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white dark:border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                      Đang xác thực...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} className="group-hover:animate-pulse" />
                      Đăng nhập
                    </>
                  )}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
