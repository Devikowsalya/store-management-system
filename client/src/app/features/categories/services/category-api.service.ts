import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '../../../core/services/base-api.service';
import { Category, CategoryRequest } from '../models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService extends BaseApiService {
  private readonly endpoint = '/Category';

  // GET ALL
  getCategories(search?: string): Observable<Category[]> {
    const url = search?.trim()
      ? `${this.endpoint}?search=${encodeURIComponent(search.trim())}`
      : this.endpoint;
    return this.get<Category[]>(url);
  }

  // GET BY ID
  getCategoryById(id: number): Observable<Category> {
    return this.get<Category>(`${this.endpoint}/${id}`);
  }

  // CREATE
  createCategory(request: CategoryRequest): Observable<Category> {
    const formData = new FormData();

    formData.append('CategoryName', request.CategoryName);

    return this.post<Category>(this.endpoint, formData);
  }

  // UPDATE
  //   updateCategory(id: number, request: CategoryRequest): Observable<Category> {
  //     return this.put<Category>(`${this.endpoint}/${id}`, request);
  //   }

  updateCategory(id: number, request: CategoryRequest): Observable<Category> {
    const formData = new FormData();

    formData.append('CategoryName', request.CategoryName);

    return this.put<Category>(`${this.endpoint}/${id}`, formData);
  }

  // PATCH
  patchCategory(id: number, request: Partial<CategoryRequest>): Observable<Category> {
    return this.patch<Category>(`${this.endpoint}/${id}`, request);
  }

  // DELETE
  deleteCategory(id: number): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }
}
