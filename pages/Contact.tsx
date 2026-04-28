
import React, { useState, useEffect } from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { sendMessage, getSettings } from '../utils/storage';
import { DEFAULT_CONTACT_CONTENT } from '../constants';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [contactContent, setContactContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSettings().then(s => {
      if (s.contactContent) {
        setContactContent(s.contactContent);
      } else {
        // Default Content
        setContactContent(DEFAULT_CONTACT_CONTENT);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendMessage(formData);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error: any) {
      console.error(error);
      alert("Gửi tin nhắn thất bại: " + error.message + "\n\n(Lưu ý: Nếu lỗi 404, hãy khởi động lại server)");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white text-center mb-16 drop-shadow-sm">
          Kết Nối Với <span className="text-sky-600 dark:text-cyan-400">CosmoGIS</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Info Side (Dynamic) */}
          <div className="space-y-8">
            <div 
              className="bg-white/90 dark:bg-slate-900/50 p-8 rounded-2xl border border-white/40 dark:border-white/10 backdrop-blur-md shadow-lg
                        prose prose-lg max-w-none 
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
                        
                        /* Keep accent colors */
                        [&_.text-space-neon]:!text-sky-600 dark:[&_.text-space-neon]:!text-cyan-400
                        [&_.text-space-purple]:!text-purple-600 dark:[&_.text-space-purple]:!text-purple-400"
              dangerouslySetInnerHTML={{ __html: contactContent }}
            >
            </div>

            <div className="bg-gradient-to-r from-sky-100 to-purple-100 dark:from-cyan-400/20 dark:to-purple-400/20 p-8 rounded-2xl border border-white/40 dark:border-white/5 backdrop-blur-sm shadow-sm">
              <p className="text-slate-700 dark:text-gray-300 italic font-medium">
                "Bản đồ không phải là lãnh thổ, nhưng là công cụ tốt nhất để chúng ta không bị lạc lối giữa những vì sao."
              </p>
            </div>
          </div>

          {/* Form Side */}
          <div className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-2xl border border-slate-100 dark:border-white/10 shadow-2xl backdrop-blur-xl">
            {isSubmitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                  <Send className="text-green-600 dark:text-green-400" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Đã gửi thành công!</h3>
                <p className="text-slate-600 dark:text-gray-400">Cảm ơn bạn đã liên hệ. Đội ngũ CosmoGIS sẽ phản hồi tín hiệu của bạn sớm nhất có thể.</p>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="mt-8 text-sky-600 dark:text-cyan-400 hover:underline font-bold"
                >
                  Gửi tin nhắn khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Gửi tin nhắn</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-gray-400 mb-2">Tên của bạn</label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/20 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:border-sky-500 dark:focus:border-cyan-400 focus:ring-1 focus:ring-sky-500 dark:focus:ring-cyan-400 outline-none transition-all placeholder-slate-400"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-gray-400 mb-2">Email</label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/20 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:border-sky-500 dark:focus:border-cyan-400 focus:ring-1 focus:ring-sky-500 dark:focus:ring-cyan-400 outline-none transition-all placeholder-slate-400"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-gray-400 mb-2">Chủ đề</label>
                  <input 
                    type="text" 
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/20 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:border-sky-500 dark:focus:border-cyan-400 focus:ring-1 focus:ring-sky-500 dark:focus:ring-cyan-400 outline-none transition-all placeholder-slate-400"
                    placeholder="Hợp tác nghiên cứu / Góp ý..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-gray-400 mb-2">Nội dung</label>
                  <textarea 
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/20 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:border-sky-500 dark:focus:border-cyan-400 focus:ring-1 focus:ring-sky-500 dark:focus:ring-cyan-400 outline-none transition-all resize-none placeholder-slate-400"
                    placeholder="Nhập nội dung tin nhắn..."
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-sky-500 hover:bg-sky-600 dark:bg-gradient-to-r dark:from-cyan-400 dark:to-cyan-300 text-white dark:text-slate-950 font-bold py-4 rounded-lg shadow-lg hover:shadow-xl dark:hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all transform hover:-translate-y-1 disabled:opacity-50"
                >
                  {loading ? 'Đang gửi...' : 'Gửi Tín Hiệu'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
