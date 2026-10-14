export interface ProductFilterParams {
  categoryId: number | string | null;
  brand: string | null;
  minRating: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  inStock: boolean;
  sortBy: string | null;
  sortDescending: boolean;
  take: number;
  page: number;
}

export const DEFAULT_FILTERS: ProductFilterParams = {
  categoryId: null,
  brand: null,
  minRating: null,
  minPrice: null,
  maxPrice: null,
  inStock: false,
  sortBy: null,
  sortDescending: false,
  take: 12,
  page: 1,
};

export interface SortOption {
  label: string;
  sortBy: string;
  sortDescending: boolean;
}

export const SORT_OPTIONS: SortOption[] = [
  { label: 'Price: Low to High', sortBy: 'low', sortDescending: false },
  { label: 'Price: High to Low', sortBy: 'high', sortDescending: true },
  { label: 'Name: A-Z', sortBy: 'name', sortDescending: false },
  { label: 'Top Rated', sortBy: 'rating', sortDescending: true },
  { label: 'Newest', sortBy: 'newest', sortDescending: true },
];

export const PAGE_SIZE_OPTIONS = [12, 24, 48];

export interface PagedProducts {
  items: import('./product.model').Product[];
  total: number;
}
