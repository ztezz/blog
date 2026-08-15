
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Link, useLocation } from '../utils/router';
import { Menu, X, Globe, ChevronDown, ExternalLink, Shield, Sun, Moon, ArrowUpRight, RadioTower } from 'lucide-react';
import StarBackground from './StarBackground';
import SkyBackground from './SkyBackground';
import { getSettings } from '../utils/storage';
import { SiteSettings, NavItem } from '../types';
import SiteSeo from './SiteSeo';

interface LayoutProps {
  children: React.ReactNode;
}

const SiteSettingsContext = createContext<SiteSettings | null>(null);

export const useSiteSettings = () => useContext(SiteSettingsContext);

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
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
      root.style.colorScheme = 'dark';
      root.style.backgroundColor = '#020617'; // Slate 950 - Darker background
      root.style.color = '#f8fafc'; // Slate 50 - Off-white text
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
      root.style.backgroundColor = '#f8fafc'; // Slate 50 - Light background
      root.style.color = '#0f172a'; // Slate 900 - Dark text
    }
    // Lưu theme vào localStorage
    localStorage.setItem('theme-preference', theme);
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => setIsCompact(previous => {
      const next = window.scrollY > 36;
      return previous === next ? previous : next;
    });
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      menuButtonRef.current?.focus();
    };
  }, [isMenuOpen]);

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
  }, []);

  useEffect(() => {
    const handleSettingsUpdate = (event: Event) => setSettings((event as CustomEvent<SiteSettings>).detail);
    window.addEventListener('site-settings-updated', handleSettingsUpdate);
    return () => window.removeEventListener('site-settings-updated', handleSettingsUpdate);
  }, []);

  // Update Favicon dynamically
  useEffect(() => {
    if (settings && settings.faviconUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
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
    const isItemActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(`${item.path}/`));
    
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
             {hasChildren ? <div className={`${mobileBaseClass} justify-between text-slate-900 dark:text-white`}>
               <span className="flex items-center space-x-2">
                  <span>{item.label}</span>
               </span>
               <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Khám phá</span>
             </div> : <Link
              to={item.path}
              onClick={() => setIsMenuOpen(false)}
              aria-current={isItemActive ? 'page' : undefined}
              className={`${mobileBaseClass} justify-between ${isItemActive ? mobileActiveClass : mobileHoverClass}`}
            ><span>{item.label}</span></Link>}
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
    <SiteSettingsContext.Provider value={settings}>
    <SiteSeo settings={settings} />
    <div className="min-h-screen relative flex flex-col font-sans text-slate-800 dark:text-gray-100 overflow-x-hidden transition-colors duration-500 bg-sky-50 dark:bg-slate-950">
      
      {/* Background Logic - Hidden on Admin pages to avoid layout clutter */}
      {!isAdminPage && (theme === 'dark' ? <StarBackground /> : <SkyBackground />)}
      
      {/* Header */}
      <header className={`fixed top-0 z-50 w-full border-b transition-colors duration-200 ${isCompact ? 'border-slate-200 bg-white shadow-md dark:border-white/10 dark:bg-slate-950' : 'border-slate-200/80 bg-white/95 shadow-sm dark:border-white/10 dark:bg-slate-900/95'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between transition-[height] duration-300 ${isCompact ? 'h-16 md:h-[68px]' : 'h-20'}`}>
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group relative">
              <div className="absolute inset-0 bg-sky-400/20 dark:bg-cyan-400/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              {settings.logoUrl ? (
                <div className="relative z-10 transition-transform duration-300 group-hover:scale-105">
                  <img src={settings.logoUrl} alt={`Logo ${settings.siteNamePrefix}${settings.siteNameSuffix}`} className="h-10 w-auto object-contain" />
                </div>
              ) : (
                <div className="relative z-10 bg-gradient-to-br from-sky-500 to-blue-600 dark:from-cyan-400 dark:to-blue-600 p-2 rounded-xl shadow-lg group-hover:shadow-cyan-400/50 transition-all duration-300">
                  <Globe className="text-white" size={24} />
                </div>
              )}
              <span className={`relative z-10 font-display font-bold tracking-wider text-slate-800 transition-all dark:text-white ${isCompact ? 'text-xl' : 'text-2xl'}`}>
                {settings.siteNamePrefix}<span className="text-sky-600 dark:text-cyan-400">{settings.siteNameSuffix}</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="flex items-center space-x-6">
                <nav className="hidden items-center space-x-1 md:flex" aria-label="Điều hướng chính">
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
                        item.children ? <button type="button" className={getDesktopLinkClass(item.path, true)} aria-haspopup="true">
                        <span>{item.label}</span>
                        <ChevronDown size={14} className="transition-transform duration-300 group-hover:rotate-180 group-focus-within:rotate-180"/>
                        </button> : <Link to={item.path} aria-current={location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(`${item.path}/`)) ? 'page' : undefined} className={getDesktopLinkClass(item.path)}><span>{item.label}</span></Link>
                    )}

                    {item.children && item.children.length > 0 && (
                        <div className="invisible absolute left-0 z-50 mt-0 w-56 translate-y-3 pt-4 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
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
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600 shadow-sm transition hover:bg-sky-100 hover:text-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:bg-white/10 dark:text-yellow-300 dark:hover:bg-white/20"
                  aria-label={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Mobile Menu Button */}
                <button
                ref={menuButtonRef}
                type="button"
                onClick={() => setIsMenuOpen(true)}
                className="flex h-11 w-11 items-center justify-center rounded-full text-slate-600 transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:text-gray-300 md:hidden"
                aria-label="Mở menu điều hướng"
                aria-expanded={isMenuOpen}
                aria-controls="mobile-navigation"
                >
                <Menu size={25} />
                </button>
            </div>
          </div>
        </div>

      </header>

      {isMenuOpen && <div className="fixed inset-0 z-[55] md:hidden">
        <button type="button" className="absolute inset-0 bg-slate-950/55" onClick={() => setIsMenuOpen(false)} aria-label="Đóng menu" />
        <aside id="mobile-navigation" className="absolute bottom-0 right-0 top-0 w-[min(88vw,24rem)] overflow-y-auto border-l border-slate-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-slate-950" aria-label="Điều hướng trên thiết bị di động">
          <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-5 dark:border-white/10">
            <span className="font-display text-lg font-bold tracking-wider text-slate-900 dark:text-white">{settings.siteNamePrefix}<span className="text-sky-600 dark:text-cyan-300">{settings.siteNameSuffix}</span></span>
            <button ref={closeButtonRef} type="button" onClick={() => setIsMenuOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:bg-white/10 dark:text-white" aria-label="Đóng menu"><X size={22} /></button>
          </div>
          <nav className="space-y-1" aria-label="Điều hướng chính trên thiết bị di động">{settings.navigation.map(item => renderMobileNavItem(item))}</nav>
          <div className="mt-8 border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400"><p className="font-bold text-slate-900 dark:text-white">Trạm dữ liệu GISVN</p><p className="mt-2 leading-6">GIS, viễn thám và khoa học hành tinh trong một không gian khám phá.</p></div>
        </aside>
      </div>}

      {/* Main Content */}
      <main className="flex-grow z-10 pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-12 overflow-hidden border-t border-slate-200 bg-white/85 py-14 dark:border-white/10 dark:bg-slate-950/90">
        {/* Footer Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-sky-400 dark:via-cyan-400 to-transparent opacity-50"></div>
        
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 text-sm sm:px-6 md:grid-cols-[1.3fr_0.7fr_0.8fr] lg:px-8">
          <div>
             <span className="font-display font-bold text-xl tracking-wider text-slate-800 dark:text-white block mb-4">
                {settings.siteNamePrefix}<span className="text-sky-600 dark:text-cyan-400">{settings.siteNameSuffix}</span>
              </span>
            <p className="text-slate-500 dark:text-gray-400 leading-relaxed">
              {settings.footerDescription}
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/5 dark:text-emerald-300"><RadioTower size={13} /><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Trạm dữ liệu hoạt động</div>
          </div>
          <div>
            <h3 className="text-slate-800 dark:text-white font-bold mb-4 uppercase tracking-wider flex items-center">
              <span className="w-1 h-4 bg-sky-500 dark:bg-cyan-400 mr-2 rounded-full shadow-[0_0_10px_#06b6d4]"></span>
              Liên kết nhanh
            </h3>
            <ul className="space-y-2 text-slate-500 dark:text-gray-400">
              {settings.navigation.filter(item => !item.isExternal && !item.children).slice(0, 4).map(item => (
                 !item.isExternal && !item.children && (
                   <li key={item.id}>
                      <Link to={item.path} className="group inline-flex items-center gap-1 hover:text-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:hover:text-cyan-400">
                        {item.label}<ArrowUpRight size={12} className="opacity-0 transition group-hover:opacity-100" />
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
            <div className="flex space-x-3">
              <a href={settings.socialLinks.facebook} aria-label="Facebook" className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-600 transition hover:border-sky-500 hover:bg-sky-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">FB</a>
              <a href={settings.socialLinks.twitter} aria-label="X" className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-600 transition hover:border-sky-500 hover:bg-sky-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">X</a>
              <a href={settings.socialLinks.linkedin} aria-label="LinkedIn" className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-600 transition hover:border-sky-500 hover:bg-sky-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">IN</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-slate-200 dark:border-white/5 text-center text-slate-400 dark:text-gray-500 text-xs">
          {settings.footerCopyright}
        </div>
      </footer>
    </div>
    </SiteSettingsContext.Provider>
  );
};

export default Layout;
