import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '../../../core/services/base-api.service';

import { LowStockResponse, Product, ProductQueryParams } from '../models/product.model';

import { ProductRequest, UpdateProductRequest } from '../models/product.model';

import { ApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class ProductApiService extends BaseApiService {
  private readonly endpoint = '/Product';

  getProducts(params?: ProductQueryParams | string): Observable<any> {
    let search: string | undefined;
    let pageNumber: number | undefined;
    let pageSize: number | undefined;
    let sortBy: string | undefined;
    let stockStatus: string | undefined;
    let minPrice: number | undefined;
    let maxPrice: number | undefined;
    let categoryId: number | undefined;

    if (typeof params === 'string') {
      search = params;
    } else if (params) {
      search = params.search;
      pageNumber = params.pageNumber;
      pageSize = params.pageSize;
      sortBy = params.sortBy;
      stockStatus = params.stockStatus;
      minPrice = params.minPrice;
      maxPrice = params.maxPrice;
      categoryId = params.categoryId;
    }

    const queryParts: string[] = [];

    if (search?.trim()) {
      queryParts.push(`search=${encodeURIComponent(search.trim())}`);
    }

    if (pageNumber !== undefined && pageNumber !== null) {
      queryParts.push(`pageNumber=${pageNumber}`);
    }

    if (pageSize !== undefined && pageSize !== null) {
      queryParts.push(`pageSize=${pageSize}`);
    }

    if (sortBy?.trim() && sortBy !== 'default') {
      queryParts.push(`sortBy=${encodeURIComponent(sortBy.trim())}`);
    }

    if (stockStatus?.trim() && stockStatus !== 'all') {
      queryParts.push(`stockStatus=${encodeURIComponent(stockStatus.trim())}`);
    }

    if (minPrice !== undefined && minPrice !== null) {
      queryParts.push(`minPrice=${minPrice}`);
    }

    if (maxPrice !== undefined && maxPrice !== null) {
      queryParts.push(`maxPrice=${maxPrice}`);
    }

    if (categoryId !== undefined && categoryId !== null && categoryId > 0) {
      queryParts.push(`categoryId=${categoryId}`);
    }
    debugger
    const queryString = queryParts.length ? `?${queryParts.join('&')}` : '';
    return this.get<any>(`${this.endpoint}${queryString}`);
  }


  getProductById(id: number): Observable<Product> {
    return this.get<Product>(`${this.endpoint}/${id}`);
  }

  createProduct(request: ProductRequest): Observable<ApiResponse<Product>> {
     const formData = new FormData();

      formData.append('ProductName', request.productName);
      if (request.categoryID !== null) {
        formData.append('CategoryID', request.categoryID.toString());
      }

      if (request.supplierID !== null) {
        formData.append('SupplierID', request.supplierID.toString());
      }

      if (request.isActive) {
        formData.append('IsActive', request.isActive.toString());
      }

      if (request.price) {
        formData.append('Price', request.price.toString());
      }

      formData.append('Brand', request.brand ?? '');
      formData.append('Stock', request.stock.toString());
    return this.post<ApiResponse<Product>>(this.endpoint, formData);
  }

  updateProduct(id: number, request: ProductRequest): Observable<ApiResponse<Product>> {
    return this.put<ApiResponse<Product>>(`${this.endpoint}/${id}`, request);
  }

  getProductCount(): Observable<{ count: number }> {
    return this.get<{ count: number }>(`${this.endpoint}/count`);
  }

  getInventoryValue(): Observable<{totalAmount: number}> {
    return this.get<{totalAmount: number}>(`${this.endpoint}/inventory-value`)
  }

  getLowStockProducts(): Observable<LowStockResponse> {
    return this.get<LowStockResponse>(`${this.endpoint}/low-stock`);
  }

  deleteProduct(id: number): Observable<ApiResponse<null>> {
    return this.delete<ApiResponse<null>>(`${this.endpoint}/${id}`);
  }
}
