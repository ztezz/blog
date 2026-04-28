
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe, Satellite, Orbit } from 'lucide-react';
import { getPosts } from '../utils/storage';
import { BlogPost } from '../types';

const Home: React.FC = () => {
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    getPosts().then(posts => {
      setFeaturedPosts(posts.slice(0, 3));
    });
  }, []);

  return (
    <div className="text-slate-800 dark:text-white">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden px-4">
        {/* Glow Effects (Dark Mode Only) */}
        <div className="hidden dark:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-space-neon/20 rounded-full blur-[120px]"></div>
        <div className="hidden dark:block absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-space-purple/20 rounded-full blur-[100px]"></div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-block px-4 py-1 mb-6 border border-sky-500/30 dark:border-space-neon/30 rounded-full bg-white/50 dark:bg-space-neon/5 backdrop-blur-sm shadow-sm">
            <span className="text-sky-700 dark:text-space-neon text-sm tracking-widest uppercase font-semibold">Khám phá vũ trụ qua dữ liệu</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight text-slate-900 dark:text-white">
            GIS & <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-purple-600 dark:from-space-neon dark:to-space-purple">VŨ TRỤ KHÔNG GIAN</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-gray-300 mb-10 font-light">
            Nơi giao thoa giữa Bản đồ học, Viễn thám và Khoa học hành tinh.
            <br className="hidden md:block" /> Định vị vị trí của bạn trong vũ trụ bao la.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/blog" 
              className="px-8 py-4 bg-sky-500 dark:bg-space-neon text-white dark:text-space-900 font-bold rounded hover:bg-sky-600 dark:hover:bg-white transition-all transform hover:scale-105 flex items-center group shadow-lg shadow-sky-500/20 dark:shadow-none"
            >
              Đọc Blog Ngay
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </Link>
            <Link 
              to="/about" 
              className="px-8 py-4 border border-slate-300 dark:border-white/30 hover:bg-white/50 dark:hover:bg-white/5 text-slate-700 dark:text-white rounded font-medium transition-all"
            >
              Tìm Hiểu Thêm
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-xl hover:border-sky-400 dark:hover:border-space-neon/50 transition-all group shadow-lg dark:shadow-none">
              <Globe className="text-sky-500 dark:text-space-neon mb-4 group-hover:animate-float" size={40} />
              <h3 className="text-2xl font-display font-bold mb-3 text-slate-800 dark:text-white">GIS Không Gian</h3>
              <p className="text-slate-600 dark:text-gray-400">Ứng dụng các hệ tọa độ đa hành tinh và phân tích không gian ngoài Trái Đất.</p>
            </div>
            <div className="p-8 bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-xl hover:border-purple-400 dark:hover:border-space-purple/50 transition-all group shadow-lg dark:shadow-none">
              <Satellite className="text-purple-500 dark:text-space-purple mb-4 group-hover:animate-float" size={40} />
              <h3 className="text-2xl font-display font-bold mb-3 text-slate-800 dark:text-white">Viễn Thám</h3>
              <p className="text-slate-600 dark:text-gray-400">Thu thập và xử lý dữ liệu từ vệ tinh Sentinel, Landsat và các tàu thăm dò vũ trụ.</p>
            </div>
            <div className="p-8 bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-xl hover:border-pink-400 dark:hover:border-pink-500/50 transition-all group shadow-lg dark:shadow-none">
              <Orbit className="text-pink-500 mb-4 group-hover:animate-float" size={40} />
              <h3 className="text-2xl font-display font-bold mb-3 text-slate-800 dark:text-white">Hành Tinh Học</h3>
              <p className="text-slate-600 dark:text-gray-400">Nghiên cứu địa chất bề mặt Sao Hỏa, Mặt Trăng và các thiên thể khác qua bản đồ.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-20 bg-sky-50/50 dark:bg-space-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white mb-2">Bài Viết Nổi Bật</h2>
              <div className="h-1 w-20 bg-sky-500 dark:bg-space-neon rounded"></div>
            </div>
            <Link to="/blog" className="hidden md:flex items-center text-sky-600 dark:text-space-neon hover:text-sky-800 dark:hover:text-white transition-colors font-medium">
              Xem tất cả <ArrowRight className="ml-2" size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredPosts.map((post) => (
              <Link to={`/blog/${post.id}`} key={post.id} className="group block h-full">
                <div className="h-full bg-white dark:bg-space-900 border border-slate-200 dark:border-white/10 rounded-lg overflow-hidden hover:shadow-xl dark:hover:shadow-[0_0_20px_rgba(102,252,241,0.15)] hover:border-sky-300 dark:hover:border-space-neon/50 transition-all duration-300 flex flex-col">
                  <div className="relative overflow-hidden h-48">
                    <img 
                      src={post.imageUrl} 
                      alt={post.title} 
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 dark:bg-space-900/80 backdrop-blur px-3 py-1 rounded text-xs font-bold text-sky-700 dark:text-space-neon border border-sky-200 dark:border-space-neon/20 shadow-sm">
                      {post.category}
                    </div>
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex items-center text-xs text-slate-500 dark:text-gray-500 mb-3 space-x-2">
                      <span>{post.date}</span>
                      <span>•</span>
                      <span>{post.readTime} đọc</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-white group-hover:text-sky-600 dark:group-hover:text-space-neon transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-slate-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 flex-grow">
                      {post.excerpt}
                    </p>
                    <div className="text-sky-600 dark:text-space-neon text-sm font-medium flex items-center mt-auto">
                      Đọc tiếp <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-8 text-center md:hidden">
             <Link to="/blog" className="inline-flex items-center text-sky-600 dark:text-space-neon hover:text-sky-800 dark:hover:text-white transition-colors font-medium">
              Xem tất cả <ArrowRight className="ml-2" size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
