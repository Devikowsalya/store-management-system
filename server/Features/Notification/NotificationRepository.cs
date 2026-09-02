using Microsoft.EntityFrameworkCore;
using StoreApi.Data;

namespace StoreApi.Features.Notification
{
    public class NotificationRepository 
    {
        private readonly StoreDbContext _context;

        public NotificationRepository(StoreDbContext context)
        {
            _context = context;
        }

        public async Task<NotificationModal> CreateAsync(
            NotificationModal notification)
        {
            await _context.Notifications.AddAsync(notification);

            await _context.SaveChangesAsync();

            return notification;
        }

        // Get only read(true)/unread(false) notifications
        //var notifications =
        //    await _notificationRepository.GetAllNotificationsAsync(
        //        userID,
        //        roleID,
        //        true);

        public async Task<List<NotificationModal>> GetAllNotificationsAsync(
      int userID,
      int roleID,
      bool? isRead = null)
        {
            var query = _context.Notifications
                .AsNoTracking()
                .Where(notification =>
                    // Do not return the notification to its sender
                    notification.SenderUserID != userID &&

                    // The user's role must be targeted
                    notification.TargetRoleIDs.Contains(roleID));

            // Optional read/unread filter
            if (isRead.HasValue)
            {
                if (isRead.Value)
                {
                    query = query.Where(notification =>
                        notification.ReadByUserIDs.Contains(userID));
                }
                else
                {
                    query = query.Where(notification =>
                        !notification.ReadByUserIDs.Contains(userID));
                }
            }

            return await query
                .OrderByDescending(notification => notification.CreatedAt)
                .ToListAsync();
        }

        public async Task<NotificationModal?> GetByIdAsync(
            int notificationID)
        {
            return await _context.Notifications
                .FirstOrDefaultAsync(notification =>
                    notification.NotificationID == notificationID);
        }

        public async Task<bool> MarkAsReadAsync(
            int notificationID,
            int userID,
            int roleID)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(notification =>
                    notification.NotificationID == notificationID);

            if (notification == null)
            {
                return false;
            }

            // Sender must not read their own notification.
            if (notification.SenderUserID == userID)
            {
                return false;
            }

            // Check whether the user's role can receive it.
            if (!notification.TargetRoleIDs.Contains(roleID))
            {
                return false;
            }

            // Add the user only if they have not already read it.
            if (!notification.ReadByUserIDs.Contains(userID))
            {
                notification.ReadByUserIDs =
                    notification.ReadByUserIDs
                        .Append(userID)
                        .Distinct()
                        .ToList();

                await _context.SaveChangesAsync();
            }

            return true;
        }

        public async Task<int> MarkAllAsReadAsync(
    int userID,
    int roleID)
        {
            var notifications = await _context.Notifications
                .Where(notification =>
                    notification.SenderUserID != userID &&
                    notification.TargetRoleIDs.Contains(roleID) &&
                    !notification.ReadByUserIDs.Contains(userID))
                .ToListAsync();

            if (notifications.Count == 0)
            {
                return 0;
            }

            foreach (var notification in notifications)
            {
                notification.ReadByUserIDs =
                    notification.ReadByUserIDs
                        .Append(userID)
                        .Distinct()
                        .ToList();
            }

            await _context.SaveChangesAsync();

            return notifications.Count;
        }

        public async Task<List<int>> GetAllRoleIDsAsync()
        {
            return await _context.Roles
                .AsNoTracking()
                .Select(role => role.RoleID)
                .ToListAsync();
        }
    }
}