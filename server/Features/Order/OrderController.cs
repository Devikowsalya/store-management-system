using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StoreApi.DTOs;
using StoreApi.Features.Notification;
using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;
using StoreApi.Hubs;

namespace StoreApi.Features.Order
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly OrderService _orderService;
        private readonly NotificationService _notificationService;
        private readonly IHubContext<NotificationHub> _notificationHubContext;

        public OrderController(
            OrderService orderService,
            NotificationService notificationService,
            IHubContext<NotificationHub> notificationHubContext)
        {
            _orderService = orderService;
            _notificationService = notificationService;
            _notificationHubContext = notificationHubContext;
        }

        // GET: api/Order
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderDTO>>> GetOrders()
        {
            var roleName =
                User.FindFirstValue(ClaimTypes.Role);

            int? customerID = null;

            if (roleName == "User")
            {
                if (!TryGetCurrentUserID(out int currentUserID))
                {
                    return Unauthorized(new
                    {
                        Message = "User ID not found in token."
                    });
                }

                customerID = currentUserID;
            }

            var orders =
                await _orderService.GetOrdersAsync(customerID);

            return Ok(orders);
        }

        // GET: api/Order/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<OrderDTO>> GetOrder(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new
                {
                    Message = "Invalid order ID."
                });
            }

            var order =
                await _orderService.GetOrderAsync(id);

            if (order == null)
            {
                return NotFound(new
                {
                    Message = "Order not found."
                });
            }

            return Ok(order);
        }

        // POST: api/Order
        [HttpPost]
        public async Task<ActionResult<OrderDTO>> PostOrder(
            OrderRequestDTO dto)
        {
            if (dto.CustomerId <= 0)
            {
                return BadRequest(new
                {
                    Message = "Customer ID is required."
                });
            }

            if (string.IsNullOrWhiteSpace(dto.Items))
            {
                return BadRequest(new
                {
                    Message = "Order items are required."
                });
            }

            var order =
                await _orderService.CreateOrderAsync(dto);

            return Ok(new
            {
                Message = "Order created successfully.",
                Data = order
            });
        }

        // PUT: api/Order/5
        [HttpPut("{id:int}")]
        [Authorize(
            Roles = "Admin,Manager,Supervisor,Employee")]
        public async Task<IActionResult> PutOrder(
            int id,
            OrderRequestDTO dto)
        {
            if (id <= 0)
            {
                return BadRequest(new
                {
                    Message = "Invalid order ID."
                });
            }

            var order =
                await _orderService.UpdateOrderAsync(id, dto);

            if (order == null)
            {
                return NotFound(new
                {
                    Message = "Order not found."
                });
            }

            return Ok(new
            {
                Message = "Order updated successfully.",
                Data = order
            });
        }

        // GET: api/Order/summary
        [HttpGet("summary")]
        public async Task<IActionResult> GetOrderSummary()
        {
            var roleName =
                User.FindFirstValue(ClaimTypes.Role);

            int? customerID = null;

            if (roleName == "User")
            {
                if (!TryGetCurrentUserID(out int currentUserID))
                {
                    return Unauthorized(new
                    {
                        Message = "User ID not found in token."
                    });
                }

                customerID = currentUserID;
            }

            var summary =
                await _orderService.GetOrderSummaryAsync(customerID);

            return Ok(summary);
        }

        // DELETE: api/Order/5
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new
                {
                    Message = "Invalid order ID."
                });
            }

            var deleted =
                await _orderService.DeleteOrderAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    Message = "Order not found."
                });
            }

            return Ok(new
            {
                Message = "Order deleted successfully."
            });
        }

        // PATCH: api/Order/20/status/3
        [HttpPatch("{orderID:int}/status/{statusID:int}")]
        [Authorize(
            Roles =
                "Admin,Manager,Supervisor,Employee," +
                "Inventory Manager,Delivery Partner"
        )]
        public async Task<IActionResult> UpdateOrderStatus(
            int orderID,
            int statusID)
        {
            if (orderID <= 0)
            {
                return BadRequest(new
                {
                    Message = "Invalid order ID."
                });
            }

            if (statusID <= 0)
            {
                return BadRequest(new
                {
                    Message = "Invalid status ID."
                });
            }

            if (!TryGetCurrentUser(
                    out int currentUserID,
                    out int currentRoleID))
            {
                return Unauthorized(new
                {
                    Message =
                        "User ID or role ID not found in token."
                });
            }

            var updatedOrder =
                await _orderService.UpdateOrderStatusAsync(
                    orderID,
                    statusID);

            if (updatedOrder == null)
            {
                return NotFound(new
                {
                    Message =
                        "Order or order status not found."
                });
            }

            var targetRoleIDs =
    await _notificationService.GetAllRoleIDsAsync();

            // 1.Store the notification in SQL
            var notification =
           await _notificationService.CreateNotificationAsync(
               new NotificationRequestDTO
               {
                   SenderUserID = currentUserID,
                   SenderRoleID = currentRoleID,

                   NotificationString =
                       $"Order #{updatedOrder.OrderID} status was updated.",

                   NotificationType = "OrderStatus",

                   ReferenceID = updatedOrder.OrderID,
                   ReferenceType = "Order",

                   TargetRoleIDs = targetRoleIDs
               });
            // 2. Send live notification through SignalR
            await _notificationHubContext
                .Clients
                .Group(NotificationHub.StaffGroup)
                .SendAsync(
                    "ReceiveNotification",
                    notification
                );


            return Ok(new
            {
                Message =
                    "Order status updated successfully.",

                Data = new
                {
                    updatedOrder.OrderID,
                    updatedOrder.StatusID,
                    Notification = notification
                }
            });
        }

        private bool TryGetCurrentUserID(
            out int userID)
        {
            var userIDValue =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("UserID");

            return int.TryParse(
                userIDValue,
                out userID);
        }

        private bool TryGetCurrentUser(
            out int userID,
            out int roleID)
        {
            var userIDValue =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("UserID");

            var roleIDValue =
                User.FindFirstValue("roleId")
                ?? User.FindFirstValue("RoleID");

            var validUserID =
                int.TryParse(userIDValue, out userID);

            var validRoleID =
                int.TryParse(roleIDValue, out roleID);

            return validUserID && validRoleID;
        }
    }
}