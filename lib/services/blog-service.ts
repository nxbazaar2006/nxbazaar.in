import db from "@/lib/db";
import type { BlogItem, PostQueryFilters, PostStatus } from "@/types/blog";

// Type-safe accessor for dynamically generated Prisma model
const prisma = db as any;

export async function getBlogs(filters: PostQueryFilters = {}): Promise<{
  blogs: BlogItem[];
  total: number;
  totalPages: number;
}> {
  const {
    search,
    category,
    tag,
    status = "PUBLISHED",
    authorId,
    productId,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = filters;

  const where: Record<string, unknown> = {};

  if (status) {
    where.status = status;
  }

  if (authorId) {
    where.authorId = authorId;
  }

  if (productId) {
    where.productId = productId;
  }

  if (category) {
    where.OR = [
      { categoryId: category },
      { category: { slug: category } },
    ];
  }

  if (tag) {
    where.tags = {
      some: {
        slug: tag,
      },
    };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (!prisma.blog) {
    return { blogs: [], total: 0, totalPages: 0 };
  }

  const total = await prisma.blog.count({ where });

  const blogs = await prisma.blog.findMany({
    where,
    orderBy: { [sortBy]: sortOrder },
    skip: (page - 1) * limit,
    take: limit,
    include: {
      category: true,
      tags: true,
      author: {
        select: { id: true, name: true, email: true, role: true },
      },
      product: {
        select: { id: true, title: true, slug: true, imageUrl: true, salePrice: true },
      },
    },
  });

  return {
    blogs: blogs as unknown as BlogItem[],
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getBlogBySlug(slug: string): Promise<BlogItem | null> {
  if (!prisma.blog) return null;

  const blog = await prisma.blog.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: true,
      author: {
        select: { id: true, name: true, email: true, role: true },
      },
      product: {
        select: { id: true, title: true, slug: true, imageUrl: true, salePrice: true },
      },
    },
  });

  if (blog) {
    await prisma.blog.update({
      where: { id: blog.id },
      data: { viewCount: { increment: 1 } },
    });
  }

  return blog as unknown as BlogItem | null;
}

export async function createBlog(
  data: {
    title: string;
    slug: string;
    description?: string;
    content?: string;
    imageUrl?: string;
    seoTitle?: string;
    seoDescription?: string;
    status?: PostStatus;
    categoryId?: string;
    productId?: string;
    readingTime?: number;
    isFeatured?: boolean;
    isTrending?: boolean;
  },
  authorId: string
): Promise<BlogItem> {
  const blog = await prisma.blog.create({
    data: {
      ...data,
      authorId,
    },
    include: {
      category: true,
      tags: true,
      author: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  });

  return blog as unknown as BlogItem;
}

export async function updateBlog(
  id: string,
  data: Partial<{
    title: string;
    slug: string;
    description: string;
    content: string;
    imageUrl: string;
    seoTitle: string;
    seoDescription: string;
    status: PostStatus;
    categoryId: string;
    productId: string;
    readingTime: number;
    isFeatured: boolean;
    isTrending: boolean;
  }>
): Promise<BlogItem> {
  const blog = await prisma.blog.update({
    where: { id },
    data,
    include: {
      category: true,
      tags: true,
    },
  });

  return blog as unknown as BlogItem;
}

export async function deleteBlog(id: string): Promise<void> {
  await prisma.blog.delete({
    where: { id },
  });
}

export async function bulkUpdateBlogStatus(
  ids: string[],
  status: PostStatus
): Promise<number> {
  const result = await prisma.blog.updateMany({
    where: { id: { in: ids } },
    data: { status },
  });

  return result.count;
}

export async function bulkDeleteBlogs(ids: string[]): Promise<number> {
  const result = await prisma.blog.deleteMany({
    where: { id: { in: ids } },
  });

  return result.count;
}
