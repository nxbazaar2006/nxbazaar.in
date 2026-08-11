import type { Banner, Category, Product } from "@prisma/client";

export type HomepageCategorySummary = Pick<
  Category,
  "id" | "title" | "slug" | "imageUrl"
>;

export type HomepageProduct = {
  id: Product["id"];
  title: Product["title"];
  slug: Product["slug"];
  imageUrl: Product["imageUrl"];
  salePrice: Product["salePrice"];
  productPrice: Product["productPrice"];
  productType?: Product["productType"];
  userId?: Product["userId"];
  category?: HomepageCategorySummary | Category["title"] | null;
};

export type HomepageCategory = HomepageCategorySummary & {
  products: HomepageProduct[];
};

export type HomepageBanner = Pick<Banner, "id" | "title" | "link" | "imageUrl">;
