import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from '../utils/router';
import { ArrowUpRight, Calendar, ChevronLeft, ChevronRight, Clock, Eye, Filter, Search } from 'lucide-react';
import { getCategories, getPosts } from '../utils/storage';
import { BlogPost, Category } from '../types';

const POSTS_PER_PAGE = 6;

const formatDate = (date: string) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' }).format(parsed);
};

const BlogList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([{ id: 'all', name: 'Tất cả' }]);
  const [loading, setLoading] = useState(true);
  const resultsRef = useRef<HTMLDivElement>(null);
  const activeCategory = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('q') || '';
  const requestedPage = Math.max(1, Number(searchParams.get('page')) || 1);

  useEffect(() => {
    Promise.all([getPosts(), getCategories()]).then(([posts, loadedCategories]) => {
      setAllPosts(posts);
      const categoryNames = new Map(loadedCategories.map(category => [category.id, category.name]));
      posts.forEach(post => {
        if (post.category && !categoryNames.has(post.category)) categoryNames.set(post.category, post.category);
      });
      setCategories([{ id: 'all', name: 'Tất cả' }, ...Array.from(categoryNames, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name, 'vi'))]);
    }).finally(() => setLoading(false));
  }, []);

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase('vi');
    return allPosts.filter(post => {
      const categoryMatches = activeCategory === 'all' || post.category === activeCategory;
      const textMatches = !query || [post.title, post.excerpt, post.author, ...post.tags].join(' ').toLocaleLowerCase('vi').includes(query);
      return categoryMatches && textMatches;
    });
  }, [activeCategory, allPosts, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const currentPage = Math.min(requestedPage, totalPages);
  const currentPosts = filteredPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  const updateQuery = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    setSearchParams(next);
  };

  const paginate = (page: number) => {
    updateQuery({ page: page > 1 ? String(page) : null });
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <header className="grid gap-7 border-b border-slate-200 pb-10 dark:border-white/10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-700 dark:text-cyan-300">Thư viện không gian</p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-[-0.035em] text-slate-950 sm:text-5xl dark:text-white">Những lớp dữ liệu đáng đọc.</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">Phân tích, hướng dẫn và góc nhìn mới về GIS, viễn thám và khoa học hành tinh.</p>
          </div>
          <div className="font-mono text-sm text-slate-500 dark:text-slate-400"><strong className="text-2xl text-slate-950 dark:text-white">{filteredPosts.length}</strong> bài viết được tìm thấy</div>
        </header>

        <section className="sticky top-16 z-20 -mx-4 border-b border-slate-200 bg-slate-50 px-4 py-5 dark:border-white/10 dark:bg-slate-950 sm:-mx-6 sm:px-6 lg:mx-0 lg:rounded-b-2xl lg:border-x lg:px-5" aria-label="Bộ lọc bài viết">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Danh mục">
              {categories.map(category => <button type="button" key={category.id} onClick={() => updateQuery({ category: category.id === 'all' ? null : category.id, page: null })} aria-pressed={activeCategory === category.id} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${activeCategory === category.id ? 'border-sky-600 bg-sky-600 text-white dark:border-cyan-300 dark:bg-cyan-300 dark:text-slate-950' : 'border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-cyan-300/40 dark:hover:text-cyan-300'}`}>{category.name}</button>)}
            </div>
            <label className="relative block w-full lg:w-80"><span className="sr-only">Tìm kiếm bài viết</span><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="search" placeholder="Tiêu đề, tác giả, thẻ..." value={searchQuery} onChange={event => updateQuery({ q: event.target.value || null, page: null })} className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white" /></label>
          </div>
        </section>

        <div ref={resultsRef} className="scroll-mt-40 pt-10">
          {loading ? <div role="status" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"><span className="sr-only">Đang tải bài viết</span>{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-[26rem] animate-pulse rounded-2xl bg-slate-200 dark:bg-white/5" />)}</div> : currentPosts.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {currentPosts.map((post, index) => <Link to={`/blog/${encodeURIComponent(post.id)}`} key={post.id} className={`group flex min-h-[27rem] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-white/10 dark:bg-slate-900/65 dark:hover:border-cyan-300/30 ${index === 0 && currentPage === 1 ? 'md:col-span-2 lg:grid lg:grid-cols-[1.1fr_0.9fr]' : ''}`}>
              <div className={`relative overflow-hidden bg-slate-200 ${index === 0 && currentPage === 1 ? 'min-h-64 md:min-h-full' : 'h-56'}`}><img src={post.imageUrl} alt="" loading={index === 0 && currentPage === 1 ? 'eager' : 'lazy'} fetchPriority={index === 0 && currentPage === 1 ? 'high' : 'auto'} decoding="async" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 to-transparent" /><span className="absolute left-4 top-4 rounded-full bg-slate-950/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">{post.category}</span></div>
              <div className="flex flex-1 flex-col p-6"><div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400"><span className="flex items-center gap-1.5"><Calendar size={13} />{formatDate(post.date)}</span><span className="flex items-center gap-1.5"><Clock size={13} />{post.readTime}</span><span className="flex items-center gap-1.5"><Eye size={13} />{(post.views || 0).toLocaleString('vi-VN')}</span></div><h2 className="mt-4 font-display text-2xl font-bold leading-tight text-slate-950 transition group-hover:text-sky-700 dark:text-white dark:group-hover:text-cyan-300">{post.title}</h2><p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{post.excerpt}</p><div className="mt-auto flex items-end justify-between gap-4 pt-6"><div className="flex flex-wrap gap-1.5">{post.tags.slice(0, 2).map(tag => <span key={tag} className="text-xs text-slate-500 dark:text-slate-400">#{tag}</span>)}</div><ArrowUpRight size={19} className="shrink-0 text-sky-600 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 dark:text-cyan-300" /></div></div>
            </Link>)}
          </div> : <div className="rounded-3xl border border-dashed border-slate-300 bg-white/50 py-20 text-center dark:border-white/15 dark:bg-white/[0.025]"><Filter className="mx-auto text-slate-400" size={42} /><h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Không tìm thấy tín hiệu phù hợp</h2><p className="mt-2 text-slate-500 dark:text-slate-400">Hãy thử một từ khóa hoặc danh mục khác.</p></div>}
        </div>

        {totalPages > 1 && <nav className="mt-14 flex items-center justify-center gap-2" aria-label="Phân trang"><button type="button" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} aria-label="Trang trước" className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white disabled:opacity-35 dark:border-white/10 dark:bg-white/5"><ChevronLeft size={19} /></button>{Array.from({ length: totalPages }, (_, index) => index + 1).map(page => <button type="button" key={page} onClick={() => paginate(page)} aria-current={currentPage === page ? 'page' : undefined} className={`h-11 min-w-11 rounded-xl px-3 font-bold ${currentPage === page ? 'bg-sky-600 text-white dark:bg-cyan-300 dark:text-slate-950' : 'border border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300'}`}>{page}</button>)}<button type="button" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Trang sau" className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white disabled:opacity-35 dark:border-white/10 dark:bg-white/5"><ChevronRight size={19} /></button></nav>}
      </div>
    </div>
  );
};

export default BlogList;
