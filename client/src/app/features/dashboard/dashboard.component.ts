import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductStore } from '../products/stores/product.store';
import { OrderStore } from '../orders/store/order.store';
import { CategoryStore } from '../categories/stores/category.store';
import { AuthStore } from '../../core/auth/auth.store';

interface DashboardCard {
  title: string;
  value: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  readonly productStore = inject(ProductStore);
  readonly orderStore = inject(OrderStore);
  readonly categoryStore = inject(CategoryStore);
  readonly authStore = inject(AuthStore);

  readonly baseRoute = computed(() => (this.authStore.isAdmin() ? '/admin' : '/user'));

  ngOnInit(): void {
    this.productStore.loadProductCount();
    this.productStore.loadInventoryValue();
    this.productStore.loadLowStockProducts();
    this.orderStore.loadOrderSummary();
    this.categoryStore.loadCategories();
  }

  readonly cards = computed<DashboardCard[]>(() => [
    {
      title: 'Total Products',
      value: this.productStore.totalProducts().toString() ?? '0',
      description: 'Products available',
      icon: '▣'
    },
    {
      title: 'Total Categories',
      value: this.categoryStore.categoryCount().toString() ?? '0',
      description: 'Active categories',
      icon: '▦'
    },
    {
      title: 'Total Orders',
      value: this.orderStore.totalOrdersThisMonth().toString() ?? '0',
      description: 'Orders this month',
      icon: '☷'
    },
    {
      title: 'Inventory Value',
      value: `₹${this.productStore.inventoryValue().toLocaleString('en-IN')}`,
      description: 'Current stock value',
      icon: '▤'
    }
  ]);

  readonly lowStockItems = signal([
    {
      product: 'Wireless Mouse',
      stock: 4,
      status: 'Low'
    },
    {
      product: 'USB Keyboard',
      stock: 7,
      status: 'Low'
    },
    {
      product: 'HDMI Cable',
      stock: 3,
      status: 'Critical'
    },
    {
      product: 'Laptop Stand',
      stock: 9,
      status: 'Low'
    }
  ]);

  readonly recentOrders = signal([
    {
      id: '#ORD-1024',
      customer: 'Rahul Kumar',
      amount: '₹2,450',
      status: 'Completed'
    },
    {
      id: '#ORD-1023',
      customer: 'Priya Sharma',
      amount: '₹1,820',
      status: 'Processing'
    },
    {
      id: '#ORD-1022',
      customer: 'Arun Kumar',
      amount: '₹4,200',
      status: 'Completed'
    },
    {
      id: '#ORD-1021',
      customer: 'Sneha Reddy',
      amount: '₹980',
      status: 'Pending'
    }
  ]);

  readonly lowStockCount = computed(
    () => this.lowStockItems().length
  );
}