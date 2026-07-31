export type PostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type BlogCategoryItem = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type BlogTagItem = {
  id: string;
  name: string;
  slug: string;
  createdAt?: Date | string;
};

export type BlogItem = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  content?: string | null;
  imageUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  status: PostStatus;
  viewCount: number;
  readingTime: number;
  isFeatured: boolean;
  isTrending: boolean;
  authorId: string;
  author?: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  } | null;
  categoryId?: string | null;
  category?: BlogCategoryItem | null;
  productId?: string | null;
  product?: {
    id: string;
    title: string;
    slug: string;
    imageUrl?: string | null;
    salePrice?: number;
  } | null;
  tags?: BlogTagItem[];
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type VlogItem = {
  id: string;
  title: string;
  slug: string;
  videoUrl: string;
  thumbnailUrl?: string | null;
  description?: string | null;
  content?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  status: PostStatus;
  viewCount: number;
  duration?: string | null;
  isFeatured: boolean;
  isTrending: boolean;
  authorId: string;
  author?: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  } | null;
  categoryId?: string | null;
  category?: BlogCategoryItem | null;
  productId?: string | null;
  product?: {
    id: string;
    title: string;
    slug: string;
    imageUrl?: string | null;
    salePrice?: number;
  } | null;
  tags?: BlogTagItem[];
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type PostQueryFilters = {
  search?: string;
  category?: string;
  tag?: string;
  status?: PostStatus;
  authorId?: string;
  productId?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "viewCount" | "title";
  sortOrder?: "asc" | "desc";
};
