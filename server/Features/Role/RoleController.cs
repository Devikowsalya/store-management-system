using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreApi.Data;

namespace StoreApi.Features.Role
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoleController : ControllerBase
    {
        private readonly StoreDbContext _context;

        public RoleController(StoreDbContext context)
        {
            _context = context;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await _context.Roles
                .AsNoTracking()
                .OrderBy(r => r.RoleName)
                .Select(r => new
                {
                    r.RoleID,
                    r.RoleName
                })
                .ToListAsync();

            return Ok(new
            {
                Message = "Roles retrieved successfully.",
                Data = roles
            });
        }
    }
}