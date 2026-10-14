import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/product.service';
import { Category } from '../../core/models/category.model';
import { Product } from '../../core/models/product.model';
import { DEFAULT_FILTERS, PAGE_SIZE_OPTIONS, SORT_OPTIONS, SortOption } from '../../core/models/filter.model';

const ICON_COLORS = ['var(--icon-blue-1)', 'var(--icon-blue-2)', 'var(--icon-blue-3)', 'var(--icon-blue-4)'];

@Component({
  selector: 'app-shop',
  imports: [CommonModule, FormsModule],
  templateUrl: './shop.html',
  styleUrl: './shop.css',
})
export class Shop {
  private readonly categoryService = inject(CategoryService);
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);

  protected readonly sortOptions = SORT_OPTIONS;
  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  protected readonly ratingOptions = [4, 3, 2, 1];

  protected readonly categories = signal<Category[]>([]);
  protected readonly categoriesLoading = signal(true);

  protected readonly brands = signal<string[]>([]);
  protected readonly brandsLoading = signal(true);

  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly total = signal(0);
  protected readonly searchQuery = signal('');

  // ---- Filter state (bound directly from the template via ngModel) ----
  protected selectedCategoryId: number | string | null = DEFAULT_FILTERS.categoryId;
  protected selectedBrand: string | null = DEFAULT_FILTERS.brand;
  protected selectedMinRating: number | null = DEFAULT_FILTERS.minRating;
  protected minPrice: number | null = DEFAULT_FILTERS.minPrice;
  protected maxPrice: number | null = DEFAULT_FILTERS.maxPrice;
  protected inStockOnly = DEFAULT_FILTERS.inStock;
  protected selectedSort: SortOption = SORT_OPTIONS[0];
  protected pageSize = DEFAULT_FILTERS.take;
  protected page = 1;

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize)));

  constructor() {
    this.loadCategories();
    this.loadBrands();
    this.route.queryParamMap.subscribe((params) => {
      this.searchQuery.set(params.get('query')?.trim() ?? '');
      const categoryId = params.get('categoryId');
      this.selectedCategoryId = categoryId ? categoryId : null;
      this.page = 1;
      this.loadProducts();
    });
  }

  private loadCategories(): void {
    this.categoriesLoading.set(true);
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.categoriesLoading.set(false);
      },
      error: () => this.categoriesLoading.set(false),
    });
  }

  
  private loadBrands(): void {
    this.brandsLoading.set(true);
    this.productService.getProducts(1000, 1).subscribe({
      next: (products) => {
        const distinct = Array.from(new Set(products.map((p) => p.brand).filter((b): b is string => !!b)));
        distinct.sort((a, b) => a.localeCompare(b));
        this.brands.set(distinct);
        this.brandsLoading.set(false);
      },
      error: () => this.brandsLoading.set(false),
    });
  }

  protected loadProducts(): void {
    this.loading.set(true);
    this.error.set(false);

    if (this.searchQuery()) {
      this.productService.getSearchProducts(this.searchQuery()).subscribe({
        next: ({ items, total }) => {
          this.products.set(items);
          this.total.set(total);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to search products', err);
          this.error.set(true);
          this.loading.set(false);
        },
      });
      return;
    }

    this.productService
      .getFilteredProducts({
        categoryId: this.selectedCategoryId,
        brand: this.selectedBrand,
        minRating: this.selectedMinRating,
        minPrice: this.minPrice,
        maxPrice: this.maxPrice,
        inStock: this.inStockOnly,
        sortBy: this.selectedSort.sortBy,
        sortDescending: this.selectedSort.sortDescending,
        take: this.pageSize,
        page: this.page,
      })
      .subscribe({
        next: ({ items, total }) => {
          this.products.set(items);
          this.total.set(total);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to load products', err);
          this.error.set(true);
          this.loading.set(false);
        },
      });
  }


  protected selectCategory(id: number | string | null): void {
    this.selectedCategoryId = this.selectedCategoryId === id ? null : id;
    this.applyFilters();
  }

  protected selectBrand(brand: string | null): void {
    this.selectedBrand = this.selectedBrand === brand ? null : brand;
    this.applyFilters();
  }

  protected selectMinRating(rating: number | null): void {
    this.selectedMinRating = this.selectedMinRating === rating ? null : rating;
    this.applyFilters();
  }

  protected onSortChange(sortByValue: string): void {
    const option = this.sortOptions.find((o) => o.sortBy === sortByValue);
    if (option) {
      this.selectedSort = option;
      this.applyFilters();
    }
  }

  protected onPageSizeChange(): void {
    this.applyFilters();
  }

  protected applyFilters(): void {
    this.page = 1;
    this.loadProducts();
  }

  protected resetFilters(): void {
    this.selectedCategoryId = null;
    this.selectedBrand = null;
    this.selectedMinRating = null;
    this.minPrice = null;
    this.maxPrice = null;
    this.inStockOnly = false;
    this.selectedSort = SORT_OPTIONS[0];
    this.applyFilters();
  }


  protected goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.page) {
      return;
    }
    this.page = page;
    this.loadProducts();
  }

  protected get pageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.page;
    const window = 2;
    const start = Math.max(1, current - window);
    const end = Math.min(total, current + window);
    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }


  protected iconColor(index: number): string {
    return ICON_COLORS[index % ICON_COLORS.length];
  }

  protected ratingStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => (i < Math.round(rating) ? 1 : 0));
  }

  protected ratingValue(rating: number): string {
    return rating.toFixed(1);
  }
}
