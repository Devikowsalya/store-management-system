using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace StoreApi.Features.Category
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CategoryController : ControllerBase
    {
        private readonly CategoryService _categoryService;

        public CategoryController(CategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetCategories([FromQuery] string? search)
        {
            var categories =
                await _categoryService.GetCategoriesAsync(search);

            return Ok(categories);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager,Supervisor,Employee")]
        public async Task<IActionResult> CreateCategory(
            [FromForm]  CategoryDTO dto)
        {
            var category =
                await _categoryService.CreateCategoryAsync(dto);

            return Ok(new
            {
                Message = "Category created successfully.",
                Data = category
            });
        }

        [HttpPut("{categoryID}")]
        public async Task<IActionResult> PutCategory(
            int categoryID,
            [FromForm] CategoryDTO dto)
        {
            var category =
                await _categoryService.UpdateCategoryAsync(
                    categoryID,
                    dto);

            if (category == null)
            {
                return NotFound(new
                {
                    Message = "Category not found."
                });
            }

            return Ok(new
            {
                Message = "Category updated successfully.",
                Data = category
            });
        }

        [HttpPatch("{categoryID}")]
        [Authorize(Roles = "Admin,Manager,Supervisor,Employee")]
        public async Task<IActionResult> PatchCategory(
            int categoryID,
            [FromForm] CategoryDTO dto)
        {
            var category =
                await _categoryService.PatchCategoryAsync(
                    categoryID,
                    dto);

            if (category == null)
            {
                return NotFound(new
                {
                    Message = "Category not found."
                });
            }

            return Ok(new
            {
                Message = "Category updated successfully.",
                Data = category
            });
        }
    }
}