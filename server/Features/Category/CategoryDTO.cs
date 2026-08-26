using System.ComponentModel.DataAnnotations;
namespace StoreApi.Features.Category

{
    public class CategoryDTO
    {
        [Required(ErrorMessage = "Category name is required.")]
        public string? CategoryName { get; set; }
    }
}
