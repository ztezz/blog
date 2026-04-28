
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Share2, Tag } from 'lucide-react';
import { getPostById } from '../utils/storage';
import { BlogPost } from '../types';

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

  return (
    <article className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
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
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-sky-600 dark:text-gray-400 dark:hover:text-white">
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* Featured Image */}
        <div className="mb-12 rounded-xl overflow-hidden shadow-xl shadow-slate-200 dark:shadow-space-neon/10 border border-slate-200 dark:border-white/10">
          <img src={post.imageUrl} alt={post.title} className="w-full h-auto object-cover max-h-[500px]" />
        </div>

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
          dangerouslySetInnerHTML={{ __html: post.content }} 
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
      </div>
    </article>
  );
};

export default PostDetail;
