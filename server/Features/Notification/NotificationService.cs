namespace StoreApi.Features.Notification
{
    public class NotificationService
    {
        private readonly NotificationRepository _notificationRepository;
        //private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationService(
            NotificationRepository notificationRepository
             //IHubContext<NotificationHub> hubContext
            )
        {
            _notificationRepository = notificationRepository;
            //_hubContext = hubContext;
        }

        public async Task<NotificationResponseDTO>
        CreateNotificationAsync(
            NotificationRequestDTO dto)
        {
            var targetRoleIDs = dto.TargetRoleIDs
                .Distinct()
                .ToList();

            var notification = new NotificationModal
            {
                SenderUserID = dto.SenderUserID,
                SenderRoleID = dto.SenderRoleID,

                NotificationString =
                    dto.NotificationString,

                NotificationType =
                    dto.NotificationType,

                ReferenceID = dto.ReferenceID,
                ReferenceType = dto.ReferenceType,

                TargetRoleIDs = targetRoleIDs,

                ReadByUserIDs = new List<int>(),

                CreatedAt = DateTime.UtcNow
            };

            // First save notification in the database.
            var createdNotification =
                await _notificationRepository.CreateAsync(
                    notification);

            var response = MapToResponse(
                createdNotification,
                dto.SenderUserID);

            // Send the saved notification to all
            // currently connected users in target roles.
            //var sendTasks = targetRoleIDs.Select(
            //    roleID =>
            //        _hubContext.Clients
            //            .Group($"Role_{roleID}")
            //            .SendAsync(
            //                "ReceiveNotification",
            //                response));

            //await Task.WhenAll(sendTasks);

            return response;
        }

        public async Task<List<NotificationResponseDTO>>
            GetAllNotificationsAsync(
                int userID,
                int roleID,
                bool? isRead = null)
        {
            var notifications =
                await _notificationRepository.GetAllNotificationsAsync(
                    userID,
                    roleID,
                    isRead);

            return notifications
                .Select(notification =>
                    MapToResponse(notification, userID))
                .ToList();
        }

        public async Task<bool> MarkAsReadAsync(
            int notificationID,
            int userID,
            int roleID)
        {
            return await _notificationRepository.MarkAsReadAsync(
                notificationID,
                userID,
                roleID);
        }

        public async Task<int> MarkAllAsReadAsync(
            int userID,
            int roleID)
        {
            return await _notificationRepository.MarkAllAsReadAsync(
                userID,
                roleID);
        }

        public async Task<List<int>> GetAllRoleIDsAsync()
        {
            return await _notificationRepository.GetAllRoleIDsAsync();
        }

        private static NotificationResponseDTO MapToResponse(
            NotificationModal notification,
            int currentUserID)
        {
            return new NotificationResponseDTO
            {
                NotificationID = notification.NotificationID,
                SenderUserID = notification.SenderUserID,
                SenderRoleID = notification.SenderRoleID,
                NotificationString =
                    notification.NotificationString,
                NotificationType =
                    notification.NotificationType,
                ReferenceID = notification.ReferenceID,
                ReferenceType = notification.ReferenceType,
                TargetRoleIDs = notification.TargetRoleIDs,
                IsRead = notification.ReadByUserIDs
                    .Contains(currentUserID),
                CreatedAt = notification.CreatedAt
            };
        }
    }
}