
import { BlogPost, SiteSettings, User, ContactMessage, Category } from '../types';
import { BLOG_POSTS as INITIAL_POSTS, CATEGORIES as INITIAL_CATEGORIES } from '../constants';

// --- Configuration ---
// Set to true to use the Real API. 
const USE_API = true; 
const API_URL = '/api';

const STORAGE_KEY = 'cosmogis_posts';
const AUTH_KEY = 'cosmogis_auth_user'; 
const USER_KEY = 'cosmogis_users';
const SETTINGS_KEY = 'cosmogis_settings';
const CAT_KEY = 'cosmogis_categories';

const DEFAULT_SETTINGS: SiteSettings = {
  siteNamePrefix: 'COSMO',
  siteNameSuffix: 'GIS',
  pageTitle: 'CosmoGIS - Bản Đồ Của Vũ Trụ',
  logoUrl: '',
  faviconUrl: '',
  footerDescription: 'Khám phá vũ trụ thông qua lăng kính dữ liệu không gian.',
  footerCopyright: '© 2023 CosmoGIS.',
  navigation: [
    { id: 'home', label: 'Trang Chủ', path: '/', isExternal: false },
    { id: 'blog', label: 'Bài Viết', path: '/blog', isExternal: false },
    { id: 'about', label: 'Giới Thiệu', path: '/about', isExternal: false },
    { id: 'contact', label: 'Liên Hệ', path: '/contact', isExternal: false }
  ],
  socialLinks: { facebook: '#', twitter: '#', linkedin: '#' },
  aboutContent: '',
  contactContent: ''
};

// --- Helper Functions ---
export const calculateReadTime = (content: string): string => {
  const text = content.replace(/<[^>]*>?/gm, '');
  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  const minutes = Math.ceil(wordCount / 200);
  return wordCount === 0 ? '0 phút' : `${minutes} phút`;
};

// --- API Client Helpers ---
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, options);
  
  const contentType = res.headers.get("content-type");
  if (!contentType || contentType.indexOf("application/json") === -1) {
    const text = await res.text();
    console.error(`API Error (${res.status}): Received non-JSON response`, text.substring(0, 100));
    throw new Error(`API returned invalid format: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || `API Error: ${res.statusText}`);
  }
  
  return data;
}

// --- Upload Helper ---
export const uploadImage = async (file: File): Promise<string> => {
  if (USE_API) {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.url; 
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// --- Categories Logic (New) ---
export const getCategories = async (): Promise<Category[]> => {
  if (USE_API) {
    try {
      return await fetchApi<Category[]>('/categories');
    } catch(e) {
      console.error(e);
      // Fallback
      return INITIAL_CATEGORIES.filter(c => c.id !== 'all');
    }
  }
  const data = localStorage.getItem(CAT_KEY);
  return data ? JSON.parse(data) : INITIAL_CATEGORIES.filter(c => c.id !== 'all');
}

export const saveCategory = async (cat: Category): Promise<void> => {
  if (USE_API) {
    await fetchApi('/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat)
    });
    return;
  }
  const cats = await getCategories();
  const index = cats.findIndex(c => c.id === cat.id);
  if (index >= 0) cats[index] = cat;
  else cats.push(cat);
  localStorage.setItem(CAT_KEY, JSON.stringify(cats));
}

export const deleteCategory = async (id: string): Promise<void> => {
  if (USE_API) {
    await fetchApi(`/categories/${id}`, { method: 'DELETE' });
    return;
  }
  const cats = await getCategories();
  const newCats = cats.filter(c => c.id !== id);
  localStorage.setItem(CAT_KEY, JSON.stringify(newCats));
}

// --- Posts Logic ---
export const getPosts = async (): Promise<BlogPost[]> => {
  if (USE_API) {
    try {
      return await fetchApi<BlogPost[]>('/posts');
    } catch (e) {
      console.error("Failed to fetch posts from API, falling back to empty", e);
      return [];
    }
  }
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : INITIAL_POSTS;
};

export const getPostById = async (id: string): Promise<BlogPost | undefined> => {
  if (USE_API) {
    try {
      return await fetchApi<BlogPost>(`/posts/${id}`);
    } catch (e) {
      return undefined;
    }
  }
  const posts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  return posts.find((p: BlogPost) => p.id === id);
};

export const savePost = async (post: BlogPost): Promise<void> => {
  const postToSave = { ...post, readTime: calculateReadTime(post.content) };
  if (USE_API) {
    await fetchApi('/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postToSave)
    });
    return;
  }
  const posts = await getPosts();
  const existingIndex = posts.findIndex(p => p.id === postToSave.id);
  if (existingIndex >= 0) posts[existingIndex] = postToSave;
  else posts.unshift(postToSave);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
};

export const deletePost = async (id: string): Promise<void> => {
  if (USE_API) {
    await fetchApi(`/posts/${id}`, { method: 'DELETE' });
    return;
  }
  const posts = await getPosts();
  const newPosts = posts.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newPosts));
};

// --- Settings Logic ---
export const getSettings = async (): Promise<SiteSettings> => {
  if (USE_API) {
    try {
      return await fetchApi<SiteSettings>('/settings');
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  }
  const data = localStorage.getItem(SETTINGS_KEY);
  return data ? JSON.parse(data) : DEFAULT_SETTINGS;
};

export const saveSettings = async (settings: SiteSettings): Promise<void> => {
  if (USE_API) {
    await fetchApi('/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return;
  }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

// --- User Management Logic ---
export const getUsers = async (): Promise<User[]> => {
  if (USE_API) {
    return await fetchApi<User[]>('/users');
  }
  return JSON.parse(localStorage.getItem(USER_KEY) || '[]');
};

export const saveUser = async (user: User): Promise<void> => {
  if (USE_API) {
    await fetchApi('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    return;
  }
  const users = await getUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index >= 0) users[index] = user;
  else users.push(user);
  localStorage.setItem(USER_KEY, JSON.stringify(users));
};

export const deleteUser = async (id: string): Promise<void> => {
  if (USE_API) {
    await fetchApi(`/users/${id}`, { method: 'DELETE' });
    return;
  }
  const users = await getUsers();
  if (users.length <= 1) return;
  const newUsers = users.filter(u => u.id !== id);
  localStorage.setItem(USER_KEY, JSON.stringify(newUsers));
};

// --- Messages Logic (New) ---
export const sendMessage = async (data: { name: string, email: string, subject: string, message: string }): Promise<void> => {
  if (USE_API) {
    await fetchApi('/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return;
  }
  console.log("Mock message sent:", data);
};

export const getMessages = async (): Promise<ContactMessage[]> => {
  if (USE_API) {
    try {
      return await fetchApi<ContactMessage[]>('/messages');
    } catch(e) {
      console.error(e);
      return [];
    }
  }
  return [];
};

export const deleteMessage = async (id: number): Promise<void> => {
  if (USE_API) {
    await fetchApi(`/messages/${id}`, { method: 'DELETE' });
  }
};

// --- Auth Logic ---
export const login = async (username: string, password: string): Promise<boolean> => {
  if (USE_API) {
    try {
      const user = await fetchApi<User>('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      return true;
    } catch (e) {
      return false;
    }
  }
  
  const users = await getUsers();
  const validUser = users.find(u => u.username === username && u.password === password);
  if (validUser) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(validUser));
    return true;
  }
  return false;
};

export const logout = (): void => {
  localStorage.removeItem(AUTH_KEY);
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(AUTH_KEY);
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(AUTH_KEY);
  return data ? JSON.parse(data) : null;
};
