using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreApi.Data;
using StoreApi.DTOs;
using StoreApi.Features.Category;
using StoreApi.Models;

namespace StoreApi.Features.Product
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProductController : ControllerBase
    {
        private readonly ProductService _productService;

        public ProductController(ProductService productService)
        {
            _productService = productService;
        }


        // GET: api/Product
        [HttpGet]
        //[Authorize(Roles = "Admin,Manager,Supervisor,Employee")]

        public async Task<IActionResult> GetProducts([FromQuery] string? search,
    [FromQuery] int? pageNumber,
    [FromQuery] int? pageSize,
    [FromQuery] string? sortBy,
    [FromQuery] string? stockStatus,
    [FromQuery] decimal? minPrice,
    [FromQuery] decimal? maxPrice,
     [FromQuery] int? categoryId)
        {
            var products =
                await _productService.GetProductsAsync(search, pageNumber, pageSize, sortBy, stockStatus, minPrice, maxPrice, categoryId);

            return Ok(products);
        }
        //public async Task<ActionResult<IEnumerable<ProductDTO>>> GetProducts()
        //{
        //    var products = await _context.Products
        //        .Include(p => p.Category)
        //        .Include(p => p.Supplier)
        //        .Select(p => new ProductDTO
        //        {
        //            ProductID = p.ProductID,
        //            ProductName = p.ProductName,

        //            CategoryID = p.CategoryID,
        //            CategoryName = p.Category != null
        //                ? p.Category.CategoryName
        //                : null,

        //            SupplierID = p.SupplierID,
        //            SupplierName = p.Supplier != null
        //                ? p.Supplier.SupplierName
        //                : null,

        //            Brand = p.Brand,
        //            Price = p.Price,
        //            Stock = p.Stock,
        //            IsActive = p.IsActive
        //        })
        //        .ToListAsync();

        //    return Ok(products);
        //}



        // GET: api/Product/5
        [HttpGet("{id}")]
        public async Task<ActionResult> GetProduct(int id)
        {
            var product = await _productService.GetProductAsync(id);
            return Ok(product);
            //    var product = await _context.Products
            //        .Include(p => p.Category)
            //        .Include(p => p.Supplier)
            //        .Where(p => p.ProductID == id)
            //        .Select(p => new ProductDTO
            //        {
            //            ProductID = p.ProductID,
            //            ProductName = p.ProductName,

            //            CategoryID = p.CategoryID,
            //            CategoryName = p.Category != null
            //                ? p.Category.CategoryName
            //                : null,

            //            SupplierID = p.SupplierID,
            //            SupplierName = p.Supplier != null
            //                ? p.Supplier.SupplierName
            //                : null,

            //            //Barcode = p.Barcode,
            //            Brand = p.Brand,
            //            Price = p.Price,
            //            Stock = p.Stock,
            //            IsActive = p.IsActive
            //            //UnitPrice = p.UnitPrice,
            //            //CostPrice = p.CostPrice,
            //            //TaxPercent = p.TaxPercent
            //        })
            //        .FirstOrDefaultAsync();


            //    if (product == null)
            //    {
            //        return NotFound(new { Message = "Product not found." });
            //    }

            //    return Ok(product);
        }


         //POST: api/Product
        [HttpPost]
        [Authorize(Roles = "Admin,Manager,Supervisor,Employee")]

        public async Task<ActionResult<ProductDTO>> CreateProduct([FromForm] ProductDTO dto)
        {
            Console.WriteLine($"DTO Price in controller: {dto.Price}");

            var product =
              await _productService.CreateProductAsync(dto);
            return Ok(new
            {
                Message = "Product created successfully.",
                Data = product
            });

            //    var product = new Product
            //    {
            //        ProductName = dto.ProductName,

            //        CategoryID = dto.CategoryID,
            //        SupplierID = dto.SupplierID,

            //        //Barcode = dto.Barcode,
            //        Brand = dto.Brand,

            //        Price = dto.Price,
            //        Stock = dto.Stock,
            //        IsActive = dto.IsActive,
            //        //UnitPrice = dto.UnitPrice,
            //        //CostPrice = dto.CostPrice,
            //        //TaxPercent = dto.TaxPercent
            //    };


            //    _context.Products.Add(product);
            //    await _context.SaveChangesAsync();


            //    dto.ProductID = product.ProductID;


            //    return CreatedAtAction(nameof(GetProduct),
            //        new { id = product.ProductID }, dto);
        }


        // PUT: api/Product/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager,Supervisor,Employee")]

        public async Task<IActionResult> PutProduct(
            int id,
            ProductDTO dto)
        {
            var product =
                await _productService.UpdateProductAsync(id, dto);

            return Ok(new
            {
                Message = "Product updated successfully.",
                Data = product
            });

            //        await _context.Products.FindAsync(id);

            //    if (product == null)
            //    {
            //        return NotFound(new
            //        {
            //            Message = "Product not found."
            //        });
            //    }

            //    product.ProductName = dto.ProductName;
            //    product.CategoryID = dto.CategoryID;
            //    product.SupplierID = dto.SupplierID;
            //    product.Brand = dto.Brand;
            //    product.Price = dto.Price;
            //    product.Stock = dto.Stock;
            //    product.IsActive = dto.IsActive;

            //    await _context.SaveChangesAsync();

            //    return Ok(new
            //    {
            //        Message = "Product updated successfully.",
            //        Data = product
            //    });
        }

        [HttpGet("count")]
        public async Task<IActionResult> GetProductCount()
        {
            var count =
                await _productService.GetProductCountAsync();
            //var count = await _context.Products.CountAsync();

            return Ok(new
            {
                Count = count
            });
        }

        [HttpGet("inventory-value")]
        public async Task<IActionResult> GetInventoryValue()
        {
            var totalAmount = await _productService.GetInventoryValue();
                //.SumAsync(p => p.Price * p.Stock);

            return Ok(new
            {
                TotalAmount = totalAmount
            });
        }

        // GET: api/Product/low-stock
        [HttpGet("low-stock")]
        public async Task<IActionResult> GetLowStockProducts()
        {
            var products = await _productService.GetLowStockProductsAsync();

            var response = products.Select(p => new
            {
                p.ProductID,
                p.ProductName,
                p.Stock,
                p.Price
            });

            return Ok(new
            {
                TotalLowStockProducts = products.Count,
                Products = response
            });
        }


        // DELETE: api/Product/5
        //[HttpDelete("{id}")]
        //public async Task<IActionResult> DeleteProduct(int id)
        //{
        //    var product = await _context.Products.FindAsync(id);


        //    if (product == null)
        //    {
        //        return NotFound(new { Message = "Product not found." });
        //    }


        //    _context.Products.Remove(product);
        //    await _context.SaveChangesAsync();


        //    return Ok(new { Message = "Product deleted successfully." });
        //}
    }
}