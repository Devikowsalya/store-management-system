import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'signup',
    loadComponent: () =>
      import('./signup/signup.component')
        .then(m => m.SignupComponent)
  },
    {
    path: 'signin',
    loadComponent: () =>
      import('./signin/signin.component')
        .then(m => m.SigninComponent)
  }
];