
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, ArrowLeft, Bold, Italic, Underline, 
  Image as ImageIcon, Link as LinkIcon, List, 
  Type, Code, Quote, Heading, Monitor, Clock, Upload,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Palette, Highlighter, Scaling, Minus, Plus
} from 'lucide-react';
import { getPostById, savePost, isAuthenticated, calculateReadTime, uploadImage, getCategories } from '../utils/storage';
import { BlogPost, Category } from '../types';

const PostEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentImageInputRef = useRef<HTMLInputElement>(null);

  // State
  const [loading, setLoading] = useState(!!id);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState<BlogPost>({
    id: '',
    title: '',
    excerpt: '',
    content: '',
    author: 'Admin',
    date: new Date().toISOString().split('T')[0],
    category: '',
    tags: [],
    imageUrl: 'https://picsum.photos/800/400',
    readTime: '0 phút'
  });
  
  const [tagInput, setTagInput] = useState('');
  const [editorMode, setEditorMode] = useState<'visual' | 'code'>('visual');

  // --- Initialization & Effects ---

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/admin');
      return;
    }

    getCategories().then(cats => {
        setCategories(cats);
        if (!id && cats.length > 0) {
            setFormData(prev => ({...prev, category: cats[0].id}));
        }
    });

    const loadPost = async () => {
      if (id) {
        setLoading(true);
        const existing = await getPostById(id);
        if (existing) {
          setFormData(existing);
          setTagInput(existing.tags.join(', '));
        }
        setLoading(false);
      } else {
        setFormData(prev => ({ ...prev, id: Date.now().toString() }));
        setLoading(false);
      }
    };
    loadPost();
  }, [id, navigate]);

  useEffect(() => {
    if (editorMode === 'visual' && editorRef.current) {
      editorRef.current.innerHTML = formData.content;
    }
  }, [editorMode]);

  useEffect(() => {
    if (!loading && editorMode === 'visual' && editorRef.current) {
      if (editorRef.current.innerHTML !== formData.content) {
        editorRef.current.innerHTML = formData.content;
      }
    }
  }, [loading, editorMode]);

  useEffect(() => {
    const time = calculateReadTime(formData.content);
    setFormData(prev => ({ ...prev, readTime: time }));
  }, [formData.content]);

  // --- Basic Handlers ---

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
    const tags = e.target.value.split(',').map(t => t.trim()).filter(t => t !== '');
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    setIsUploading(true);
    try {
      const url = await uploadImage(e.target.files[0]);
      setFormData(prev => ({ ...prev, imageUrl: url }));
    } catch (error) {
      alert("Lỗi upload ảnh: " + error);
    } finally {
      setIsUploading(false);
    }
  };

  // --- Content Manipulation Helpers ---

  const updateContent = () => {
    if (editorRef.current) {
      setFormData(prev => ({ ...prev, content: editorRef.current?.innerHTML || '' }));
    }
  };

  const execCmd = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    updateContent();
  };

  const insertHtmlTag = (openTag: string, closeTag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    const newContent = `${before}${openTag}${selection}${closeTag}${after}`;
    setFormData({ ...formData, content: newContent });
    
    // Restore cursor/selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + openTag.length, end + openTag.length);
    }, 0);
  };

  // --- Toolbar Handlers ---

  const handleFormat = (type: string) => {
    if (editorMode === 'visual') {
      switch (type) {
        case 'bold': execCmd('bold'); break;
        case 'italic': execCmd('italic'); break;
        case 'underline': execCmd('underline'); break;
        case 'h2': execCmd('formatBlock', 'H2'); break;
        case 'h3': execCmd('formatBlock', 'H3'); break;
        case 'p': execCmd('formatBlock', 'P'); break;
        case 'quote': execCmd('formatBlock', 'BLOCKQUOTE'); break;
        case 'list': execCmd('insertUnorderedList'); break;
        case 'orderedList': execCmd('insertOrderedList'); break;
      }
    } else {
      // HTML Mode mappings
      switch (type) {
        case 'bold': insertHtmlTag('<b>', '</b>'); break;
        case 'italic': insertHtmlTag('<i>', '</i>'); break;
        case 'underline': insertHtmlTag('<u>', '</u>'); break;
        case 'h2': insertHtmlTag('<h2 class="text-2xl font-bold text-slate-800 dark:text-white mb-3">', '</h2>'); break;
        case 'h3': insertHtmlTag('<h3 class="text-xl font-bold text-sky-600 dark:text-cyan-400 mb-2">', '</h3>'); break;
        case 'p': insertHtmlTag('<p class="mb-4 text-slate-600 dark:text-gray-300">', '</p>'); break;
        case 'quote': insertHtmlTag('<blockquote class="border-l-4 border-sky-500 dark:border-cyan-400 pl-4 italic text-slate-500 dark:text-gray-400 my-4 bg-slate-100 dark:bg-white/5 p-4 rounded-r">', '</blockquote>'); break;
        case 'list': insertHtmlTag('<ul class="list-disc list-inside mb-4 space-y-2 text-slate-600 dark:text-gray-300"><li>', '</li></ul>'); break;
        case 'orderedList': insertHtmlTag('<ol class="list-decimal list-inside mb-4 space-y-2 text-slate-600 dark:text-gray-300"><li>', '</li></ol>'); break;
      }
    }
  };

  // 1. Alignment Handler
  const handleAlign = (align: 'left' | 'center' | 'right' | 'justify') => {
    if (editorMode === 'visual') {
      const cmd = align === 'justify' ? 'justifyFull' : `justify${align.charAt(0).toUpperCase() + align.slice(1)}`;
      execCmd(cmd);
    } else {
      const cls = align === 'justify' ? 'text-justify' : `text-${align}`;
      insertHtmlTag(`<div class="${cls}">`, '</div>');
    }
  };

  // 2. Color & Highlight Handler
  const handleColor = (e: React.ChangeEvent<HTMLInputElement>, type: 'fore' | 'back') => {
    const color = e.target.value;
    if (editorMode === 'visual') {
      execCmd(type === 'fore' ? 'foreColor' : 'hiliteColor', color);
    } else {
      const prop = type === 'fore' ? 'color' : 'background-color';
      insertHtmlTag(`<span style="${prop}: ${color}">`, '</span>');
    }
  };

  // 3. Font Size Handler
  const handleFontSize = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const size = e.target.value; // 1-7 for execCommand
    if (editorMode === 'visual') {
      execCmd('fontSize', size);
    } else {
      // Map basic sizes to Tailwind classes or inline styles
      const sizeMap: Record<string, string> = {
        '1': 'text-xs', '2': 'text-sm', '3': 'text-base', 
        '4': 'text-lg', '5': 'text-xl', '6': 'text-2xl', '7': 'text-4xl'
      };
      insertHtmlTag(`<span class="${sizeMap[size] || 'text-base'}">`, '</span>');
    }
  };

  // 4. Image Insertion & Resize
  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    setIsUploading(true);
    try {
      const url = await uploadImage(e.target.files[0]);
      insertImageToEditor(url);
    } catch (error) {
      alert("Lỗi upload ảnh: " + error);
    } finally {
      setIsUploading(false);
      if (contentImageInputRef.current) contentImageInputRef.current.value = '';
    }
  };

  const handleImage = () => {
    if (window.confirm("Nhấn OK để upload ảnh từ máy tính.\nNhấn Cancel để nhập URL ảnh.")) {
      if (contentImageInputRef.current) contentImageInputRef.current.click();
    } else {
      const url = prompt("Nhập đường dẫn hình ảnh (URL):");
      if (url) insertImageToEditor(url);
    }
  };

  const insertImageToEditor = (url: string) => {
    if (editorMode === 'visual') {
      execCmd('insertImage', url);
    } else {
      const alt = prompt("Nhập mô tả ảnh (Alt text):") || "Image";
      insertHtmlTag(`<img src="${url}" alt="${alt}" class="w-full rounded-lg my-6 shadow-lg border border-slate-200 dark:border-white/10" />`, '');
    }
  };

  const handleResizeImage = () => {
    if (editorMode !== 'visual') {
        alert("Vui lòng chuyển sang chế độ Trực quan để resize ảnh dễ dàng hơn (hoặc sửa width trong thẻ img ở chế độ Code).");
        return;
    }

    // Logic to find selected image
    const selection = window.getSelection();
    let img: HTMLImageElement | null = null;

    // Check if an image is directly selected
    if (selection && selection.rangeCount > 0) {
        const node = selection.anchorNode;
        // Case 1: The node itself is the image (sometimes happens with range selection)
        if (node instanceof HTMLImageElement) {
            img = node;
        } 
        // Case 2: Check children of the focus node (common in contentEditable)
        else if (node instanceof Element) {
             const child = node.childNodes[selection.anchorOffset];
             if (child instanceof HTMLImageElement) img = child;
             else if (node.querySelector('img')) img = node.querySelector('img'); // Fallback: find first image in block
        }
        // Case 3: Parent element
        else if (node?.parentElement instanceof HTMLImageElement) {
            img = node.parentElement;
        }
    }

    // If still no image found via selection API, try check if user clicked an image recently (active element)
    // In this simple editor, we prompt user to enter width manually if we can't detect perfectly,
    // or we wrap the selection logic better.
    
    // Simplest Robust approach: Ask for width and apply to the "current selection block" if it contains an image
    // Or just prompt.
    
    const width = prompt("Nhập kích thước ảnh (VD: 50%, 300px, 100%):", "100%");
    if (!width) return;

    if (img) {
        img.style.width = width;
        updateContent();
    } else {
        // Fallback: Try to apply to the nearest image in the selection range
        document.execCommand('insertHTML', false, `<img src="${prompt('Không tìm thấy ảnh đang chọn. Nhập URL ảnh mới để chèn với kích thước ' + width)}" style="width: ${width}" />`);
    }
  };

  const handleLink = () => {
    const url = prompt("Nhập đường dẫn (URL):");
    if (!url) return;
    if (editorMode === 'visual') execCmd('createLink', url);
    else insertHtmlTag(`<a href="${url}" class="text-sky-600 dark:text-cyan-400 hover:underline" target="_blank">`, `</a>`);
  };

  const handleVisualInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerHTML;
    setFormData(prev => ({ ...prev, content: newContent }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const postToSave = {
        ...formData,
        category: formData.category || (categories.length > 0 ? categories[0].id : 'gis-basic')
    }
    await savePost(postToSave);
    setLoading(false);
    navigate('/admin/dashboard');
  };

  if (loading && id) {
     return <div className="text-slate-600 dark:text-white text-center py-20 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 dark:border-cyan-400 mb-4"></div>
        <p>Đang tải dữ liệu bài viết...</p>
     </div>
  }

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
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
            {id ? 'Chỉnh Sửa Bài Viết' : 'Tạo Bài Viết Mới'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-xl border border-slate-200 dark:border-white/10 space-y-6 shadow-lg dark:shadow-2xl">
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-500 dark:text-gray-400 mb-2 font-medium">Tiêu đề bài viết</label>
              <input 
                type="text" 
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/20 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:border-sky-500 dark:focus:border-cyan-400 focus:ring-1 focus:ring-sky-500 dark:focus:ring-cyan-400 outline-none text-lg font-bold"
                placeholder="Nhập tiêu đề..."
              />
            </div>
            
            <div>
              <label className="block text-sm text-slate-500 dark:text-gray-400 mb-2">Danh mục</label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/20 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:border-sky-500 dark:focus:border-cyan-400 outline-none"
              >
                {categories.length === 0 && <option value="">Đang tải danh mục...</option>}
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-500 dark:text-gray-400 mb-2">Thời gian đọc (Tự động)</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                  type="text" 
                  name="readTime"
                  value={formData.readTime}
                  readOnly
                  className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-lg pl-10 pr-4 py-3 text-slate-500 dark:text-gray-400 focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-500 dark:text-gray-400 mb-2">Ảnh đại diện (Thumbnail)</label>
            <div className="flex gap-4">
               <div className="flex-1 flex gap-2">
                 <input 
                  type="text" 
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/20 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:border-sky-500 dark:focus:border-cyan-400 outline-none"
                  placeholder="Nhập URL hoặc upload..."
                />
                <label className={`cursor-pointer bg-sky-100 dark:bg-cyan-400/10 border border-sky-300 dark:border-cyan-400/30 text-sky-700 dark:text-cyan-400 rounded-lg px-4 flex items-center hover:bg-sky-200 dark:hover:bg-cyan-400 hover:text-sky-800 dark:hover:text-slate-950 transition-colors font-bold ${isUploading ? 'opacity-50 cursor-wait' : ''}`}>
                  <Upload size={18} className="mr-2" />
                  {isUploading ? '...' : 'Upload'}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                </label>
               </div>
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded border border-slate-300 dark:border-white/10 overflow-hidden flex-shrink-0">
                {formData.imageUrl && <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-500 dark:text-gray-400 mb-2">Tags (cách nhau bởi dấu phẩy)</label>
            <input 
              type="text" 
              value={tagInput}
              onChange={handleTagChange}
              placeholder="GIS, Space, Mars..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/20 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:border-sky-500 dark:focus:border-cyan-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-500 dark:text-gray-400 mb-2">Tóm tắt ngắn (Excerpt)</label>
            <textarea 
              name="excerpt"
              rows={3}
              value={formData.excerpt}
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/20 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:border-sky-500 dark:focus:border-cyan-400 outline-none resize-none"
              placeholder="Mô tả ngắn gọn về bài viết hiển thị ở trang chủ..."
            ></textarea>
          </div>

          {/* EDITOR SECTION */}
          <div className="border border-slate-300 dark:border-white/20 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/50 flex flex-col shadow-inner">
            {/* Toolbar */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-300 dark:border-white/10 p-2 sticky top-0 z-10">
               <div className="flex flex-wrap items-center gap-1 mb-1">
                 {/* Text Style */}
                 <div className="flex bg-slate-100 dark:bg-white/5 rounded p-0.5">
                    <button type="button" onClick={() => handleFormat('bold')} className="p-1.5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded" title="In đậm"><Bold size={16} /></button>
                    <button type="button" onClick={() => handleFormat('italic')} className="p-1.5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded" title="In nghiêng"><Italic size={16} /></button>
                    <button type="button" onClick={() => handleFormat('underline')} className="p-1.5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded" title="Gạch chân"><Underline size={16} /></button>
                 </div>

                 {/* Headings */}
                 <div className="flex bg-slate-100 dark:bg-white/5 rounded p-0.5">
                    <button type="button" onClick={() => handleFormat('p')} className="p-1.5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded font-bold text-xs w-8" title="Normal Text">P</button>
                    <button type="button" onClick={() => handleFormat('h2')} className="p-1.5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded font-bold text-xs w-8" title="Heading 2">H2</button>
                    <button type="button" onClick={() => handleFormat('h3')} className="p-1.5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded font-bold text-xs w-8" title="Heading 3">H3</button>
                 </div>

                 {/* Alignment */}
                 <div className="flex bg-slate-100 dark:bg-white/5 rounded p-0.5">
                    <button type="button" onClick={() => handleAlign('left')} className="p-1.5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded" title="Căn trái"><AlignLeft size={16} /></button>
                    <button type="button" onClick={() => handleAlign('center')} className="p-1.5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded" title="Căn giữa"><AlignCenter size={16} /></button>
                    <button type="button" onClick={() => handleAlign('right')} className="p-1.5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded" title="Căn phải"><AlignRight size={16} /></button>
                    <button type="button" onClick={() => handleAlign('justify')} className="p-1.5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded" title="Căn đều"><AlignJustify size={16} /></button>
                 </div>

                 {/* Font Size */}
                 <div className="flex items-center bg-slate-100 dark:bg-white/5 rounded px-2">
                    <Type size={14} className="text-slate-500 dark:text-gray-500 mr-1"/>
                    <select onChange={handleFontSize} defaultValue="3" className="bg-transparent text-slate-800 dark:text-gray-300 text-xs py-1 outline-none cursor-pointer w-20">
                        <option value="1">Nhỏ</option>
                        <option value="2">Vừa</option>
                        <option value="3">Chuẩn</option>
                        <option value="4">Lớn</option>
                        <option value="5">Rất lớn</option>
                        <option value="7">Khổng lồ</option>
                    </select>
                 </div>
               </div>

               <div className="flex flex-wrap items-center gap-1">
                 {/* Colors */}
                 <div className="flex items-center bg-slate-100 dark:bg-white/5 rounded p-0.5 px-2 gap-2">
                    <div className="flex items-center relative group" title="Màu chữ">
                        <Palette size={16} className="text-slate-400 dark:text-gray-400 mr-1" />
                        <input type="color" onChange={(e) => handleColor(e, 'fore')} className="w-5 h-5 bg-transparent border-none cursor-pointer p-0" />
                    </div>
                    <div className="w-px h-4 bg-slate-300 dark:bg-white/10"></div>
                    <div className="flex items-center relative group" title="Màu nền (Highlight)">
                        <Highlighter size={16} className="text-slate-400 dark:text-gray-400 mr-1" />
                        <input type="color" onChange={(e) => handleColor(e, 'back')} defaultValue="#ffff00" className="w-5 h-5 bg-transparent border-none cursor-pointer p-0" />
                    </div>
                 </div>

                 {/* Lists & Extra */}
                 <div className="flex bg-slate-100 dark:bg-white/5 rounded p-0.5">
                     <button type="button" onClick={() => handleFormat('list')} className="p-1.5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded" title="Danh sách chấm"><List size={16} /></button>
                     <button type="button" onClick={() => handleFormat('quote')} className="p-1.5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded" title="Trích dẫn"><Quote size={16} /></button>
                     <button type="button" onClick={handleLink} className="p-1.5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded" title="Chèn Link"><LinkIcon size={16} /></button>
                 </div>

                 {/* Images */}
                 <div className="flex bg-slate-100 dark:bg-white/5 rounded p-0.5">
                     <button type="button" onClick={handleImage} className="p-1.5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded" title="Chèn Ảnh (Upload/Link)"><ImageIcon size={16} /></button>
                     <button type="button" onClick={handleResizeImage} className="p-1.5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded" title="Chỉnh kích thước ảnh đang chọn"><Scaling size={16} /></button>
                 </div>

                 {/* Mode Toggle */}
                 <div className="flex bg-slate-100 dark:bg-space-800 rounded-lg p-1 border border-slate-300 dark:border-white/10 ml-auto">
                    <button 
                    type="button"
                    onClick={() => setEditorMode('visual')}
                    className={`px-3 py-1 rounded text-xs font-bold flex items-center transition-colors ${editorMode === 'visual' ? 'bg-sky-500 dark:bg-space-neon text-white dark:text-space-900' : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                    <Monitor size={14} className="mr-1" /> Trực quan
                    </button>
                    <button 
                    type="button"
                    onClick={() => setEditorMode('code')}
                    className={`px-3 py-1 rounded text-xs font-bold flex items-center transition-colors ${editorMode === 'code' ? 'bg-sky-500 dark:bg-space-neon text-white dark:text-space-900' : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                    <Code size={14} className="mr-1" /> Mã HTML
                    </button>
                </div>
               </div>
            </div>

            <div className="relative min-h-[500px] flex-grow bg-white dark:bg-space-900">
              {editorMode === 'visual' ? (
                /* Visual WYSIWYG Editor */
                <div 
                  ref={editorRef}
                  contentEditable
                  onInput={handleVisualInput}
                  className="w-full h-[600px] overflow-y-auto p-8 text-slate-800 dark:text-gray-300 focus:outline-none prose prose-slate dark:prose-invert prose-lg max-w-none"
                  spellCheck={false}
                  suppressContentEditableWarning={true}
                />
              ) : (
                /* Raw HTML Editor */
                <textarea 
                  ref={textareaRef}
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  className="w-full h-[600px] bg-white dark:bg-space-900 p-4 text-slate-800 dark:text-green-400 font-mono text-sm focus:outline-none resize-none"
                  placeholder="Viết nội dung ở đây (hỗ trợ HTML tags)..."
                ></textarea>
              )}
            </div>
            
            <div className="bg-slate-50 dark:bg-space-900 border-t border-slate-200 dark:border-white/10 px-4 py-2 text-xs text-slate-500 dark:text-gray-500 flex justify-between items-center">
               <span>ID: {formData.id}</span>
               <span>{formData.content.length} ký tự (HTML)</span>
            </div>
          </div>
          
          {/* Hidden File Input for Content Image Upload */}
          <input 
            type="file" 
            ref={contentImageInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleContentImageUpload}
          />

          <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-white/10">
            <button 
              type="submit" 
              disabled={loading}
              className="flex items-center px-8 py-4 bg-sky-500 dark:bg-gradient-to-r dark:from-space-neon dark:to-space-accent text-white dark:text-space-900 font-bold rounded hover:shadow-lg hover:shadow-sky-500/30 dark:hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] transition-all disabled:opacity-50 disabled:cursor-wait"
            >
              <Save size={20} className="mr-2" /> {loading ? 'Đang lưu...' : 'Lưu Bài Viết'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostEditor;
