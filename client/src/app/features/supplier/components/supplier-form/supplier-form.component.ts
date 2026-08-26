import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { SupplierStore } from '../../store/supplier.store';
import { SupplierRequest } from '../../models/supplier.model';

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './supplier-form.component.html',
  styleUrl: './supplier-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupplierFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly supplierStore = inject(SupplierStore);

  /*
   * Store state
   */
  readonly isLoading = this.supplierStore.isLoading;
  readonly isSaving = this.supplierStore.isSaving;
  readonly errorMessage = this.supplierStore.error;

  /*
   * Component state
   */
  readonly isEditMode = signal(false);
  private supplierID: number | null = null;

  /*
   * Reactive Form
   */
  readonly supplierForm = this.fb.nonNullable.group({
    supplierName: ['', [Validators.required, Validators.minLength(2)]],
    contactPerson: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    address: [''],
    isActive: [true],
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.supplierID = Number(id);
      this.isEditMode.set(true);
      this.supplierStore.loadSupplierById(this.supplierID);
    }

    effect(() => {
      const supplier = this.supplierStore.selectedSupplier();
      if (!supplier) return;

      this.supplierForm.patchValue({
        supplierName: supplier.supplierName,
        contactPerson: supplier.contactPerson,
        email: supplier.email,
        phone: String(supplier.phone || supplier.Phone || ''),
        address: supplier.address || supplier.Address || '',
        isActive: supplier.isActive ?? true,
      });
    });
  }

  async saveSupplier(): Promise<void> {
    if (this.supplierForm.invalid) {
      this.supplierForm.markAllAsTouched();
      return;
    }

    const request: SupplierRequest = this.supplierForm.getRawValue();
    let success = false;

    if (this.isEditMode() && this.supplierID) {
      success = await this.supplierStore.updateSupplier(this.supplierID, request);
    } else {
      success = await this.supplierStore.createSupplier(request);
    }

    if (success) {
      this.supplierStore.clearSelectedSupplier();
      await this.router.navigate(['/admin/suppliers']);
    }
  }

  isFieldInvalid(controlName: keyof typeof this.supplierForm.controls): boolean {
    const control = this.supplierForm.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  cancel(): void {
    this.supplierStore.clearSelectedSupplier();
    this.router.navigate(['/admin/suppliers']);
  }
}
