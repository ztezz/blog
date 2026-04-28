
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe, ChevronDown, ExternalLink, Shield, Sun, Moon } from 'lucide-react';
import StarBackground from './StarBackground';
import SkyBackground from './SkyBackground';
import { getSettings } from '../utils/storage';
import { SiteSettings, NavItem } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  
  // Theme State - Với localStorage persistence
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
        // Kiểm tra localStorage trước
        const savedTheme = localStorage.getItem('theme-preference');
        if (savedTheme === 'dark' || savedTheme === 'light') {
            return savedTheme;
        }
        // Nếu không có, dùng logic tự động theo giờ
        const currentHour = new Date().getHours();
        // Quy định: 6h sáng đến 18h tối (6PM) là Ban Ngày -> Light Mode
        const isDayTime = currentHour >= 6 && currentHour < 18;
        return isDayTime ? 'light' : 'dark';
    }
    return 'dark'; // Fallback server-side
  });

  const isAdminPage = location.pathname.startsWith('/admin');

  // Apply Theme Effect
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.backgroundColor = '#020617'; // Slate 950 - Darker background
      root.style.color = '#f8fafc'; // Slate 50 - Off-white text
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#f8fafc'; // Slate 50 - Light background
      root.style.color = '#0f172a'; // Slate 900 - Dark text
    }
    // Lưu theme vào localStorage
    localStorage.setItem('theme-preference', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Initialize and update settings
  useEffect(() => {
    const fetchSettings = async () => {
      const data = await getSettings();
      setSettings(data);
    };
    fetchSettings();
  }, [location]);

  // Update Favicon dynamically
  useEffect(() => {
    if (settings && settings.faviconUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = settings.faviconUrl;
    }
  }, [settings]);

  // Helper: Đảm bảo link ngoài luôn có https://
  const getSafeExternalLink = (path: string) => {
    if (!path) return '#';
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `https://${path}`;
  };

  // Helper for Desktop active state with Glow effect
  const getDesktopLinkClass = (path: string, hasChildren: boolean = false) => {
    // Light Mode: text-slate-600 hover:text-sky-600 hover:bg-sky-50
    // Dark Mode: text-gray-300 hover:text-white hover:bg-white/5
    const baseClass = "flex items-center space-x-1 py-2 px-3 font-medium text-sm tracking-wide transition-all duration-300 ease-out rounded-lg";
    
    // Active State
    const activeClass = "text-sky-700 bg-sky-100 dark:text-white dark:bg-white/10 shadow-sm dark:shadow-[0_0_10px_rgba(56,189,248,0.3)]";
    
    // Inactive State
    const inactiveClass = "text-slate-600 hover:text-sky-600 hover:bg-sky-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/5";
    
    const cursorClass = hasChildren ? 'cursor-default' : 'cursor-pointer';

    return `${baseClass} ${location.pathname === path ? activeClass : inactiveClass} ${cursorClass}`;
  };

  // Helper for External Links (Desktop)
  const desktopExternalClass = "flex items-center space-x-1 py-2 px-3 font-medium text-sm tracking-wide text-slate-600 hover:text-sky-600 hover:bg-sky-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/5 rounded-lg transition-all duration-300 ease-out";

  // Recursive render for mobile
  const renderMobileNavItem = (item: NavItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isItemActive = location.pathname === item.path;
    
    // Mobile Item Styles
    const mobileBaseClass = `flex items-center w-full py-3 px-3 rounded-md text-base font-medium transition-all duration-300 ${depth > 0 ? 'pl-8 text-sm' : ''}`;
    const mobileHoverClass = "text-slate-600 hover:text-sky-600 hover:bg-sky-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/10"; 
    const mobileActiveClass = "text-sky-700 bg-sky-100 border-l-2 border-sky-500 dark:text-cyan-400 dark:bg-cyan-400/10 dark:border-cyan-400";

    return (
      <div key={item.id} className="w-full">
        {item.isExternal ? (
          <a
            href={getSafeExternalLink(item.path)} // Sử dụng hàm fix link
            target="_blank"
            rel="noopener noreferrer"
            className={`${mobileBaseClass} ${mobileHoverClass} justify-start space-x-2`}
            onClick={() => setIsMenuOpen(false)}
          >
             <span>{item.label}</span>
             <ExternalLink size={14} className="ml-1 opacity-70" />
          </a>
        ) : (
          <div className="w-full">
             <Link
              to={hasChildren ? '#' : item.path}
              onClick={() => !hasChildren && setIsMenuOpen(false)}
              className={`${mobileBaseClass} justify-between ${isItemActive && !hasChildren ? mobileActiveClass : mobileHoverClass}`}
            >
              <span className="flex items-center space-x-2">
                 <span>{item.label}</span>
              </span>
              {hasChildren && <span className="text-xs text-gray-500 bg-white/10 px-2 py-0.5 rounded">Group</span>}
            </Link>
            {hasChildren && (
              <div className="border-l border-slate-200 dark:border-white/10 ml-3 mt-1">
                {item.children!.map(child => renderMobileNavItem(child, depth + 1))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!settings) return <div className="min-h-screen bg-sky-50 dark:bg-slate-950 transition-colors duration-500"></div>; // Loading state

  return (
    <div className="min-h-screen relative flex flex-col font-sans text-slate-800 dark:text-gray-100 overflow-x-hidden transition-colors duration-500 bg-sky-50 dark:bg-slate-950">
      
      {/* Background Logic - Hidden on Admin pages to avoid layout clutter */}
      {!isAdminPage && (theme === 'dark' ? <StarBackground /> : <SkyBackground />)}
      
      {/* Background Layer 2: Cosmic Nebula Glows (Only in Dark Mode) */}
      <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-1000 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`}>
         <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[120px] opacity-60 mix-blend-screen animate-pulse-slow"></div>
         <div className="absolute bottom-[0%] right-[0%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px] opacity-50 mix-blend-screen"></div>
         <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-cyan-500/10 rounded-full blur-[150px] opacity-30"></div>
      </div>
      
      {/* Header */}
      <header className="fixed w-full z-50 top-0 bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border-b border-slate-200 dark:border-white/10 shadow-lg transition-all duration-300 supports-[backdrop-filter]:bg-white/40 dark:supports-[backdrop-filter]:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group relative">
              <div className="absolute inset-0 bg-sky-400/20 dark:bg-cyan-400/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              {settings.logoUrl ? (
                <div className="relative z-10 transition-transform duration-300 group-hover:scale-105">
                  <img src={settings.logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
                </div>
              ) : (
                <div className="relative z-10 bg-gradient-to-br from-sky-500 to-blue-600 dark:from-cyan-400 dark:to-blue-600 p-2 rounded-xl shadow-lg group-hover:shadow-cyan-400/50 transition-all duration-300">
                  <Globe className="text-white" size={24} />
                </div>
              )}
              <span className="relative z-10 font-display font-bold text-2xl tracking-wider text-slate-800 dark:text-white">
                {settings.siteNamePrefix}<span className="text-sky-600 dark:text-cyan-400">{settings.siteNameSuffix}</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="flex items-center space-x-6">
                <nav className="hidden md:flex space-x-2">
                {settings.navigation.map((item) => (
                    <div key={item.id} className="relative group">
                    {item.isExternal ? (
                        <a 
                        href={getSafeExternalLink(item.path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={desktopExternalClass}
                        >
                            <span>{item.label}</span>
                            <ExternalLink size={12} />
                        </a>
                    ) : (
                        <Link
                        to={item.children ? '#' : item.path}
                        className={getDesktopLinkClass(item.path, !!item.children)}
                        >
                        <span>{item.label}</span>
                        {item.children && <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300"/>}
                        </Link>
                    )}

                    {item.children && item.children.length > 0 && (
                        <div className="absolute left-0 mt-0 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-4 pt-4 z-50">
                        <div className="bg-white/95 dark:bg-slate-800/90 border border-slate-200 dark:border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10">
                            {item.children.map((child) => (
                            <div key={child.id} className="border-b border-slate-100 dark:border-white/5 last:border-0">
                                {child.isExternal ? (
                                <a
                                    href={getSafeExternalLink(child.path)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block px-5 py-3 text-sm text-slate-600 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-white/10 hover:text-sky-700 dark:hover:text-white hover:pl-7 transition-all duration-300 flex items-center justify-between group/item"
                                >
                                    {child.label}
                                    <ExternalLink size={12} className="opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                </a>
                                ) : (
                                <Link
                                    to={child.path}
                                    className="block px-5 py-3 text-sm text-slate-600 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-white/10 hover:text-sky-700 dark:hover:text-white hover:pl-7 transition-all duration-300"
                                >
                                    {child.label}
                                </Link>
                                )}
                            </div>
                            ))}
                        </div>
                        </div>
                    )}
                    </div>
                ))}
                </nav>

                {/* Theme Toggle Button */}
                <button 
                  onClick={toggleTheme}
                  className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-sky-100 hover:text-sky-600 dark:bg-white/10 dark:text-yellow-300 dark:hover:bg-white/20 transition-all shadow-sm"
                  title="Chuyển đổi giao diện (Mặc định: Tự động theo giờ)"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Mobile Menu Button */}
                <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden text-slate-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-white focus:outline-none transition-transform duration-300 active:scale-90"
                >
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className={`md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 overflow-y-auto max-h-[75vh]">
              {settings.navigation.map(item => renderMobileNavItem(item))}
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow z-10 pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-white/10 mt-12 py-12 relative overflow-hidden">
        {/* Footer Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-sky-400 dark:via-cyan-400 to-transparent opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div>
             <span className="font-display font-bold text-xl tracking-wider text-slate-800 dark:text-white block mb-4">
                {settings.siteNamePrefix}<span className="text-sky-600 dark:text-cyan-400">{settings.siteNameSuffix}</span>
              </span>
            <p className="text-slate-500 dark:text-gray-400 leading-relaxed">
              {settings.footerDescription}
            </p>
          </div>
          <div>
            <h3 className="text-slate-800 dark:text-white font-bold mb-4 uppercase tracking-wider flex items-center">
              <span className="w-1 h-4 bg-sky-500 dark:bg-cyan-400 mr-2 rounded-full shadow-[0_0_10px_#06b6d4]"></span>
              Liên kết nhanh
            </h3>
            <ul className="space-y-2 text-slate-500 dark:text-gray-400">
              {settings.navigation.slice(0, 4).map(item => (
                 !item.isExternal && !item.children && (
                   <li key={item.id}>
                     <Link to={item.path} className="hover:text-sky-600 dark:hover:text-cyan-400 hover:pl-1 transition-all duration-300 inline-block">
                       {item.label}
                     </Link>
                   </li>
                 )
              ))}
              <li><Link to="/admin" className="hover:text-sky-600 dark:hover:text-cyan-400 flex items-center hover:pl-1 transition-all duration-300"><Shield size={12} className="mr-1"/> Quản trị viên</Link></li>
            </ul>
          </div>
          <div>
             <h3 className="text-slate-800 dark:text-white font-bold mb-4 uppercase tracking-wider flex items-center">
              <span className="w-1 h-4 bg-purple-500 dark:bg-purple-400 mr-2 rounded-full shadow-[0_0_10px_#a855f7]"></span>
              Theo dõi
            </h3>
            <div className="flex space-x-4">
              <a href={settings.socialLinks.facebook} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-sky-500 dark:hover:bg-cyan-400 hover:text-white dark:hover:text-white hover:border-sky-500 dark:hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.6)] transition-all duration-300 text-slate-600 dark:text-gray-300">FB</a>
              <a href={settings.socialLinks.twitter} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-sky-500 dark:hover:bg-cyan-400 hover:text-white dark:hover:text-white hover:border-sky-500 dark:hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.6)] transition-all duration-300 text-slate-600 dark:text-gray-300">X</a>
              <a href={settings.socialLinks.linkedin} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-sky-500 dark:hover:bg-cyan-400 hover:text-white dark:hover:text-white hover:border-sky-500 dark:hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.6)] transition-all duration-300 text-slate-600 dark:text-gray-300">IN</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-slate-200 dark:border-white/5 text-center text-slate-400 dark:text-gray-500 text-xs">
          {settings.footerCopyright}
        </div>
      </footer>
    </div>
  );
};

export default Layout;
