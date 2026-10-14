import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiProduct, Product } from '../models/product.model';
import { PagedProducts, ProductFilterParams } from '../models/filter.model';
import { SHOP_API_BASE_URL } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = SHOP_API_BASE_URL;

  getProducts(take = 1000, page = 1): Observable<Product[]> {
    const params = new HttpParams().set('Take', take).set('Page', page);

    return this.http
      .get<ApiProduct[] | { items?: ApiProduct[]; data?: ApiProduct[]; results?: ApiProduct[] }>(
        `${this.baseUrl}/products`,
        { params },
      )
      .pipe(
        map((res) => this.extractList(res)),
        map((list) => list.map((item) => this.normalize(item))),
      );
  }

  getBestSellers(take = 8, page = 1): Observable<Product[]> {
    return this.getProducts(1000, page).pipe(
      map((products) => [...products].sort((a, b) => b.rating - a.rating).slice(0, take)),
    );
  }

  /** Search the catalog using the API's dedicated search endpoint. */
  getSearchProducts(query: string): Observable<PagedProducts> {
    const params = new HttpParams()
      .set('query', query)
      .set('Take', 100000)
      .set('Page', 1);

    return this.http
      .get<
        | ApiProduct[]
        | {
            items?: ApiProduct[];
            data?: ApiProduct[] | { items?: ApiProduct[]; total?: number; totalCount?: number; totalItems?: number; totalRecords?: number; totalPages?: number };
            results?: ApiProduct[];
            total?: number;
            totalCount?: number;
            totalItems?: number;
            totalRecords?: number;
            totalPages?: number;
          }
      >(`${this.baseUrl}/products/search`, { params })
      .pipe(map((res) => this.normalizeFilterResponse(res, 100000)));
  }

  getFilteredProducts(filters: ProductFilterParams): Observable<PagedProducts> {
    let params = new HttpParams().set('Take', filters.take).set('Page', filters.page);

    if (filters.categoryId !== null && filters.categoryId !== '') {
      params = params.set('CategoryId', filters.categoryId);
    }
    if (filters.brand) {
      params = params.set('Brand', filters.brand);
    }
    if (filters.minRating !== null) {
      params = params.set('MinRating', filters.minRating);
    }
    if (filters.minPrice !== null) {
      params = params.set('MinPrice', filters.minPrice);
    }
    if (filters.maxPrice !== null) {
      params = params.set('MaxPrice', filters.maxPrice);
    }
    if (filters.inStock) {
      params = params.set('InStock', true);
    }
    if (filters.sortBy) {
      params = params.set('SortBy', filters.sortBy);
      params = params.set('SortDescending', filters.sortDescending);
    }

    return this.http
      .get<
        | ApiProduct[]
        | {
            items?: ApiProduct[];
            data?: ApiProduct[] | { items?: ApiProduct[] };
            results?: ApiProduct[];
            total?: number;
            totalCount?: number;
            totalItems?: number;
            totalRecords?: number;
            totalPages?: number;
          }
      >(`${this.baseUrl}/products/filter`, { params })
      .pipe(map((res) => this.normalizeFilterResponse(res, filters.take)));
  }

  private normalizeFilterResponse(
    res:
      | ApiProduct[]
      | {
          items?: ApiProduct[];
          data?: ApiProduct[] | { items?: ApiProduct[]; total?: number; totalCount?: number; totalItems?: number; totalRecords?: number; totalPages?: number };
          results?: ApiProduct[];
          total?: number;
          totalCount?: number;
          totalItems?: number;
          totalRecords?: number;
          totalPages?: number;
        }
      | null
      | undefined,
    take: number,
  ): PagedProducts {
    const list = this.extractList(res);
    const items = list.map((item) => this.normalize(item));

    const nestedData = !Array.isArray(res) && !Array.isArray(res?.data) ? res?.data : undefined;
    const totalFromApi = Array.isArray(res)
      ? undefined
      : (res?.total ?? res?.totalCount ?? res?.totalItems ?? res?.totalRecords ?? nestedData?.total ?? nestedData?.totalCount ?? nestedData?.totalItems ?? nestedData?.totalRecords);
    const totalFromPages =
      !Array.isArray(res) && (res?.totalPages ?? nestedData?.totalPages)
        ? (res?.totalPages ?? nestedData?.totalPages)! * take
        : undefined;


    const total = totalFromApi ?? totalFromPages ?? items.length;

    return { items, total };
  }

  private extractList(
    res: ApiProduct[] | { items?: ApiProduct[]; data?: ApiProduct[] | { items?: ApiProduct[] }; results?: ApiProduct[] } | null | undefined,
  ): ApiProduct[] {
    if (Array.isArray(res)) {
      return res;
    }

    if (Array.isArray(res?.items)) {
      return res.items;
    }

    if (Array.isArray(res?.data)) {
      return res.data;
    }

    if (Array.isArray((res as { data?: { items?: ApiProduct[] } } | null | undefined)?.data?.items)) {
      return (res as { data: { items: ApiProduct[] } }).data.items;
    }

    if (Array.isArray(res?.results)) {
      return res.results;
    }

    return [];
  }

  private normalize(raw: ApiProduct): Product {
    const category = typeof raw.category === 'string' ? raw.category : raw.category?.name;

    return {
      id: raw.id ?? raw.productId ?? crypto.randomUUID(),
      name: raw.name ?? raw.title ?? raw.productName ?? 'Product',
      price: Number(raw.price ?? raw.unitPrice ?? raw.cost ?? 0),
      rating: Number(raw.rating ?? raw.averageRating ?? raw.avgRating ?? raw.ratingAverage ?? raw.stars ?? 0),
      category: category ?? raw.categoryName ?? '',
      brand: raw.brand ?? raw.brandName ?? raw.manufacturer ?? '',
      imageUrl: this.firstImage(raw),
      inStock: this.isInStock(raw),
    };
  }

  private isInStock(raw: ApiProduct): boolean {
    if (typeof raw.inStock === 'boolean') {
      return raw.inStock;
    }
    if (typeof raw.isInStock === 'boolean') {
      return raw.isInStock;
    }
    if (typeof raw.isAvailable === 'boolean') {
      return raw.isAvailable;
    }

    const quantity = raw.stock ?? raw.stockQuantity ?? raw.quantity ?? raw.availableQuantity;
    return typeof quantity === 'number' ? quantity > 0 : true;
  }

  private firstImage(raw: ApiProduct): string | null {
    if (raw.imageUrl) {
      return raw.imageUrl;
    }
    if (raw.image) {
      return raw.image;
    }
    if (Array.isArray(raw.images) && raw.images.length > 0) {
      const first = raw.images[0];
      return typeof first === 'string' ? first : (first?.url ?? null);
    }
    return null;
  }
}
