import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '../../../core/services/base-api.service';
import { ApiResponse } from '../../../core/models/api-response.model';

import { Supplier, SupplierRequest } from '../models/supplier.model';

@Injectable({
  providedIn: 'root',
})
export class SupplierApiService extends BaseApiService {
  private readonly endpoint = '/Supplier';

  getSuppliers(search?: string): Observable<Supplier[]> {
    const url = search?.trim()
      ? `${this.endpoint}?search=${encodeURIComponent(search.trim())}`
      : this.endpoint;
    return this.get<Supplier[]>(url);
  }

  getSupplierById(id: number): Observable<Supplier> {
    return this.get<Supplier>(`${this.endpoint}/${id}`);
  }

  createSupplier(request: SupplierRequest): Observable<ApiResponse<Supplier>> {
    return this.post<ApiResponse<Supplier>>(this.endpoint, request);
  }

  updateSupplier(id: number, request: SupplierRequest): Observable<ApiResponse<Supplier>> {
    return this.put<ApiResponse<Supplier>>(`${this.endpoint}/${id}`, request);
  }

  getSupplierCount(): Observable<{ count: number }> {
    return this.get<{ count: number }>(`${this.endpoint}/count`);
  }

  deleteSupplier(id: number): Observable<ApiResponse<null>> {
    return this.delete<ApiResponse<null>>(`${this.endpoint}/${id}`);
  }
}