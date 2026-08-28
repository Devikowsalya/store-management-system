using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StoreApi.Features.OrderStatus
{
    [Table("OrderStatus")]
    public class OrderStatusModel
    {
        [Key]
        public int StatusID { get; set; }

        [Required]
        public string StatusName { get; set; }

        [Required]
        public int AssignedRoleID { get; set; }


        [Required]
        public int NextStatusId { get; set; }
    }
}


 