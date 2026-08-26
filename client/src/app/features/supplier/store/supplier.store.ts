import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { SupplierApiService } from '../services/supplier-api.service';
import { Supplier, SupplierRequest } from '../models/supplier.model';

@Injectable({
  providedIn: 'root',
})
export class SupplierStore {
  /*
   * Dependencies
   */
  private readonly supplierApi = inject(SupplierApiService);

  /*
   * Writable State
   */
  private readonly _suppliers = signal<Supplier[]>([]);
  private readonly _totalSuppliers = signal<number>(0);
  private readonly _selectedSupplier = signal<Supplier | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _isSaving = signal<boolean>(false);
  private readonly _isDeleting = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _searchTerm = signal<string>('');

  /*
   * Readonly State
   */
  readonly suppliers = this._suppliers.asReadonly();
  readonly totalSuppliers = this._totalSuppliers.asReadonly();
  readonly selectedSupplier = this._selectedSupplier.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isSaving = this._isSaving.asReadonly();
  readonly isDeleting = this._isDeleting.asReadonly();
  readonly error = this._error.asReadonly();
  readonly searchTerm = this._searchTerm.asReadonly();

  /*
   * Computed State
   */
  readonly supplierCount = computed(() => this._suppliers().length);

  readonly filteredSuppliers = computed(() => {
    const search = this._searchTerm().trim().toLowerCase();
    const suppliers = this._suppliers();

    if (!search) {
      return suppliers;
    }

    return suppliers.filter((supplier) => {
      const name = supplier.supplierName?.toLowerCase() ?? '';
      const contact = supplier.contactPerson?.toLowerCase() ?? '';
      const email = supplier.email?.toLowerCase() ?? '';
      const address = (supplier.address || supplier.Address || '').toLowerCase();
      const phone = String(supplier.phone || supplier.Phone || '').toLowerCase();

      return (
        name.includes(search) ||
        contact.includes(search) ||
        email.includes(search) ||
        address.includes(search) ||
        phone.includes(search)
      );
    });
  });

  /*
   * LOAD ALL SUPPLIERS
   */
  async loadSuppliers(search?: string): Promise<void> {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      if (search !== undefined) {
        this._searchTerm.set(search);
      }

      const response = await firstValueFrom(this.supplierApi.getSuppliers(this._searchTerm()));
      this._suppliers.set(response || []);
    } catch (error) {
      console.error('Error loading suppliers:', error);
      this._suppliers.set([]);
      this._error.set('Failed to load suppliers.');
    } finally {
      this._isLoading.set(false);
    }
  }

  /*
   * LOAD SUPPLIER BY ID
   */
  async loadSupplierById(id: number): Promise<void> {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      const supplier = await firstValueFrom(this.supplierApi.getSupplierById(id));
      this._selectedSupplier.set(supplier);
    } catch (error) {
      console.error('Error loading supplier:', error);
      this._selectedSupplier.set(null);
      this._error.set('Failed to load supplier details.');
    } finally {
      this._isLoading.set(false);
    }
  }

  /*
   * CREATE SUPPLIER
   */
  async createSupplier(request: SupplierRequest): Promise<boolean> {
    try {
      this._isSaving.set(true);
      this._error.set(null);

      const response = await firstValueFrom(this.supplierApi.createSupplier(request));

      if (response.data) {
        this._suppliers.update((suppliers) => [response.data, ...suppliers]);
      }
      return true;
    } catch (error) {
      console.error('Error creating supplier:', error);
      this._error.set('Failed to create supplier.');
      return false;
    } finally {
      this._isSaving.set(false);
    }
  }

  /*
   * UPDATE SUPPLIER
   */
  async updateSupplier(id: number, request: SupplierRequest): Promise<boolean> {
    try {
      this._isSaving.set(true);
      this._error.set(null);

      const response = await firstValueFrom(this.supplierApi.updateSupplier(id, request));

      if (response.data) {
        this._suppliers.update((suppliers) =>
          suppliers.map((supplier) => (supplier.supplierID === id ? response.data : supplier)),
        );
        this._selectedSupplier.set(response.data);
      }
      return true;
    } catch (error) {
      console.error('Error updating supplier:', error);
      this._error.set('Failed to update supplier.');
      return false;
    } finally {
      this._isSaving.set(false);
    }
  }

  /*
   * DELETE SUPPLIER
   */
  async deleteSupplier(id: number): Promise<boolean> {
    try {
      this._isDeleting.set(true);
      this._error.set(null);

      await firstValueFrom(this.supplierApi.deleteSupplier(id));

      this._suppliers.update((suppliers) =>
        suppliers.filter((supplier) => supplier.supplierID !== id),
      );

      if (this._selectedSupplier()?.supplierID === id) {
        this._selectedSupplier.set(null);
      }
      return true;
    } catch (error) {
      console.error('Error deleting supplier:', error);
      this._error.set('Failed to delete supplier.');
      return false;
    } finally {
      this._isDeleting.set(false);
    }
  }

  /*
   * HELPER ACTIONS
   */
  selectSupplier(supplier: Supplier): void {
    this._selectedSupplier.set(supplier);
  }

  clearSelectedSupplier(): void {
    this._selectedSupplier.set(null);
  }

  setSearchTerm(value: string): void {
    this._searchTerm.set(value);
  }

  clearSearch(): void {
    this._searchTerm.set('');
  }

  clearError(): void {
    this._error.set(null);
  }

  resetStore(): void {
    this._suppliers.set([]);
    this._selectedSupplier.set(null);
    this._isLoading.set(false);
    this._isSaving.set(false);
    this._isDeleting.set(false);
    this._error.set(null);
    this._searchTerm.set('');
  }
}