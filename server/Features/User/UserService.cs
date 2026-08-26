namespace StoreApi.Features.User
{
    public class UserService
    {
        private readonly UserRepository _userRepository;

        public UserService(UserRepository userRepository)
        {
            _userRepository = userRepository;
        }


        public async Task<List<UserDTO>> GetUsersAsync()
        {
            var users = await _userRepository.GetAllAsync();

            return users.Select(u => new UserDTO
            {
                UserID = u.UserID,
                //Username = u.Username,
                //Role = u.Role,
                RoleID = u.RoleID,
                RegistrationDate = u.RegistrationDate,
                Email = u.Email,
                FullName = u.FullName,
                IsActive = u.IsActive
            }).ToList();
        }


        public async Task<UserDTO?> GetUserAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);

            if (user == null)
            {
                return null;
            }

            return new UserDTO
            {
                UserID = user.UserID,
                //Username = user.Username,
                //Role = user.Role,
                RoleID = user.RoleID,
                RegistrationDate = user.RegistrationDate,
                Email = user.Email,
                FullName = user.FullName,
                IsActive = user.IsActive
            };
        }


        public async Task<UserDTO?> CreateUserAsync(UserRequestDTO dto)
        {
            var exists =
                await _userRepository.EmailExistsAsync(dto.Email);

            if (exists)
            {
                return null;
            }

            var entity = new UserModal
            {
                //Username = dto.Username,
                Password = dto.Password,
                RoleID = dto.RoleID,
                //Role = dto.Role,
                Email = dto.Email,
                FullName = dto.FullName,
                IsActive = dto.IsActive,
                RegistrationDate = DateTime.Now
            };

            var createdUser =
                await _userRepository.CreateAsync(entity);

            return new UserDTO
            {
                UserID = createdUser.UserID,
                //Username = createdUser.Username,
                //Role = createdUser.Role,
                RoleID = createdUser.RoleID,
                RegistrationDate = createdUser.RegistrationDate,
                Email = createdUser.Email,
                FullName = createdUser.FullName,
                IsActive = createdUser.IsActive
            };
        }


        public async Task<UserDTO?> UpdateUserAsync(
            int id,
            UserRequestDTO dto)
        {
            var user = await _userRepository.GetByIdAsync(id);

            if (user == null)
            {
                return null;
            }

            //user.Username = dto.Username;
            user.Password = dto.Password;
            //user.Role = dto.Role;
            user.Email = dto.Email;
            user.FullName = dto.FullName;
            user.IsActive = dto.IsActive;
            user.RoleID = dto.RoleID;
            var updatedUser =
                await _userRepository.UpdateAsync(user);

            return new UserDTO
            {
                //UserID = updatedUser.UserID,
                //Username = updatedUser.Username,
                RoleID = updatedUser.RoleID,
                RegistrationDate = updatedUser.RegistrationDate,
                Email = updatedUser.Email,
                FullName = updatedUser.FullName,
                IsActive = updatedUser.IsActive
            };
        }


        public async Task<bool> DeleteUserAsync(int id)
        {
            return await _userRepository.DeleteAsync(id);
        }
    }
}