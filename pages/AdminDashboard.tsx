
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from '../utils/router';
import { Edit, Trash2, Plus, LogOut, Settings, Users, Mail, Layers, Database, Sparkles, X, LoaderCircle, CheckCircle2, AlertCircle, Search, FileText, Cpu, Send, ClipboardCheck, ExternalLink } from 'lucide-react';
import { API_URL, approveDraftPost, getPosts, deletePost, getCurrentUser, getAutomationStatus, getDraftPosts, logout, isAuthenticated, rejectDraftPost, runAutomation } from '../utils/storage';
import { AutomationStatus, BlogPost } from '../types';

const AdminDashboard: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [drafts, setDrafts] = useState<BlogPost[]>([]);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiControl, setShowAiControl] = useState(false);
  const [automationStatus, setAutomationStatus] = useState<AutomationStatus | null>(null);
  const [automationError, setAutomationError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/admin');
      return;
    }
    void Promise.all([loadPosts(), loadDrafts()]);
  }, [navigate]);

  useEffect(() => {
    if (!showAiControl && !isGenerating) return;
    let active = true;
    const refreshStatus = async () => {
      try {
        const status = await getAutomationStatus();
        if (active) {
          setAutomationStatus(status);
          setIsGenerating(status.running);
        }
      } catch (error) {
        if (active) setAutomationError(error instanceof Error ? error.message : 'Không thể tải tiến trình AI');
      }
    };
    void refreshStatus();
    const interval = window.setInterval(refreshStatus, 1000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [showAiControl, isGenerating]);

  const loadPosts = async () => {
    const data = await getPosts();
    setPosts(data);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa bài viết này?')) {
      await deletePost(id);
      loadPosts();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const handleRestoreDb = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn khôi phục Database từ file SQL? Hành động này sẽ ghi đè dữ liệu hiện tại!')) {
      return;
    }

    setIsRestoring(true);
    try {
      const token = getCurrentUser()?.token;
      const response = await fetch(`${API_URL}/restore-db`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await response.json();
      
      if (response.ok) {
        alert(data.message || 'Khôi phục thành công!');
        loadPosts();
      } else {
        alert('Lỗi: ' + (data.error || 'Không thể khôi phục database'));
      }
    } catch (err) {
      console.error('Fetch Error:', err);
      alert('Đã xảy ra lỗi khi kết nối với máy chủ.');
    } finally {
      setIsRestoring(false);
    }
  };

  const loadDrafts = async () => {
    try { setDrafts(await getDraftPosts()); } catch { setDrafts([]); }
  };

  const handleDraftAction = async (id: string, action: 'approve' | 'reject') => {
    setAutomationError('');
    try {
      if (action === 'approve') await approveDraftPost(id);
      else await rejectDraftPost(id);
      await Promise.all([loadPosts(), loadDrafts()]);
    } catch (error) {
      setAutomationError(error instanceof Error ? error.message : 'Không thể cập nhật bản nháp');
    }
  };

  const openAiControl = async () => {
    setShowAiControl(true);
    setAutomationError('');
    try {
      const status = await getAutomationStatus();
      setAutomationStatus(status);
      setIsGenerating(status.running);
    } catch (error) {
      setAutomationError(error instanceof Error ? error.message : 'Không thể tải trạng thái AI');
    }
  };

  const handleGeneratePost = async () => {
    setIsGenerating(true);
    setAutomationError('');
    try {
      const result = await runAutomation();
      setAutomationStatus(await getAutomationStatus());
      if (result.status === 'published') await loadPosts();
      if (result.status === 'draft') await loadDrafts();
    } catch (error) {
      setAutomationError(error instanceof Error ? error.message : 'Không thể tạo bài viết AI');
      try {
        setAutomationStatus(await getAutomationStatus());
      } catch {
        // Keep the original run error visible.
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Bảng Điều Khiển</h1>
          <div className="flex flex-wrap gap-3 items-center justify-center">
            <Link 
              to="/admin/create" 
              className="flex items-center px-4 py-2 bg-sky-500 dark:bg-cyan-400 text-white dark:text-slate-950 rounded font-bold hover:bg-sky-600 dark:hover:bg-cyan-300 transition-colors"
            >
              <Plus size={18} className="mr-2" /> Viết bài mới
            </Link>
            <div className="h-6 w-px bg-slate-300 dark:bg-white/20 hidden md:block"></div>
            
            <Link 
              to="/admin/mailbox" 
              className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-white border border-slate-300 dark:border-white/20 rounded font-bold hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-cyan-400 transition-colors"
            >
              <Mail size={18} className="mr-2" /> Hộp thư
            </Link>
            
            <Link 
              to="/admin/users" 
              className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-white border border-slate-300 dark:border-white/20 rounded font-bold hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-cyan-400 transition-colors"
            >
              <Users size={18} className="mr-2" /> Users
            </Link>

             <Link 
              to="/admin/categories" 
              className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-white border border-slate-300 dark:border-white/20 rounded font-bold hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-cyan-400 transition-colors"
            >
              <Layers size={18} className="mr-2" /> Danh mục
            </Link>

            <Link 
              to="/admin/settings" 
              className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-white border border-slate-300 dark:border-white/20 rounded font-bold hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-cyan-400 transition-colors"
            >
              <Settings size={18} className="mr-2" /> Cài đặt
            </Link>

            <button
              onClick={openAiControl}
              className="flex items-center rounded bg-purple-600 px-4 py-2 font-bold text-white transition-colors hover:bg-purple-700"
              title="Lấy nguồn mới và đăng bài bằng AI"
            >
              {isGenerating ? <LoaderCircle size={18} className="mr-2 animate-spin" /> : <Sparkles size={18} className="mr-2" />} {isGenerating ? 'Xem tiến trình AI' : 'Tạo bài AI'}
            </button>

            <button 
              onClick={handleRestoreDb}
              disabled={isRestoring}
              className={`flex items-center px-4 py-2 ${isRestoring ? 'bg-gray-300 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600'} text-white rounded font-bold transition-colors`}
              title="Khôi phục database từ file .sql"
            >
              <Database size={18} className="mr-2" /> {isRestoring ? 'Đang khôi phục...' : 'Khôi phục DB'}
            </button>

            <button 
              onClick={handleLogout}
              className="flex items-center px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-500/10 transition-colors ml-2"
            >
              <LogOut size={18} className="mr-2" /> Thoát
            </button>
          </div>
        </div>

        {showAiControl && (
          <section className="mb-8 overflow-hidden rounded-2xl border border-purple-200 bg-white shadow-xl dark:border-purple-500/20 dark:bg-slate-800" aria-labelledby="ai-control-title">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-sky-50 p-5 dark:border-white/10 dark:from-purple-950/50 dark:to-slate-900">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-purple-600 p-2.5 text-white shadow-lg shadow-purple-500/20"><Sparkles size={22} /></div>
                <div>
                  <h2 id="ai-control-title" className="text-xl font-bold text-slate-900 dark:text-white">Trung tâm tạo bài AI</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-gray-300">Theo dõi từ lúc tìm nguồn đến khi 9Router lưu bản nháp hoặc đăng bài.</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowAiControl(false)} disabled={isGenerating} className="rounded-lg p-2 text-slate-500 transition hover:bg-black/5 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-white/10 dark:hover:text-white" aria-label="Đóng bảng điều khiển AI"><X size={20} /></button>
            </div>

            <div className="p-5 sm:p-6">
              {!isGenerating && automationStatus?.progress?.stage !== 'completed' && automationStatus?.progress?.stage !== 'failed' && !automationError && (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Sẵn sàng tạo một bài viết mới</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">Hệ thống sẽ tìm nguồn, kiểm tra trùng, tạo bài, chấm chất lượng và áp dụng chế độ kiểm duyệt.</p>
                  </div>
                  <button type="button" onClick={handleGeneratePost} className="inline-flex shrink-0 items-center justify-center rounded-xl bg-purple-600 px-5 py-3 font-bold text-white shadow-lg shadow-purple-600/20 transition hover:bg-purple-700"><Sparkles className="mr-2" size={18} /> Bắt đầu tạo bài</button>
                </div>
              )}

              {(isGenerating || automationStatus?.progress) && (() => {
                const progress = automationStatus?.progress;
                const diagnostics = progress?.diagnostics || automationStatus?.lastResult?.diagnostics;
                const stages = [
                  { key: 'sources', label: 'Tìm nguồn', icon: Search },
                  { key: 'reading', label: 'Đọc và lọc', icon: FileText },
                  { key: 'writing', label: '9Router viết', icon: Cpu },
                  { key: 'publishing', label: 'Đăng bài', icon: Send }
                ];
                const stageOrder = ['config', 'sources', 'filtering', 'reading', 'writing', 'publishing', 'completed'];
                const currentIndex = stageOrder.indexOf(progress?.stage || 'config');
                return (
                  <div className="space-y-6">
                    <div>
                      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                        <span className="font-bold text-purple-700 dark:text-purple-300">{progress?.message || 'Đang khởi động lượt tạo bài...'}</span>
                        <span className="font-mono font-bold text-slate-500 dark:text-gray-400">{progress?.percent || 0}%</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-950">
                        <div className={`h-full rounded-full transition-all duration-500 ${progress?.stage === 'failed' ? 'bg-red-500' : 'bg-gradient-to-r from-purple-600 to-sky-500'}`} style={{ width: `${progress?.percent || 3}%` }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                      {stages.map(({ key, label, icon: Icon }) => {
                        const index = stageOrder.indexOf(key);
                        const done = progress?.stage === 'completed' || currentIndex > index;
                        const active = progress?.stage !== 'failed' && (progress?.stage === key || (key === 'reading' && progress?.stage === 'filtering'));
                        return <div key={key} className={`flex items-center gap-3 rounded-xl border p-3 ${done ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300' : active ? 'border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300' : 'border-slate-200 text-slate-400 dark:border-white/10 dark:text-gray-500'}`}>{done ? <CheckCircle2 size={18} /> : active ? <LoaderCircle className="animate-spin" size={18} /> : <Icon size={18} />}<span className="text-sm font-bold">{label}</span></div>;
                      })}
                    </div>

                    {progress?.currentSource && <div className="rounded-lg bg-slate-100 px-4 py-3 dark:bg-slate-900"><p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Nguồn đang xử lý</p><p className="truncate font-mono text-xs text-sky-700 dark:text-cyan-300" title={progress.currentSource}>{progress.currentSource}</p></div>}

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                      {[['DuckDuckGo', diagnostics?.discoveryFound], ['Bị lọc', diagnostics?.discoveryRejected], ['RSS', diagnostics?.rssItems], ['Website', diagnostics?.websiteLinks], ['Ứng viên', diagnostics?.candidates], ['Đã xử lý', diagnostics?.alreadyProcessed], ['Trùng', diagnostics?.duplicates], ['Lỗi', diagnostics?.failed]].map(([label, value]) => <div key={String(label)} className="rounded-lg border border-slate-200 p-3 text-center dark:border-white/10"><p className="text-xl font-bold text-slate-900 dark:text-white">{value || 0}</p><p className="mt-1 text-xs text-slate-500 dark:text-gray-400">{label}</p></div>)}
                    </div>

                    {automationStatus?.lastResult?.status === 'published' && !isGenerating && <div className="flex items-start gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"><CheckCircle2 className="mt-0.5 shrink-0" size={21} /><div><p className="font-bold">Đăng bài thành công</p><p className="mt-1 text-sm">{automationStatus.lastResult.title}</p></div></div>}
                    {automationStatus?.lastResult?.status === 'draft' && !isGenerating && <div className="flex items-start gap-3 rounded-xl border border-sky-300 bg-sky-50 p-4 text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200"><ClipboardCheck className="mt-0.5 shrink-0" size={21} /><div><p className="font-bold">Đã lưu bản nháp chờ duyệt</p><p className="mt-1 text-sm">{automationStatus.lastResult.title} · Điểm chất lượng {automationStatus.lastResult.qualityScore ?? 0}/100</p></div></div>}
                    {automationStatus?.lastResult?.status === 'skipped' && !isGenerating && <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"><AlertCircle className="mt-0.5 shrink-0" size={21} /><div><p className="font-bold">Chưa tạo được bài mới</p><p className="mt-1 text-sm">Đã kiểm tra các nguồn nhưng không có nội dung mới phù hợp.</p></div></div>}
                    {!isGenerating && <div className="flex justify-end"><button type="button" onClick={handleGeneratePost} className="inline-flex items-center rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-purple-700"><Sparkles className="mr-2" size={17} /> Chạy lượt mới</button></div>}
                  </div>
                );
              })()}

              {automationError && <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200" role="alert"><AlertCircle className="mt-0.5 shrink-0" size={21} /><div className="min-w-0"><p className="font-bold">Không thể hoàn tất lượt tạo bài</p><p className="mt-1 whitespace-pre-wrap break-words text-sm">{automationError}</p></div></div>}
            </div>
          </section>
        )}

        {drafts.length > 0 && (
          <section className="mb-8 overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-lg dark:border-sky-500/20 dark:bg-slate-800" aria-labelledby="draft-review-title">
            <div className="border-b border-slate-200 p-5 dark:border-white/10">
              <h2 id="draft-review-title" className="flex items-center text-xl font-bold text-slate-900 dark:text-white"><ClipboardCheck className="mr-2 text-sky-600" size={22} /> Bài AI chờ duyệt</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">{drafts.length} bản nháp chưa được công khai</p>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {drafts.map(draft => (
                <article key={draft.id} className="grid gap-4 p-5 lg:grid-cols-[120px_1fr_auto] lg:items-center">
                  <img src={draft.imageUrl} alt="" className="h-24 w-full rounded-lg object-cover lg:w-28" />
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${(draft.qualityScore || 0) >= 80 ? 'bg-emerald-100 text-emerald-700' : (draft.qualityScore || 0) >= 65 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{draft.qualityScore ?? 0}/100</span>
                      <span className="text-xs text-slate-500">{draft.category}</span>
                    </div>
                    <h3 className="truncate font-bold text-slate-900 dark:text-white">{draft.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-gray-400">{draft.excerpt}</p>
                    {draft.sourceUrl && <a href={draft.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center text-xs text-sky-600 hover:underline">Xem nguồn <ExternalLink className="ml-1" size={12} /></a>}
                  </div>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <Link to={`/admin/edit/${draft.id}`} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:text-gray-200 dark:hover:bg-white/10">Sửa & xem</Link>
                    {getCurrentUser()?.role === 'admin' && <>
                      <button type="button" onClick={() => handleDraftAction(draft.id, 'approve')} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-700">Duyệt đăng</button>
                      <button type="button" onClick={() => handleDraftAction(draft.id, 'reject')} className="rounded-lg border border-red-300 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10">Từ chối</button>
                    </>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-lg dark:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-white/10">
                  <th className="p-4 text-slate-500 dark:text-gray-400 font-medium">Tiêu đề</th>
                  <th className="p-4 text-slate-500 dark:text-gray-400 font-medium">Danh mục</th>
                  <th className="p-4 text-slate-500 dark:text-gray-400 font-medium">Ngày đăng</th>
                  <th className="p-4 text-slate-500 dark:text-gray-400 font-medium text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-slate-800 dark:text-white">
                      <div className="truncate max-w-[300px]">{post.title}</div>
                    </td>
                    <td className="p-4 text-sky-600 dark:text-cyan-400">{post.category}</td>
                    <td className="p-4 text-slate-600 dark:text-gray-400">{post.date}</td>
                    <td className="p-4 flex justify-end space-x-3">
                      <Link 
                        to={`/admin/edit/${post.id}`} 
                        className="p-2 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-400/10 rounded transition-colors"
                        title="Sửa"
                      >
                        <Edit size={18} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(post.id)}
                        className="p-2 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-400/10 rounded transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500 dark:text-gray-500">Chưa có bài viết nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
