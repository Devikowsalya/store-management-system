using Microsoft.EntityFrameworkCore;
using StoreApi.Features.Category;
using StoreApi.Features.Order;
using StoreApi.Features.Product;
using StoreApi.Features.Supplier;
using StoreApi.Features.User;
using StoreApi.Models;

namespace StoreApi.Data
{
    public class StoreDbContext : DbContext
        
    {
        public StoreDbContext(DbContextOptions<StoreDbContext> options)
            : base(options)
        {

        }

        public DbSet<CategoryModel> Categories { get; set; }

        public DbSet<Inventory> Inventories { get; set; }

        public DbSet<OrderModal> Orders { get; set; }

        public DbSet<ProductModal> Products { get; set; }

        public DbSet<SupplierModal> Suppliers { get; set; }

        public DbSet<UserModal> Users { get; set; }

        public DbSet<OrderStatusModal> OrderStatuses { get; set; }
    }
}
