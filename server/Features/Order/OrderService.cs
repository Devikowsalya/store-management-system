using Microsoft.EntityFrameworkCore;
using StoreApi.Features.Product;
using StoreApi.Features.Supplier;
using System.ComponentModel.DataAnnotations;

namespace StoreApi.Features.Order
{
    public class OrderService
    {

        private readonly OrderRepository _orderRepository;
        private readonly ProductRepository _productRepository;

        public OrderService(OrderRepository orderRepository, ProductRepository productRepository)
        {
            _orderRepository = orderRepository;
            _productRepository = productRepository;
        }


        public async Task<List<OrderDTO>> GetOrdersAsync(int? customerId)
        {

            var orders = await _orderRepository.GetAllAsync(customerId);

            var response = new List<OrderDTO>();

            foreach (var order in orders.OrderByDescending(o => o.OrderDate))
            {
                var statusName =
          await _orderRepository.GetStatusNameAsync(order.StatusID);

                var parsedItems = await ParseOrderItems(order.Items);

                response.Add(new OrderDTO
                {
                    OrderID = order.OrderID,
                    CustomerId = order.CustomerId,
                    OrderDate = order.OrderDate,
                    TotalAmount = order.TotalAmount,
                    StatusID = order.StatusID,
                    StatusName = statusName,
                    Items = parsedItems
                });
            }

            return response;
        }


        //public async Task<OrderModal> GetByIdAsync(int OrderID)

        public async Task<OrderDTO?> GetOrderAsync(int id)
        {
            var order = await _orderRepository.GetByIdAsync(id);

            var statusName =
      await _orderRepository.GetStatusNameAsync(order.StatusID);
            if (order == null)
            {
                return null;
            }
            var parsedItems = await ParseOrderItems(order.Items);
            return new OrderDTO
            {
                OrderID = order.OrderID,
                CustomerId = order.CustomerId,
                OrderDate = order.OrderDate,
                TotalAmount = order.TotalAmount,
                StatusID = order.StatusID,
                StatusName = statusName,
                Items = parsedItems
            };

        }


        public async Task<OrderModal> CreateOrderAsync(OrderRequestDTO dto)
        {
            var order = new OrderModal
            {

                CustomerId = dto.CustomerId,
                OrderDate = dto.OrderDate ?? DateTime.Now,
                TotalAmount = dto.TotalAmount,
                Items = dto.Items
            };

            return await _orderRepository.CreateAsync(order);
        }


        public async Task<OrderModal?> UpdateOrderAsync(int orderID, OrderRequestDTO dto)
        {
            var order =
                await _orderRepository.GetByIdAsync(orderID);

            if (order == null)
            {
                return null;
            }
 
            order.CustomerId = dto.CustomerId;
            order.OrderDate = dto.OrderDate ?? DateTime.Now;
            order.TotalAmount = dto.TotalAmount;
            order.Items = dto.Items;
            order.StatusID = order.StatusID;
             


            return await _orderRepository.UpdateOrderAsync(order);


        }

        public async Task<OrderSummaryResponseDTO> GetOrderSummaryAsync()
        {
            var orders = await _orderRepository.GetAllAsync();

            var now = DateTime.Now;

            var startOfMonth = new DateTime(
                now.Year,
                now.Month,
                1
            );

            var startOfNextMonth = startOfMonth.AddMonths(1);

            return new OrderSummaryResponseDTO
            {
                TotalOrders = orders.Count,

                TotalOrdersThisMonth = orders.Count(o =>
                    o.OrderDate >= startOfMonth &&
                    o.OrderDate < startOfNextMonth
                ),

                TotalOrderValue = orders.Sum(o => o.TotalAmount),

                Orders = orders.Select(o => new OrderSummaryDTO
                {
                    OrderID = o.OrderID,
                    CustomerId = o.CustomerId,
                    OrderDate = o.OrderDate,
                    TotalAmount = o.TotalAmount
                }).ToList()
            };
        }

        public async Task<OrderSummaryResponseDTO> GetOrderSummaryAsync(int? customerId)
        {
            var orders = await _orderRepository.GetAllAsync(customerId);

            var now = DateTime.Now;

            var startOfMonth = new DateTime(
                now.Year,
                now.Month,
                1
            );

            var startOfNextMonth = startOfMonth.AddMonths(1);

            return new OrderSummaryResponseDTO
            {
                TotalOrders = orders.Count,

                TotalOrdersThisMonth = orders.Count(o =>
                    o.OrderDate >= startOfMonth &&
                    o.OrderDate < startOfNextMonth
                ),

                TotalOrderValue = orders.Sum(o => o.TotalAmount),

                Orders = orders.Select(o => new OrderSummaryDTO
                {
                    OrderID = o.OrderID,
                    CustomerId = o.CustomerId,
                    OrderDate = o.OrderDate,
                    TotalAmount = o.TotalAmount
                }).ToList()
            };
        }

        public async Task<bool> DeleteOrderAsync(int id)
        {
            return await _orderRepository.DeleteAsync(id);
        }


        private string ConvertItemsToString(List<OrderItemResponseDTO> items)
        {
            if (items == null || items.Count == 0)
            {
                return string.Empty;
            }

            return string.Join(",",
                items.Select(item => $"{item.ProductId}:{item.Quantity}"));
        }

        private async Task<List<OrderItemResponseDTO>> ParseOrderItems(string items)
        {
            var result = new List<OrderItemResponseDTO>();

            if (string.IsNullOrWhiteSpace(items))
            {
                return result;
            }

            var itemParts = items.Split(',');

            foreach (var item in itemParts)
            {
                var parts = item.Split(':');

                if (parts.Length != 2)
                {
                    continue;
                }

                if (!int.TryParse(parts[0], out int productId))
                {
                    continue;
                }

                if (!int.TryParse(parts[1], out int quantity))
                {
                    continue;
                }

                var product = await _productRepository.GetByIdAsync(productId);

                if (product == null)
                {
                    continue;
                }

                result.Add(new OrderItemResponseDTO
                {
                    ProductId = productId,
                    ProductName = product.ProductName,
                    Quantity = quantity,
                    UnitPrice = product.Price
                });
            }

            return result;
        }



        public async Task<OrderModal?> UpdateOrderStatusAsync(
            int orderID,
            int statusID)
        {
            var order = await _orderRepository.GetByIdAsync(orderID);

            if (order == null)
            {
                return null;
            }

            order.StatusID = statusID;

            return await _orderRepository.UpdateOrderAsync(order);
        }








    }
}
