using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreApi.Data;
using StoreApi.Features.Product;
using StoreApi.Models;

namespace StoreApi.Features.Supplier
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SupplierController : ControllerBase
    {
        private readonly SupplierService _supplierService;

        public SupplierController(SupplierService supplierService)
        {
            _supplierService = supplierService;
        }


        // GET: api/Supplier
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SupplierDTO>>> GetSuppliers([FromQuery] string? search)
        {
            var suppliers = await _supplierService.GetSuppliersAsync(search);
            //var suppliers = await _context.Suppliers
            //    .Select(s => new SupplierDTO
            //    {
            //        SupplierID = s.SupplierID,
            //        SupplierName = s.SupplierName,
            //        ContactPerson = s.ContactPerson,
            //        Phone = s.Phone,
            //        Email = s.Email,
            //        Address = s.Address
            //    })
            //    .ToListAsync();

            return Ok(suppliers);
        }


        // GET: api/Supplier/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SupplierDTO>> GetSupplier(int id)
        {
            var supplier = await _supplierService.GetSupplierAsync(id);
            //var supplier = await _context.Suppliers
            //    .Where(s => s.SupplierID == id)
            //    .Select(s => new SupplierDTO
            //    {
            //        SupplierID = s.SupplierID,
            //        SupplierName = s.SupplierName,
            //        ContactPerson = s.ContactPerson,
            //        Phone = s.Phone,
            //        Email = s.Email,
            //        Address = s.Address
            //    })
            //    .FirstOrDefaultAsync();


            //if (supplier == null)
            //{
            //    return NotFound(new { Message = "Supplier not found." });
            //}


            return Ok(supplier);
        }


        // POST: api/Supplier
        [HttpPost]
        [Authorize(Roles = "Admin,Manager,Supervisor,Employee")]
        public async Task<ActionResult<SupplierDTO>> PostSupplier(SupplierDTO dto)
        {
            var supplier = await _supplierService.CreateSupplierAsync(dto);

            return Ok(supplier);
            //var supplier = new Supplier
            //{
            //    SupplierName = dto.SupplierName,
            //    ContactPerson = dto.ContactPerson,
            //    Phone = dto.Phone,
            //    Email = dto.Email,
            //    Address = dto.Address
            //};


            //_context.Suppliers.Add(supplier);
            //await _context.SaveChangesAsync();


            //dto.SupplierID = supplier.SupplierID;


            //return CreatedAtAction(nameof(GetSupplier),
            //    new { id = supplier.SupplierID }, dto);
        }


        // PUT: api/Supplier/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager,Supervisor,Employee")]
        public async Task<IActionResult> PutSupplier(int id, SupplierDTO dto)
        {
            var supplier = await _supplierService.UpdateSupplierAsync(id, dto);
            //var supplier = _supplierService.UpdateSupplierAsync(id, dto);
            return Ok(new { 
                Message = "Supplier updated successfully." });
            //if (id != dto.SupplierID)
            //{
            //    return BadRequest(new { Message = "Supplier ID mismatch." });
            //}


            //var supplier = await _context.Suppliers.FindAsync(id);


            //if (supplier == null)
            //{
            //    return NotFound(new { Message = "Supplier not found." });
            //}


            //supplier.SupplierName = dto.SupplierName;
            //supplier.ContactPerson = dto.ContactPerson;
            //supplier.Phone = dto.Phone;
            //supplier.Email = dto.Email;
            //supplier.Address = dto.Address;


            //await _context.SaveChangesAsync();


            //return Ok(new { Message = "Supplier updated successfully." });
        }


        // DELETE: api/Supplier/5
        //[HttpDelete("{id}")]
        //public async Task<IActionResult> DeleteSupplier(int id)
        //{
        //    var supplier = await _context.Suppliers.FindAsync(id);


        //    if (supplier == null)
        //    {
        //        return NotFound(new { Message = "Supplier not found." });
        //    }


        //    _context.Suppliers.Remove(supplier);
        //    await _context.SaveChangesAsync();


        //    return Ok(new { Message = "Supplier deleted successfully." });
        //}
    }
}