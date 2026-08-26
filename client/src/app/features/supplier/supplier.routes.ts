import { Routes } from '@angular/router';

export const SUPPLIER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/supplier-list/supplier-list.component').then(
        (m) => m.SupplierListComponent,
      ),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./components/supplier-form/supplier-form.component').then(
        (m) => m.SupplierFormComponent,
      ),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./components/supplier-form/supplier-form.component').then(
        (m) => m.SupplierFormComponent,
      ),
  },
];
