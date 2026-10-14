import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { ProductService } from './app/core/services/product.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the hero heading', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Discover the Future of');
  });
});

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should return the six highest-rated products from a nested data.items API response', () => {
    const mockProducts = [
      { id: 1, name: 'Low', price: 10, rating: 3.2, category: 'Tech' },
      { id: 2, name: 'Best 1', price: 12, rating: 5, category: 'Tech' },
      { id: 3, name: 'Best 2', price: 13, rating: 4.8, category: 'Tech' },
      { id: 4, name: 'Best 3', price: 14, rating: 4.9, category: 'Tech' },
      { id: 5, name: 'Best 4', price: 15, rating: 4.7, category: 'Tech' },
      { id: 6, name: 'Best 5', price: 16, rating: 4.6, category: 'Tech' },
      { id: 7, name: 'Best 6', price: 17, rating: 4.5, category: 'Tech' },
      { id: 8, name: 'Best 7', price: 18, rating: 4.4, category: 'Tech' },
    ];

    service.getBestSellers(6, 1).subscribe((products) => {
      expect(products.map((product) => product.rating)).toEqual([5, 4.9, 4.8, 4.7, 4.6, 4.5]);
      expect(products).toHaveSize(6);
    });

    const req = httpMock.expectOne((request) => request.url.includes('/products'));
    expect(req.request.method).toBe('GET');
    req.flush({ data: { items: mockProducts } });
  });
});
