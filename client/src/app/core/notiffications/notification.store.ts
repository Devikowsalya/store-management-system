import {
    computed,
    effect,
    inject,
    Injectable,
    signal
} from '@angular/core';

import { AuthStore } from '../auth/auth.store';
import { OrderStatusNotification } from './notification.model';
import { NotificationApiService } from './notification-api.service';
import { NotificationSignalrService } from './notification-signalr.service';

@Injectable({
    providedIn: 'root'
})
export class NotificationStore {
    private readonly authStore = inject(AuthStore);
    private readonly notificationApiService = inject(NotificationApiService);
    private readonly signalRService = inject(NotificationSignalrService);

    private readonly _notifications = signal<OrderStatusNotification[]>([]);
    private readonly _loading = signal<boolean>(false);
    private readonly _connectionError = signal<string | null>(null);

    readonly notifications = this._notifications.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly connectionError = this._connectionError.asReadonly();

    readonly isConnected = this.signalRService.isConnected;

    readonly unreadNotifications = computed(() =>
        this._notifications().filter(notification => !notification.isRead)
    );

    readonly unreadCount = computed(() => this.unreadNotifications().length);
    readonly hasUnreadNotifications = computed(() => this.unreadCount() > 0);

    constructor() {
        effect(() => {
            if (this.authStore.isLoggedIn()) {
                this.loadNotifications();
                void this.signalRService.startConnection();
            } else {
                void this.signalRService.stopConnection();
                this.clearNotifications();
            }
        });

        effect(() => {
            const liveNotification = this.signalRService.receivedNotification();
            if (liveNotification) {
                this.addNotification(liveNotification);
            }
        });
    }

    loadNotifications(): void {
        if (!this.authStore.isLoggedIn()) {
            return;
        }

        this._loading.set(true);
        this._connectionError.set(null);

        this.notificationApiService.getNotifications(false).subscribe({
            next: response => {
                const list: OrderStatusNotification[] = Array.isArray(response)
                    ? response
                    : Array.isArray((response as any)?.data)
                        ? (response as any).data
                        : [];

                this._notifications.update(existing => {
                    const notificationMap = new Map<string | number, OrderStatusNotification>();
                    existing.forEach(item => notificationMap.set(item.notificationID, item));
                    list.forEach(item => notificationMap.set(item.notificationID, item));

                    return Array.from(notificationMap.values()).sort(
                        (first, second) =>
                            new Date(second.createdAt).getTime() -
                            new Date(first.createdAt).getTime()
                    );
                });

                this._loading.set(false);
            },
            error: error => {
                console.error('Failed to load notifications:', error);
                this._connectionError.set('Unable to load notifications.');
                this._loading.set(false);
            }
        });
    }

    addNotification(item: OrderStatusNotification): void {
        this._notifications.update(existing => {
            const alreadyExists = existing.some(
                notification => notification.notificationID === item.notificationID
            );

            if (alreadyExists) {
                return existing;
            }

            return [item, ...existing];
        });
    }

    markAsRead(notificationID: string | number): void {
        this._notifications.update(notifications =>
            notifications.map(notification =>
                notification.notificationID === notificationID
                    ? { ...notification, isRead: true }
                    : notification
            )
        );
    }

    markAllAsRead(): void {
        this._notifications.update(notifications =>
            notifications.map(notification => ({ ...notification, isRead: true }))
        );
    }

    removeNotification(notificationID: string | number): void {
        this._notifications.update(notifications =>
            notifications.filter(
                notification => notification.notificationID !== notificationID
            )
        );
    }

    clearNotifications(): void {
        this._notifications.set([]);
        this._connectionError.set(null);
    }
}