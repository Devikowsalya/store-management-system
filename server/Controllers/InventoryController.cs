using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreApi.Data;
using StoreApi.DTOs;
using StoreApi.Models;

namespace StoreApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class InventoryController : ControllerBase
    {
        private readonly StoreDbContext _context;

        public InventoryController(StoreDbContext context)
        {
            _context = context;
        }


        // GET: api/Inventory
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<InventoryResponse>>> GetInventories()
        {
            var inventories = await _context.Inventories
                .Select(i => new InventoryResponse
                {
                    InventoryID = i.InventoryID,
                    ProductID = i.ProductID,
                    ProductName = i.Product != null
                        ? i.Product.ProductName
                        : null,
                    Quantity = i.Quantity,
                    LastUpdated = i.LastUpdated
                })
                .ToListAsync();

            return Ok(inventories);
        }


        // GET: api/Inventory/5
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<InventoryResponse>> GetInventory(int id)
        {
            var inventory = await _context.Inventories
                .Where(i => i.InventoryID == id)
                .Select(i => new InventoryResponse
                {
                    InventoryID = i.InventoryID,
                    ProductID = i.ProductID,
                    ProductName = i.Product != null
                        ? i.Product.ProductName
                        : null,
                    Quantity = i.Quantity,
                    LastUpdated = i.LastUpdated
                })
                .FirstOrDefaultAsync();


            if (inventory == null)
            {
                return NotFound(new
                {
                    Message = "Inventory not found."
                });
            }


            return Ok(inventory);
        }


        // POST: api/Inventory
        [HttpPost]
        public async Task<IActionResult> PostInventory(
            [FromBody] InventoryDTO dto)
        {
            var inventory = new Inventory
            {
                ProductID = dto.ProductID,
                Quantity = dto.Quantity,
                LastUpdated = dto.LastUpdated ?? DateTime.Now
            };


            _context.Inventories.Add(inventory);

            await _context.SaveChangesAsync();


            return Ok(new
            {
                Message = "Inventory created successfully.",
                Data = new InventoryResponse
                {
                    InventoryID = inventory.InventoryID,
                    ProductID = inventory.ProductID,
                    ProductName = inventory.Product != null
                        ? inventory.Product.ProductName
                        : null,
                    Quantity = inventory.Quantity,
                    LastUpdated = inventory.LastUpdated
                }
            });
        }


        // PUT: api/Inventory/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInventory(
            int id,
            [FromBody] InventoryDTO dto)
        {
            var inventory = await _context.Inventories
                .FindAsync(id);


            if (inventory == null)
            {
                return NotFound(new
                {
                    Message = "Inventory not found."
                });
            }


            inventory.ProductID = dto.ProductID;
            inventory.Quantity = dto.Quantity;
            inventory.LastUpdated = dto.LastUpdated ?? DateTime.Now;


            await _context.SaveChangesAsync();


            return Ok(new
            {
                Message = "Inventory updated successfully.",
                Data = new InventoryResponse
                {
                    InventoryID = inventory.InventoryID,
                    ProductID = inventory.ProductID,
                    Quantity = inventory.Quantity,
                    LastUpdated = inventory.LastUpdated
                }
            });
        }


        // PATCH: api/Inventory/5
        [HttpPatch("{id}")]
        public async Task<IActionResult> PatchInventory(
            int id,
            [FromBody] InventoryDTO dto)
        {
            var inventory = await _context.Inventories
                .FindAsync(id);


            if (inventory == null)
            {
                return NotFound(new
                {
                    Message = "Inventory not found."
                });
            }


            if (dto.ProductID > 0)
            {
                inventory.ProductID = dto.ProductID;
            }


            if (dto.Quantity > 0)
            {
                inventory.Quantity = dto.Quantity;
            }


            if (dto.LastUpdated.HasValue)
            {
                inventory.LastUpdated = dto.LastUpdated.Value;
            }
            else
            {
                inventory.LastUpdated = DateTime.Now;
            }


            await _context.SaveChangesAsync();


            return Ok(new
            {
                Message = "Inventory partially updated successfully.",
                Data = new InventoryResponse
                {
                    InventoryID = inventory.InventoryID,
                    ProductID = inventory.ProductID,
                    Quantity = inventory.Quantity,
                    LastUpdated = inventory.LastUpdated
                }
            });
        }


        // DELETE: api/Inventory/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInventory(int id)
        {
            var inventory = await _context.Inventories
                .FindAsync(id);


            if (inventory == null)
            {
                return NotFound(new
                {
                    Message = "Inventory not found."
                });
            }


            _context.Inventories.Remove(inventory);

            await _context.SaveChangesAsync();


            return Ok(new
            {
                Message = "Inventory deleted successfully."
            });
        }
    }
}