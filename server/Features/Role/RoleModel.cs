using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StoreApi.Features.Role
{
    [Table("Roles")]
    public class RoleModel
    {
        [Key]
        public int RoleID { get; set; }

        [Required]
        public string RoleName { get; set; }  

        public string Description { get; set; }
    }
}
