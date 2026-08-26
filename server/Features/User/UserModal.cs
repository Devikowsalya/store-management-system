using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StoreApi.Features.User
{
    [Table("Users")]
    public class UserModal
    {
        [Key]
        public int UserID { get; set; }

      
        [Required]
        public string Password { get; set; } = string.Empty;

        public int RoleID { get; set; }

        public DateTime RegistrationDate { get; set; }

        [StringLength(50)]
        public string Email { get; set; } = string.Empty;

        [StringLength(50)]
        public string FullName { get; set; } = string.Empty;

        public bool IsActive { get; set; }

     
    }
}