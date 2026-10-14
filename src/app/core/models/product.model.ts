export interface ApiProduct {
  id?: number | string;
  productId?: number | string;
  name?: string;
  title?: string;
  productName?: string;
  price?: number;
  unitPrice?: number;
  cost?: number;
  rating?: number;
  averageRating?: number;
  avgRating?: number;
  ratingAverage?: number;
  stars?: number;
  categoryName?: string;
  category?: { name?: string } | string;
  brand?: string;
  brandName?: string;
  manufacturer?: string;
  imageUrl?: string;
  image?: string;
  images?: Array<string | { url?: string }>;
  inStock?: boolean;
  isInStock?: boolean;
  stock?: number;
  stockQuantity?: number;
  quantity?: number;
  availableQuantity?: number;
  isAvailable?: boolean;
  [key: string]: unknown;
}

export interface Product {
  id: number | string;
  name: string;
  price: number;
  rating: number;
  category: string;
  brand: string;
  imageUrl: string | null;
  inStock: boolean;
}
