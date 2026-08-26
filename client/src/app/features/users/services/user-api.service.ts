import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '../../../core/services/base-api.service';
import { ApiResponse } from '../../../core/models/api-response.model';

import { User, UserRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserApiService extends BaseApiService {
  private readonly endpoint = '/User';

  getUsers(): Observable<User[]> {
    return this.get<User[]>(this.endpoint);
  }

  getUserById(id: number): Observable<User> {
    return this.get<User>(`${this.endpoint}/${id}`);
  }

  createUser(request: UserRequest): Observable<ApiResponse<User>> {
    return this.post<ApiResponse<User>>(this.endpoint, request);
  }

  updateUser(id: number, request: UserRequest): Observable<ApiResponse<User>> {
    return this.put<ApiResponse<User>>(`${this.endpoint}/${id}`, request);
  }

  getUserCount(): Observable<{ count: number }> {
    return this.get<{ count: number }>(`${this.endpoint}/count`);
  }

  deleteUser(id: number): Observable<ApiResponse<null>> {
    return this.delete<ApiResponse<null>>(`${this.endpoint}/${id}`);
  }
}
