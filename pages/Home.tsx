import React, { useEffect, useState } from 'react';
import { Link } from '../utils/router';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Clock3,
  Eye,
  Globe,
  Orbit,
  RadioTower,
  Satellite
} from 'lucide-react';
import { getPosts } from '../utils/storage';
import { BlogPost } from '../types';
import { useSiteSettings } from '../components/Layout';

const topics = [
  {
    id: 'gis-basic',
    label: 'GIS đa hành tinh',
    description: 'Hệ tọa độ, mô hình địa hình và phân tích không gian ngoài Trái Đất.',
    icon: Globe,
    accent: 'sky'
  },
  {
    id: 'earth-obs',
    label: 'Quan sát Trái Đất',
    description: 'Đọc tín hiệu từ Landsat, Sentinel và những cảm biến viễn thám hiện đại.',
    icon: Satellite,
    accent: 'violet'
  },
  {
    id: 'solar-system',
    label: 'Hệ Mặt Trời',
    description: 'Khám phá địa chất, khí hậu và dấu vết nước qua dữ liệu hành tinh.',
    icon: Orbit,
    accent: 'rose'
  },
  {
    id: 'space-tech',
    label: 'Công nghệ vũ trụ',
    description: 'Hạ tầng dữ liệu, AI và các hệ thống dẫn đường cho sứ mệnh tương lai.',
    icon: RadioTower,
    accent: 'amber'
  }
] as const;

const topicAccentClasses = {
  sky: 'bg-sky-100 text-sky-700 group-hover:bg-sky-600 group-hover:text-white dark:bg-cyan-400/10 dark:text-cyan-300 dark:group-hover:bg-cyan-400 dark:group-hover:text-slate-950',
  violet: 'bg-violet-100 text-violet-700 group-hover:bg-violet-600 group-hover:text-white dark:bg-violet-400/10 dark:text-violet-300 dark:group-hover:bg-violet-400 dark:group-hover:text-slate-950',
  rose: 'bg-rose-100 text-rose-700 group-hover:bg-rose-600 group-hover:text-white dark:bg-rose-400/10 dark:text-rose-300 dark:group-hover:bg-rose-400 dark:group-hover:text-slate-950',
  amber: 'bg-amber-100 text-amber-700 group-hover:bg-amber-500 group-hover:text-white dark:bg-amber-400/10 dark:text-amber-300 dark:group-hover:bg-amber-400 dark:group-hover:text-slate-950'
};

const formatDate = (date: string) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' }).format(parsed);
};

