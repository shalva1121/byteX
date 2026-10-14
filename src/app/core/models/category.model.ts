export interface ApiCategory {
  id?: number | string;
  categoryId?: number | string;
  name?: string;
  title?: string;
  categoryName?: string;
  productCount?: number;
  productsCount?: number;
  count?: number;
  totalProducts?: number;
  imageUrl?: string;
  image?: string;
  icon?: string;
  [key: string]: unknown;
}

export interface Category {
  id: number | string;
  name: string;
  productCount: number;
  imageUrl: string | null;
}
