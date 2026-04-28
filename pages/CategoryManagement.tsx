
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit, Save, X, List, Layers } from 'lucide-react';
import { getCategories, saveCategory, deleteCategory, isAuthenticated } from '../utils/storage';
import { Category } from '../types';

const CategoryManagement: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const [formData, setFormData] = useState<Category>({
    id: '',
    name: ''
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/admin');
      return;
    }
    loadCategories();
  }, [navigate]);

  const loadCategories = async () => {
    const data = await getCategories();
    setCategories(data);
  };

  const handleEdit = (cat: Category) => {
    setFormData(cat);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setFormData({
      id: '',
      name: ''
    });
    setIsEditing(true);
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này? Các bài viết thuộc danh mục này có thể bị ảnh hưởng.')) {
      await deleteCategory(id);
      loadCategories();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.name) {
      alert("Vui lòng nhập ID và Tên danh mục");
      return;
    }
    
    // Simple ID validation for creation
    if (isCreating) {
      const slug = formData.id.toLowerCase().replace(/\s+/g, '-');
      if (slug !== formData.id) {
          alert("ID danh mục không được chứa khoảng trắng hoặc ký tự đặc biệt. Gợi ý: " + slug);
          setFormData({...formData, id: slug});
          return;
      }
    }

    setLoading(true);
    await saveCategory(formData);
    await loadCategories();
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
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white flex items-center">
              <Layers className="mr-3 text-sky-600 dark:text-cyan-400" /> Quản Lý Danh Mục
            </h1>
          </div>
          
          {!isEditing && (
            <button 
              onClick={handleCreate}
              className="flex items-center px-4 py-2 bg-sky-500 dark:bg-cyan-400 text-white dark:text-slate-950 rounded font-bold hover:bg-sky-600 dark:hover:bg-cyan-300 transition-colors shadow-lg shadow-sky-500/30 dark:shadow-[0_0_10px_rgba(34,211,238,0.3)]"
            >
              <Plus size={18} className="mr-2" /> Thêm danh mục
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List */}
          <div className="lg:col-span-2 space-y-4">
            {categories.length === 0 ? (
                 <div className="text-center text-slate-500 dark:text-gray-500 py-10 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
                     <List size={40} className="mx-auto mb-2 opacity-30" />
                     <p>Chưa có danh mục nào.</p>
                 </div>
            ) : (
                categories.map((cat) => (
                <div key={cat.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl p-5 flex items-center justify-between hover:border-sky-300 dark:hover:border-cyan-400/30 transition-all group shadow-sm dark:shadow-none">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-gray-400">
                            <Layers size={20} />
                        </div>
                        <div>
                            <h3 className="text-slate-800 dark:text-white font-bold text-lg">{cat.name}</h3>
                            <p className="text-sky-600 dark:text-cyan-400 text-xs font-mono bg-sky-50 dark:bg-cyan-400/10 px-2 py-0.5 rounded inline-block">ID: {cat.id}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={() => handleEdit(cat)}
                        className="p-2 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-400/10 rounded transition-colors"
                        title="Sửa"
                    >
                        <Edit size={18} />
                    </button>
                    <button 
                        onClick={() => handleDelete(cat.id)}
                        className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 rounded transition-colors"
                        title="Xóa"
                    >
                        <Trash2 size={18} />
                    </button>
                    </div>
                </div>
                ))
            )}
          </div>

          {/* Edit/Create Form */}
          <div className="lg:col-span-1">
             {isEditing ? (
               <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/20 rounded-xl p-6 sticky top-24 shadow-2xl">
                 <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
                   {isCreating ? 'Tạo danh mục mới' : 'Cập nhật danh mục'}
                 </h3>
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-gray-400 mb-1">Tên danh mục</label>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/20 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:border-sky-500 dark:focus:border-cyan-400 outline-none"
                        placeholder="VD: Viễn thám"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-gray-400 mb-1">ID (Mã định danh)</label>
                      <input 
                        type="text" 
                        value={formData.id}
                        onChange={(e) => setFormData({...formData, id: e.target.value})}
                        className={`w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/20 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:border-sky-500 dark:focus:border-cyan-400 outline-none font-mono text-sm ${!isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        placeholder="VD: vien-tham"
                        readOnly={!isCreating}
                        required
                      />
                      {isCreating && <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-1">ID nên viết liền không dấu, dùng dấu gạch ngang.</p>}
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
                 <Layers size={48} className="mb-4 opacity-20" />
                 <p>Chọn một danh mục để sửa hoặc tạo mới.</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;
