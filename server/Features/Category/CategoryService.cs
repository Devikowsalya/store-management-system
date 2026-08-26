//using StoreApi.Features.Category;


namespace StoreApi.Features.Category
{
    public class CategoryService
    {
        private readonly CategoryRepository _categoryRepository;

        public CategoryService(CategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        public async Task<List<CategoryModel>> GetCategoriesAsync(string? search)
        {
            return await _categoryRepository.GetAllAsync(search);
        }

        public async Task<CategoryModel> CreateCategoryAsync(CategoryDTO dto)
        {
            var category = new CategoryModel
            {
                CategoryName = dto.CategoryName
            };

            return await _categoryRepository.AddAsync(category);
        }

        public async Task<CategoryModel?> UpdateCategoryAsync(
            int categoryID,
            CategoryDTO dto)
        {
            var category =
                await _categoryRepository.GetByIdAsync(categoryID);

            if (category == null)
            {
                return null;
            }

            category.CategoryName = dto.CategoryName;

            return await _categoryRepository.UpdateAsync(category);
        }

        public async Task<CategoryModel?> PatchCategoryAsync(
            int categoryID,
            CategoryDTO dto)
        {
            var category =
                await _categoryRepository.GetByIdAsync(categoryID);

            if (category == null)
            {
                return null;
            }

            if (!string.IsNullOrWhiteSpace(dto.CategoryName))
            {
                category.CategoryName = dto.CategoryName;
            }

            return await _categoryRepository.UpdateAsync(category);
        }
    }
}