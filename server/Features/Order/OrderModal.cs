using StoreApi.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using StoreApi.Features.User;
namespace StoreApi.Features.Order
{
    [Table("Orders")]
    public class OrderModal
    {
        [Key]
        public int OrderID { get; set; }

        public int CustomerId { get; set; }

        public DateTime OrderDate { get; set; } = DateTime.Now;

        [Column(TypeName = "decimal(10,2)")]
        public decimal TotalAmount { get; set; }

        public string Items { get; set; } = string.Empty;

        public int StatusID { get; set; }

        //public string StatusName { get; set; }

        [ForeignKey(nameof(CustomerId))]
        public UserModal Customer { get; set; } = null!;
    }
}