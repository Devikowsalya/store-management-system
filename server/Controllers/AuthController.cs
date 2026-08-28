using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StoreApi.Data;
using StoreApi.DTOs;
using StoreApi.Features.User;
using StoreApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace StoreApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly StoreDbContext _context;
        private readonly IConfiguration _configuration;

        // Constructor
        public AuthController(StoreDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDTO login)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Email == login.Email &&
                    u.Password == login.Password
                );

            if (user == null)
            {
                return Unauthorized(new
                {
                    Message = "User not found, please signup"
                });
            }

            // Convert RoleID to Role Name
            string roleName = user.RoleID switch
            {
                1 => "Admin",
                2 => "Manager",
                3 => "Supervisor",
                4 => "Employee",
                5 => "User",
                7 => "Inventory Manager",
                8 => "Delivery Partner"
            };

            // JWT Claims
            var claims = new[]
            {
        new Claim(ClaimTypes.Email, user.Email),

        new Claim(
            ClaimTypes.Role,
            roleName
        ),

        new Claim(
            "RoleID",
            user.RoleID.ToString()
        ),

        new Claim(
            "UserID",
            user.UserID.ToString()
        )
    };

            // JWT Key
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    _configuration["Jwt:Key"]!
                )
            );

            var credentials = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256
            );

            // Generate Token
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(
                    Convert.ToDouble(
                        _configuration["Jwt:DurationInHours"]
                    )
                ),
                signingCredentials: credentials
            );

            var tokenString = new JwtSecurityTokenHandler()
                .WriteToken(token);

            return Ok(new
            {
                Message = "Login successful",
                Token = tokenString,
                Data = new
                {
                    UserID = user.UserID,
                    Email = user.Email,
                    RoleID = user.RoleID,
                    Role = roleName
                }
            });
        }


        [HttpPost("register")]
        public async Task<IActionResult> Register([FromForm] RegisterDTO register)
        {
            // Check if username already exists
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == register.Email);

            if (existingUser != null)
            {
                return BadRequest("Username already exists");
            }


            // Create new user object
            var user = new UserModal
            {
                Email = register.Email,
                Password = register.Password,
                //firstName = register.FirstName,

                //Role = register.Role
            };


            // Save into database
            _context.Users.Add(user);

            await _context.SaveChangesAsync();


            return Ok(new
            {
                Message = "User registered successfully",
                Data = new
                {
                    UserID = user.UserID,
                    Email = user.Email
                }
            });
        }

    }
}