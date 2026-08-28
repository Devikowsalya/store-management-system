import {
  computed,
  inject,
  Injectable,
  signal
} from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { CreateOrderPayload, Order, OrderFormValue, OrderStatus, OrderSummary, OrderSummaryResponse } from '../modals/orders.model';
import { OrderService } from '../services/order-api.service';
import { UserApiService } from '../../users/services/user-api.service';
import { User_Role } from '../../users/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class OrderStore {

  private readonly orderService = inject(OrderService);
  private readonly userApiService = inject(UserApiService);

  private readonly _orders = signal<Order[]>([]);
  // private readonly _ordersSummary = signal<OrderSummary[]>([]);

  private readonly _ordersSummary = signal<OrderSummary[]>([]);
  private readonly _orderStatuses = signal<OrderStatus[]>([]);
  private readonly _userRoles = signal<User_Role[]>([]);

  private readonly _totalOrders = signal(0);

  private readonly _totalOrdersThisMonth = signal(0);

  private readonly _totalOrderValue = signal(0);

  private readonly _loading = signal(false);

  private readonly _error = signal<string | null>(null);


  readonly orders = this._orders.asReadonly();
  readonly orderStatuses = this._orderStatuses.asReadonly();
  readonly userRoles = this._userRoles.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly ordersSummary = this._ordersSummary.asReadonly();

  readonly totalOrders = this._totalOrders.asReadonly();

  readonly totalOrdersThisMonth =
    this._totalOrdersThisMonth.asReadonly();

  readonly totalOrderValue =
    this._totalOrderValue.asReadonly();




  readonly totalOrderAmount = computed(() =>
    this._orders().reduce(
      (sum, order) => sum + (order.totalAmount ?? 0),
      0
    )
  );

  loadOrders(): void {
    this._loading.set(true);
    this._error.set(null);

    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this._orders.set(orders);
        this._loading.set(false);
      },

      error: (error) => {
        console.error('Failed to load orders', error);

        this._error.set('Failed to load orders');
        this._loading.set(false);
      }
    });
  }

  loadOrderStatuses(): void {
    this.orderService.getOrderStatuses().subscribe({
      next: (statuses: any) => {
        const list = Array.isArray(statuses.data) ? statuses.data : [statuses.data];
        this._orderStatuses.set(list);
      },
      error: (error) => {
        console.error('Failed to load order statuses', error);
      }
    });
  }

  loadUserRoles(): void {
    this.userApiService.getUserRoles().subscribe({
      next: (roles) => {
        this._userRoles.set(roles || []);
      },
      error: (error) => {
        console.error('Failed to load user roles', error);
      }
    });
  }

  updateOrderStatus(orderID: number, statusID: number): void {
    this._loading.set(true);
    this.orderService.updateOrderStatus(orderID, statusID).subscribe({
      next: () => {
        this.loadOrders();
      },
      error: (error) => {
        console.error('API update status error, applying local state update', error);
        this._loading.set(false);
      }
    });
  }

  loadOrderSummary(): void {

    this._loading.set(true);
    this._error.set(null);

    this.orderService.getOrdersSummary()
      .subscribe({

        next: (response: OrderSummaryResponse) => {

          this._ordersSummary.set(
            response.orders ?? []
          );

          this._totalOrders.set(
            response.totalOrders ?? 0
          );

          this._totalOrdersThisMonth.set(
            response.totalOrdersThisMonth ?? 0
          );

          this._totalOrderValue.set(
            response.totalOrderValue ?? 0
          );

          this._loading.set(false);
        },

        error: (error: any) => {

          console.error(
            'Failed to load order summary',
            error
          );

          this._error.set(
            'Failed to load order summary'
          );

          this._loading.set(false);
        }

      });
  }

  async createOrder(order: OrderFormValue | CreateOrderPayload): Promise<boolean> {
    this._loading.set(true);
    this._error.set(null);

    try {
      await firstValueFrom(this.orderService.createOrder(order));
      this.loadOrders();
      return true;
    } catch (error: any) {
      console.error('Failed to create order', error);
      this._error.set(error?.error?.message || 'Failed to create order');
      return false;
    } finally {
      this._loading.set(false);
    }
  }

  updateOrder(
    id: number,
    order: OrderFormValue
  ): void {
    this._loading.set(true);

    this.orderService.updateOrder(id, order).subscribe({
      next: () => {
        this.loadOrders();
      },

      error: (error) => {
        console.error('Failed to update order', error);

        this._error.set('Failed to update order');
        this._loading.set(false);
      }
    });
  }

  deleteOrder(id: number): void {
    this._loading.set(true);

    this.orderService.deleteOrder(id).subscribe({
      next: () => {
        this._orders.update(orders =>
          orders.filter(order => order.orderID !== id)
        );

        this._loading.set(false);
      },

      error: (error) => {
        console.error('Failed to delete order', error);

        this._error.set('Failed to delete order');
        this._loading.set(false);
      }
    });
  }
}