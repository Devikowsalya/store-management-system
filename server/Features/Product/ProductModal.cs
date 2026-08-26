using StoreApi.Features.Category;
using StoreApi.Features.Supplier;
using StoreApi.Models;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace StoreApi.Features.Product
{
    [Table("Product")]
    public class ProductModal
    {
        [Key]
        public int ProductID { get; set; }

        [MaxLength(150)]
        public string? ProductName { get; set; }

        public int? CategoryID { get; set; }

        public int? SupplierID { get; set; }

        //[MaxLength(50)]
        //public string? Barcode { get; set; }

        [MaxLength(100)]
        public string? Brand { get; set; }


        [Column(TypeName = "decimal(10,2)")]
        public decimal? Price { get; set; }

        public int? Stock { get; set; }

        public bool IsActive { get; set; }

        //[Column(TypeName = "decimal(10,2)")]
        //public decimal? UnitPrice { get; set; }

        //[Column(TypeName = "decimal(10,2)")]
        //public decimal? CostPrice { get; set; }

        //[Column(TypeName = "decimal(5,2)")]
        //public decimal? TaxPercent { get; set; }


        // Navigation Properties

        [ForeignKey("CategoryID")]
        public CategoryModel? Category { get; set; }


        [ForeignKey("SupplierID")]
        public SupplierModal? Supplier { get; set; }


        public ICollection<Inventory>? Inventories { get; set; }
    }
}