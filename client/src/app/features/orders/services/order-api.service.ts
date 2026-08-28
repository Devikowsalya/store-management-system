import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '../../../core/services/base-api.service';
import { CreateOrderPayload, Order, OrderFormValue, OrderStatus, OrderSummary, OrderSummaryResponse } from '../modals/orders.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService extends BaseApiService {

  private readonly endpoint = '/Order';

  getOrders(): Observable<Order[]> {
    return this.get<Order[]>(this.endpoint);
  }

  getOrdersSummary(): Observable<OrderSummaryResponse> {
    return this.get<OrderSummaryResponse>(
      `${this.endpoint}/summary`
    );
  }

  getOrderStatuses(): Observable<OrderStatus[]> {
    return this.get<OrderStatus[]>('/OrderStatus');
  }

  updateOrderStatus(id: number, statusID: number): Observable<Order> {
    return this.patch<Order>(`${this.endpoint}/${id}/status/${statusID}`, {});
    // /api/Order/22/status/9
  }

  getOrderById(id: number): Observable<Order> {
    return this.get<Order>(`${this.endpoint}/${id}`);
  }

  createOrder(order: OrderFormValue | CreateOrderPayload): Observable<Order> {
    return this.post<Order>(
      this.endpoint,
      order
    );
  }

  updateOrder(
    id: number,
    order: OrderFormValue
  ): Observable<Order> {
    return this.put<Order>(
      `${this.endpoint}/${id}`,
      order
    );
  }

  deleteOrder(id: number): Observable<void> {
    return this.delete<void>(
      `${this.endpoint}/${id}`
    );
  }
}