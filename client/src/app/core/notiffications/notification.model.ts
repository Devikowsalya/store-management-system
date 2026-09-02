export interface OrderStatusNotification {
    NotificationID: string;
    SenderRoleID: number;
    NotificationString: string;
    NotificationType: string;
    ReferenceID: number;
    ReferenceType: string;
    TargetRoleIDs: number[];
    ReadByUserIDs: number[];
    CreatedAt: Date;





}