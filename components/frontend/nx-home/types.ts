export type NxHomeCategory = {
  id: string;
  title: string;
  slug: string | null;
  imageUrl: string | null;
};

export type NxHomeProduct = {
  id: string;
  title: string;
  slug: string | null;
  imageUrl: string | null;
  salePrice: number | null;
  productPrice: number | null;
  categoryName: string | null;
};
