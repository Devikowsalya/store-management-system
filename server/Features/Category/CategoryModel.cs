using StoreApi.Features.Product;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using ProductEntity = StoreApi.Features.Product.ProductModal;

namespace StoreApi.Features.Category
{
    [Table("Category")]
    public class CategoryModel
    {
        [Key]
        public int CategoryID { get; set; }


        [StringLength(100)]
        [Required]
        public string CategoryName { get; set; }

        // Navigation Property
        [JsonIgnore]
        public ICollection<ProductEntity>? Products { get; set; }

        [NotMapped]
        public int ProductCount { get; set; }
    }
}