using Microsoft.AspNetCore.Mvc;
using StoreApi.Features.Category;
using System.Diagnostics;

namespace StoreApi.Features.Product
{
    public class ProductService
    {
        private readonly ProductRepository _productRepository;

        public ProductService(ProductRepository productRepository)
        {
            _productRepository = productRepository;
        }

        public async Task<List<ProductDTO>> GetProductsAsync(string? search,
    int? pageNumber,
    int? pageSize,
    string? sortBy,
    string? stockStatus,
    decimal? minPrice,
    decimal? maxPrice,
    int? categoryId)
        {
            var products = await _productRepository.GetAllAsync(search,
        pageNumber,
        pageSize,
        sortBy,
        stockStatus,
        minPrice,
        maxPrice,
        categoryId);

            return products.Select(p => new ProductDTO
            {
                ProductID = p.ProductID,
                ProductName = p.ProductName,

                CategoryID = p.CategoryID,
                CategoryName = p.Category?.CategoryName,

                SupplierID = p.SupplierID,
                SupplierName = p.Supplier?.SupplierName,

                Brand = p.Brand,
                Price = p.Price,
                Stock = p.Stock,
                IsActive = p.IsActive
            }).ToList();
        }

     public async Task<int>   GetProductCountAsync()
        {
            var count = await _productRepository.GetProductCountAsync();
                return count;
        }

        public async Task<List<ProductModal>> GetLowStockProductsAsync()
        {
            return await _productRepository.GetLowStockProductsAsync();
        }

        public async Task<decimal?> GetInventoryValue()
        {
            var amount = await _productRepository.GetInventoryValue();
            return amount;
        }

        public async Task<ProductDTO?> GetProductAsync(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);

            if (product == null)
            {
                return null;
            }

            return new ProductDTO
            {
                ProductID = product.ProductID,
                ProductName = product.ProductName,

                CategoryID = product.CategoryID,
                CategoryName = product.Category?.CategoryName,

                SupplierID = product.SupplierID,
                SupplierName = product.Supplier?.SupplierName,

                Brand = product.Brand,
                Price = product.Price,
                Stock = product.Stock,
                IsActive = product.IsActive
            };
        }

        public async Task<ProductModal> CreateProductAsync(ProductDTO dto)
        {
            var product = new ProductModal
            {
                ProductName = dto.ProductName,
                CategoryID = dto.CategoryID,
                SupplierID = dto.SupplierID,
                Brand = dto.Brand,
                Price = dto.Price,
                Stock = dto.Stock,
                IsActive = dto.IsActive
            };
            Console.WriteLine($"DTO Price: {dto.Price}");
            Console.WriteLine($"Product Price: {product.Price}");
            return await _productRepository.CreateAsync(product);
        }

        public async Task<ProductModal?> UpdateProductAsync(
            int productID,
            ProductDTO dto)
        {
            var product =
                await _productRepository.GetByIdAsync(productID);

            if (product == null)
            {
                return null;
            }

            // Update existing product with incoming DTO values
            product.ProductName = dto.ProductName;
            product.CategoryID = dto.CategoryID;
            product.SupplierID = dto.SupplierID;
            product.Brand = dto.Brand;
            product.Price = dto.Price;
            product.Stock = dto.Stock;
            product.IsActive = dto.IsActive;

            return await _productRepository.UpdateProductAsync(product);
        }

    }
}
