//using StoreApi.Models;
//using System.ComponentModel.DataAnnotations.Schema;

//namespace StoreApi.DTOs
//{
//    public class OrderDTO
//    {
//        public int OrderID { get; set; }

//        public DateTime? OrderDate { get; set; }

//        public decimal TotalAmount { get; set; }

//        public string Items  { get; set; }

//        public int CustomerId { get; set; }
//    }
//}

using System.ComponentModel.DataAnnotations;

namespace StoreApi.Features.Order
{
    public class OrderDTO
    {
        public int OrderID { get; set; }

        public int CustomerId { get; set; }

        public DateTime? OrderDate { get; set; }

        public decimal TotalAmount { get; set; }

        public int StatusID { get; set; }

        public string? StatusName { get; set; }

        [Required]
        public List<OrderItemResponseDTO> Items { get; set; }
            = new List<OrderItemResponseDTO>();
    }
}