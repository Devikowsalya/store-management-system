import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
  computed,
  inject,
  signal,
} from '@angular/core';

import { CategoryStore } from '../../stores/category.store';
import { Category, CategoryFormValue, CategoryRequest } from '../../models/category.model';

import { ModalComponent } from '../../../../shared/modal/modal.component';
import { CategoryFormComponent } from '../../components/category-form/category-form.component';

import { AuthStore } from '../../../../core/auth/auth.store';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [ModalComponent, CategoryFormComponent],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryListComponent implements OnInit {
  private readonly categoryStore = inject(CategoryStore);
  private readonly authStore = inject(AuthStore);

  readonly isAdmin = this.authStore.isAdmin;

  @Output() saved =
    new EventEmitter<CategoryFormValue>();
  // --------------------------------------------------
  // Store signals
  // --------------------------------------------------

  readonly categories = this.categoryStore.categories;

  readonly isLoading = this.categoryStore.loading;

  // --------------------------------------------------
  // Local UI state
  // --------------------------------------------------

  readonly searchTerm = signal('');

  readonly isModalOpen = signal(false);

  readonly formMode = signal<'create' | 'edit'>('create');

  readonly selectedCategory = signal<Category | null>(null);

  // --------------------------------------------------
  // Computed signals
  // --------------------------------------------------

  readonly filteredCategories = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();

    if (!search) {
      return this.categories();
    }

    return this.categories().filter((category) =>
      category.categoryName.toLowerCase().includes(search),
    );
  });

  readonly categoryCount = computed(() => this.categories().length);

  readonly activeCategoryCount = computed(
    () => this.categories().filter((category) => category.isActive).length,
  );

  readonly totalProducts = computed(() =>
    this.categories().reduce((total, category) => total + (category.productCount ?? 0), 0),
  );

  // --------------------------------------------------
  // Lifecycle
  // --------------------------------------------------

  ngOnInit(): void {
    this.categoryStore.loadCategories();
  }

  // --------------------------------------------------
  // Search
  // --------------------------------------------------

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.searchTerm.set(input.value);
    this.categoryStore.loadCategories(input.value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.categoryStore.loadCategories('');
  }

  // --------------------------------------------------
  // Create
  // --------------------------------------------------

  createCategory(): void {
    this.formMode.set('create');

    this.selectedCategory.set(null);

    this.isModalOpen.set(true);
  }

  // --------------------------------------------------
  // Edit
  // --------------------------------------------------

  editCategory(category: Category): void {
    this.formMode.set('edit');

    this.selectedCategory.set(category);

    this.isModalOpen.set(true);
  }

  // --------------------------------------------------
  // Delete
  // --------------------------------------------------

  deleteCategory(category: Category): void {
    const confirmed = confirm(`Are you sure you want to delete "${category.categoryName}"?`);

    if (!confirmed) {
      return;
    }

    this.categoryStore.deleteCategory(category.categoryID);
  }

  // --------------------------------------------------
  // Save
  // --------------------------------------------------

saveCategory(formValue: CategoryFormValue): void {

  const request: CategoryRequest = {
    CategoryName: formValue.categoryName
  };

  if (this.formMode() === 'create') {

    this.categoryStore.createCategory(request);

  } else {

    const category = this.selectedCategory();

    if (!category) {
      return;
    }

    this.categoryStore.updateCategory(
      category.categoryID,
      request
    );
  }

  this.closeModal();
}

  // --------------------------------------------------
  // Modal
  // --------------------------------------------------

  closeModal(): void {
    this.isModalOpen.set(false);

    this.selectedCategory.set(null);
  }
}
