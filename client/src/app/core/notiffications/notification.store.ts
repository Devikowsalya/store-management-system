import {
    Injectable,
    computed,
    effect,
    inject,
    signal
} from '@angular/core';

import { AuthStore } from '../auth/auth.store';
import { OrderStatusNotification } from './notification.model';
import { NotificationApiService } from './notification-api.service';

export type NotificationItem = OrderStatusNotification & {
    isRead?: boolean;
};

@Injectable({
    providedIn: 'root'
})
export class NotificationStore {
    private readonly authStore = inject(AuthStore);
    private readonly notificationApiService = inject(NotificationApiService);

    private readonly _notifications =
        signal<NotificationItem[]>([]);

    private readonly _loading = signal(false);
    private readonly _isConnected = signal(false);
    private readonly _connectionError =
        signal<string | null>(null);

    readonly notifications =
        this._notifications.asReadonly();

    readonly loading =
        this._loading.asReadonly();

    readonly isConnected =
        this._isConnected.asReadonly();

    readonly connectionError =
        this._connectionError.asReadonly();

    readonly unreadNotifications = computed(() =>
        this._notifications().filter(
            (notification) => !notification.isRead
        )
    );

    readonly unreadCount = computed(
        () => this.unreadNotifications().length
    );

    readonly hasUnreadNotifications = computed(
        () => this.unreadCount() > 0
    );

    constructor() {
        effect(() => {
            const shouldConnect =
                this.authStore.isLoggedIn() &&
                this.authStore.isStaff();

            if (shouldConnect) {
                this.loadNotifications();
            } else {
                this.clearNotifications();
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
            next: (response: any) => {
                const rawList: any[] = Array.isArray(response)
                    ? response
                    : Array.isArray(response?.data)
                    ? response.data
                    : [];

                const mapped: NotificationItem[] = rawList.map((item, index) => {
                    const id = String(
                        item.notificationId ??
                        item.notificationID ??
                        item.NotificationID ??
                        item.NotificationId ??
                        item.id ??
                        item.ID ??
                        `notif-${index}-${Date.now()}`
                    );

                    const stringMsg =
                        item.notificationString ??
                        item.NotificationString ??
                        item.message ??
                        '';

                    const refId = Number(
                        item.referenceId ??
                        item.referenceID ??
                        item.ReferenceID ??
                        item.ReferenceId ??
                        0
                    );

                    const refType = String(
                        item.referenceType ??
                        item.ReferenceType ??
                        'Order'
                    );

                    const created =
                        item.createdAt ??
                        item.CreatedAt ??
                        new Date();

                    const senderRoleId = Number(
                        item.senderRoleId ??
                        item.senderRoleID ??
                        item.SenderRoleID ??
                        0
                    );

                    const targetRoleIds =
                        item.targetRoleIds ??
                        item.targetRoleIDs ??
                        item.TargetRoleIDs ??
                        [];

                    const readByUserIds =
                        item.readByUserIds ??
                        item.readByUserIDs ??
                        item.ReadByUserIDs ??
                        [];

                    return {
                        NotificationID: id,
                        SenderRoleID: senderRoleId,
                        NotificationString: stringMsg,
                        NotificationType: item.notificationType ?? item.NotificationType ?? 'General',
                        ReferenceID: refId,
                        ReferenceType: refType,
                        TargetRoleIDs: targetRoleIds,
                        ReadByUserIDs: readByUserIds,
                        CreatedAt: new Date(created),
                        isRead: item.isRead ?? false
                    };
                });

                this._notifications.set(mapped);
                this._isConnected.set(true);
                this._loading.set(false);
            },
            error: (error) => {
                console.error('Failed to load notifications:', error);
                this._isConnected.set(false);
                this._connectionError.set('Unable to load notifications.');
                this._loading.set(false);
            }
        });
    }

    markAsRead(notificationId: string): void {
        this._notifications.update(
            (notifications) =>
                notifications.map((notification) =>
                    notification.NotificationID === notificationId
                        ? {
                            ...notification,
                            isRead: true
                        }
                        : notification
                )
        );
    }

    markAllAsRead(): void {
        this._notifications.update(
            (notifications) =>
                notifications.map((notification) => ({
                    ...notification,
                    isRead: true
                }))
        );
    }

    removeNotification(notificationId: string): void {
        this._notifications.update(
            (notifications) =>
                notifications.filter(
                    (notification) =>
                        notification.NotificationID !== notificationId
                )
        );
    }

    clearNotifications(): void {
        this._notifications.set([]);
    }
}