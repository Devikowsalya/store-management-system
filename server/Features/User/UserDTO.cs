namespace StoreApi.Features.User
{
    public class UserDTO
    {
        public int UserID { get; set; }
         
        public int RoleID { get; set; } 

        public DateTime RegistrationDate { get; set; }

        public string Email { get; set; } = string.Empty;

        public string FullName { get; set; } = string.Empty;

        public bool IsActive { get; set; }
    }
}