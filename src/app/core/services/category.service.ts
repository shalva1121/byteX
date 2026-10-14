import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiCategory, Category } from '../models/category.model';
import { SHOP_API_BASE_URL } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = SHOP_API_BASE_URL;

  getCategories(): Observable<Category[]> {
    return this.http
      .get<ApiCategory[] | { items?: ApiCategory[]; data?: ApiCategory[]; results?: ApiCategory[] }>(
        `${this.baseUrl}/categories`,
      )
      .pipe(
        map((res) => this.extractList(res)),
        map((list) => list.map((item) => this.normalize(item))),
      );
  }

  private extractList(
    res: ApiCategory[] | { items?: ApiCategory[]; data?: ApiCategory[]; results?: ApiCategory[] } | null | undefined,
  ): ApiCategory[] {
    if (Array.isArray(res)) {
      return res;
    }
    if (Array.isArray(res?.items)) {
      return res.items;
    }
    if (Array.isArray(res?.data)) {
      return res.data;
    }
    if (Array.isArray(res?.results)) {
      return res.results;
    }
    return [];
  }

  private normalize(raw: ApiCategory): Category {
    return {
      id: raw.id ?? raw.categoryId ?? crypto.randomUUID(),
      name: raw.name ?? raw.title ?? raw.categoryName ?? 'Category',
      productCount: raw.productCount ?? raw.productsCount ?? raw.count ?? raw.totalProducts ?? 0,
      imageUrl: raw.imageUrl ?? raw.image ?? raw.icon ?? null,
    };
  }
}
