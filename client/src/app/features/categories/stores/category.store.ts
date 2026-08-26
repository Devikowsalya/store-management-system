import { Injectable, computed, inject, signal } from '@angular/core';

import { CategoryService } from '../services/category-api.service';
import { Category, CategoryRequest } from '../models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryStore {
  private readonly categoryService = inject(CategoryService);

  // -------------------------------
  // State
  // -------------------------------

  private readonly _categories = signal<Category[]>([]);

  private readonly _selectedCategory = signal<Category | null>(null);

  private readonly _loading = signal<boolean>(false);

  private readonly _error = signal<string | null>(null);

  private readonly _searchTerm = signal<string>('');

  // -------------------------------
  // Public readonly signals
  // -------------------------------

  readonly categories = this._categories.asReadonly();

  readonly selectedCategory = this._selectedCategory.asReadonly();

  readonly loading = this._loading.asReadonly();

  readonly error = this._error.asReadonly();

  readonly searchTerm = this._searchTerm.asReadonly();

  // -------------------------------
  // Computed values
  // -------------------------------

  readonly categoryCount = computed(() => this._categories().length);

  // =====================================================
  // GET ALL
  // =====================================================

  loadCategories(search?: string): void {
    this._loading.set(true);
    this._error.set(null);

    if (search !== undefined) {
      this._searchTerm.set(search);
    }

    this.categoryService.getCategories(this._searchTerm()).subscribe({
      next: (categories) => {
        this._categories.set(categories);

        this._loading.set(false);
      },

      error: (error) => {
        console.error('Error loading categories', error);

        this._error.set('Unable to load categories.');

        this._loading.set(false);
      },
    });
  }

  // =====================================================
  // GET BY ID
  // =====================================================

  loadCategoryById(id: number): void {
    this._loading.set(true);
    this._error.set(null);

    this.categoryService.getCategoryById(id).subscribe({
      next: (category) => {
        this._selectedCategory.set(category);

        this._loading.set(false);
      },

      error: (error) => {
        console.error('Error loading category', error);

        this._error.set('Unable to load category.');

        this._loading.set(false);
      },
    });
  }

  // =====================================================
  // CREATE
  // =====================================================

  createCategory(request: CategoryRequest): void {
    this._loading.set(true);
    this._error.set(null);

    this.categoryService.createCategory(request).subscribe({
      next: (category) => {
        this._categories.update((categories) => [...categories, category]);

        this._loading.set(false);
      },

      error: (error) => {
        console.error('Error creating category', error);

        this._error.set('Unable to create category.');

        this._loading.set(false);
      },
    });
  }

  // =====================================================
  // UPDATE
  // =====================================================

  updateCategory(id: number, request: CategoryRequest): void {
    this._loading.set(true);
    this._error.set(null);

    this.categoryService.updateCategory(id, request).subscribe({
      next: (updatedCategory) => {
        this._categories.update((categories) =>
          categories.map((category) => (category.categoryID === id ? updatedCategory : category)),
        );

        this._selectedCategory.set(updatedCategory);

        this._loading.set(false);
      },

      error: (error) => {
        console.error('Error updating category', error);

        this._error.set('Unable to update category.');

        this._loading.set(false);
      },
    });
  }

  // =====================================================
  // PATCH
  // =====================================================

  patchCategory(id: number, request: Partial<CategoryRequest>): void {
    this._loading.set(true);
    this._error.set(null);

    this.categoryService.patchCategory(id, request).subscribe({
      next: (updatedCategory) => {
        this._categories.update((categories) =>
          categories.map((category) => (category.categoryID === id ? updatedCategory : category)),
        );

        this._selectedCategory.set(updatedCategory);

        this._loading.set(false);
      },

      error: (error) => {
        console.error('Error patching category', error);

        this._error.set('Unable to update category.');

        this._loading.set(false);
      },
    });
  }

  // =====================================================
  // DELETE
  // =====================================================

  deleteCategory(id: number): void {
    this._loading.set(true);
    this._error.set(null);

    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        this._categories.update((categories) =>
          categories.filter((category) => category.categoryID !== id),
        );

        if (this._selectedCategory()?.categoryID === id) {
          this._selectedCategory.set(null);
        }

        this._loading.set(false);
      },

      error: (error) => {
        console.error('Error deleting category', error);

        this._error.set('Unable to delete category.');

        this._loading.set(false);
      },
    });
  }

  // =====================================================
  // Local store actions
  // =====================================================

  setSelectedCategory(category: Category | null): void {
    this._selectedCategory.set(category);
  }

  clearError(): void {
    this._error.set(null);
  }
}
