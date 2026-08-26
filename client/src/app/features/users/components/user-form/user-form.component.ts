import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { UserStore } from '../../stores/user.store';
import { UserRequest, UserRole } from '../../models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly userStore = inject(UserStore);

  /*
   * Store state
   */
  readonly isLoading = this.userStore.isLoading;
  readonly isSaving = this.userStore.isSaving;
  readonly errorMessage = this.userStore.error;

  /*
   * Component state
   */
  readonly isEditMode = signal(false);
  private userID: number | null = null;

  readonly roles: UserRole[] = ['Admin', 'Manager', 'Staff', 'Customer'];

  /*
   * Reactive Form
   */
  readonly userForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    userName:[''],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    role: ['Staff' as UserRole, [Validators.required]],
    department: [''],
    isActive: [true],
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.userID = Number(id);
      this.isEditMode.set(true);
      this.userStore.loadUserById(this.userID);
    }

    effect(() => {
      const user = this.userStore.selectedUser();
      if (!user) return;

      this.userForm.patchValue({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone ?? '',
        role: user.role,
        department: user.department ?? '',
        isActive: user.isActive,
      });
    });
  }

  async saveUser(): Promise<void> {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const request: UserRequest = this.userForm.getRawValue();
    let success = false;

    if (this.isEditMode() && this.userID) {
      success = await this.userStore.updateUser(this.userID, request);
    } else {
      success = await this.userStore.createUser(request);
    }

    if (success) {
      this.userStore.clearSelectedUser();
      await this.router.navigate(['/admin/users']);
    }
  }

  isFieldInvalid(controlName: keyof typeof this.userForm.controls): boolean {
    const control = this.userForm.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  cancel(): void {
    this.userStore.clearSelectedUser();
    this.router.navigate(['/admin/users']);
  }
}
