using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace StoreApi.Hubs
{
    [Authorize(
        Roles =
            "Admin,Manager,Supervisor,Employee,Inventory Manager,Delivery Partner"
    )]
    public class NotificationHub : Hub
    {
        public const string StaffGroup = "StaffNotifications";

        public override async Task OnConnectedAsync()
        {
            var roleName = Context.User?
                .FindFirstValue(ClaimTypes.Role);

            if (!string.IsNullOrWhiteSpace(roleName))
            {
                await Groups.AddToGroupAsync(

                    Context.ConnectionId,
                    StaffGroup
                );
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(
            Exception? exception
        )
        {
            await Groups.RemoveFromGroupAsync(
                Context.ConnectionId,
                StaffGroup
            );

            await base.OnDisconnectedAsync(exception);
        }
    }
}