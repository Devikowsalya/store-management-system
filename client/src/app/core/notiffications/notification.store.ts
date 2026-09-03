import {
    computed,
    effect,
    inject,
    Injectable,
    signal
} from '@angular/core';

import { AuthStore } from '../auth/auth.store';

import {
    OrderStatusNotification
} from './notification.model';

import {
    NotificationApiService
} from './notification-api.service';

import {
    NotificationSignalrService
} from './notification-signalr.service';

export type NotificationItem =
    OrderStatusNotification & {
        isRead?: boolean;
    };

@Injectable({
    providedIn: 'root'
})
export class NotificationStore {
    private readonly authStore =
        inject(AuthStore);

    private readonly notificationApiService =
        inject(NotificationApiService);

    private readonly signalRService =
        inject(NotificationSignalrService);

    private readonly _notifications =
        signal<NotificationItem[]>([]);

    private readonly _loading =
        signal<boolean>(false);

    private readonly _connectionError =
        signal<string | null>(null);

    readonly notifications =
        this._notifications.asReadonly();

    readonly loading =
        this._loading.asReadonly();

    readonly connectionError =
        this._connectionError.asReadonly();

    /*
     * This represents the actual
     * SignalR connection status.
     */
    readonly isConnected =
        this.signalRService.isConnected;

    readonly unreadNotifications =
        computed(() =>
            this._notifications().filter(
                notification =>
                    !notification.isRead
            )
        );

    readonly unreadCount =
        computed(
            () =>
                this.unreadNotifications().length
        );

    readonly hasUnreadNotifications =
        computed(
            () => this.unreadCount() > 0
        );

    constructor() {
        /*
         * Start SignalR and load stored
         * notifications after login.
         */
        effect(() => {
            const isLoggedIn =
                this.authStore.isLoggedIn();

            if (isLoggedIn) {
                this.loadNotifications();

                void this.signalRService
                    .startConnection();
            } else {
                void this.signalRService
                    .stopConnection();

                this.clearNotifications();
            }
        });

        /*
         * Add newly received SignalR
         * notification to the store.
         */
        effect(() => {
            const liveNotification =
                this.signalRService
                    .receivedNotification();

            if (!liveNotification) {
                return;
            }

            this.addNotification(
                liveNotification
            );
        });
    }

    loadNotifications(): void {
        if (!this.authStore.isLoggedIn()) {
            return;
        }

        this._loading.set(true);
        this._connectionError.set(null);

        this.notificationApiService
            .getNotifications(false)
            .subscribe({
                next: response => {
                    const rawList: unknown[] =
                        Array.isArray(response)
                            ? response
                            : Array.isArray(
                                (response as any)?.data
                            )
                                ? (response as any).data
                                : [];

                    const mapped =
                        rawList.map((item, index) =>
                            this.mapNotificationItem(
                                item,
                                index
                            )
                        );

                    this._notifications.update(
                        existing => {
                            const notificationMap =
                                new Map<
                                    string,
                                    NotificationItem
                                >();

                            /*
                             * Add existing live
                             * notifications first.
                             */
                            existing.forEach(item => {
                                notificationMap.set(
                                    item.NotificationID,
                                    item
                                );
                            });

                            /*
                             * Add notifications returned
                             * from the database.
                             */
                            mapped.forEach(item => {
                                notificationMap.set(
                                    item.NotificationID,
                                    item
                                );
                            });

                            return Array.from(
                                notificationMap.values()
                            ).sort(
                                (first, second) =>
                                    second.CreatedAt.getTime() -
                                    first.CreatedAt.getTime()
                            );
                        }
                    );

                    this._loading.set(false);
                },

                error: error => {
                    console.error(
                        'Failed to load notifications:',
                        error
                    );

                    this._connectionError.set(
                        'Unable to load notifications.'
                    );

                    this._loading.set(false);
                }
            });
    }

    addNotification(
        rawItem: unknown
    ): void {
        const item =
            this.mapNotificationItem(rawItem);

        this._notifications.update(
            existing => {
                const alreadyExists =
                    existing.some(
                        notification =>
                            notification.NotificationID ===
                            item.NotificationID
                    );

                if (alreadyExists) {
                    return existing;
                }

                return [
                    item,
                    ...existing
                ];
            }
        );
    }

    private mapNotificationItem(
        rawItem: unknown,
        index: number = 0
    ): NotificationItem {
        const item = rawItem as any;

        const notificationID = String(
            item?.notificationID ??
            `notification-${index}-${Date.now()}`
        );

        const senderRoleID = Number(
            item?.senderRoleID ??
            0
        );

        const notificationString = String(
            item?.notificationString ??
            ''
        );

        const notificationType = String(
            item?.notificationType ??
            'General'
        );

        const referenceID = Number(
            item?.referenceID ??
            0
        );

        const referenceType = String(
            item?.referenceType ??
            'Order'
        );

        const targetRoleIDs =
            this.toNumberArray(
                item?.targetRoleIDs
            );

        // const readByUserIDs =
        //     this.toNumberArray(
        //         item?.readByUserIDs ??
        //         item?.readByUserIds ??
        //         item?.ReadByUserIDs
        //     );

        const createdAtValue =
            item?.createdAt ??
            new Date();

        const createdAt =
            new Date(createdAtValue);

        const isRead = Boolean(
            item?.isRead ??
            false
        );

        return {
            NotificationID: notificationID,
            SenderRoleID: senderRoleID,
            NotificationString: notificationString,
            NotificationType: notificationType,
            ReferenceID: referenceID,
            ReferenceType: referenceType,
            TargetRoleIDs: targetRoleIDs,
            ReadByUserIDs: [],
            CreatedAt: createdAt,
            isRead: isRead
        };
    }

    private toNumberArray(
        value: unknown
    ): number[] {
        if (!Array.isArray(value)) {
            return [];
        }

        return value
            .map(item => Number(item))
            .filter(item => Number.isFinite(item));
    }

    markAsRead(
        notificationID: string
    ): void {
        this._notifications.update(
            notifications =>
                notifications.map(notification =>
                    notification.NotificationID ===
                        notificationID
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
            notifications =>
                notifications.map(
                    notification => ({
                        ...notification,
                        isRead: true
                    })
                )
        );
    }

    removeNotification(
        notificationID: string
    ): void {
        this._notifications.update(
            notifications =>
                notifications.filter(
                    notification =>
                        notification.NotificationID !==
                        notificationID
                )
        );
    }

    clearNotifications(): void {
        this._notifications.set([]);
        this._connectionError.set(null);
    }
}