const Home: React.FC = () => {
  const settings = useSiteSettings();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getPosts()
      .then(data => {
        if (active) setPosts(data);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const featuredPosts = posts.slice(0, 3);
  const categoryCount = new Set(posts.map(post => post.category)).size;
  const latestPost = featuredPosts[0];
  const siteName = settings ? `${settings.siteNamePrefix}${settings.siteNameSuffix}`.trim() : 'website';

  return (
    <div className="text-slate-800 dark:text-white">
      <section className="relative overflow-hidden px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-5xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sky-700 shadow-sm dark:border-cyan-400/25 dark:bg-cyan-400/5 dark:text-cyan-300">
              <span className="h-2 w-2 rounded-full bg-sky-500 dark:bg-cyan-300" />
              Dữ liệu không gian đang mở
            </div>

            <h1 className="max-w-5xl font-display text-4xl font-bold leading-[0.98] tracking-[-0.045em] text-slate-950 min-[380px]:text-5xl sm:text-6xl lg:text-8xl dark:text-white">
              Đọc hành tinh bằng
              <span className="mt-2 block bg-gradient-to-r from-sky-600 via-blue-600 to-violet-600 bg-clip-text text-transparent dark:from-cyan-300 dark:via-sky-400 dark:to-violet-400">ngôn ngữ bản đồ.</span>
            </h1>

            <p className="mt-8 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl dark:text-slate-300">
              {siteName} kết nối GIS, viễn thám và khoa học hành tinh để biến dữ liệu phức tạp thành những câu chuyện có thể khám phá.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/blog" className="group inline-flex items-center justify-center rounded-xl bg-slate-950 px-6 py-3.5 font-bold text-white shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:bg-cyan-300 dark:text-slate-950 dark:shadow-cyan-400/10 dark:hover:bg-cyan-200">
                Khám phá bài viết <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={19} />
              </Link>
              <Link to="/about" className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white/70 px-6 py-3.5 font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-sky-400 hover:text-sky-700 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:border-cyan-300/50 dark:hover:text-cyan-300">
                Về {siteName}
              </Link>
            </div>

            <dl className="mt-12 grid max-w-2xl grid-cols-3 border-t border-slate-200 pt-6 dark:border-white/10">
              <div><dt className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Bài viết</dt><dd className="mt-1 font-display text-2xl font-bold text-slate-950 dark:text-white">{isLoading ? '--' : posts.length}</dd></div>
              <div className="border-l border-slate-200 pl-5 dark:border-white/10"><dt className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Chủ đề</dt><dd className="mt-1 font-display text-2xl font-bold text-slate-950 dark:text-white">{isLoading ? '--' : categoryCount}</dd></div>
              <div className="border-l border-slate-200 pl-5 dark:border-white/10"><dt className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Góc nhìn</dt><dd className="mt-1 font-display text-2xl font-bold text-slate-950 dark:text-white">360°</dd></div>
            </dl>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-4 py-16 sm:px-6 lg:px-8 lg:py-20" aria-labelledby="topics-title">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-700 dark:text-cyan-300">Bắt đầu từ một tín hiệu</p>
            <h2 id="topics-title" className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl dark:text-white">Chọn lớp dữ liệu bạn muốn khám phá</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {topics.map(({ id, label, description, icon: Icon, accent }, index) => (
              <Link key={id} to={`/blog?category=${id}`} className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-white/10 dark:bg-slate-900/90 dark:hover:border-white/20">
                <span className="absolute right-5 top-4 font-mono text-xs text-slate-300 dark:text-slate-600">0{index + 1}</span>
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${topicAccentClasses[accent]}`}><Icon size={22} /></span>
                <h3 className="mt-8 font-display text-xl font-bold text-slate-900 transition-colors group-hover:text-sky-700 dark:text-white dark:group-hover:text-cyan-300">{label}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
                <span className="mt-6 inline-flex items-center text-sm font-bold text-slate-500 transition-colors group-hover:text-slate-950 dark:text-slate-400 dark:group-hover:text-white">Mở chủ đề <ArrowUpRight className="ml-1.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" size={16} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-slate-200 bg-white/95 px-4 py-20 dark:border-white/10 dark:bg-slate-900/95 sm:px-6 lg:px-8 lg:py-24" aria-labelledby="featured-title">
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-700 dark:text-violet-300">Từ phòng dữ liệu</p>
              <h2 id="featured-title" className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl dark:text-white">Bài viết mới trên quỹ đạo</h2>
            </div>
            <Link to="/blog" className="group inline-flex items-center font-bold text-sky-700 hover:text-sky-900 dark:text-cyan-300 dark:hover:text-white">Xem toàn bộ thư viện <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={18} /></Link>
          </div>

          {isLoading ? (
            <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]" aria-label="Đang tải bài viết">
              <div className="h-[500px] animate-pulse rounded-3xl bg-slate-200 dark:bg-white/5" />
              <div className="grid gap-6"><div className="h-[238px] animate-pulse rounded-3xl bg-slate-200 dark:bg-white/5" /><div className="h-[238px] animate-pulse rounded-3xl bg-slate-200 dark:bg-white/5" /></div>
            </div>
          ) : featuredPosts.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
              {latestPost && (
                <Link to={`/blog/${latestPost.id}`} className="group relative min-h-[460px] overflow-hidden rounded-3xl bg-slate-900 shadow-xl sm:min-h-[520px]">
                  <img src={latestPost.imageUrl} alt="" fetchPriority="high" decoding="async" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-9">
                    <span className="inline-flex rounded-full border border-white/20 bg-slate-950/70 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-200">Mới nhất · {latestPost.category}</span>
                    <h3 className="mt-4 max-w-2xl font-display text-3xl font-bold leading-tight text-white sm:text-4xl">{latestPost.title}</h3>
                    <p className="mt-4 max-w-2xl line-clamp-2 text-sm leading-6 text-slate-200 sm:text-base">{latestPost.excerpt}</p>
                    <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-300"><span className="flex items-center gap-1.5"><CalendarDays size={14} /> {formatDate(latestPost.date)}</span><span className="flex items-center gap-1.5"><Clock3 size={14} /> {latestPost.readTime}</span><span className="flex items-center gap-1.5"><Eye size={14} /> {(latestPost.views || 0).toLocaleString('vi-VN')}</span><span className="ml-auto flex items-center font-bold text-cyan-200">Đọc bài <ArrowUpRight className="ml-1" size={16} /></span></div>
                  </div>
                </Link>
              )}

              <div className="grid gap-6">
                {featuredPosts.slice(1).map(post => (
                  <Link to={`/blog/${post.id}`} key={post.id} className="group grid min-h-[240px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-slate-950/70 sm:grid-cols-[42%_58%] lg:grid-cols-1 xl:grid-cols-[42%_58%]">
                    <div className="relative min-h-44 overflow-hidden sm:min-h-full lg:min-h-40 xl:min-h-full"><img src={post.imageUrl} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" /><span className="absolute left-3 top-3 rounded-full bg-slate-950/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">{post.category}</span></div>
                    <div className="flex flex-col p-5"><div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400"><span>{formatDate(post.date)}</span><span className="h-1 w-1 rounded-full bg-slate-300" /><span>{post.readTime}</span></div><h3 className="mt-3 line-clamp-3 font-display text-xl font-bold leading-snug text-slate-900 transition-colors group-hover:text-sky-700 dark:text-white dark:group-hover:text-cyan-300">{post.title}</h3><span className="mt-auto pt-4 text-sm font-bold text-sky-700 dark:text-cyan-300">Đọc tiếp <ArrowRight className="ml-1 inline transition-transform group-hover:translate-x-1" size={15} /></span></div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-16 text-center dark:border-white/15 dark:bg-white/[0.03]"><BookOpen className="mx-auto text-slate-400" size={40} /><h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Thư viện đang chờ dữ liệu đầu tiên</h3><p className="mx-auto mt-2 max-w-lg text-slate-500 dark:text-slate-400">Các bài viết mới sẽ xuất hiện tại đây ngay khi được xuất bản.</p></div>
          )}
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="relative mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-12 text-white shadow-2xl sm:px-10 lg:grid-cols-[1fr_auto] lg:items-center lg:px-14 lg:py-16">
          <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border border-cyan-300/20" /><div className="absolute -right-6 -top-20 h-56 w-56 rounded-full border border-violet-300/20" />
          <div className="relative max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">Tọa độ tiếp theo</p><h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">Có một câu hỏi đang chờ được lập bản đồ?</h2><p className="mt-4 leading-7 text-slate-300">Kết nối với {siteName} để trao đổi về dữ liệu không gian, WebGIS và những câu chuyện khoa học cần được trực quan hóa.</p></div>
          <Link to="/contact" className="group relative mt-8 inline-flex items-center justify-center rounded-xl bg-cyan-300 px-6 py-3.5 font-bold text-slate-950 transition hover:bg-white lg:mt-0">Bắt đầu trao đổi <ArrowUpRight className="ml-2 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" size={18} /></Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
