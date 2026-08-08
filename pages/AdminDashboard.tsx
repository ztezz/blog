
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from '../utils/router';
import { Edit, Trash2, Plus, LogOut, Settings, Users, Mail, Layers, Database, Sparkles, X, LoaderCircle, CheckCircle2, AlertCircle, Search, FileText, Cpu, Send, ClipboardCheck, ExternalLink, Octagon, Activity, BarChart3, BookOpen, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { API_URL, approveDraftPost, cancelAutomation, getPosts, deletePost, getCurrentUser, getAutomationRuns, getAutomationStatistics, getAutomationStatus, getDraftPosts, logout, isAuthenticated, rejectDraftPost, runAutomation } from '../utils/storage';
import { AutomationRunHistory, AutomationStatistics, AutomationStatus, BlogPost } from '../types';

const AdminDashboard: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [drafts, setDrafts] = useState<BlogPost[]>([]);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiControl, setShowAiControl] = useState(false);
  const [automationStatus, setAutomationStatus] = useState<AutomationStatus | null>(null);
  const [automationError, setAutomationError] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [automationRuns, setAutomationRuns] = useState<AutomationRunHistory[]>([]);
  const [automationStatistics, setAutomationStatistics] = useState<AutomationStatistics | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/admin');
      return;
    }
    void Promise.all([loadPosts(), loadDrafts(), loadAutomationInsights()]);
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

  const loadAutomationInsights = async () => {
    if (getCurrentUser()?.role !== 'admin') return;
    try {
      const [runs, statistics] = await Promise.all([getAutomationRuns(), getAutomationStatistics()]);
      setAutomationRuns(runs);
      setAutomationStatistics(statistics);
    } catch {
      // Operational insights are supplementary to the main dashboard.
    }
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
    let backgroundRunStarted = false;
    try {
      const result = await runAutomation();
      backgroundRunStarted = result.status === 'started';
      const status = await getAutomationStatus();
      setAutomationStatus(status);
      setIsGenerating(status.running);
      backgroundRunStarted = status.running;
      if (result.status === 'published') await loadPosts();
      if (result.status === 'draft') await loadDrafts();
      if (!backgroundRunStarted) await loadAutomationInsights();
    } catch (error) {
      setAutomationError(error instanceof Error ? error.message : 'Không thể tạo bài viết AI');
      try {
        setAutomationStatus(await getAutomationStatus());
      } catch {
        // Keep the original run error visible.
      }
    } finally {
      if (!backgroundRunStarted) setIsGenerating(false);
    }
  };

  const handleCancelAutomation = async () => {
    setIsCancelling(true);
    setAutomationError('');
    try {
      const result = await cancelAutomation();
      if (!result.cancelled) setAutomationError('Không có lượt tạo bài nào đang chạy.');
      else if (result.stale) {
        setAutomationStatus(await getAutomationStatus());
        await loadAutomationInsights();
      }
    } catch (error) {
      setAutomationError(error instanceof Error ? error.message : 'Không thể dừng lượt tạo bài');
    } finally {
      setIsCancelling(false);
    }
  };

  const currentUser = getCurrentUser();
  const categoryCount = new Set(posts.map(post => post.category)).size;
  const latestPost = posts[0];
  const quickActions = [
    { label: 'Viết bài mới', description: 'Tạo và xuất bản nội dung thủ công', icon: Plus, to: '/admin/create', accent: 'sky' },
    { label: 'Hộp thư', description: 'Đọc phản hồi từ độc giả', icon: Mail, to: '/admin/mailbox', accent: 'violet' },
    { label: 'Danh mục', description: 'Tổ chức kho nội dung', icon: Layers, to: '/admin/categories', accent: 'amber' },
    { label: 'Cài đặt', description: 'Thương hiệu, menu và tự động AI', icon: Settings, to: '/admin/settings', accent: 'slate' }
  ] as const;
  const quickActionAccent = {
    sky: 'bg-sky-100 text-sky-700 dark:bg-cyan-400/10 dark:text-cyan-300',
    violet: 'bg-violet-100 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300',
    slate: 'bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-200'
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-12 pt-8 dark:bg-slate-950 sm:px-6 sm:pt-10 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="relative mb-6 overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-2xl shadow-slate-900/15 sm:px-8 lg:px-10 lg:py-10">
          <div className="pointer-events-none absolute -right-20 -top-36 h-96 w-96 rounded-full border border-cyan-300/15" />
          <div className="pointer-events-none absolute -right-4 -top-20 h-64 w-64 rounded-full border border-violet-300/15" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-80 bg-cyan-400/10 blur-[70px]" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300"><ShieldCheck size={15} /> Admin workspace</div>
              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Chào {currentUser?.displayName || currentUser?.username}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">Theo dõi nội dung, kiểm duyệt bài AI và điều phối hoạt động xuất bản từ một trung tâm duy nhất.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={openAiControl} className="inline-flex items-center rounded-xl bg-violet-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5 hover:bg-violet-400" title="Lấy nguồn mới và đăng bài bằng AI">{isGenerating ? <LoaderCircle size={18} className="mr-2 animate-spin" /> : <Sparkles size={18} className="mr-2" />}{isGenerating ? 'Xem tiến trình AI' : 'Tạo bài bằng AI'}</button>
              <Link to="/admin/create" className="inline-flex items-center rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-white"><Plus size={18} className="mr-2" /> Viết bài mới</Link>
              <button onClick={handleLogout} className="inline-flex items-center rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-slate-300 transition hover:bg-white/10 hover:text-white" aria-label="Đăng xuất" title="Đăng xuất"><LogOut size={18} /></button>
            </div>
          </div>
        </header>

        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Tổng quan nội dung">
          {[
            { label: 'Bài đã xuất bản', value: posts.length, detail: latestPost ? `Mới nhất: ${latestPost.date}` : 'Chưa có bài viết', icon: BookOpen, color: 'text-sky-600 dark:text-cyan-300' },
            { label: 'Chờ kiểm duyệt', value: drafts.length, detail: drafts.length > 0 ? 'Cần xử lý nội dung AI' : 'Không có việc tồn đọng', icon: ClipboardCheck, color: drafts.length > 0 ? 'text-amber-600' : 'text-emerald-600' },
            { label: 'Danh mục hoạt động', value: categoryCount, detail: 'Đang có bài xuất bản', icon: Layers, color: 'text-violet-600 dark:text-violet-300' },
            { label: 'Điểm AI trung bình', value: automationStatistics?.average_quality ?? '-', detail: automationStatistics ? `${automationStatistics.total} lượt đã ghi nhận` : 'Đang tải thống kê', icon: Activity, color: 'text-emerald-600 dark:text-emerald-300' }
          ].map(({ label, value, detail, icon: Icon, color }) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/70 sm:p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className={`mt-2 font-display text-3xl font-bold ${color}`}>{value}</p></div><span className="rounded-xl bg-slate-100 p-2 text-slate-500 dark:bg-white/5 dark:text-slate-300"><Icon size={19} /></span></div><p className="mt-3 truncate text-xs text-slate-500 dark:text-slate-400" title={detail}>{detail}</p></div>)}
        </section>

        <section className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Tác vụ nhanh">
          {quickActions.map(({ label, description, icon: Icon, to, accent }) => <Link key={to} to={to} className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg dark:border-white/10 dark:bg-slate-900/60 dark:hover:border-white/20"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${quickActionAccent[accent]}`}><Icon size={19} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-bold text-slate-900 dark:text-white">{label}</span><span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">{description}</span></span><ArrowUpRight className="text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-600 dark:group-hover:text-white" size={17} /></Link>)}
        </section>

        {currentUser?.role === 'admin' && <div className="mb-8 flex flex-wrap items-center justify-end gap-3 border-b border-slate-200 pb-5 dark:border-white/10"><Link to="/admin/users" className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-white hover:text-sky-700 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-cyan-300"><Users className="mr-2" size={16} /> Người dùng</Link><button onClick={handleRestoreDb} disabled={isRestoring} className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-bold text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-amber-300 dark:hover:bg-amber-400/10" title="Khôi phục database từ file .sql"><Database className="mr-2" size={16} /> {isRestoring ? 'Đang khôi phục...' : 'Khôi phục database'}</button></div>}

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
                  { key: 'writing', label: 'Viết & kiểm chứng', icon: Cpu },
                  { key: 'publishing', label: 'Đăng bài', icon: Send }
                ];
                const stageOrder = ['config', 'sources', 'filtering', 'reading', 'writing', 'verifying', 'imaging', 'publishing', 'completed'];
                const currentIndex = stageOrder.indexOf(progress?.stage || 'config');
                return (
                  <div className="space-y-6">
                    <div>
                      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                        <span className="font-bold text-purple-700 dark:text-purple-300">{progress?.message || 'Đang khởi động lượt tạo bài...'}</span>
                        <span className="font-mono font-bold text-slate-500 dark:text-gray-400">{progress?.percent || 0}%</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-950">
                        <div className={`h-full rounded-full transition-all duration-500 ${progress?.stage === 'failed' || progress?.stage === 'cancelled' ? 'bg-red-500' : progress?.stage === 'cancelling' ? 'bg-amber-500' : 'bg-gradient-to-r from-purple-600 to-sky-500'}`} style={{ width: `${progress?.percent || 3}%` }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                      {stages.map(({ key, label, icon: Icon }) => {
                        const index = stageOrder.indexOf(key);
                        const done = progress?.stage === 'completed' || currentIndex > index;
                        const active = progress?.stage !== 'failed' && (progress?.stage === key || (key === 'reading' && progress?.stage === 'filtering') || (key === 'writing' && progress?.stage === 'verifying') || (key === 'publishing' && progress?.stage === 'imaging'));
                        return <div key={key} className={`flex items-center gap-3 rounded-xl border p-3 ${done ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300' : active ? 'border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300' : 'border-slate-200 text-slate-400 dark:border-white/10 dark:text-gray-500'}`}>{done ? <CheckCircle2 size={18} /> : active ? <LoaderCircle className="animate-spin" size={18} /> : <Icon size={18} />}<span className="text-sm font-bold">{label}</span></div>;
                      })}
                    </div>

                    {progress?.currentSource && <div className="rounded-lg bg-slate-100 px-4 py-3 dark:bg-slate-900"><p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Nguồn đang xử lý</p><p className="truncate font-mono text-xs text-sky-700 dark:text-cyan-300" title={progress.currentSource}>{progress.currentSource}</p></div>}

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                      {[['DuckDuckGo', diagnostics?.discoveryFound], ['Bị lọc', diagnostics?.discoveryRejected], ['RSS', diagnostics?.rssItems], ['Website', diagnostics?.websiteLinks], ['Ứng viên', diagnostics?.candidates], ['Đã xử lý', diagnostics?.alreadyProcessed], ['Trùng', diagnostics?.duplicates], ['Lỗi', diagnostics?.failed]].map(([label, value]) => <div key={String(label)} className="rounded-lg border border-slate-200 p-3 text-center dark:border-white/10"><p className="text-xl font-bold text-slate-900 dark:text-white">{value || 0}</p><p className="mt-1 text-xs text-slate-500 dark:text-gray-400">{label}</p></div>)}
                    </div>

                    {automationStatus?.lastResult?.status === 'published' && !isGenerating && <div className="flex items-start gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"><CheckCircle2 className="mt-0.5 shrink-0" size={21} /><div><p className="font-bold">Đăng bài thành công</p><p className="mt-1 text-sm">{automationStatus.lastResult.title}</p></div></div>}
                    {automationStatus?.lastResult?.status === 'draft' && !isGenerating && <div className="flex items-start gap-3 rounded-xl border border-sky-300 bg-sky-50 p-4 text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200"><ClipboardCheck className="mt-0.5 shrink-0" size={21} /><div><p className="font-bold">Đã lưu bản nháp chờ duyệt</p><p className="mt-1 text-sm">{automationStatus.lastResult.title} · {automationStatus.lastResult.sourceCount ?? 1} nguồn · Điểm {automationStatus.lastResult.qualityScore ?? 0}/100</p><p className="mt-1 text-xs opacity-75">Model: {automationStatus.lastResult.model || 'không xác định'} · {automationStatus.lastResult.attempts || 1} lượt gọi</p></div></div>}
                    {automationStatus?.lastResult?.status === 'skipped' && !isGenerating && <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"><AlertCircle className="mt-0.5 shrink-0" size={21} /><div><p className="font-bold">Chưa tạo được bài mới</p><p className="mt-1 text-sm">Đã kiểm tra các nguồn nhưng không có nội dung mới phù hợp.</p></div></div>}
                    {automationStatus?.lastResult?.status === 'cancelled' && !isGenerating && <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"><Octagon className="mt-0.5 shrink-0" size={21} /><div><p className="font-bold">Đã dừng lượt tạo bài</p><p className="mt-1 text-sm">Không có bài viết dở dang nào được lưu hoặc công khai.</p></div></div>}
                    {isGenerating && <div className="flex justify-end"><button type="button" onClick={handleCancelAutomation} disabled={isCancelling} className="inline-flex items-center rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20">{isCancelling ? <LoaderCircle className="mr-2 animate-spin" size={17} /> : <Octagon className="mr-2" size={17} />}{isCancelling ? 'Đang dừng...' : automationStatus?.progress?.stale ? 'Hủy tiến trình cũ' : 'Dừng tạo bài'}</button></div>}
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
                      <span className="text-xs text-slate-500">{draft.sourceUrls?.length || 1} nguồn</span>
                    </div>
                    <h3 className="truncate font-bold text-slate-900 dark:text-white">{draft.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-gray-400">{draft.excerpt}</p>
                    {draft.qualityReport?.verification && <p className="mt-2 text-xs text-slate-500 dark:text-gray-400">Kiểm chứng: <span className="font-bold text-emerald-600">{draft.qualityReport.verification.supported} đạt</span> · <span className="font-bold text-amber-600">{draft.qualityReport.verification.partial} một phần</span> · <span className="font-bold text-red-600">{draft.qualityReport.verification.unsupported} không đạt</span></p>}
                    {draft.qualityReport?.gateway && <p className="mt-1 text-xs text-slate-500 dark:text-gray-400">9Router: {draft.qualityReport.gateway.writerModel} ({draft.qualityReport.gateway.writerAttempts || 1} lượt) · kiểm chứng {draft.qualityReport.gateway.factCheckModel || 'không có'}</p>}
                    {draft.qualityReport?.media?.generatedTitleImage && <p className="mt-1 text-xs text-fuchsia-600">Ảnh AI: {draft.qualityReport.media.imageModel} · {draft.qualityReport.media.generatedContentImages || 0} ảnh trong bài</p>}
                    {!!draft.qualityReport?.policy?.missingRequiredKeywords?.length && <p className="mt-1 text-xs font-bold text-amber-600">Thiếu từ khóa: {draft.qualityReport.policy.missingRequiredKeywords.join(', ')}</p>}
                    {!!draft.qualityReport?.policy?.presentBlockedKeywords?.length && <p className="mt-1 text-xs font-bold text-red-600">Có từ khóa chặn: {draft.qualityReport.policy.presentBlockedKeywords.join(', ')}</p>}
                    {!!draft.qualityReport?.hardFailures?.length && <p className="mt-2 text-xs font-bold text-red-600">Cần xem lại: {draft.qualityReport.hardFailures.join('; ')}</p>}
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

        {getCurrentUser()?.role === 'admin' && automationStatistics && (
          <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-white/10 dark:bg-slate-800" aria-labelledby="automation-insights-title">
            <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-white/10">
              <div><h2 id="automation-insights-title" className="flex items-center text-xl font-bold text-slate-900 dark:text-white"><BarChart3 className="mr-2 text-purple-600" size={22} /> Vận hành AI</h2><p className="mt-1 text-sm text-slate-500 dark:text-gray-400">Lịch sử được lưu trong SQLite và không mất khi khởi động lại server.</p></div>
              <button type="button" onClick={loadAutomationInsights} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:border-white/20 dark:text-gray-300 dark:hover:bg-white/10">Làm mới</button>
            </div>
            <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 lg:grid-cols-6">
              {[
                ['Tổng lượt', automationStatistics.total, 'text-slate-900 dark:text-white'],
                ['Đã đăng', automationStatistics.published, 'text-emerald-600'],
                ['Bản nháp', automationStatistics.drafts, 'text-sky-600'],
                ['Thất bại', automationStatistics.failed, 'text-red-600'],
                ['Đã dừng', automationStatistics.cancelled, 'text-amber-600'],
                ['Điểm TB', automationStatistics.average_quality ?? '-', 'text-purple-600']
              ].map(([label, value, color]) => <div key={String(label)} className="rounded-xl border border-slate-200 p-4 text-center dark:border-white/10"><p className={`text-2xl font-bold ${color}`}>{value}</p><p className="mt-1 text-xs text-slate-500 dark:text-gray-400">{label}</p></div>)}
            </div>
            <div className="border-t border-slate-200 dark:border-white/10">
              <div className="flex items-center px-5 py-4"><Activity className="mr-2 text-purple-600" size={18} /><h3 className="font-bold text-slate-900 dark:text-white">10 lượt gần nhất</h3>{automationStatistics.average_duration_seconds !== null && <span className="ml-auto text-xs text-slate-500">Trung bình {Math.round(automationStatistics.average_duration_seconds)} giây/lượt</span>}</div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900"><tr><th className="px-5 py-3">Thời gian</th><th className="px-5 py-3">Kết quả</th><th className="px-5 py-3">Bài viết</th><th className="px-5 py-3">Model</th><th className="px-5 py-3">Nguồn</th><th className="px-5 py-3">Điểm</th><th className="px-5 py-3">Thời lượng</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {automationRuns.slice(0, 10).map(run => {
                      const duration = run.completedAt ? Math.max(0, Math.round((new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) / 1000)) : null;
                      const statusColor = run.status === 'published' ? 'text-emerald-600' : run.status === 'draft' ? 'text-sky-600' : run.status === 'failed' ? 'text-red-600' : 'text-amber-600';
                      return <tr key={run.id}><td className="px-5 py-3 text-slate-500">{new Date(run.startedAt).toLocaleString('vi-VN')}<span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] dark:bg-white/10">{run.triggerType === 'scheduled' ? 'Lịch' : 'Thủ công'}</span></td><td className={`px-5 py-3 font-bold ${statusColor}`}>{run.status}</td><td className="max-w-[220px] truncate px-5 py-3 text-slate-800 dark:text-gray-200" title={run.title || run.error || ''}>{run.title || run.error || '-'}</td><td className="px-5 py-3 font-mono text-xs text-slate-500">{run.model || '-'}{run.attempts > 0 && ` · ${run.attempts} lượt`}</td><td className="px-5 py-3 text-slate-500">{run.sourceCount}</td><td className="px-5 py-3 font-bold text-purple-600">{run.qualityScore ?? '-'}</td><td className="px-5 py-3 text-slate-500">{duration === null ? 'Đang chạy' : `${duration}s`}</td></tr>;
                    })}
                    {automationRuns.length === 0 && <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-500">Chưa có lịch sử chạy AI.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-white/10 dark:bg-slate-900/70" aria-labelledby="published-posts-title">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 id="published-posts-title" className="flex items-center text-xl font-bold text-slate-900 dark:text-white"><BookOpen className="mr-2 text-sky-600 dark:text-cyan-300" size={21} /> Nội dung đã xuất bản</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Quản lý {posts.length} bài viết đang hiển thị trên website.</p></div>
            <Link to="/admin/create" className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-sky-700 dark:bg-cyan-300 dark:text-slate-950 dark:hover:bg-cyan-200"><Plus className="mr-2" size={17} /> Thêm bài viết</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:border-white/10 dark:bg-slate-950/60">
                  <th className="px-5 py-3 font-bold">Bài viết</th>
                  <th className="px-5 py-3 font-bold">Danh mục</th>
                  <th className="px-5 py-3 font-bold">Ngày đăng</th>
                  <th className="px-5 py-3 text-right font-bold">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {posts.map((post) => (
                  <tr key={post.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.03]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3"><img src={post.imageUrl} alt="" className="h-12 w-16 shrink-0 rounded-lg bg-slate-100 object-cover dark:bg-white/5" /><div className="min-w-0"><p className="max-w-[390px] truncate font-bold text-slate-900 dark:text-white" title={post.title}>{post.title}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{post.readTime} · {post.author}</p></div></div>
                    </td>
                    <td className="px-5 py-4"><span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700 dark:bg-cyan-400/10 dark:text-cyan-300">{post.category}</span></td>
                    <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">{post.date}</td>
                    <td className="px-5 py-4"><div className="flex justify-end gap-2">
                      <Link 
                        to={`/admin/edit/${post.id}`} 
                        className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 dark:border-white/10 dark:text-slate-300 dark:hover:border-cyan-400/30 dark:hover:bg-cyan-400/10 dark:hover:text-cyan-300"
                        title="Chỉnh sửa bài viết"
                      >
                        <Edit className="mr-1.5" size={14} /> Sửa
                      </Link>
                      <button 
                        onClick={() => handleDelete(post.id)}
                        className="inline-flex items-center rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10"
                        title="Xóa bài viết"
                      >
                        <Trash2 className="mr-1.5" size={14} /> Xóa
                      </button>
                    </div></td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-14 text-center text-slate-500 dark:text-slate-400"><BookOpen className="mx-auto mb-3 opacity-40" size={36} /><p className="font-bold text-slate-700 dark:text-slate-300">Chưa có bài viết nào</p><p className="mt-1 text-sm">Bắt đầu bằng một bài viết thủ công hoặc tạo nội dung với AI.</p></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
