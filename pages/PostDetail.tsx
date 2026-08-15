import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from '../utils/router';
import { ArrowLeft, ArrowUp, Calendar, Check, Clock, Eye, Share2, Tag } from 'lucide-react';
import { getPostById } from '../utils/storage';
import { sanitizeHtml } from '../utils/sanitizeHtml';
import { getCanonicalUrl } from '../utils/seo';
import { BlogPost } from '../types';
import PostSeo from '../components/PostSeo';

const formatDate = (date: string) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' }).format(parsed);
};

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost>();
  const [loading, setLoading] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const [activeHeading, setActiveHeading] = useState('');
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const articleRef = useRef<HTMLElement>(null);
  const sanitizedContent = useMemo(() => sanitizeHtml(post?.content || ''), [post?.content]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    if (!id) {
      setLoading(false);
      return;
    }
    getPostById(id).then(foundPost => {
      if (active) setPost(foundPost);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [id]);

  useEffect(() => {
    if (loading || post) return;
    const robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]') || document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    if (!robots.parentNode) document.head.appendChild(robots);
    document.title = 'Bài viết không tồn tại';
  }, [loading, post]);

  useEffect(() => {
    if (!post) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const article = articleRef.current;
      if (!article) return;
      const start = article.offsetTop - 120;
      const distance = Math.max(1, article.offsetHeight - window.innerHeight + 120);
      setReadingProgress(Math.min(100, Math.max(0, ((window.scrollY - start) / distance) * 100)));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); };
  }, [post]);

  useEffect(() => {
    if (!post?.toc?.length) return;
    const headings = post.toc.map(item => document.getElementById(item.id)).filter((element): element is HTMLElement => Boolean(element));
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) setActiveHeading(visible.target.id);
    }, { rootMargin: '-18% 0px -68% 0px' });
    headings.forEach(heading => observer.observe(heading));
    return () => observer.disconnect();
  }, [post, sanitizedContent]);

  const handleShare = async () => {
    if (!post) return;
    const url = getCanonicalUrl(`/blog/${encodeURIComponent(post.id)}`);
    try {
      if (navigator.share) await navigator.share({ title: post.title, text: post.excerpt, url });
      else if (navigator.clipboard) { await navigator.clipboard.writeText(url); setShareStatus('copied'); }
      else throw new Error('Clipboard unavailable');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setShareStatus('error');
    }
    window.setTimeout(() => setShareStatus('idle'), 2500);
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center" role="status"><span className="sr-only">Đang tải bài viết</span><div className="h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-t-sky-500 dark:border-white/10 dark:border-t-cyan-300" /></div>;
  if (!post) return <div className="flex min-h-screen items-center justify-center px-4"><div className="text-center"><p className="text-sm font-bold uppercase tracking-wider text-sky-600">404 / Mất tín hiệu</p><h1 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">Bài viết không tồn tại</h1><Link to="/blog" className="mt-6 inline-flex rounded-xl bg-sky-600 px-5 py-3 font-bold text-white">Quay lại thư viện</Link></div></div>;

  return (
    <article ref={articleRef} className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <PostSeo post={post} />
      <div className="fixed inset-x-0 top-0 z-[60] h-0.5 bg-slate-200/50 dark:bg-white/10"><div className="h-full bg-gradient-to-r from-sky-500 to-violet-500 transition-[width] duration-150 dark:from-cyan-300 dark:to-violet-400" style={{ width: `${readingProgress}%` }} role="progressbar" aria-label="Tiến độ đọc" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(readingProgress)} /></div>

      <div className="mx-auto max-w-7xl">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:text-slate-400 dark:hover:text-cyan-300"><ArrowLeft size={18} /> Thư viện bài viết</Link>

        <header className="mx-auto max-w-5xl py-10 text-center sm:py-14">
          <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-sky-700 dark:border-cyan-300/20 dark:bg-cyan-300/5 dark:text-cyan-300">{post.category}</span>
          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.06] tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">{post.title}</h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">{post.excerpt}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-slate-500 dark:text-slate-400"><span className="font-bold text-slate-900 dark:text-white">{post.author}</span><span className="flex items-center gap-2"><Calendar size={15} />{formatDate(post.date)}</span><span className="flex items-center gap-2"><Clock size={15} />{post.readTime}</span><span className="flex items-center gap-2"><Eye size={15} />{(post.views || 0).toLocaleString('vi-VN')} lượt xem</span><button type="button" onClick={handleShare} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 font-bold transition hover:border-sky-400 hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-white/10 dark:hover:text-cyan-300"><Share2 size={15} />{shareStatus === 'copied' ? <><Check size={14} /> Đã sao chép</> : 'Chia sẻ'}</button></div>
          <p className="mt-3 min-h-5 text-xs text-rose-600 dark:text-rose-300" aria-live="polite">{shareStatus === 'error' ? 'Không thể chia sẻ. Hãy sao chép địa chỉ trên trình duyệt.' : ''}</p>
        </header>

        <figure className="mb-12 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-slate-900"><img src={post.imageUrl} alt={post.imageAlt || post.title} fetchPriority="high" decoding="async" className="max-h-[620px] w-full object-cover" />{post.imageCaption && <figcaption className="px-5 py-3 text-center text-sm text-slate-500 dark:text-slate-400">{post.imageCaption}</figcaption>}</figure>

        <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,48rem)] lg:justify-center lg:gap-14">
          {!!post.toc?.length && <aside className="lg:order-none"><nav className="rounded-2xl border border-slate-200 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.035] lg:sticky lg:top-24" aria-label="Mục lục bài viết"><p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Trong bài viết</p><ol className="space-y-1">{post.toc.map(item => <li key={item.id} className={item.level === 3 ? 'pl-4' : ''}><a href={`#${item.id}`} aria-current={activeHeading === item.id ? 'location' : undefined} className={`block border-l-2 py-1.5 pl-3 text-sm leading-5 transition ${activeHeading === item.id ? 'border-sky-500 font-bold text-sky-700 dark:border-cyan-300 dark:text-cyan-300' : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}>{item.text}</a></li>)}</ol></nav></aside>}

          <div className={post.toc?.length ? '' : 'lg:col-span-2 lg:mx-auto lg:max-w-3xl'}>
            <div className="prose prose-lg max-w-none text-slate-700 prose-headings:scroll-mt-28 prose-headings:font-display prose-headings:text-slate-950 prose-a:text-sky-700 prose-strong:text-slate-950 prose-code:text-sky-700 prose-blockquote:border-sky-500 dark:prose-invert dark:text-slate-200 dark:prose-headings:text-white dark:prose-a:text-cyan-300 dark:prose-strong:text-white dark:prose-code:text-cyan-300 dark:prose-blockquote:border-cyan-300 [&_img]:rounded-2xl [&_li]:!text-slate-700 [&_p]:!text-slate-700 dark:[&_li]:!text-slate-200 dark:[&_p]:!text-slate-200" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
            <div className="mt-12 flex flex-wrap gap-2 border-t border-slate-200 pt-8 dark:border-white/10"><span className="mr-2 flex items-center gap-2 text-sm text-slate-500"><Tag size={16} /> Chủ đề</span>{post.tags.map(tag => <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">#{tag}</span>)}</div>
          </div>
        </div>

        {!!post.relatedPosts?.length && <section className="mt-20 border-t border-slate-200 pt-12 dark:border-white/10" aria-labelledby="related-title"><p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-700 dark:text-cyan-300">Tín hiệu tiếp theo</p><h2 id="related-title" className="mt-2 font-display text-3xl font-bold text-slate-950 dark:text-white">Bài viết liên quan</h2><div className="mt-7 grid gap-5 md:grid-cols-3">{post.relatedPosts.map(related => <Link key={related.id} to={`/blog/${encodeURIComponent(related.id)}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-white/10 dark:bg-slate-900/70"><img src={related.imageUrl} alt="" loading="lazy" decoding="async" className="h-40 w-full object-cover transition duration-500 group-hover:scale-[1.03]" /><div className="p-5"><p className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-cyan-300">{related.category}</p><h3 className="mt-2 line-clamp-2 font-display text-lg font-bold text-slate-950 group-hover:text-sky-700 dark:text-white dark:group-hover:text-cyan-300">{related.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{related.excerpt}</p></div></Link>)}</div></section>}
      </div>

      {readingProgress > 20 && <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-5 right-5 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-white shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:bg-cyan-300 dark:text-slate-950" aria-label="Lên đầu trang"><ArrowUp size={18} /></button>}
    </article>
  );
};

export default PostDetail;
