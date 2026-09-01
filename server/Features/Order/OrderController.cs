using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreApi.Data;
using StoreApi.DTOs;
using StoreApi.Models;
using System.Security.Claims;

namespace StoreApi.Features.Order
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrderController : ControllerBase
    {

        private readonly OrderService _orderService;

        public OrderController(OrderService orderService)
        {
            _orderService = orderService;
        }


        // GET: api/Order
        
        [HttpGet]
        [Authorize]
        //(Roles = "Admin,Manager,Supervisor,Employee")
        public async Task<ActionResult<IEnumerable<OrderDTO>>> GetOrders()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            int? customerId = null;

            if (role == "User")
            {
                var userIdClaim = User.FindFirst("UserID")?.Value;

                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return Unauthorized(new
                    {
                        Message = "User ID not found in token."
                    });
                }

                customerId = int.Parse(userIdClaim);
            }
            var orders = await _orderService.GetOrdersAsync(customerId);
           

            return Ok(orders);
        }


        // GET: api/Order/5
        [HttpGet("{id}")] 
        public async Task<ActionResult<OrderDTO>> GetOrder(int id)
        {

            var order = await _orderService.GetOrderAsync(id);
            //var order = await _context.Orders
            //    .FirstOrDefaultAsync(o => o.OrderID == id);

            //if (order == null)
            //{
            //    return NotFound(new
            //    {
            //        Message = "Order not found."
            //    });
            //}

            //var parsedItems = await ParseOrderItems(order.Items);

            //var response = new OrderDTO
            //{
            //    OrderID = order.OrderID,
            //    CustomerId = order.CustomerId,
            //    OrderDate = order.OrderDate,
            //    TotalAmount = order.TotalAmount,
            //    Items = parsedItems
            //};

            return Ok(order);
        }


        // POST: api/Order
        [HttpPost]
        [Authorize]
        //(Roles = "Admin,Manager,Supervisor,Employee")
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

            var order = await _orderService.CreateOrderAsync(dto);


            return Ok(order);
            //return CreatedAtAction(
            //    nameof(GetOrder),
            //    new { id = order.OrderID },
            //    response
            //);

            //var customerExists = await _context.Users
            //    .AnyAsync(u => u.UserID == dto.CustomerId);

            //if (!customerExists)
            //{
            //    return BadRequest(new
            //    {
            //        Message = "Customer not found."
            //    });
            //}

            //var parsedItems = await ParseOrderItems(dto.Items);

            //if (parsedItems.Count == 0)
            //{
            //    return BadRequest(new
            //    {
            //        Message = "No valid order items found."
            //    });
            //}

            //var order = new OrderModal
            //{
            //    CustomerId = dto.CustomerId,
            //    OrderDate = dto.OrderDate ?? DateTime.Now,
            //    TotalAmount = dto.TotalAmount,

            //    // Database gets string
            //    Items = dto.Items
            //};

            //_context.Orders.Add(order);

            //await _context.SaveChangesAsync();

            //var response = new OrderDTO
            //{
            //    OrderID = order.OrderID,
            //    CustomerId = order.CustomerId,
            //    OrderDate = order.OrderDate,
            //    TotalAmount = order.TotalAmount,

            //    // Frontend gets parsed objects
            //    Items = parsedItems
            //};

            //return CreatedAtAction(
            //    nameof(GetOrder),
            //    new { id = order.OrderID },
            //    response
            //);
        }


        // PUT: api/Order/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager,Supervisor,Employee")]

        public async Task<IActionResult> PutOrder(
     int id,
     OrderRequestDTO dto)
        {

            var order = await _orderService.UpdateOrderAsync(id, dto);
            return Ok(new
            {
                Message = "Supplier updated successfully.",
                data = order
            });
            //var order = await _context.Orders
            //    .FindAsync(id);

            //if (order == null)
            //{
            //    return NotFound(new
            //    {
            //        Message = "Order not found."
            //    });
            //}

            //if (dto.CustomerId <= 0)
            //{
            //    return BadRequest(new
            //    {
            //        Message = "Customer ID is required."
            //    });
            //}

            //if (string.IsNullOrWhiteSpace(dto.Items))
            //{
            //    return BadRequest(new
            //    {
            //        Message = "Order items are required."
            //    });
            //}

            //var customerExists = await _context.Users
            //    .AnyAsync(u => u.UserID == dto.CustomerId);

            //if (!customerExists)
            //{
            //    return BadRequest(new
            //    {
            //        Message = "Customer not found."
            //    });
            //}

            //var parsedItems = await ParseOrderItems(dto.Items);

            //if (parsedItems.Count == 0)
            //{
            //    return BadRequest(new
            //    {
            //        Message = "No valid order items found."
            //    });
            //}

            //order.CustomerId = dto.CustomerId;
            //order.OrderDate = dto.OrderDate ?? order.OrderDate;
            //order.TotalAmount = dto.TotalAmount;

            //// Store string in SQL
            //order.Items = dto.Items;

            //await _context.SaveChangesAsync();

            //var response = new OrderDTO
            //{
            //    OrderID = order.OrderID,
            //    CustomerId = order.CustomerId,
            //    OrderDate = order.OrderDate,
            //    TotalAmount = order.TotalAmount,

            //    // Return structured items
            //    Items = parsedItems
            //};

            //return Ok(new
            //{
            //    Message = "Order updated successfully.",
            //    Data = response
            //});
        }

        [HttpGet("summary")]
        [Authorize]
        public async Task<IActionResult> GetOrderSummary()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            int? customerId = null;

            if (role == "User")
            {
                var userIdClaim = User.FindFirst("UserID")?.Value;

                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return Unauthorized(new
                    {
                        Message = "User ID not found in token."
                    });
                }

                customerId = int.Parse(userIdClaim);
            }

            var summary = await _orderService.GetOrderSummaryAsync(customerId);

            return Ok(summary);
        }



        // GET: api/Order/summary
        //[HttpGet("summary")]
        //public async Task<IActionResult> GetOrderSummary()
        //{
        //    var summary = await _orderService.GetOrderSummaryAsync();

        //    return Ok(summary);
        //}


        //{
        //    var now = DateTime.Now;

        //    var startOfMonth = new DateTime(
        //        now.Year,
        //        now.Month,
        //        1
        //    );

        //    var startOfNextMonth = startOfMonth.AddMonths(1);

        //    // Total orders
        //    var totalOrders = await _context.Orders
        //        .CountAsync();

        //    // Total orders for current month
        //    var totalOrdersThisMonth = await _context.Orders
        //        .CountAsync(o =>
        //            o.OrderDate >= startOfMonth &&
        //            o.OrderDate < startOfNextMonth
        //        );

        //    // Total value of all orders
        //    var totalOrderValue = await _context.Orders
        //        .SumAsync(o => o.TotalAmount);

        //    // Orders without Items
        //    var orders = await _context.Orders
        //        .OrderByDescending(o => o.OrderDate)
        //        .Select(o => new OrderSummaryDTO
        //        {
        //            OrderID = o.OrderID,
        //            CustomerId = o.CustomerId,
        //            OrderDate = o.OrderDate,
        //            TotalAmount = o.TotalAmount
        //        })
        //        .ToListAsync();

        //    return Ok(new
        //    {
        //        TotalOrders = totalOrders,
        //        TotalOrdersThisMonth = totalOrdersThisMonth,
        //        TotalOrderValue = totalOrderValue,
        //        Orders = orders
        //    });



        // DELETE: api/Order/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var deleted = await _orderService.DeleteOrderAsync(id);

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
        [HttpPatch("{orderID}/status/{statusID}")]
        [Authorize(
            Roles =
                "Admin,Manager,Supervisor,Employee,Inventory Manager,Delivery Partner"
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

            var updatedOrder =
                await _orderService.UpdateOrderStatusAsync(
                    orderID,
                    statusID
                );

            if (updatedOrder == null)
            {
                return NotFound(new
                {
                    Message = "Order or order status not found."
                });
            }

            return Ok(new
            {
                Message = "Order status updated successfully.",

                Data = new
                {
                    updatedOrder.OrderID,
                    updatedOrder.StatusID
                }
            });
        }
    }
}