using StoreApi.Features.Product;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StoreApi.Models
{
    [Table("Inventory")]
    public class Inventory
    {
        [Key]
        public int InventoryID { get; set; }

        [Required]
        public int ProductID { get; set; }

        public string ProductName { get; set; }

        [Required]
        public int Quantity { get; set; }

        public DateTime? LastUpdated { get; set; }


        // Navigation Property
        public ProductModal? Product { get; set; }
    }
}