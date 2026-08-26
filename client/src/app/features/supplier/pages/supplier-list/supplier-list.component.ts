import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';

import { Supplier } from '../../models/supplier.model';
import { SupplierStore } from '../../store/supplier.store';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [],
  templateUrl: './supplier-list.component.html',
  styleUrl: './supplier-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupplierListComponent implements OnInit {
  readonly supplierStore = inject(SupplierStore);
  private readonly router = inject(Router);

  /*
   * Local Search State
   */
  readonly searchTerm = signal('');

  /*
   * Readonly signals from store
   */
  readonly suppliers = this.supplierStore.suppliers;
  readonly isLoading = this.supplierStore.isLoading;
  readonly error = this.supplierStore.error;

  ngOnInit(): void {
    this.supplierStore.loadSuppliers();
  }

  /*
   * Filter suppliers based on search query
   */
  readonly filteredSuppliers = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const allSuppliers = this.suppliers();

    if (!search) {
      return allSuppliers;
    }

    return allSuppliers.filter((supplier) => {
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

  readonly supplierCount = computed(() => this.filteredSuppliers().length);

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.supplierStore.loadSuppliers(input.value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.supplierStore.loadSuppliers('');
  }

  addSupplier(): void {
    this.router.navigate(['/admin/suppliers/create']);
  }

  editSupplier(supplier: Supplier): void {
    this.router.navigate(['/admin/suppliers/edit', supplier.supplierID]);
  }

  async deleteSupplier(supplier: Supplier): Promise<void> {
    if (confirm(`Are you sure you want to delete supplier "${supplier.supplierName}"?`)) {
      await this.supplierStore.deleteSupplier(supplier.supplierID);
    }
  }

  getInitials(name: string): string {
    if (!name) return 'S';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
}
