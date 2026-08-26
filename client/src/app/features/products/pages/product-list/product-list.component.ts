import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';

import { CurrencyPipe } from '@angular/common';

import { Product } from '../../models/product.model';
import { ProductStore } from '../../stores/product.store';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStore } from '../../../../core/auth/auth.store';
import { CartStore } from '../../../cart/stores/cart.store';
import { CategoryStore } from '../../../categories/stores/category.store';
import { SupplierStore } from '../../../supplier/store/supplier.store';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent implements OnInit {
  readonly productStore = inject(ProductStore);
  readonly authStore = inject(AuthStore);
  readonly cartStore = inject(CartStore);
  readonly categoryStore = inject(CategoryStore);
  readonly supplierStore = inject(SupplierStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isAdmin = this.authStore.isAdmin;
  readonly isUser = computed(() => !this.isAdmin());

  /*
   * Dropdown data from stores
   */
  readonly categories = this.categoryStore.categories;
  readonly suppliers = this.supplierStore.suppliers;

  /*
   * UI Filter States (Signals)
   */
  readonly searchTerm = signal('');
  readonly isFilterOpen = signal(false);
  readonly selectedCategoryId = signal<number | 'all'>('all');
  readonly selectedSupplierId = signal<number | 'all'>('all');
  readonly minPrice = signal<number | null>(null);
  readonly maxPrice = signal<number | null>(null);
  readonly stockStatus = signal<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  readonly activeStatus = signal<'all' | 'active' | 'inactive'>('all');
  readonly sortBy = signal<'default' | 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'stock_asc' | 'stock_desc'>('default');

  /*
   * Load products, categories, and suppliers
   */
  ngOnInit(): void {
    this.productStore.loadProductCount();
    this.categoryStore.loadCategories();
    this.supplierStore.loadSuppliers();

    this.route.queryParams.subscribe((params) => {
      const catParam = params['categoryId'] || params['categoryID'];
      if (catParam) {
        const parsedCat = Number(catParam);
        if (!isNaN(parsedCat) && parsedCat > 0) {
          this.selectedCategoryId.set(parsedCat);
        }
      }
      this.applyFiltersToStore();
    });
  }

  readonly products = this.productStore.products;
  readonly isLoading = this.productStore.isLoading;
  readonly error = this.productStore.error;
  private searchTimeout?: ReturnType<typeof setTimeout>;
  /*
   * Filter and Sort Products loaded from the backend
   */
  readonly filteredProducts = computed(() => {
    let result = [...this.products()];
    const search = this.searchTerm().trim().toLowerCase();
    const catId = this.selectedCategoryId();
    const supId = this.selectedSupplierId();
    const minP = this.minPrice();
    const maxP = this.maxPrice();
    const stock = this.stockStatus();
    const active = this.activeStatus();
    const sort = this.sortBy();

    // 1. Search text filter
    if (search) {
      result = result.filter(
        (product) =>
          product.productName?.toLowerCase().includes(search) ||
          product.categoryName?.toLowerCase().includes(search) ||
          product.supplierName?.toLowerCase().includes(search) ||
          product.brand?.toLowerCase().includes(search)
      );
    }

    // 2. Category filter
    if (catId !== 'all') {
      result = result.filter((p) => p.categoryID === catId);
    }

    // 3. Supplier filter
    if (supId !== 'all') {
      result = result.filter((p) => p.supplierID === supId);
    }

    // 4. Min Price filter
    if (minP !== null && minP !== undefined) {
      result = result.filter((p) => p.price >= minP);
    }

    // 5. Max Price filter
    if (maxP !== null && maxP !== undefined) {
      result = result.filter((p) => p.price <= maxP);
    }

    // 6. Stock Status filter
    if (stock === 'in_stock') {
      result = result.filter((p) => p.stock > 5);
    } else if (stock === 'low_stock') {
      result = result.filter((p) => p.stock > 0 && p.stock <= 5);
    } else if (stock === 'out_of_stock') {
      result = result.filter((p) => p.stock === 0);
    }

    // 7. Active Status filter
    if (active === 'active') {
      result = result.filter((p) => p.isActive === true);
    } else if (active === 'inactive') {
      result = result.filter((p) => p.isActive === false);
    }

    // 8. Sorting
    switch (sort) {
      case 'name_asc':
        result.sort((a, b) => a.productName.localeCompare(b.productName));
        break;
      case 'name_desc':
        result.sort((a, b) => b.productName.localeCompare(a.productName));
        break;
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'stock_asc':
        result.sort((a, b) => a.stock - b.stock);
        break;
      case 'stock_desc':
        result.sort((a, b) => b.stock - a.stock);
        break;
      default:
        break;
    }

    return result;
  });

  /*
   * Filter stats and helper computed properties
   */
  readonly productCount = computed(() => this.filteredProducts().length);

  readonly hasActiveFilters = computed(() => {
    return (
      this.selectedCategoryId() !== 'all' ||
      this.minPrice() !== null ||
      this.maxPrice() !== null ||
      this.stockStatus() !== 'all' ||
      this.sortBy() !== 'default'
    );
  });

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.selectedCategoryId() !== 'all') count++;
    if (this.minPrice() !== null || this.maxPrice() !== null) count++;
    if (this.stockStatus() !== 'all') count++;
    if (this.sortBy() !== 'default') count++;
    return count;
  });

  readonly selectedCategoryName = computed(() => {
    const id = this.selectedCategoryId();
    if (id === 'all') return '';
    const cat = this.categories().find((c) => c.categoryID === id);
    return cat ? cat.categoryName : `Category #${id}`;
  });

  readonly selectedSupplierName = computed(() => {
    const id = this.selectedSupplierId();
    if (id === 'all') return '';
    const sup = this.suppliers().find((s) => s.supplierID === id);
    return sup ? sup.supplierName : `Supplier #${id}`;
  });

  /*
   * Actions & Toggle Handlers
   */
  toggleFilterPanel(): void {
    this.isFilterOpen.update((open) => !open);
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
      this.searchTerm.set(input.value);
      this.applyFiltersToStore();
    }, 400);

  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.applyFiltersToStore();
  }

  applyFiltersToStore(): void {
    const catId = this.selectedCategoryId();
    this.productStore.loadProducts({
      search: this.searchTerm(),
      pageNumber: 1,
      pageSize: this.pageSize(),
      sortBy: this.sortBy(),
      stockStatus: this.stockStatus(),
      minPrice: this.minPrice() ?? undefined,
      maxPrice: this.maxPrice() ?? undefined,
      categoryId: catId !== 'all' ? (catId as number) : undefined,
    });
  }

  onCategoryChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedCategoryId.set(value === 'all' ? 'all' : Number(value));
    this.applyFiltersToStore();
  }

  onSupplierChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedSupplierId.set(value === 'all' ? 'all' : Number(value));
    this.applyFiltersToStore();
  }

  onMinPriceChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.minPrice.set(val === '' ? null : Number(val));
    this.applyFiltersToStore();
  }

  onMaxPriceChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.maxPrice.set(val === '' ? null : Number(val));
    this.applyFiltersToStore();
  }

  onStockStatusChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as any;
    this.stockStatus.set(val);
    this.applyFiltersToStore();
  }

  onActiveStatusChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as any;
    this.activeStatus.set(val);
  }

  onSortByChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as any;
    this.sortBy.set(val);
    this.applyFiltersToStore();
  }

  clearCategory(): void {
    this.selectedCategoryId.set('all');
    this.applyFiltersToStore();
  }

  clearSupplier(): void {
    this.selectedSupplierId.set('all');
    this.applyFiltersToStore();
  }

  clearPriceRange(): void {
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.applyFiltersToStore();
  }

  clearStockStatus(): void {
    this.stockStatus.set('all');
    this.applyFiltersToStore();
  }

  clearSort(): void {
    this.sortBy.set('default');
    this.applyFiltersToStore();
  }

  resetFilters(): void {
    this.selectedCategoryId.set('all');
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.stockStatus.set('all');
    this.activeStatus.set('all');
    this.sortBy.set('default');
    this.applyFiltersToStore();
  }

  addProduct(): void {
    this.router.navigate(['/admin/products/create']);
  }

  editProduct(product: Product): void {
    this.router.navigate(['/admin/products/edit', product.productID]);
  }

  getCartQuantity(productId: number): number {
    return this.cartStore.getItemQuantity(productId);
  }

  addToCart(product: Product): void {
    this.cartStore.addToCart(product, 1);
  }

  incrementQuantity(productId: number): void {
    this.cartStore.incrementQuantity(productId);
  }

  decrementQuantity(productId: number): void {
    this.cartStore.decrementQuantity(productId);
  }

  /*
   * Pagination Handlers
   */
  readonly pageNumber = this.productStore.pageNumber;
  readonly pageSize = this.productStore.pageSize;
  readonly totalPages = this.productStore.totalPages;
  readonly totalCount = this.productStore.totalCount;
  readonly hasMorePages = this.productStore.hasMorePages;

  onPageChange(page: number): void {
    this.productStore.setPageNumber(page);
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const size = parseInt(select.value, 10);
    if (!isNaN(size)) {
      this.productStore.setPageSize(size);
    }
  }

  nextPage(): void {
    this.productStore.nextPage();
  }

  previousPage(): void {
    this.productStore.previousPage();
  }
}

