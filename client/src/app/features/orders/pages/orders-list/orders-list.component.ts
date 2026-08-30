import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';
import {
  CommonModule,
  CurrencyPipe,
  DatePipe
} from '@angular/common';

import { OrderStore } from '../../store/order.store';
import { AuthStore } from '../../../../core/auth/auth.store';
import { Order, OrderStatus } from '../../modals/orders.model';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe
  ],
  templateUrl: './orders-list.component.html',
  styleUrl: './orders-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderListComponent implements OnInit {

  readonly orderStore = inject(OrderStore);
  readonly authStore = inject(AuthStore);

  readonly expandedOrderID = signal<number | null>(null);

  ngOnInit(): void {
    this.orderStore.loadOrders();
    this.orderStore.loadOrderStatuses();
  }

  getOrderStatus(order: Order): OrderStatus | undefined {
    const statuses = this.orderStore.orderStatuses();
    const targetId = order.statusID;
    return statuses.find(s => s.statusID === targetId) || statuses[0];
  }

  getNextStatus(order: Order): OrderStatus | undefined {
    // debugger;
    const current = this.getOrderStatus(order);
    if (!current?.nextStatusId) return undefined;
    return this.orderStore.orderStatuses().find(s => s.statusID === current.nextStatusId);
  }

  canProcess(order: Order): boolean {
    debugger
    if (this.authStore.isAdmin()) return true;
    const current = this.getOrderStatus(order);
    const userRoleId = this.authStore.userRoleId();
    return !!(userRoleId && current && current.assignedRoleID === userRoleId);
  }

  advanceStatus(order: Order): void {
    const nextSt = this.getNextStatus(order);
    if (nextSt && this.canProcess(order)) {
      this.orderStore.updateOrderStatus(order.orderID, nextSt.statusID);
    }
  }

  toggleOrder(orderID: number): void {
    this.expandedOrderID.update(current =>
      current === orderID ? null : orderID
    );
  }

  isExpanded(orderID: number): boolean {
    return this.expandedOrderID() === orderID;
  }

  getStatusClass(statusName: string | undefined): string {
    if (!statusName) return 'status-pending';
    const name = statusName.toLowerCase();
    if (name.includes('pending')) return 'status-pending';
    if (name.includes('process')) return 'status-processing';
    if (name.includes('ship')) return 'status-shipped';
    if (name.includes('deliver') || name.includes('complet')) return 'status-delivered';
    if (name.includes('cancel') || name.includes('reject')) return 'status-cancelled';
    return 'status-default';
  }
}