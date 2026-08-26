import { computed, inject, Injectable, signal } from '@angular/core';

import { firstValueFrom } from 'rxjs';

import { ProductApiService } from '../services/product-api.service';

import { LowStockProduct, Product, ProductQueryParams } from '../models/product.model';

import { ProductRequest, UpdateProductRequest } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductStore {
  /*
   * Dependencies
   */

  private readonly productApi = inject(ProductApiService);

  /*
   * Writable State
   *
   * These signals are private because
   * only ProductStore should modify them.
   */

  private readonly _products = signal<Product[]>([]);

  private readonly _totalProducts = signal<number>(0);

  private readonly _inventoryValue = signal<number>(0);

  private readonly _lowStockProducts =signal<LowStockProduct[]>([]);

  private readonly _totalLowStockProducts = signal(0);

  private readonly _selectedProduct = signal<Product | null>(null);

  private readonly _isLoading = signal<boolean>(false);

  private readonly _isSaving = signal<boolean>(false);

  private readonly _isDeleting = signal<boolean>(false);

  private readonly _error = signal<string | null>(null);

  private readonly _searchTerm = signal<string>('');

  private readonly _pageNumber = signal<number>(1);

  private readonly _pageSize = signal<number>(5);

  private readonly _totalCount = signal<number>(0);

  private readonly _hasMorePages = signal<boolean>(true);

  private readonly _sortBy = signal<string>('default');

  private readonly _stockStatus = signal<string>('all');

  private readonly _minPrice = signal<number | null>(null);

  private readonly _maxPrice = signal<number | null>(null);

  private readonly _categoryId = signal<number | null>(null);

  /*
   * Readonly State
   *
   * Components can read these,
   * but cannot modify them directly.
   */

  readonly products = this._products.asReadonly();

  readonly totalProducts = this._totalProducts.asReadonly();

  readonly inventoryValue = this._inventoryValue.asReadonly();

  readonly lowStockProducts = this._lowStockProducts.asReadonly();

  readonly totalLowStockProducts = this._totalLowStockProducts.asReadonly();

  readonly selectedProduct = this._selectedProduct.asReadonly();

  readonly isLoading = this._isLoading.asReadonly();

  readonly isSaving = this._isSaving.asReadonly();

  readonly isDeleting = this._isDeleting.asReadonly();

  readonly error = this._error.asReadonly();

  readonly searchTerm = this._searchTerm.asReadonly();

  readonly pageNumber = this._pageNumber.asReadonly();

  readonly pageSize = this._pageSize.asReadonly();

  readonly sortBy = this._sortBy.asReadonly();

  readonly stockStatus = this._stockStatus.asReadonly();

  readonly minPrice = this._minPrice.asReadonly();

  readonly maxPrice = this._maxPrice.asReadonly();

  readonly categoryId = this._categoryId.asReadonly();

  readonly totalCount = computed(() => {
    return Math.max(this._totalCount(), this._totalProducts(), this._products().length);
  });

  readonly hasMorePages = this._hasMorePages.asReadonly();

  /*
   * Computed State
   */

  readonly productCount = computed(() => this._products().length);

  readonly totalPages = computed(() => {
    const total = this.totalCount();
    const size = this._pageSize() || 5;
    return Math.max(1, Math.ceil(total / size));
  });

  readonly filteredProducts = computed(() => {
    const search = this._searchTerm().trim().toLowerCase();

    const products = this._products();

    if (!search) {
      return products;
    }

    return products.filter(
      (product) =>
        product.productName.toLowerCase().includes(search) ||
        product.brand?.toLowerCase().includes(search) ||
        product.categoryName?.toLowerCase().includes(search) ||
        product.supplierName?.toLowerCase().includes(search),
    );
  });

  /*
   * LOAD ALL PRODUCTS
   */

  async loadProducts(params?: ProductQueryParams | string, pageNumber?: number, pageSize?: number): Promise<void> {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      if (typeof params === 'string') {
        this._searchTerm.set(params);
        if (pageNumber !== undefined) {
          this._pageNumber.set(pageNumber);
        }
        if (pageSize !== undefined) {
          this._pageSize.set(pageSize);
        }
      } else if (params) {
        this._searchTerm.set(params.search ?? '');
        if (params.pageNumber !== undefined) this._pageNumber.set(params.pageNumber);
        if (params.pageSize !== undefined) this._pageSize.set(params.pageSize);
        this._sortBy.set(params.sortBy ?? 'default');
        this._stockStatus.set(params.stockStatus ?? 'all');
        this._minPrice.set(params.minPrice ?? null);
        this._maxPrice.set(params.maxPrice ?? null);
        this._categoryId.set(params.categoryId ?? null);
      }

      const response = await firstValueFrom(
        this.productApi.getProducts({
          search: this._searchTerm(),
          pageNumber: this._pageNumber(),
          pageSize: this._pageSize(),
          sortBy: this._sortBy(),
          stockStatus: this._stockStatus(),
          minPrice: this._minPrice() ?? undefined,
          maxPrice: this._maxPrice() ?? undefined,
          categoryId: this._categoryId() ?? undefined,
        })
      );

      let items: Product[] = [];
      let total = 0;

      if (Array.isArray(response)) {
        items = response;
        total = response.length;
      } else if (response && typeof response === 'object') {
        items = response.data || response.items || response.products || [];
        total = response.totalCount ?? response.total ?? response.count ?? 0;
      }

      this._products.set(items);

      if (total > 0 && total !== items.length) {
        this._totalCount.set(total);
      }

      // Disable next page if API response is empty [] or has fewer items than pageSize
      if (!items || items.length === 0 || items.length < this._pageSize()) {
        this._hasMorePages.set(false);
      } else {
        this._hasMorePages.set(true);
      }
    } catch (error) {
      console.error('Error loading products:', error);

      this._products.set([]);
      this._totalCount.set(0);
      this._hasMorePages.set(false);

      this._error.set('Failed to load products.');
    } finally {
      this._isLoading.set(false);
    }
  }

  setPageNumber(page: number): void {
    if (page >= 1 && page !== this._pageNumber()) {
      this.loadProducts({
        search: this._searchTerm(),
        pageNumber: page,
        pageSize: this._pageSize(),
        sortBy: this._sortBy(),
        stockStatus: this._stockStatus(),
        minPrice: this._minPrice() ?? undefined,
        maxPrice: this._maxPrice() ?? undefined,
        categoryId: this._categoryId() ?? undefined,
      });
    }
  }

  setPageSize(size: number): void {
    if (size >= 1 && size !== this._pageSize()) {
      this.loadProducts({
        search: this._searchTerm(),
        pageNumber: 1,
        pageSize: size,
        sortBy: this._sortBy(),
        stockStatus: this._stockStatus(),
        minPrice: this._minPrice() ?? undefined,
        maxPrice: this._maxPrice() ?? undefined,
        categoryId: this._categoryId() ?? undefined,
      });
    }
  }


  nextPage(): void {
    if (this._hasMorePages() && !this._isLoading()) {
      this.setPageNumber(this._pageNumber() + 1);
    }
  }

  previousPage(): void {
    if (this._pageNumber() > 1 && !this._isLoading()) {
      this.setPageNumber(this._pageNumber() - 1);
    }
  }

  loadProductCount(): void {
    this.productApi.getProductCount().subscribe({
      next: (response) => {
        const count = typeof response === 'number' ? response : (response?.count ?? 0);
        this._totalProducts.set(count);
        if (count > this._totalCount()) {
          this._totalCount.set(count);
        }
      },
      error: (error) => {
        console.error('Failed to load product count', error);
      }
    });
  }

