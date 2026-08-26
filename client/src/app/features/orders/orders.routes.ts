import { Routes } from '@angular/router';

export const ORDER_ROUTES: Routes = [
   {
    path: '',

    loadComponent: () =>
      import(
        './pages/orders-list/orders-list.component'
      ).then(
        m => m.OrderListComponent
      )
  }
];