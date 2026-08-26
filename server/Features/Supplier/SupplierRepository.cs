using Microsoft.EntityFrameworkCore;
using StoreApi.Data;

namespace StoreApi.Features.Supplier
{
    public class SupplierRepository
    {
        private readonly StoreDbContext _context;

        public SupplierRepository(StoreDbContext context)
        {
            _context = context;
        }

        public async Task<List<SupplierModal>> GetAllAsync(string? search)
        {
            var query = _context.Suppliers.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.Trim();

                query = query.Where(s =>
                    s.SupplierName.Contains(search));
            }

            return await query.ToListAsync();
        }

        public async Task<SupplierModal> GetByIdAsync(int SupplierID)
        {
            return await _context.Suppliers
                .FirstOrDefaultAsync(
                    x => x.SupplierID == SupplierID);
        }

        public async Task<SupplierModal> CreateAsync(SupplierModal Supplier)
        {
            _context.Suppliers.Add(Supplier);

            await _context.SaveChangesAsync();

            return Supplier;
        }

        public async Task<SupplierModal> UpdateProductAsync(SupplierModal Supplier)
        {
          await  _context.SaveChangesAsync();

            return (Supplier);
        }
    }
}
