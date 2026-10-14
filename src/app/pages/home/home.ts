import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/product.service';
import { Category } from '../../core/models/category.model';
import { Product } from '../../core/models/product.model';

interface Feature {
  title: string;
  description: string;
  colorVar: string;
  icon: 'shipping' | 'payment' | 'returns' | 'support';
}

const ICON_COLORS = ['var(--icon-blue-1)', 'var(--icon-blue-2)', 'var(--icon-blue-3)', 'var(--icon-blue-4)'];

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly categoryService = inject(CategoryService);
  private readonly productService = inject(ProductService);

  protected readonly categories = signal<Category[]>([]);
  protected readonly categoriesLoading = signal(true);
  protected readonly categoriesError = signal(false);

  protected readonly bestSellers = signal<Product[]>([]);
  protected readonly bestSellersLoading = signal(true);
  protected readonly bestSellersError = signal(false);

  protected readonly features: Feature[] = [
    {
      title: 'Free Shipping',
      description: 'On all orders over $100',
      colorVar: 'var(--icon-blue-2)',
      icon: 'shipping',
    },
    {
      title: 'Secure Payment',
      description: '100% secure checkout',
      colorVar: 'var(--icon-green)',
      icon: 'payment',
    },
    {
      title: 'Easy Returns',
      description: '30-day return policy',
      colorVar: 'var(--icon-blue-1)',
      icon: 'returns',
    },
    {
      title: '24/7 Support',
      description: 'Dedicated support team',
      colorVar: 'var(--icon-blue-3)',
      icon: 'support',
    },
  ];

  constructor() {
    this.loadCategories();
    this.loadBestSellers();
  }

  private loadCategories(): void {
    this.categoriesLoading.set(true);
    this.categoriesError.set(false);

    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.categoriesLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load categories', err);
        this.categoriesError.set(true);
        this.categoriesLoading.set(false);
      },
    });
  }

  private loadBestSellers(): void {
    this.bestSellersLoading.set(true);
    this.bestSellersError.set(false);

    this.productService.getBestSellers(8, 1).subscribe({
      next: (products) => {
        this.bestSellers.set(products);
        this.bestSellersLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load best sellers', err);
        this.bestSellersError.set(true);
        this.bestSellersLoading.set(false);
      },
    });
  }

  protected retryCategories(): void {
    this.loadCategories();
  }

  protected retryBestSellers(): void {
    this.loadBestSellers();
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
