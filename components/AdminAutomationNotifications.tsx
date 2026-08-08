import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { getAutomationStatus, isAuthenticated } from '../utils/storage';
import { useLocation } from '../utils/router';

const LAST_NOTIFIED_KEY = 'cosmogis_ai_last_notified';

type Notice = {
  type: 'success' | 'warning' | 'error';
  title: string;
  message: string;
};

const AdminAutomationNotifications: React.FC = () => {
  const { pathname } = useLocation();
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    if (!pathname.startsWith('/admin') || pathname === '/admin' || !isAuthenticated()) return;

    let active = true;
    const checkStatus = async () => {
      try {
        const { lastResult } = await getAutomationStatus();
        if (!active || !lastResult?.completedAt || localStorage.getItem(LAST_NOTIFIED_KEY) === lastResult.completedAt) return;

        localStorage.setItem(LAST_NOTIFIED_KEY, lastResult.completedAt);
        if (lastResult.status === 'published') {
          setNotice({ type: 'success', title: 'AI đã đăng bài mới', message: lastResult.title || 'Bài viết AI đã được đăng thành công.' });
        } else if (lastResult.status === 'draft') {
          setNotice({ type: 'success', title: 'AI đã tạo bản nháp', message: `${lastResult.title || 'Bài viết mới'} · Điểm chất lượng ${lastResult.qualityScore ?? 0}/100` });
        } else if (lastResult.status === 'failed') {
          setNotice({ type: 'error', title: 'Lượt chạy AI thất bại', message: lastResult.error || 'Không thể hoàn tất lượt tạo bài tự động.' });
        } else {
          const failed = lastResult.diagnostics?.failed || 0;
          setNotice({
            type: failed > 0 ? 'error' : 'warning',
            title: failed > 0 ? 'AI không tạo được bài' : 'AI chưa tìm thấy nguồn mới',
            message: failed > 0 ? `${failed} nguồn gặp lỗi khi crawl hoặc xử lý bằng AI.` : 'Lượt chạy đã hoàn tất nhưng không có nguồn mới phù hợp.'
          });
        }
      } catch {
        // Status polling should not interrupt admin work when the API is temporarily unavailable.
      }
    };

    void checkStatus();
    const interval = window.setInterval(checkStatus, 15000);
    const checkOnFocus = () => void checkStatus();
    window.addEventListener('focus', checkOnFocus);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener('focus', checkOnFocus);
    };
  }, [pathname]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 8000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  if (!notice) return null;

  const colors = notice.type === 'success'
    ? 'border-emerald-300 bg-emerald-50/95 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-950/95 dark:text-emerald-100'
    : notice.type === 'warning'
      ? 'border-amber-300 bg-amber-50/95 text-amber-900 dark:border-amber-500/40 dark:bg-amber-950/95 dark:text-amber-100'
      : 'border-red-300 bg-red-50/95 text-red-900 dark:border-red-500/40 dark:bg-red-950/95 dark:text-red-100';
  const Icon = notice.type === 'success' ? CheckCircle2 : notice.type === 'warning' ? Info : AlertCircle;

  return (
    <div className={`fixed right-4 top-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 rounded-xl border p-4 shadow-2xl backdrop-blur sm:right-6 sm:top-6 ${colors}`} role="status" aria-live="polite">
      <Icon className="mt-0.5 shrink-0" size={21} />
      <div className="min-w-0 flex-1">
        <p className="font-bold">{notice.title}</p>
        <p className="mt-1 break-words text-sm opacity-80">{notice.message}</p>
      </div>
      <button type="button" onClick={() => setNotice(null)} className="shrink-0 rounded p-0.5 opacity-60 transition hover:opacity-100" aria-label="Đóng thông báo">
        <X size={17} />
      </button>
    </div>
  );
};

export default AdminAutomationNotifications;
