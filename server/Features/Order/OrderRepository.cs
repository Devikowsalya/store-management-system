using Microsoft.EntityFrameworkCore;
using StoreApi.Data;
using StoreApi.Features.Supplier;
namespace StoreApi.Features.Order
{
    public class OrderRepository
    {
        private readonly StoreDbContext _context;

        public OrderRepository(StoreDbContext context)
        {
            _context = context;
        }

        public async Task<List<OrderModal>> GetAllAsync()
        {
            return await _context.Orders.ToListAsync();
        }

        public async Task<OrderModal> GetByIdAsync(int OrderID)
        {
            return await _context.Orders
                .FirstOrDefaultAsync(
                    x => x.OrderID == OrderID);
        }

        public async Task<OrderModal> CreateAsync(OrderModal Order)
        {
            _context.Orders.Add(Order);

            await _context.SaveChangesAsync();

            return Order;
        }

        public async Task<List<OrderModal>> GetAllAsync(int? customerId)
        {
            var query = _context.Orders.AsQueryable();

            if (customerId.HasValue)
            {
                query = query.Where(o => o.CustomerId == customerId.Value);
            }

            return await query
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }

        public async Task<OrderModal> UpdateOrderAsync(OrderModal Order)
        {
         await   _context.SaveChangesAsync();

            return (Order);
        }

        public async Task<List<OrderModal>> GetAllOrdersSummaryAsync()
        {
            return await _context.Orders
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var order = await _context.Orders.FindAsync(id);

            if (order == null)
            {
                return false;
            }

            _context.Orders.Remove(order);

            await _context.SaveChangesAsync();

            return true;
        }
        public async Task<string?> GetStatusNameAsync(int statusId)
        {
            return await _context.OrderStatuses
                .Where(s => s.StatusID == statusId)
                .Select(s => s.StatusName)
                .FirstOrDefaultAsync();
        }
    }

}
