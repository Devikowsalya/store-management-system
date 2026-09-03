export interface OrderStatusNotification {
    notificationID: number | string;
    senderUserID?: number;
    senderRoleID?: number;
    notificationString: string;
    notificationType: string;
    referenceID?: number;
    referenceType?: string;
    targetRoleIDs?: number[];
    isRead: boolean;
    createdAt: string | Date;
}