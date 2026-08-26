namespace StoreApi.Features.Order
{
    public class OrderRequestDTO
    {
        public int CustomerId { get; set; }

        public DateTime? OrderDate { get; set; }

        public decimal TotalAmount { get; set; }

        public string Items { get; set; } = string.Empty;
    }
}