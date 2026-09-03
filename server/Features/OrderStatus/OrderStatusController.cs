using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreApi.Data;

namespace StoreApi.Features.OrderStatus
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderStatusController : ControllerBase
    {
        private readonly StoreDbContext _context;

        public OrderStatusController(StoreDbContext context)
        {
            _context = context;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetOrderStatuses()
        {
            var statuses = await _context.OrderStatuses
                .AsNoTracking()
                .OrderBy(s => s.StatusID)
                .Select(s => new
                {
                    s.StatusID,
                    s.StatusName,
                    s.AssignedRoleID,
                    s.NextStatusId
                })
                .ToListAsync();

            return Ok(new
            {
                Message = "Order statuses retrieved successfully.",
                Data = statuses
            });
        }
    }
}