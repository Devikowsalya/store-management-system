using StoreApi.Features.Product;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StoreApi.Features.Supplier
{
    [Table("Supplier")]
    public class SupplierModal
    {
        [Key]
        public int SupplierID { get; set; }

        [MaxLength(100)]
        public string? SupplierName { get; set; }

        [MaxLength(100)]
        public string? ContactPerson { get; set; }

        [MaxLength(15)]
        public string? Phone { get; set; }

        [MaxLength(100)]
        public string? Email { get; set; }

        [MaxLength(200)]
        public string? Address { get; set; }


        // Navigation Property
        public ICollection<ProductModal>? Products { get; set; }
    }
}