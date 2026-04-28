
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { getPosts } from '../utils/storage';
import { BlogPost } from '../types';

const POSTS_PER_PAGE = 6;

const BlogList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Initial Fetch
  useEffect(() => {
    getPosts().then(posts => {
      setAllPosts(posts);
      setFilteredPosts(posts);
    });
  }, []);

  // Update active category when URL param changes
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setActiveCategory(cat);
    } else {
      setActiveCategory('all');
    }
  }, [searchParams]);

  // Filter Logic
  useEffect(() => {
    let result = allPosts;

    if (activeCategory !== 'all') {
      result = result.filter(post => post.category === activeCategory);
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(post => 
        post.title.toLowerCase().includes(lowerQuery) || 
        post.excerpt.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredPosts(result);
    setCurrentPage(1); // Reset to page 1 on filter change
  }, [activeCategory, searchQuery, allPosts]);

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    if (catId === 'all') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: catId });
    }
  };

  // Pagination Logic
  const indexOfLastPost = currentPage * POSTS_PER_PAGE;
  const indexOfFirstPost = indexOfLastPost - POSTS_PER_PAGE;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-space-neon to-space-purple mb-4">Kho Tàng Kiến Thức</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Cập nhật những bài viết mới nhất về công nghệ bản đồ, vệ tinh và nghiên cứu vũ trụ.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-center gap-6 bg-white/5 p-6 rounded-xl border border-white/10 backdrop-blur-sm">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-space-neon text-space-900 shadow-[0_0_10px_rgba(102,252,241,0.4)]'
                    : 'bg-space-800 text-gray-300 hover:bg-white/10'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-auto min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-space-900 border border-white/20 rounded-full py-2 pl-10 pr-4 text-white focus:outline-none focus:border-space-neon focus:ring-1 focus:ring-space-neon transition-all"
            />
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentPosts.length > 0 ? (
            currentPosts.map((post) => (
              <Link to={`/blog/${post.id}`} key={post.id} className="group flex flex-col h-full">
                <div className="bg-space-800/50 border border-white/10 rounded-xl overflow-hidden hover:border-space-neon/40 hover:bg-space-800 transition-all duration-300 h-full flex flex-col">
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={post.imageUrl} 
                      alt={post.title} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-space-900 via-transparent to-transparent opacity-60"></div>
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex items-center justify-between text-xs text-space-light mb-4">
                      <span className="flex items-center"><Calendar size={12} className="mr-1"/> {post.date}</span>
                      <span className="flex items-center"><Clock size={12} className="mr-1"/> {post.readTime}</span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-3 group-hover:text-space-neon transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-grow">
                      {post.excerpt}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {post.tags.map(tag => (
                        <span key={tag} className="text-xs bg-white/5 text-gray-300 px-2 py-1 rounded border border-white/5">#{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-20 text-gray-500">
              <Filter className="mx-auto mb-4 opacity-50" size={48} />
              <p className="text-xl">Không tìm thấy bài viết nào phù hợp.</p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-16 space-x-2">
            <button 
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border transition-colors ${currentPage === 1 ? 'border-white/10 text-gray-600 cursor-not-allowed' : 'border-white/20 text-white hover:bg-white/10 hover:text-space-neon hover:border-space-neon/50'}`}
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex space-x-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`w-10 h-10 rounded-lg border font-bold transition-all ${
                    currentPage === i + 1
                      ? 'bg-space-neon border-space-neon text-space-900 shadow-[0_0_10px_rgba(102,252,241,0.4)]'
                      : 'bg-transparent border-white/20 text-white hover:bg-white/10 hover:border-space-neon/50 hover:text-space-neon'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button 
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg border transition-colors ${currentPage === totalPages ? 'border-white/10 text-gray-600 cursor-not-allowed' : 'border-white/20 text-white hover:bg-white/10 hover:text-space-neon hover:border-space-neon/50'}`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;
