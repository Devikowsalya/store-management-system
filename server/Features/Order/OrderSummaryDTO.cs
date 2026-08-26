namespace StoreApi.Features.Order
{
    public class OrderSummaryDTO
    {
        public int OrderID { get; set; }

        public int CustomerId { get; set; }

        public DateTime? OrderDate { get; set; }

        public decimal TotalAmount { get; set; }
    }
}
