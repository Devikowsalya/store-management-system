namespace StoreApi.Features.Product
{
    public class ProductDTO
    {
        public int ProductID { get; set; }

        public string? ProductName { get; set; }


        public int? CategoryID { get; set; }

        public string? CategoryName { get; set; }


        public int? SupplierID { get; set; }

        public string? SupplierName { get; set; }


        //public string? Barcode { get; set; }

        public string? Brand { get; set; }

        public decimal? Price { get; set; }

        public int? Stock { get; set; }

        public bool IsActive { get; set; }

        //public decimal? UnitPrice { get; set; }

        //public decimal? CostPrice { get; set; }

        //public decimal? TaxPercent { get; set; }
    }
}