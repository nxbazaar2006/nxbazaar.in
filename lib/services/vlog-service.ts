import db from "@/lib/db";
import type { PostQueryFilters, PostStatus, VlogItem } from "@/types/blog";

// Type-safe accessor for dynamically generated Prisma model
const prisma = db as any;

export function formatVideoEmbedUrl(url: string): string {
  if (!url) return "";
  if (url.includes("youtube.com/watch?v=")) {
    const videoId = url.split("v=")[1]?.split("&")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1]?.split("?")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes("vimeo.com/")) {
    const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
    return `https://player.vimeo.com/video/${videoId}`;
  }
  return url;
}

export async function getVlogs(filters: PostQueryFilters = {}): Promise<{
  vlogs: VlogItem[];
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

  if (!prisma.vlog) {
    return { vlogs: [], total: 0, totalPages: 0 };
  }

  const total = await prisma.vlog.count({ where });

  const vlogs = await prisma.vlog.findMany({
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
    vlogs: vlogs as unknown as VlogItem[],
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getVlogBySlug(slug: string): Promise<VlogItem | null> {
  if (!prisma.vlog) return null;

  const vlog = await prisma.vlog.findUnique({
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

  if (vlog) {
    await prisma.vlog.update({
      where: { id: vlog.id },
      data: { viewCount: { increment: 1 } },
    });
  }

  return vlog as unknown as VlogItem | null;
}

export async function createVlog(
  data: {
    title: string;
    slug: string;
    videoUrl: string;
    thumbnailUrl?: string;
    description?: string;
    content?: string;
    seoTitle?: string;
    seoDescription?: string;
    status?: PostStatus;
    categoryId?: string;
    productId?: string;
    duration?: string;
    isFeatured?: boolean;
    isTrending?: boolean;
  },
  authorId: string
): Promise<VlogItem> {
  const formattedVideoUrl = formatVideoEmbedUrl(data.videoUrl);

  const vlog = await prisma.vlog.create({
    data: {
      ...data,
      videoUrl: formattedVideoUrl,
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

  return vlog as unknown as VlogItem;
}

export async function updateVlog(
  id: string,
  data: Partial<{
    title: string;
    slug: string;
    videoUrl: string;
    thumbnailUrl: string;
    description: string;
    content: string;
    seoTitle: string;
    seoDescription: string;
    status: PostStatus;
    categoryId: string;
    productId: string;
    duration: string;
    isFeatured: boolean;
    isTrending: boolean;
  }>
): Promise<VlogItem> {
  const updateData = { ...data };
  if (updateData.videoUrl) {
    updateData.videoUrl = formatVideoEmbedUrl(updateData.videoUrl);
  }

  const vlog = await prisma.vlog.update({
    where: { id },
    data: updateData,
    include: {
      category: true,
      tags: true,
    },
  });

  return vlog as unknown as VlogItem;
}

export async function deleteVlog(id: string): Promise<void> {
  await prisma.vlog.delete({
    where: { id },
  });
}

export async function bulkUpdateVlogStatus(
  ids: string[],
  status: PostStatus
): Promise<number> {
  const result = await prisma.vlog.updateMany({
    where: { id: { in: ids } },
    data: { status },
  });

  return result.count;
}

export async function bulkDeleteVlogs(ids: string[]): Promise<number> {
  const result = await prisma.vlog.deleteMany({
    where: { id: { in: ids } },
  });

  return result.count;
}
