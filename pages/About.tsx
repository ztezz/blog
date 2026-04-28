
import React, { useEffect, useState } from 'react';
import { Target, Users, Sparkles } from 'lucide-react';
import { getSettings } from '../utils/storage';
import { DEFAULT_ABOUT_CONTENT } from '../constants';

const About: React.FC = () => {
  const [content, setContent] = useState<string>('');
  
  useEffect(() => {
    getSettings().then(s => {
      // Use dynamic content or fallback
      if (s.aboutContent) {
        setContent(s.aboutContent);
      } else {
        // Default content fallback if DB is empty
        setContent(DEFAULT_ABOUT_CONTENT);
      }
    });
  }, []);

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* 
            Dynamic Content Container 
            FIX: Sử dụng [&_tag]:!text-color để ghi đè (override) các class màu cứng (như text-white) 
            có thể đang tồn tại trong database HTML cũ.
        */}
        <div className="bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl mb-12">
            <div 
            className="prose prose-lg max-w-none 
                        text-slate-700 dark:text-gray-100
                        prose-headings:text-slate-900 dark:prose-headings:text-white
                        prose-strong:text-slate-900 dark:prose-strong:text-white
                        
                        /* FORCE OVERRIDES FOR LIGHT MODE */
                        [&_p]:!text-slate-700 dark:[&_p]:!text-gray-100
                        [&_li]:!text-slate-700 dark:[&_li]:!text-gray-100
                        [&_h1]:!text-slate-900 dark:[&_h1]:!text-white
                        [&_h2]:!text-slate-900 dark:[&_h2]:!text-white
                        [&_h3]:!text-slate-800 dark:[&_h3]:!text-white
                        [&_h4]:!text-slate-800 dark:[&_h4]:!text-white
                        [&_strong]:!text-slate-900 dark:[&_strong]:!text-white
                        
                        /* Giữ lại màu cho các class điểm nhấn (nếu có) */
                        [&_.text-space-neon]:!text-sky-600 dark:[&_.text-space-neon]:!text-cyan-400
                        [&_.text-space-purple]:!text-purple-600 dark:[&_.text-space-purple]:!text-purple-400
                        "
            dangerouslySetInnerHTML={{ __html: content }} 
            />
        </div>

        {/* Static Stats (Always visible) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/40 dark:border-white/10 text-center shadow-lg dark:shadow-none hover:transform hover:-translate-y-1 transition-all">
            <Sparkles className="mx-auto text-yellow-500 dark:text-yellow-400 mb-4" size={32} />
            <h3 className="text-4xl font-bold text-slate-800 dark:text-white mb-2">5+</h3>
            <p className="text-slate-600 dark:text-gray-400">Năm nghiên cứu</p>
          </div>
          <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/40 dark:border-white/10 text-center shadow-lg dark:shadow-none hover:transform hover:-translate-y-1 transition-all">
            <Users className="mx-auto text-sky-600 dark:text-cyan-400 mb-4" size={32} />
            <h3 className="text-4xl font-bold text-slate-800 dark:text-white mb-2">10k+</h3>
            <p className="text-slate-600 dark:text-gray-400">Độc giả hàng tháng</p>
          </div>
          <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/40 dark:border-white/10 text-center shadow-lg dark:shadow-none hover:transform hover:-translate-y-1 transition-all">
            <Target className="mx-auto text-purple-600 dark:text-purple-400 mb-4" size={32} />
            <h3 className="text-4xl font-bold text-slate-800 dark:text-white mb-2">50+</h3>
            <p className="text-slate-600 dark:text-gray-400">Dự án phân tích</p>
          </div>
        </div>

        {/* Team Teaser (Static) */}
        <div className="text-center bg-white/90 dark:bg-slate-800/50 backdrop-blur-md p-12 rounded-2xl border border-white/40 dark:border-white/5 shadow-xl">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Tham gia cùng chúng tôi</h2>
          <p className="text-slate-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Bạn đam mê thiên văn học và có kiến thức về lập trình hoặc bản đồ? Hãy trở thành cộng tác viên nội dung.
          </p>
          <a href="/contact" className="inline-block px-8 py-3 bg-sky-500 dark:bg-transparent border border-sky-500 dark:border-cyan-400 text-white dark:text-cyan-400 font-bold rounded hover:bg-sky-600 dark:hover:bg-cyan-400 dark:hover:text-slate-950 transition-all shadow-md">
            Liên hệ ngay
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;