loadInventoryValue(): void {
  this.productApi.getInventoryValue().subscribe({
    next: (response) => {
      this._inventoryValue.set(response.totalAmount);
    },
    error: (error) => {
      console.error('Failed to load inventory value', error);
    }
  });
}

loadLowStockProducts(): void {

  this.productApi
    .getLowStockProducts()
    .subscribe({

      next: (response) => {

        this._lowStockProducts.set(
          response.products ?? []
        );

        this._totalLowStockProducts.set(
          response.totalLowStockProducts ?? 0
        );
      },

      error: (error) => {
        console.error(
          'Failed to load low stock products',
          error
        );
      }

    });
}
  /*
   * LOAD PRODUCT BY ID
   */

  async loadProductById(id: number): Promise<void> {
    try {
      this._isLoading.set(true);

      this._error.set(null);

      const product = await firstValueFrom(this.productApi.getProductById(id));

      this._selectedProduct.set(product);
    } catch (error) {
      console.error('Error loading product:', error);

      this._selectedProduct.set(null);

      this._error.set('Failed to load product details.');
    } finally {
      this._isLoading.set(false);
    }
  }

  /*
   * CREATE PRODUCT
   */

  async createProduct(request: ProductRequest): Promise<boolean> {
    try {
      this._isSaving.set(true);

      this._error.set(null);

      const response = await firstValueFrom(this.productApi.createProduct(request));
 

      if (response.data) {
        this._products.update((products) => [response.data, ...products]);
      }

      return true;
    } catch (error) {
      console.error('Error creating product:', error);

      this._error.set('Failed to create product.');

      return false;
    } finally {
      this._isSaving.set(false);
    }
  }

  /*
   * UPDATE PRODUCT
   */

  async updateProduct(id: number, request: ProductRequest): Promise<boolean> {
    try {
      this._isSaving.set(true);

      this._error.set(null);

      const response = await firstValueFrom(this.productApi.updateProduct(id, request));

      if (response.data) {
        this._products.update((products) =>
          products.map((product) => (product.productID === id ? response.data : product)),
        );

        this._selectedProduct.set(response.data);
      }

      return true;
    } catch (error) {
      console.error('Error updating product:', error);

      this._error.set('Failed to update product.');

      return false;
    } finally {
      this._isSaving.set(false);
    }
  }

  /*
   * DELETE PRODUCT
   */

  async deleteProduct(id: number): Promise<boolean> {
    try {
      this._isDeleting.set(true);

      this._error.set(null);

      await firstValueFrom(this.productApi.deleteProduct(id));

      /*
       * Remove product from local state.
       */

      this._products.update((products) => products.filter((product) => product.productID !== id));

      /*
       * Clear selected product
       * if that product was deleted.
       */

      if (this._selectedProduct()?.productID === id) {
        this._selectedProduct.set(null);
      }

      return true;
    } catch (error) {
      console.error('Error deleting product:', error);

      this._error.set('Failed to delete product.');

      return false;
    } finally {
      this._isDeleting.set(false);
    }
  }

  /*
   * SELECT PRODUCT
   */

  selectProduct(product: Product): void {
    this._selectedProduct.set(product);
  }

  /*
   * CLEAR SELECTED PRODUCT
   */

  clearSelectedProduct(): void {
    this._selectedProduct.set(null);
  }

  /*
   * SEARCH
   */

  setSearchTerm(value: string): void {
    this._searchTerm.set(value);
  }

  clearSearch(): void {
    this._searchTerm.set('');
  }

  /*
   * CLEAR ERROR
   */

  clearError(): void {
    this._error.set(null);
  }

  /*
   * RESET STORE
   */

  resetStore(): void {
    this._products.set([]);

    this._selectedProduct.set(null);

    this._isLoading.set(false);

    this._isSaving.set(false);

    this._isDeleting.set(false);

    this._error.set(null);

    this._searchTerm.set('');
  }
}
