import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';

import { User } from '../../models/user.model';
import { UserStore } from '../../stores/user.store';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [NgClass],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent implements OnInit {
  readonly userStore = inject(UserStore);
  private readonly router = inject(Router);

  /*
   * Local Search State
   */
  readonly searchTerm = signal('');

  /*
   * Readonly signals from store
   */
  readonly users = this.userStore.users;
  readonly isLoading = this.userStore.isLoading;
  readonly error = this.userStore.error;

  ngOnInit(): void {
    this.userStore.loadUsers();
  }

  /*
   * Filter users based on search query
   */
  readonly filteredUsers = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const allUsers = this.users();

    if (!search) {
      return allUsers;
    }

    return allUsers.filter(
      (user) =>
        user.fullName?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.role?.toLowerCase().includes(search) ||
        user.department?.toLowerCase().includes(search) ||
        user.phone?.toLowerCase().includes(search),
    );
  });

  readonly userCount = computed(() => this.filteredUsers().length);

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  addUser(): void {
    this.router.navigate(['/admin/users/create']);
  }

  editUser(user: User): void {
    this.router.navigate(['/admin/users/edit', user.userID]);
  }

  async deleteUser(user: User): Promise<void> {
    if (confirm(`Are you sure you want to delete user "${user.fullName}"?`)) {
      await this.userStore.deleteUser(user.userID);
    }
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  getRoleBadgeClass(role: string): string {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'role-admin';
      case 'manager':
        return 'role-manager';
      case 'staff':
        return 'role-staff';
      case 'customer':
        return 'role-customer';
      default:
        return 'role-default';
    }
  }
}
