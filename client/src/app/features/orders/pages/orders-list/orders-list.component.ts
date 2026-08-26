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

interface ParsedOrderItem {
  productID: number;
  quantity: number;
}

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

  readonly expandedOrderID = signal<number | null>(null);

  ngOnInit(): void {
    this.orderStore.loadOrders();
 

  }
  toggleOrder(orderID: number): void {
     console.log(this.orderStore.orders());
    this.expandedOrderID.update(current =>
      current === orderID ? null : orderID
    );
  }

  isExpanded(orderID: number): boolean {
    return this.expandedOrderID() === orderID;
  }

  getOrderItems(items: string): ParsedOrderItem[] {
    if (!items) {
      return [];
    }

    return items
      .split(',')
      .map(item => {
        const [productID, quantity] = item.split(':');

        return {
          productID: Number(productID),
          quantity: Number(quantity)
        };
      });
  }
}