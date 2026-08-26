import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { ProductStore } from '../../stores/product.store';
import { ProductRequest } from '../../models/product.model';

import { CategoryStore } from '../../../categories/stores/category.store';
import { SupplierStore } from '../../../supplier/store/supplier.store';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /*
   * Stores
   */

  private readonly productStore = inject(ProductStore);
  private readonly categoryStore = inject(CategoryStore);
  private readonly supplierStore = inject(SupplierStore);

  /*
   * Store State
   */

  readonly categories = this.categoryStore.categories;

  readonly suppliers = this.supplierStore.suppliers;

  readonly isLoading = this.productStore.isLoading;

  readonly isSaving = this.productStore.isSaving;

  readonly errorMessage = this.productStore.error;

  /*
   * Local Component State
   */

  readonly isEditMode = signal(false);

  private productID: number | null = null;

  /*
   * Form
   */

  readonly productForm = this.fb.nonNullable.group({
    productName: ['', [Validators.required, Validators.minLength(2)]],

    brand: [''],

    categoryID: [0, [Validators.required, Validators.min(1)]],

    supplierID: [0, [Validators.required, Validators.min(1)]],

    price: [0, [Validators.required, Validators.min(0)]],

    stock: [0, [Validators.required, Validators.min(0)]],

    isActive: [true],
  });

  constructor() {
    /*
     * Load dropdown values
     */

    this.categoryStore.loadCategories();
    this.supplierStore.loadSuppliers();

    /*
     * Check Create/Edit mode
     */

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.productID = Number(id);
      this.isEditMode.set(true);

      this.productStore.loadProductById(this.productID);
    }

    /*
     * Populate form when selected product changes
     */

    effect(() => {
      const product = this.productStore.selectedProduct();

      if (!product) {
        return;
      }

      this.productForm.patchValue({
        productName: product.productName,
        brand: product.brand ?? '',
        categoryID: product.categoryID,
        supplierID: product.supplierID,
        price: product.price,
        stock: product.stock,
        isActive: product.isActive,
      });
    });
  }

  /*
   * Save
   */

  async saveProduct(): Promise<void> {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const request: ProductRequest = this.productForm.getRawValue();

    let success = false;

    /*
     * Edit
     */

    if (this.isEditMode() && this.productID) {
      success = await this.productStore.updateProduct(this.productID, request);
    } else {

    /*
     * Create
     */
      success = await this.productStore.createProduct(request);
    }

    /*
     * Navigate only when API succeeds
     */

    if (success) {
      this.productStore.clearSelectedProduct();

      await this.router.navigate(['/admin/products']);
    }
  }

  /*
   * Validation Helper
   */

  isFieldInvalid(controlName: keyof typeof this.productForm.controls): boolean {
    const control = this.productForm.controls[controlName];

    return control.invalid && (control.touched || control.dirty);
  }

  /*
   * Cancel
   */

  cancel(): void {
    this.productStore.clearSelectedProduct();

    this.router.navigate(['/admin/products']);
  }
}
