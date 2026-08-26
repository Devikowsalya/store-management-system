namespace StoreApi.Features.Order
{
    public class OrderSummaryResponseDTO
    {

        //public int OrderID { get; set; }

        //public int CustomerId { get; set; }

        //public DateTime OrderDate { get; set; }

        //public decimal TotalAmount { get; set; }

        public int TotalOrders { get; set; }

        public int TotalOrdersThisMonth { get; set; }

        public decimal TotalOrderValue { get; set; }

        public List<OrderSummaryDTO> Orders { get; set; } = new();
    }
}
