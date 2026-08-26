using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StoreApi.Features.Order
{
    [Table("OrderStatus")]
    public class OrderStatusModal
    {
        [Key]
        public int StatusID { get; set; }

        public string StatusName { get; set; } = string.Empty;

        public int AssignedRoleID { get; set; }
    }
}