import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from './auth.store';

export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/signin']);
};

export const adminGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (!authStore.isLoggedIn()) {
    return router.createUrlTree(['/signin']);
  }

  if (authStore.isAdmin()) {
    return true;
  }

  // Restrict normal users from admin controls and redirect to user portal
  return router.createUrlTree(['/user/dashboard']);
};

export const userGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isLoggedIn()) { 
    return true;
  }

  return router.createUrlTree(['/signin']);
};
