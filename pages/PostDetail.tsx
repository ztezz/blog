
import React, { useEffect, useState } from 'react';
import { useParams, Link } from '../utils/router';
import { ArrowLeft, Calendar, Share2, Tag } from 'lucide-react';
import { getPostById } from '../utils/storage';
import { sanitizeHtml } from '../utils/sanitizeHtml';
import { BlogPost } from '../types';
import PostSeo from '../components/PostSeo';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getPostById(id).then(foundPost => {
        setPost(foundPost);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (loading || post) return;
    const robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]') || document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    if (!robots.parentNode) document.head.appendChild(robots);
    document.title = 'Bài viết không tồn tại';
  }, [loading, post]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 dark:border-cyan-400"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl text-slate-800 dark:text-white mb-4">Bài viết không tồn tại</h2>
          <Link to="/blog" className="text-sky-600 dark:text-cyan-400 hover:underline">Quay lại danh sách</Link>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    const shareData = { title: post.title, text: post.excerpt, url: window.location.href };
    if (navigator.share) await navigator.share(shareData);
    else await navigator.clipboard.writeText(window.location.href);
  };

  return (
    <article className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <PostSeo post={post} />
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link to="/blog" className="inline-flex items-center text-slate-500 hover:text-sky-600 dark:text-gray-400 dark:hover:text-cyan-400 mb-8 transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Quay lại danh sách
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 text-sm mb-4">
            <span className="uppercase tracking-wider font-bold border px-3 py-1 rounded 
              text-sky-700 bg-sky-50 border-sky-200 
              dark:text-space-neon dark:bg-space-neon/10 dark:border-space-neon/30">
              {post.category}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-8">
            <div className="flex items-center space-x-6 text-slate-700 dark:text-gray-200 text-sm">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-sky-500 dark:bg-space-purple flex items-center justify-center text-white font-bold mr-3">
                  {post.author.charAt(0)}
                </div>
                <span>{post.author}</span>
              </div>
              <div className="flex items-center">
                <Calendar size={16} className="mr-2" />
                {post.date}
              </div>
            </div>
            <button onClick={handleShare} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-sky-600 dark:text-gray-400 dark:hover:text-white" aria-label="Chia sẻ bài viết">
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* Featured Image */}
        <figure className="mb-12 overflow-hidden rounded-xl border border-slate-200 shadow-xl shadow-slate-200 dark:border-white/10 dark:shadow-space-neon/10">
          <img src={post.imageUrl} alt={post.imageAlt || post.title} className="max-h-[500px] w-full object-cover" />
          {post.imageCaption && <figcaption className="bg-slate-50 px-4 py-3 text-center text-sm text-slate-500 dark:bg-slate-900 dark:text-gray-400">{post.imageCaption}</figcaption>}
        </figure>

        {!!post.toc?.length && post.toc.length >= 2 && (
          <nav className="mb-10 rounded-xl border border-sky-200 bg-sky-50 p-5 dark:border-sky-500/20 dark:bg-sky-500/10" aria-label="Mục lục bài viết">
            <h2 className="mb-3 font-bold text-sky-900 dark:text-sky-200">Nội dung bài viết</h2>
            <ol className="space-y-2 text-sm">
              {post.toc.map(item => <li key={item.id} className={item.level === 3 ? 'pl-5' : ''}><a href={`#${item.id}`} className="text-slate-700 hover:text-sky-600 dark:text-gray-300 dark:hover:text-cyan-300">{item.text}</a></li>)}
            </ol>
          </nav>
        )}

        {/* Content */}
        <div 
          className="prose dark:prose-invert prose-lg max-w-none text-slate-700 dark:text-gray-300 mb-12
            prose-headings:text-slate-900 dark:prose-headings:text-white
            prose-a:text-sky-600 dark:prose-a:text-space-neon
            prose-strong:text-slate-900 dark:prose-strong:text-white
            prose-code:text-sky-700 dark:prose-code:text-space-neon
            prose-blockquote:border-sky-500 dark:prose-blockquote:border-space-neon
            [&_p]:!text-slate-700 dark:[&_p]:!text-gray-100
            [&_li]:!text-slate-700 dark:[&_li]:!text-gray-100
          "
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
        />

        {/* Tags */}
        <div className="flex flex-wrap gap-3 pt-8 border-t border-slate-200 dark:border-white/10">
          <span className="flex items-center text-slate-500 dark:text-gray-500 mr-2"><Tag size={18} /> Tags:</span>
          {post.tags.map(tag => (
            <span key={tag} className="px-3 py-1 rounded-full text-sm transition-colors cursor-pointer border 
              bg-slate-100 text-slate-600 border-slate-200 hover:bg-sky-100 hover:text-sky-600 hover:border-sky-300
              dark:bg-space-800 dark:text-space-neon dark:border-space-neon/20 dark:hover:bg-space-700">
              #{tag}
            </span>
          ))}
        </div>

        {!!post.relatedPosts?.length && (
          <section className="mt-12 border-t border-slate-200 pt-8 dark:border-white/10" aria-labelledby="related-title">
            <h2 id="related-title" className="mb-5 text-2xl font-bold text-slate-900 dark:text-white">Bài viết liên quan</h2>
            <div className="grid gap-5 md:grid-cols-3">
              {post.relatedPosts.map(related => <Link key={related.id} to={`/blog/${related.id}`} className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-slate-800"><img src={related.imageUrl} alt="" className="h-36 w-full object-cover" /><div className="p-4"><p className="mb-2 text-xs font-bold uppercase text-sky-600">{related.category}</p><h3 className="line-clamp-2 font-bold text-slate-900 group-hover:text-sky-600 dark:text-white">{related.title}</h3></div></Link>)}
            </div>
          </section>
        )}
      </div>
    </article>
  );
};

export default PostDetail;
