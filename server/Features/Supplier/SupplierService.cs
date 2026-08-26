using StoreApi.Features.Product;
using StoreApi.Features.Supplier;

namespace StoreApi.Features.Supplier
{
    public class SupplierService
    {
        private readonly SupplierRepository _supplierRepository;

        public SupplierService(SupplierRepository supplierRepository)
        {
            _supplierRepository = supplierRepository;
        }


        public async Task<List<SupplierDTO>> GetSuppliersAsync(string? search)
        {
            var suppliers = await _supplierRepository.GetAllAsync(search);

            return suppliers.Select(s => new SupplierDTO
            {
                SupplierID = s.SupplierID,
                SupplierName = s.SupplierName,
                ContactPerson = s.ContactPerson,
                Phone = s.Phone,
                Email = s.Email,
                Address = s.Address
            }).ToList();
        }

        public async Task<SupplierDTO?> GetSupplierAsync(int id)
        {
            var supplier = await _supplierRepository.GetByIdAsync(id);

            if (supplier == null)
            {
                return null;
            }

            return new SupplierDTO
            {
                SupplierID = supplier.SupplierID,
                SupplierName = supplier.SupplierName,

                ContactPerson = supplier.ContactPerson,
                Phone = supplier.Phone,

                Email = supplier.Email,
                Address = supplier.Address,

            };


        }

        public async Task<SupplierModal> CreateSupplierAsync(SupplierDTO dto)
        {
            var supplier = new SupplierModal
            {
                SupplierName = dto.SupplierName,
                ContactPerson = dto.ContactPerson,
                Phone = dto.Phone,
                Email = dto.Email,
                Address = dto.Address,
            };

            return await _supplierRepository.CreateAsync(supplier);
        }

        public async Task<SupplierModal?> UpdateSupplierAsync(
        int supplierID,
        SupplierDTO dto)
        {
            var supplier =
                await _supplierRepository.GetByIdAsync(supplierID);

            if (supplier == null)
            {
                return null;
            }

            // Update existing product with incoming DTO values
            supplier.SupplierName = dto.SupplierName;
            supplier.ContactPerson = dto.ContactPerson;
            supplier.Phone = dto.Phone;
            supplier.Email = dto.Email;
            supplier.Address = dto.Address;


            return await _supplierRepository.UpdateProductAsync(supplier);


        }
    }
}
