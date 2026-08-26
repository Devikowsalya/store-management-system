import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '../services/base-api.service';
import {
  LoginRequest,
  LoginResponse,
  SignupRequest
} from './auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseApiService {

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.baseUrl}/Auth/login`,
      request
    );
  }

  signup(request: SignupRequest): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/Auth/register`,
      request
    );
  }
}