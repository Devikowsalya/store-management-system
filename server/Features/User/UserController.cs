using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace StoreApi.Features.User
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly UserService _userService;

        public UserController(UserService userService)
        {
            _userService = userService;
        }


        // GET: api/User
        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _userService.GetUsersAsync();

            return Ok(users);
        }


        // GET: api/User/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _userService.GetUserAsync(id);

            if (user == null)
            {
                return NotFound(new
                {
                    Message = "User not found."
                });
            }

            return Ok(user);
        }


        // POST: api/User
        [HttpPost]
        [Authorize(Roles = "Admin,Manager,Supervisor,Employee")]

        public async Task<IActionResult> CreateUser(
            UserRequestDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Username))
            {
                return BadRequest(new
                {
                    Message = "Username is required."
                });
            }

            if (string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest(new
                {
                    Message = "Password is required."
                });
            }

            var user =
                await _userService.CreateUserAsync(dto);

            if (user == null)
            {
                return BadRequest(new
                {
                    Message = "Username already exists."
                });
            }

            return Ok(new
            {
                Message = "User created successfully.",
                Data = user
            });
        }


        // PUT: api/User/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager,Supervisor,Employee")]

        public async Task<IActionResult> UpdateUser(
            int id,
            UserRequestDTO dto)
        {
            var user =
                await _userService.UpdateUserAsync(id, dto);

            if (user == null)
            {
                return NotFound(new
                {
                    Message = "User not found."
                });
            }

            return Ok(new
            {
                Message = "User updated successfully.",
                Data = user
            });
        }


        // DELETE: api/User/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager,Supervisor,Employee")]

        public async Task<IActionResult> DeleteUser(int id)
        {
            var deleted =
                await _userService.DeleteUserAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    Message = "User not found."
                });
            }

            return Ok(new
            {
                Message = "User deleted successfully."
            });
        }
    }
}