
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Mail, Calendar, User } from 'lucide-react';
import { getMessages, deleteMessage, isAuthenticated } from '../utils/storage';
import { ContactMessage } from '../types';

const Mailbox: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/admin');
      return;
    }
    loadMessages();
  }, [navigate]);

  const loadMessages = async () => {
    setLoading(true);
    const data = await getMessages();
    setMessages(data);
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tin nhắn này?')) {
      await deleteMessage(id);
      loadMessages();
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <button 
            onClick={() => navigate('/admin/dashboard')} 
            className="text-gray-400 hover:text-sky-600 dark:hover:text-white mr-4 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white flex items-center">
            <Mail className="mr-3" size={32} /> Hộp Thư Liên Hệ
          </h1>
        </div>

        <div className="bg-white dark:bg-space-800 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-lg dark:shadow-2xl">
          {loading ? (
             <div className="p-8 text-center text-slate-500 dark:text-gray-400">Đang tải tin nhắn...</div>
          ) : messages.length === 0 ? (
             <div className="p-12 text-center text-slate-500 dark:text-gray-500 flex flex-col items-center">
               <Mail size={48} className="mb-4 opacity-20" />
               <p>Chưa có tin nhắn nào từ người dùng.</p>
             </div>
          ) : (
             <div className="divide-y divide-slate-100 dark:divide-white/5">
                {messages.map((msg) => (
                  <div key={msg.id} className="p-6 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    <div className="flex flex-col md:flex-row justify-between mb-2">
                       <div className="flex items-center space-x-3 mb-2 md:mb-0">
                         <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-space-neon/10 text-sky-600 dark:text-space-neon flex items-center justify-center font-bold">
                           {msg.name.charAt(0).toUpperCase()}
                         </div>
                         <div>
                            <h4 className="text-slate-900 dark:text-white font-bold">{msg.name}</h4>
                            <p className="text-xs text-slate-500 dark:text-gray-400">{msg.email}</p>
                         </div>
                       </div>
                       <div className="flex items-center text-xs text-slate-500 dark:text-gray-500 space-x-4">
                          <span className="flex items-center"><Calendar size={12} className="mr-1"/> {new Date(msg.created_at).toLocaleString()}</span>
                          <button 
                            onClick={() => handleDelete(msg.id)}
                            className="p-2 text-red-500 bg-red-500/10 rounded hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                            title="Xóa tin nhắn"
                          >
                             <Trash2 size={16} />
                          </button>
                       </div>
                    </div>
                    <div className="pl-13 md:pl-13 mt-2">
                       <h5 className="text-sky-600 dark:text-space-neon font-medium text-sm mb-2">{msg.subject}</h5>
                       <p className="text-slate-600 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-black/20 p-4 rounded-lg border border-slate-200 dark:border-white/5">
                         {msg.message}
                       </p>
                    </div>
                  </div>
                ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mailbox;
