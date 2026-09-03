using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StoreApi.Features.Notification;

namespace StoreApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly NotificationService _notificationService;

        public NotificationController(
            NotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        // GET: api/Notification
        // GET: api/Notification?isRead=false
        // GET: api/Notification?isRead=true
        [HttpGet]
        public async Task<IActionResult> GetAllNotifications(
            [FromQuery] bool? isRead = null)
        {
            if (!TryGetCurrentUser(
                    out int userID,
                    out int roleID))
            {
                return Unauthorized(new
                {
                    Message = "Invalid user token."
                });
            }

            var notifications =
                await _notificationService.GetAllNotificationsAsync(
                    userID,
                    roleID,
                    isRead);

            return Ok(new
            {
                Message = "Notifications retrieved successfully.",
                Data = notifications
            });
        }

        // PATCH: api/Notification/10/read
        [HttpPatch("{notificationID:int}/read")]
        public async Task<IActionResult> MarkAsRead(
            int notificationID)
        {
            if (!TryGetCurrentUser(
                    out int userID,
                    out int roleID))
            {
                return Unauthorized(new
                {
                    Message = "Invalid user token."
                });
            }

            var result =
                await _notificationService.MarkAsReadAsync(
                    notificationID,
                    userID,
                    roleID);

            if (!result)
            {
                return NotFound(new
                {
                    Message =
                        "Notification not found or access denied."
                });
            }

            return Ok(new
            {
                Message = "Notification marked as read."
            });
        }

        // PATCH: api/Notification/read-all
        [HttpPatch("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            if (!TryGetCurrentUser(
                    out int userID,
                    out int roleID))
            {
                return Unauthorized(new
                {
                    Message = "Invalid user token."
                });
            }

            var updatedCount =
                await _notificationService.MarkAllAsReadAsync(
                    userID,
                    roleID);

            return Ok(new
            {
                Message = updatedCount == 0
                    ? "No unread notifications found."
                    : $"{updatedCount} notifications marked as read.",

                Data = new
                {
                    UpdatedCount = updatedCount
                }
            });
        }

        private bool TryGetCurrentUser(
            out int userID,
            out int roleID)
        {
            var userIDValue =
                User.FindFirstValue("UserID");

            var roleIDValue =
                User.FindFirstValue("RoleID");

            var validUserID =
                int.TryParse(userIDValue, out userID);

            var validRoleID =
                int.TryParse(roleIDValue, out roleID);

            return validUserID && validRoleID;
        }
    }
}