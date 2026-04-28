import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }),
  },
  timeout: 10000, // 10 second timeout
});

export interface Article {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  reading_time: number;
  cover_image?: {
    url: string;
    alternativeText?: string;
  };
  category?: {
    name: string;
    slug: string;
  };
  locale: string;
}

export type HeroSection = {
  __component: 'sections.hero';
  eyebrow?: string;
  title_line1?: string;
  title_line2?: string;
  subtitle?: string;
  cta_text?: string;
  cta_link?: string;
  layout?: 'left' | 'centered';
  padding_top?: number;
  padding_bottom?: number;
};

export type IntroSection = {
  __component: 'sections.intro';
  label?: string;
  heading_zh?: string;
  heading_en?: string;
  body?: string;
  link_text?: string;
  link_url?: string;
  background_image_url?: string;
  layout?: 'image-left' | 'image-right' | 'text-only' | 'text-centered';
  min_height?: number;
  padding_top?: number;
  padding_bottom?: number;
};

export type ArticleGridSection = {
  __component: 'sections.article-grid';
  title_prefix?: string;
  title_highlight?: string;
  article_count?: number;
  view_all_text?: string;
  layout?: '3-col' | '2-col' | 'list';
  padding_top?: number;
  padding_bottom?: number;
};

export type ContactBandSection = {
  __component: 'sections.contact-band';
  heading_line1?: string;
  heading_line2?: string;
  description?: string;
  email?: string;
  instagram?: string;
  wechat?: string;
  padding_top?: number;
  padding_bottom?: number;
};

export type FeaturedArticleSection = {
  __component: 'sections.featured-article';
  label?: string;
  layout?: 'image-left' | 'image-right';
  padding_top?: number;
  padding_bottom?: number;
};

export type QuoteSection = {
  __component: 'sections.quote';
  quote?: string;
  attribution?: string;
  layout?: 'dark' | 'light' | 'gold';
  padding_top?: number;
  padding_bottom?: number;
};

export type BannerSection = {
  __component: 'sections.banner';
  heading?: string;
  subtitle?: string;
  cta_text?: string;
  cta_link?: string;
  background_image_url?: string;
  overlay_opacity?: number;
  layout?: 'left' | 'centered';
  min_height?: number;
  padding_top?: number;
  padding_bottom?: number;
};

export type PageSection = HeroSection | IntroSection | ArticleGridSection | ContactBandSection | FeaturedArticleSection | QuoteSection | BannerSection;

export interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description?: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    pagination?: PaginationMeta;
  };
}

// 获取文章列表
export async function getArticles(locale: string = 'en', page: number = 1, pageSize: number = 9) {
  try {
    const response = await api.get<ApiResponse<Article[]>>('/articles', {
      params: {
        locale,
        'populate': '*',
        'pagination[page]': page,
        'pagination[pageSize]': pageSize,
        'sort[0]': 'publishedAt:desc',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching articles:', error);
    return { data: [], meta: { pagination: { page: 1, pageSize, pageCount: 0, total: 0 } } };
  }
}

// 获取单篇文章
export async function getArticleBySlug(slug: string, locale: string = 'en') {
  try {
    const response = await api.get<ApiResponse<Article[]>>('/articles', {
      params: {
        locale,
        'filters[slug][$eq]': slug,
        'populate': '*',
      },
    });
    return response.data.data[0] || null;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

// 获取分类列表
export async function getCategories(locale: string = 'en') {
  try {
    const response = await api.get<ApiResponse<Category[]>>('/categories', {
      params: {
        locale,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// 根据分类获取文章
export async function getArticlesByCategory(categorySlug: string, locale: string = 'en', page: number = 1, pageSize: number = 9) {
  try {
    const response = await api.get<ApiResponse<Article[]>>('/articles', {
      params: {
        locale,
        'filters[category][slug][$eq]': categorySlug,
        'populate': '*',
        'pagination[page]': page,
        'pagination[pageSize]': pageSize,
        'sort[0]': 'publishedAt:desc',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching articles by category:', error);
    return { data: [], meta: { pagination: { page: 1, pageSize, pageCount: 0, total: 0 } } };
  }
}

// 获取首页 Dynamic Zone 布局
export async function getHomepage(locale: string = 'en'): Promise<PageSection[] | null> {
  try {
    const response = await api.get('/homepage', {
      params: { locale, populate: 'sections' },
    });
    return response.data?.data?.sections ?? null;
  } catch {
    return null;
  }
}

// 获取图片完整URL
export function getImageUrl(url?: string): string {
  if (!url) return '/placeholder.jpg';
  if (url.startsWith('http')) return url;
  return `${API_URL}${url}`;
}

export default api;
