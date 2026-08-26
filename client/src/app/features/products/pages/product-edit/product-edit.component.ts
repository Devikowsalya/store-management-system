import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Router } from '@angular/router';

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './product-edit.component.html',
  styleUrl: './product-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductEditComponent {

  private readonly fb = new FormBuilder();

  private readonly router = new Router();

  /*
   * UI state
   *
   * Later these will be managed by ProductStore.
   */

  readonly isLoading = signal(false);

  readonly isSaving = signal(false);

  readonly errorMessage =
    signal<string | null>(null);


  /*
   * Product form
   */

  readonly productForm =
    this.fb.nonNullable.group({

      productName: [
        'Wireless Mouse',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100)
        ]
      ],

      categoryID: [
        1,
        [
          Validators.required
        ]
      ],

      supplierID: [
        1,
        [
          Validators.required
        ]
      ],

      price: [
        850,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      stock: [
        24,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      description: [
        'Wireless optical mouse',
        [
          Validators.maxLength(500)
        ]
      ],

      isActive: [
        true
      ]

    });


  /*
   * Save Product
   */

  saveProduct(): void {

    if (this.productForm.invalid) {

      this.productForm.markAllAsTouched();

      return;
    }

    this.isSaving.set(true);

    this.errorMessage.set(null);


    /*
     * Temporary mock save.
     *
     * API integration will be added later.
     */

    console.log(
      'Product:',
      this.productForm.getRawValue()
    );


    setTimeout(() => {

      this.isSaving.set(false);

      this.router.navigate([
        '/admin/products'
      ]);

    }, 500);
  }


  /*
   * Cancel editing
   */

  cancel(): void {

    this.router.navigate([
      '/admin/products'
    ]);
  }


  /*
   * Field helpers
   */

  isFieldInvalid(
    fieldName: string
  ): boolean {

    const field =
      this.productForm.get(fieldName);

    return !!(
      field &&
      field.invalid &&
      field.touched
    );
  }

}