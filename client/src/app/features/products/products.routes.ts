import { Routes } from '@angular/router';

export const PRODUCT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/product-list/product-list.component')
        .then(m => m.ProductListComponent),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./components/product-form/product-form.component')
        .then(m => m.ProductFormComponent),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./components/product-form/product-form.component')
        .then(m => m.ProductFormComponent),
  },
];