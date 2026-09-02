import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '../services/base-api.service';
import { OrderStatusNotification } from './notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationApiService extends BaseApiService {
  private readonly endpoint = '/Notification';

  getNotifications(isRead?: boolean): Observable<OrderStatusNotification[] | { data: OrderStatusNotification[] }> {
    const url = isRead !== undefined ? `${this.endpoint}?isRead=${isRead}` : this.endpoint;
    return this.get<OrderStatusNotification[] | { data: OrderStatusNotification[] }>(url);
  }
}
