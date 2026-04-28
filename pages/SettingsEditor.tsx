
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Layout, Type, Link as LinkIcon, Globe, Plus, Trash2, ArrowUp, ArrowDown, CornerDownRight, ExternalLink, GripVertical, Upload, Image as ImageIcon, FileText, AlignLeft } from 'lucide-react';
import { getSettings, saveSettings, isAuthenticated, uploadImage } from '../utils/storage';
import { SiteSettings, NavItem } from '../types';
import { DEFAULT_ABOUT_CONTENT, DEFAULT_CONTACT_CONTENT } from '../constants';

const SettingsEditor: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'menu' | 'pages'>('general');
  
  // State for Navigation Builder
  const [editingItem, setEditingItem] = useState<{parentId: string | null, item: NavItem} | null>(null);
  
  // Drag and Drop State
  const [draggedItem, setDraggedItem] = useState<{ type: 'parent' | 'child', index: number, parentIndex?: number } | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/admin');
      return;
    }
    const load = async () => {
      const s = await getSettings();
      // Pre-fill with defaults if empty so user has something to edit
      if (!s.aboutContent) s.aboutContent = DEFAULT_ABOUT_CONTENT;
      if (!s.contactContent) s.contactContent = DEFAULT_CONTACT_CONTENT;
      setSettings(s);
    };
    load();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [e.target.name]: e.target.value
    });
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!settings) return;
    setSettings({
      ...settings,
      socialLinks: {
        ...settings.socialLinks,
        [e.target.name]: e.target.value
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    if (!e.target.files || !e.target.files[0] || !settings) return;
    
    const file = e.target.files[0];
    const isLogo = type === 'logo';
    
    try {
      if (isLogo) setUploadingLogo(true);
      else setUploadingFavicon(true);
      
      const url = await uploadImage(file);
      
      setSettings({
        ...settings,
        [isLogo ? 'logoUrl' : 'faviconUrl']: url
      });
    } catch (error) {
      alert(`Lỗi upload ${type}: ` + error);
    } finally {
      if (isLogo) setUploadingLogo(false);
      else setUploadingFavicon(false);
    }
  };

  // --- Navigation Builder Logic ---
  const createNewItem = (): NavItem => ({
    id: `nav-${Date.now()}`,
    label: 'New Link',
    path: '/',
    isExternal: false
  });

  const addTopLevelItem = () => {
    if (!settings) return;
    const newItem = createNewItem();
    setSettings({
      ...settings,
      navigation: [...settings.navigation, newItem]
    });
    setEditingItem({ parentId: null, item: newItem });
  };

  const addChildItem = (parentId: string) => {
    if (!settings) return;
    const newItem = createNewItem();
    const newNav = settings.navigation.map(item => {
      if (item.id === parentId) {
        return {
          ...item,
          children: [...(item.children || []), newItem]
        };
      }
      return item;
    });
    setSettings({ ...settings, navigation: newNav });
    setEditingItem({ parentId, item: newItem });
  };

  const deleteItem = (itemId: string) => {
    if (!settings) return;
    if (window.confirm('Xóa mục này?')) {
      let newNav = settings.navigation.filter(item => item.id !== itemId);
      if (newNav.length === settings.navigation.length) {
         newNav = settings.navigation.map(parent => ({
           ...parent,
           children: parent.children ? parent.children.filter(child => child.id !== itemId) : []
         }));
      }
      setSettings({ ...settings, navigation: newNav });
      if (editingItem?.item.id === itemId) setEditingItem(null);
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down', parentId: string | null) => {
    if (!settings) return;
    if (parentId === null) {
      const newNav = [...settings.navigation];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex >= 0 && targetIndex < newNav.length) {
        [newNav[index], newNav[targetIndex]] = [newNav[targetIndex], newNav[index]];
        setSettings({ ...settings, navigation: newNav });
      }
    } else {
      const newNav = settings.navigation.map(parent => {
        if (parent.id === parentId && parent.children) {
          const newChildren = [...parent.children];
          const targetIndex = direction === 'up' ? index - 1 : index + 1;
           if (targetIndex >= 0 && targetIndex < newChildren.length) {
            [newChildren[index], newChildren[targetIndex]] = [newChildren[targetIndex], newChildren[index]];
          }
          return { ...parent, children: newChildren };
        }
        return parent;
      });
      setSettings({ ...settings, navigation: newNav });
    }
  };

  const updateItemField = (field: keyof NavItem, value: any) => {
    if (!settings || !editingItem) return;
    const updatedItem = { ...editingItem.item, [field]: value };
    setEditingItem({ ...editingItem, item: updatedItem });
    if (editingItem.parentId === null) {
      const newNav = settings.navigation.map(i => i.id === editingItem.item.id ? updatedItem : i);
      setSettings({ ...settings, navigation: newNav });
    } else {
      const newNav = settings.navigation.map(parent => {
        if (parent.id === editingItem.parentId) {
          return {
            ...parent,
            children: parent.children?.map(child => child.id === editingItem.item.id ? updatedItem : child)
          };
        }
        return parent;
      });
      setSettings({ ...settings, navigation: newNav });
    }
  };

  const handleDragStart = (e: React.DragEvent, type: 'parent' | 'child', index: number, parentIndex?: number) => {
    e.stopPropagation();
    setDraggedItem({ type, index, parentIndex });
    e.dataTransfer.effectAllowed = 'move';
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation();
    setDraggedItem(null);
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetType: 'parent' | 'child', targetIndex: number, targetParentIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedItem || !settings) return;
    if (draggedItem.type === 'parent' && targetType === 'parent') {
       if (draggedItem.index === targetIndex) return;
       const newNav = [...settings.navigation];
       const [movedItem] = newNav.splice(draggedItem.index, 1);
       newNav.splice(targetIndex, 0, movedItem);
       setSettings({ ...settings, navigation: newNav });
    } 
    else if (draggedItem.type === 'child' && targetType === 'child') {
       const newNav = [...settings.navigation];
       const sourceParent = newNav[draggedItem.parentIndex!];
       if (!sourceParent.children) return;
       const [movedItem] = sourceParent.children.splice(draggedItem.index, 1);
       const destParent = newNav[targetParentIndex!];
       if (!destParent.children) destParent.children = [];
       destParent.children.splice(targetIndex, 0, movedItem);
       setSettings({ ...settings, navigation: newNav });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settings) {
      setLoading(true);
      await saveSettings(settings);
      setLoading(false);
      alert('Đã lưu cài đặt thành công!');
    }
  };

  if (!settings) return null;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button onClick={() => navigate('/admin/dashboard')} className="text-gray-400 hover:text-sky-600 dark:hover:text-white mr-4 transition-colors">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Cài Đặt Website</h1>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex border-b border-slate-200 dark:border-white/10 mb-8 space-x-6">
          <button 
            onClick={() => setActiveTab('general')}
            className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'general' ? 'border-sky-500 dark:border-cyan-400 text-sky-600 dark:text-cyan-400' : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-sky-600 dark:hover:text-white'}`}
          >
            Chung & Footer
          </button>
          <button 
            onClick={() => setActiveTab('menu')}
            className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'menu' ? 'border-sky-500 dark:border-cyan-400 text-sky-600 dark:text-cyan-400' : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-sky-600 dark:hover:text-white'}`}
          >
            Menu Điều Hướng
          </button>
          <button 
            onClick={() => setActiveTab('pages')}
            className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'pages' ? 'border-sky-500 dark:border-cyan-400 text-sky-600 dark:text-cyan-400' : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-sky-600 dark:hover:text-white'}`}
          >
            Nội dung Trang
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-white/10 shadow-lg">
                <h3 className="text-xl font-bold text-sky-600 dark:text-cyan-400 mb-6 flex items-center">
                  <Globe className="mr-2" size={20} /> Thương Hiệu & Logo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                  <div>
                    <label className="block text-sm text-slate-600 dark:text-gray-400 mb-2">Logo Website</label>
                    <div className="flex items-start space-x-4">
                      <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/20 rounded-lg flex items-center justify-center overflow-hidden relative">
                        {settings.logoUrl ? <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" /> : <ImageIcon className="text-gray-400 dark:text-gray-600" size={32} />}
                        {uploadingLogo && <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-xs text-white">...</div>}
                      </div>
                      <div className="flex-1">
                        <label className="cursor-pointer bg-sky-50 dark:bg-cyan-400/10 text-sky-600 dark:text-cyan-400 hover:bg-sky-100 dark:hover:bg-cyan-400 hover:text-sky-700 dark:hover:text-slate-950 border border-sky-200 dark:border-cyan-400/30 px-4 py-2 rounded text-sm font-bold inline-flex items-center transition-all mb-2">
                          <Upload size={14} className="mr-2" /> Chọn Logo
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
                        </label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 dark:text-gray-400 mb-2">Favicon</label>
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/20 rounded-lg flex items-center justify-center overflow-hidden relative">
                        {settings.faviconUrl ? <img src={settings.faviconUrl} alt="Favicon" className="w-8 h-8 object-contain" /> : <Globe className="text-gray-400 dark:text-gray-600" size={20} />}
                        {uploadingFavicon && <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-[10px] text-white">...</div>}
                      </div>
                      <div className="flex-1">
                        <label className="cursor-pointer bg-sky-50 dark:bg-cyan-400/10 text-sky-600 dark:text-cyan-400 hover:bg-sky-100 dark:hover:bg-cyan-400 hover:text-sky-700 dark:hover:text-slate-950 border border-sky-200 dark:border-cyan-400/30 px-4 py-2 rounded text-sm font-bold inline-flex items-center transition-all mb-2">
                          <Upload size={14} className="mr-2" /> Chọn Icon
                          <input type="file" className="hidden" accept="image/png, image/x-icon" onChange={(e) => handleFileUpload(e, 'favicon')} />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* NEW: Page Title Input */}
                <div className="mb-6">
                    <label className="block text-sm text-slate-600 dark:text-gray-400 mb-2">Tiêu đề trang (Browser Tab Title)</label>
                    <input type="text" name="pageTitle" value={settings.pageTitle || ''} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/20 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:border-sky-500 dark:focus:border-cyan-400 outline-none" placeholder="VD: CosmoGIS - Bản Đồ Vũ Trụ" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-slate-600 dark:text-gray-400 mb-2">Tên Web (Tiền tố)</label>
                    <input type="text" name="siteNamePrefix" value={settings.siteNamePrefix} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/20 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:border-sky-500 dark:focus:border-cyan-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 dark:text-gray-400 mb-2">Tên Web (Hậu tố - Màu)</label>
                    <input type="text" name="siteNameSuffix" value={settings.siteNameSuffix} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/20 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:border-sky-500 dark:focus:border-cyan-400 outline-none" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-white/10 shadow-lg">
                <h3 className="text-xl font-bold text-sky-600 dark:text-cyan-400 mb-6 flex items-center">
                  <Type className="mr-2" size={20} /> Footer & Mạng Xã Hội
                </h3>
                <div className="mb-6">
                  <label className="block text-sm text-slate-600 dark:text-gray-400 mb-2">Mô tả Footer</label>
                  <textarea name="footerDescription" rows={3} value={settings.footerDescription} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/20 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:border-sky-500 dark:focus:border-cyan-400 outline-none resize-none"></textarea>
                </div>
                <div className="mb-6">
                  <label className="block text-sm text-slate-600 dark:text-gray-400 mb-2">Dòng bản quyền</label>
                  <input type="text" name="footerCopyright" value={settings.footerCopyright} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/20 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:border-sky-500 dark:focus:border-cyan-400 outline-none" />
                </div>
                <h4 className="text-slate-900 dark:text-white font-bold mb-4 flex items-center"><LinkIcon size={16} className="mr-2"/> Links Mạng Xã Hội</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-gray-500 mb-1">Facebook</label>
                    <input type="text" name="facebook" value={settings.socialLinks.facebook} onChange={handleSocialChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/20 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:border-sky-500 dark:focus:border-cyan-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-gray-500 mb-1">X (Twitter)</label>
                    <input type="text" name="twitter" value={settings.socialLinks.twitter} onChange={handleSocialChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/20 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:border-sky-500 dark:focus:border-cyan-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-gray-500 mb-1">LinkedIn</label>
                    <input type="text" name="linkedin" value={settings.socialLinks.linkedin} onChange={handleSocialChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/20 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:border-sky-500 dark:focus:border-cyan-400 outline-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MENU TAB */}
          {activeTab === 'menu' && (
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-white/10 shadow-lg animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold text-sky-600 dark:text-cyan-400 flex items-center"><Layout className="mr-2" size={20} /> Menu Builder</h3>
                 <button type="button" onClick={addTopLevelItem} className="text-sm bg-sky-100 dark:bg-cyan-400/20 text-sky-700 dark:text-cyan-400 px-3 py-1 rounded hover:bg-sky-200 dark:hover:bg-cyan-400 hover:text-sky-800 dark:hover:text-slate-950 transition-colors flex items-center">
                   <Plus size={14} className="mr-1" /> Thêm menu
                 </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {/* List View */}
                 <div className="space-y-3">
                   {settings.navigation.map((item, index) => (
                     <div key={item.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg overflow-hidden" draggable onDragStart={(e) => handleDragStart(e, 'parent', index)} onDragEnd={handleDragEnd} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'parent', index)}>
                       <div className={`p-3 flex items-center justify-between cursor-move ${editingItem?.item.id === item.id ? 'bg-sky-100 dark:bg-white/10' : ''}`}>
                          <div className="flex items-center space-x-2 overflow-hidden">
                            <GripVertical size={16} className="text-slate-400 dark:text-gray-600" />
                            <span className="font-bold text-slate-800 dark:text-white truncate">{item.label}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button type="button" onClick={() => moveItem(index, 'up', null)} className="p-1 hover:text-sky-600 dark:hover:text-white text-slate-400 dark:text-gray-500"><ArrowUp size={14}/></button>
                            <button type="button" onClick={() => moveItem(index, 'down', null)} className="p-1 hover:text-sky-600 dark:hover:text-white text-slate-400 dark:text-gray-500"><ArrowDown size={14}/></button>
                            <button type="button" onClick={() => setEditingItem({parentId: null, item})} className="p-1 hover:text-blue-500 dark:hover:text-blue-400 text-slate-500 dark:text-gray-500 text-xs px-2 border border-slate-300 dark:border-white/10 rounded">Sửa</button>
                            <button type="button" onClick={() => deleteItem(item.id)} className="p-1 hover:text-red-500 text-slate-400 dark:text-gray-500"><Trash2 size={14}/></button>
                          </div>
                       </div>
                       <div className="px-3 pb-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-white/5">
                          <button type="button" onClick={() => addChildItem(item.id)} className="text-xs text-sky-600 dark:text-cyan-400 hover:underline flex items-center"><CornerDownRight size={12} className="mr-1"/> Thêm menu con</button>
                       </div>
                       {item.children && item.children.length > 0 && (
                         <div className="bg-slate-100 dark:bg-black/20 pl-6 pr-2 py-2 space-y-2 border-t border-slate-200 dark:border-white/5">
                            {item.children.map((child, cIndex) => (
                              <div key={child.id} className={`flex items-center justify-between p-2 rounded cursor-move ${editingItem?.item.id === child.id ? 'bg-sky-100 dark:bg-white/10' : 'bg-white dark:bg-white/5 shadow-sm'}`} draggable onDragStart={(e) => handleDragStart(e, 'child', cIndex, index)} onDragEnd={handleDragEnd} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'child', cIndex, index)}>
                                 <div className="flex items-center space-x-2 overflow-hidden">
                                    <GripVertical size={14} className="text-slate-400 dark:text-gray-600" />
                                    <span className="text-sm text-slate-600 dark:text-gray-300 truncate">{child.label}</span>
                                 </div>
                                 <div className="flex items-center space-x-1">
                                    <button type="button" onClick={() => moveItem(cIndex, 'up', item.id)} className="p-1 hover:text-sky-600 dark:hover:text-white text-slate-400 dark:text-gray-500"><ArrowUp size={12}/></button>
                                    <button type="button" onClick={() => moveItem(cIndex, 'down', item.id)} className="p-1 hover:text-sky-600 dark:hover:text-white text-slate-400 dark:text-gray-500"><ArrowDown size={12}/></button>
                                    <button type="button" onClick={() => setEditingItem({parentId: item.id, item: child})} className="p-1 hover:text-blue-500 dark:hover:text-blue-400 text-slate-500 dark:text-gray-500 text-xs">Sửa</button>
                                    <button type="button" onClick={() => deleteItem(child.id)} className="p-1 hover:text-red-500 text-slate-400 dark:text-gray-500"><Trash2 size={12}/></button>
                                 </div>
                              </div>
                            ))}
                         </div>
                       )}
                     </div>
                   ))}
                 </div>
                 {/* Editor */}
                 <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/20 rounded-lg p-6 h-fit sticky top-6 shadow-sm">
                    {editingItem ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4"><h4 className="font-bold text-slate-900 dark:text-white">Sửa: {editingItem.item.label}</h4></div>
                 <div><label className="block text-xs text-slate-500 dark:text-gray-400 mb-1">Tên</label><input type="text" value={editingItem.item.label} onChange={(e) => updateItemField('label', e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/20 rounded px-3 py-2 text-slate-900 dark:text-white text-sm focus:border-sky-500 dark:focus:border-cyan-400 outline-none" /></div>
                        <div><label className="block text-xs text-slate-500 dark:text-gray-400 mb-1">Link</label><input type="text" value={editingItem.item.path} onChange={(e) => updateItemField('path', e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/20 rounded px-3 py-2 text-slate-900 dark:text-white text-sm focus:border-sky-500 dark:focus:border-cyan-400 outline-none" /></div>
                        <div className="flex items-center"><input type="checkbox" checked={editingItem.item.isExternal || false} onChange={(e) => updateItemField('isExternal', e.target.checked)} className="mr-2"/><label className="text-sm text-slate-700 dark:text-gray-300">Tab mới</label></div>
                      </div>
                    ) : (
                      <div className="text-center text-slate-400 dark:text-gray-500 py-10"><Layout size={40} className="mb-2 opacity-20 mx-auto"/><p>Chọn mục bên trái để sửa</p></div>
                    )}
                 </div>
              </div>
            </div>
          )}

          {/* PAGES CONTENT TAB */}
          {activeTab === 'pages' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-white/10 shadow-lg">
                 <h3 className="text-xl font-bold text-sky-600 dark:text-cyan-400 mb-6 flex items-center">
                   <FileText className="mr-2" size={20} /> Nội dung trang Giới Thiệu (About)
                 </h3>
                 <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">Hỗ trợ mã HTML (thẻ p, h3, b, i, ul, li...)</p>
                 <textarea
                   name="aboutContent"
                   value={settings.aboutContent || ''}
                   onChange={handleChange}
                   rows={10}
                   className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/20 rounded-lg px-4 py-3 text-slate-900 dark:text-white font-mono text-sm focus:border-sky-500 dark:focus:border-cyan-400 outline-none"
                   placeholder="Nhập nội dung HTML cho trang About..."
                 ></textarea>
              </div>

              <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-white/10 shadow-lg">
                 <h3 className="text-xl font-bold text-sky-600 dark:text-cyan-400 mb-6 flex items-center">
                   <AlignLeft className="mr-2" size={20} /> Thông tin trang Liên Hệ (Contact)
                 </h3>
                 <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">Nội dung hiển thị bên trái form liên hệ (Địa chỉ, Email, SĐT...). Hỗ trợ HTML.</p>
                 <textarea
                   name="contactContent"
                   value={settings.contactContent || ''}
                   onChange={handleChange}
                   rows={10}
                   className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/20 rounded-lg px-4 py-3 text-slate-900 dark:text-white font-mono text-sm focus:border-sky-500 dark:focus:border-cyan-400 outline-none"
                   placeholder="<p>Địa chỉ...</p>"
                 ></textarea>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={loading} className="flex items-center px-8 py-4 bg-sky-500 dark:bg-cyan-400 text-white dark:text-slate-950 font-bold rounded hover:bg-sky-600 dark:hover:bg-cyan-300 transition-colors disabled:opacity-50">
              <Save size={20} className="mr-2" /> {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsEditor;
