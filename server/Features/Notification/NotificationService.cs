namespace StoreApi.Features.Notification
{
    public class NotificationService
    {
        private readonly NotificationRepository _notificationRepository;

        public NotificationService(
            NotificationRepository notificationRepository)
        {
            _notificationRepository = notificationRepository;
        }

        public async Task<NotificationResponseDTO> CreateNotificationAsync(
            NotificationRequestDTO dto)
        {
            var notification = new NotificationModal
            {
                SenderUserID = dto.SenderUserID,
                SenderRoleID = dto.SenderRoleID,
                NotificationString = dto.NotificationString,
                NotificationType = dto.NotificationType,
                ReferenceID = dto.ReferenceID,
                ReferenceType = dto.ReferenceType,

                TargetRoleIDs = dto.TargetRoleIDs
                    .Distinct()
                    .ToList(),

                ReadByUserIDs = new List<int>(),

                CreatedAt = DateTime.UtcNow
            };

            var createdNotification =
                await _notificationRepository.CreateAsync(notification);

            return MapToResponse(
                createdNotification,
                dto.SenderUserID);
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