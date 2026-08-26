using Microsoft.EntityFrameworkCore;
using StoreApi.Data;

namespace StoreApi.Features.User
{
    public class UserRepository
    {
        private readonly StoreDbContext _context;

        public UserRepository(StoreDbContext context)
        {
            _context = context;
        }

        public async Task<List<UserModal>> GetAllAsync()
        {
            return await _context.Users
                .OrderByDescending(u => u.RegistrationDate)
                .ToListAsync();
        }

        public async Task<UserModal?> GetByIdAsync(int id)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.UserID == id);
        }

        //public async Task<UserModal?> GetByUsernameAsync(string username)
        //{
        //    return await _context.Users
        //        .FirstOrDefaultAsync(u => u.Username == username);
        //}

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _context.Users
                .AnyAsync(u => u.Email == email);
        }

        public async Task<UserModal> CreateAsync(UserModal entity)
        {
            await _context.Users.AddAsync(entity);

            await _context.SaveChangesAsync();

            return entity;
        }

        public async Task<UserModal> UpdateAsync(UserModal entity)
        {
            _context.Users.Update(entity);

            await _context.SaveChangesAsync();

            return entity;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return false;
            }

            _context.Users.Remove(user);

            await _context.SaveChangesAsync();

            return true;
        }
    }
}