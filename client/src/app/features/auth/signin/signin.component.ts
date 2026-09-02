import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../core/auth/auth.store';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
})
export class SigninComponent implements OnInit {
  ngOnInit(): void { }

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly authStore = inject(AuthStore);

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authStore
      .login(this.loginForm.getRawValue())
      .subscribe({
        next: (response) => {
          const role =
            response?.data?.role ||
            this.authStore.userRole();

          const normalizedRole =
            role?.trim().toLowerCase();

          // Only the User role goes to the user portal.
          if (normalizedRole === 'user') {
            this.router.navigate(['/user/dashboard']);
          } else {
            this.router.navigate(['/admin/dashboard']);
          }
        },

        error: (error) => {
          console.error('Login API error:', error);
        }
      });
  }
}
