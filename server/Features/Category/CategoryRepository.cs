using Microsoft.EntityFrameworkCore;
using StoreApi.Data;

namespace StoreApi.Features.Category
{
    public class CategoryRepository
    {
        private readonly StoreDbContext _context;

        public CategoryRepository(StoreDbContext context)
        {
            _context = context;
        }

        //public async Task<List<CategoryDTO>> GetAllAsync()
        //{
        //    return await _context.Categories
        //        .Select(c => new CategoryDTO
        //        {
        //            CategoryID = c.CategoryID,
        //            CategoryName = c.CategoryName,
        //            TotalProducts = _context.Products
        //                .Count(p => p.CategoryID == c.CategoryID)

        //        })
        //        .ToListAsync();
        //}
        public async Task<List<CategoryModel>> GetAllAsync(string? search)
        {
            var query = _context.Categories.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.Trim();

                query = query.Where(c =>
                    c.CategoryName.Contains(search));
            }

            return await query
                .Select(c => new CategoryModel
                {
                    CategoryID = c.CategoryID,
                    CategoryName = c.CategoryName,
                    ProductCount = c.Products != null
                        ? c.Products.Count
                        : 0
                })
                .ToListAsync();
        }
        //public async Task<List<CategoryModel>> GetAllAsync()
        //{
        //    return await _context.Categories
        //        .Include(c => c.Products)
        //        .ToListAsync();
        //}

        public async Task<CategoryModel?> GetByIdAsync(int categoryID)
        {
            return await _context.Categories
                .FirstOrDefaultAsync(
                    x => x.CategoryID == categoryID);
        }

        public async Task<CategoryModel> AddAsync(CategoryModel category)
        {
            _context.Categories.Add(category);

            await _context.SaveChangesAsync();

            return category;
        }

        public async Task<CategoryModel> UpdateAsync(CategoryModel category)
        {
            await _context.SaveChangesAsync();

            return category;
        }
    }
}