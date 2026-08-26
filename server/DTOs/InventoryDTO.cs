using System.ComponentModel.DataAnnotations;

namespace StoreApi.DTOs
{
    public class InventoryDTO
    {
        //public int InventoryID { get; set; }

        [Required(ErrorMessage = "Product ID is required.")]
        public int ProductID { get; set; }

        public string? ProductName { get; set; }

        [Required(ErrorMessage = "Quantity is required.")]
        public int Quantity { get; set; }

        public DateTime? LastUpdated { get; set; }
    }
}