using System.ComponentModel.DataAnnotations;
namespace StoreApi.DTOs
{
    public class RegisterDTO
    {
        [Required(ErrorMessage = "FirstName is required.")]
        public string FirstName { get; set; }


        [Required(ErrorMessage = "Email is required.")]
        [StringLength(50, MinimumLength = 3,
           ErrorMessage = "Email must be between 3 and 50 characters.")]
        public string Email { get; set; }  

        [Required(ErrorMessage = "Password is required.")]
        [StringLength(100, MinimumLength = 6,
            ErrorMessage = "Password must be at least 6 characters.")]
        public string Password { get; set; }

        public string LastName { get; set; }

        public DateTime RegistrationDate { get; set; } = DateTime.Now;

       
    }
}