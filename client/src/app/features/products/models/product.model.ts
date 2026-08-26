export interface Product {
  productID: number;
  productName: string;
  categoryID: number;
  categoryName: string;
  supplierID: number;
  supplierName: string;
  price: number;
  stock: number;
  isActive: boolean;
  brand?: string ;
}
export interface ProductRequest {
  productName: string;
  categoryID: number | null;
  supplierID: number | null;
  brand?: string | null;
  price: number;
  stock: number;
  isActive?: boolean;
}

export interface UpdateProductRequest {
  productName: string;
  categoryID: number | null;
  supplierID: number | null;
  brand?: string | null;
  price: number;
  stock: number;
  isActive: boolean;
}

export interface LowStockProduct {
  productID: number;
  productName: string;
  stock: number;
  price: number;
}

export interface LowStockResponse {
  totalLowStockProducts: number;
  products: LowStockProduct[];
}

export interface ProductQueryParams {
  search?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  stockStatus?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: number;
}