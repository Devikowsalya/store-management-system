namespace StoreApi.DTOs
{
    public class InventoryResponse
    {
        public int InventoryID { get; set; }

        public int ProductID { get; set; }

        public string? ProductName { get; set; }

        public int Quantity { get; set; }

        public DateTime? LastUpdated { get; set; }
    }
}