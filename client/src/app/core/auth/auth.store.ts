import {
  Injectable,
  computed,
  inject,
  signal
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { AuthService } from './auth.service';
import { LoginRequest, LoginResponse } from './auth.models';

function parseRoleFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(payloadBase64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    return (
      parsed.role ||
      parsed['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      parsed.Role ||
      null
    );
  } catch {
    return null;
  }
}

function parseUserIdFromToken(token: string | null): number {
  if (!token) return 0;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return 0;
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(payloadBase64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    const id =
      parsed.nameid ||
      parsed['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
      parsed.sub ||
      parsed.userId ||
      parsed.userID ||
      parsed.customerId ||
      parsed.CustomerId ||
      0;
    return Number(id) || 0;
  } catch {
    return 0;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AuthStore {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly token = signal<string | null>(
    localStorage.getItem('token')
  );

  readonly roleOverride = signal<string | null>(
    localStorage.getItem('role')
  );

  readonly storedRoleId = signal<number | null>(
    localStorage.getItem('roleID') ? Number(localStorage.getItem('roleID')) : null
  );

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly userRole = computed(() => {
    return this.roleOverride() || parseRoleFromToken(this.token());
  });

  readonly userRoleId = computed(() => {
    return this.storedRoleId();
  });

  readonly customerId = computed(() => {
    const stored = localStorage.getItem('userID') || localStorage.getItem('userId') || localStorage.getItem('customerId');
    if (stored) {
      const num = Number(stored);
      if (!isNaN(num) && num > 0) return num;
    }
    return parseUserIdFromToken(this.token());
  });

  readonly userId = this.customerId;

  readonly isLoggedIn = computed(() => !!this.token());

  readonly isAdmin = computed(() => {
    const role = this.userRole();
    return role ? role.toLowerCase() === 'admin' : false;
  });

  readonly isUser = computed(() => {
    const role = this.userRole();
    return role ? role.toLowerCase() === 'user' : !this.isAdmin();
  });

  login(request: LoginRequest): Observable<LoginResponse> {
    this.loading.set(true);
    this.error.set(null);

    return this.authService.login(request).pipe(
      tap({
        next: (response) => {
          localStorage.setItem('token', response.token);
          this.token.set(response.token);

          const role = response.data.role || parseRoleFromToken(response.token);
          if (role) {
            localStorage.setItem('role', role);
            this.roleOverride.set(role);
          }

          if (response.data.roleID) {
            localStorage.setItem('roleID', response.data.roleID.toString());
            this.storedRoleId.set(response.data.roleID);
          }

          const uid = response.data.userID ?? 0

          if (uid) {
            localStorage.setItem('userID', uid.toString());
          }

          this.loading.set(false);
        },
        error: (error) => {
          console.error('Login failed:', error);
          this.error.set('Invalid email or password.');
          this.loading.set(false);
        }
      })
    );
  }

  logout(): void {
    localStorage.clear();
    this.token.set(null);
    this.roleOverride.set(null);
    this.storedRoleId.set(null);
    this.router.navigate(['/signin']);
  }
}