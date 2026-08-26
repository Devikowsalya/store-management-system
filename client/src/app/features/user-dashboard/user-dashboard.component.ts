import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductStore } from '../products/stores/product.store';
import { CategoryStore } from '../categories/stores/category.store';
import { OrderStore } from '../orders/store/order.store';
import { AuthStore } from '../../core/auth/auth.store';
import { CartStore } from '../cart/stores/cart.store';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDashboardComponent implements OnInit {
  readonly productStore = inject(ProductStore);
  readonly categoryStore = inject(CategoryStore);
  readonly orderStore = inject(OrderStore);
  readonly authStore = inject(AuthStore);
  readonly cartStore = inject(CartStore);

  ngOnInit(): void {
    this.productStore.loadProductCount();
    this.categoryStore.loadCategories();
    this.orderStore.loadOrderSummary();
  }

  readonly summaryCards = computed(() => [
    {
      title: 'Available Products',
      value: this.productStore.totalProducts().toString() || '0',
      description: 'Products in store',
      icon: '▣'
    },
    {
      title: 'Items in Cart',
      value: this.cartStore.totalItemsCount().toString(),
      description: 'Ready for checkout',
      icon: '🛒'
    },
    {
      title: 'Product Categories',
      value: this.categoryStore.categoryCount().toString() || '0',
      description: 'Explore categories',
      icon: '▦'
    },
    {
      title: 'Recent Orders',
      value: this.orderStore.totalOrdersThisMonth().toString() || '0',
      description: 'Orders placed',
      icon: '☷'
    }
  ]);
}
