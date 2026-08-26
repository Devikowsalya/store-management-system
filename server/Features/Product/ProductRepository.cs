using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreApi.Data;
using StoreApi.Features.Product;

namespace StoreApi.Features.Product
{
    public class ProductRepository
    {
        private readonly StoreDbContext _context;

        public ProductRepository(StoreDbContext context)
        {
            _context = context;
        }

        //public async Task<List<ProductModal>> GetAllAsync(string? search, int? pageNumber,int? pageSize)
        //{
        //    {
        //        var query = _context.Products
        //            .Include(p => p.Category)
        //            .Include(p => p.Supplier)
        //            .OrderBy(p => p.ProductID)
        //            .AsQueryable();



        //        if (!string.IsNullOrWhiteSpace(search))
        //        {
        //            search = search.Trim();

        //            query = query.Where(p =>
        //                p.ProductName.Contains(search) ||
        //                p.Brand.Contains(search));
        //        }

        //        // Order before pagination
        //        query = query.OrderBy(p => p.ProductID);

        //        // Pagination
        //        if (pageNumber.HasValue &&
        //            pageSize.HasValue &&
        //            pageNumber.Value > 0 &&
        //            pageSize.Value > 0)
        //        {
        //            query = query
        //                .Skip((pageNumber.Value - 1) * pageSize.Value)
        //                .Take(pageSize.Value);
        //        }

        //        return await query.ToListAsync();
        //        //return await _context.Products
        //        //    .Include(p => p.Category)
        //        //    .Include(p => p.Supplier)
        //        //    .ToListAsync();
        //    }
        //}


        public async Task<List<ProductModal>> GetAllAsync(
    string? search,
    int? pageNumber,
    int? pageSize,
    string? sortBy,
    string? stockStatus,
    decimal? minPrice,
    decimal? maxPrice,
    int? categoryId)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.Supplier)
                .AsQueryable();

            // category filter 

            if (categoryId.HasValue && categoryId.Value > 0)
            {
                query = query.Where(p =>
                    p.CategoryID == categoryId.Value);
            }


            // =========================
            // Search
            // =========================
            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.Trim();

                query = query.Where(p =>
                    p.ProductName.Contains(search) ||
                    p.Brand.Contains(search));
            }

            // =========================
            // Price Range Filter
            // =========================
            if (minPrice.HasValue)
            {
                query = query.Where(p => p.Price >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(p => p.Price <= maxPrice.Value);
            }

            // =========================
            // Stock Status Filter
            // =========================
            if (!string.IsNullOrWhiteSpace(stockStatus))
            {
                switch (stockStatus)
                {
                    case "in_stock":
                        query = query.Where(p => p.Stock > 5);
                        break;

                    case "low_stock":
                        query = query.Where(p => p.Stock >= 1 && p.Stock <= 5);
                        break;

                    case "out_of_stock":
                        query = query.Where(p => p.Stock == 0);
                        break;

                    case "all":
                    default:
                        break;
                }
            }

            // =========================
            // Sorting
            // =========================
            query = sortBy switch
            {
                "name_asc" => query.OrderBy(p => p.ProductName),

                "name_desc" => query.OrderByDescending(p => p.ProductName),

                "price_asc" => query.OrderBy(p => p.Price),

                "price_desc" => query.OrderByDescending(p => p.Price),

                "stock_asc" => query.OrderBy(p => p.Stock),

                "stock_desc" => query.OrderByDescending(p => p.Stock),

                _ => query.OrderBy(p => p.ProductID)
            };

            // =========================
            // Pagination
            // =========================
            if (pageNumber.HasValue &&
                pageSize.HasValue &&
                pageNumber.Value > 0 &&
                pageSize.Value > 0)
            {
                query = query
                    .Skip((pageNumber.Value - 1) * pageSize.Value)
                    .Take(pageSize.Value);
            }

            return await query.ToListAsync();
        }

        public async Task<ProductModal> GetByIdAsync(int ProductID)
        {
            return await _context.Products
                .FirstOrDefaultAsync(
                    x => x.ProductID == ProductID);
        }

        public async Task<ProductModal> CreateAsync(ProductModal product)
        {
            _context.Products.Add(product);

            await _context.SaveChangesAsync();

            return product;
        }

        public async Task<int> GetProductCountAsync()
        {
          return await _context.Products.CountAsync();
               
        }

        public async Task<decimal?> GetInventoryValue()
        {
            return await _context.Products
                .SumAsync(p => p.Price * p.Stock);
        }

        public async Task<List<ProductModal>> GetLowStockProductsAsync()
        {
            return await _context.Products
                .Where(p => p.Stock <= 10)
                .OrderBy(p => p.Stock)
                .ToListAsync();
        }
        public async Task<ProductModal> UpdateProductAsync(ProductModal product)
        {
           await _context.SaveChangesAsync();

            return (product);
        }
    }
}
