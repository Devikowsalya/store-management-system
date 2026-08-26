import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { UserApiService } from '../services/user-api.service';
import { User, UserRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserStore {
  /*
   * Dependencies
   */
  private readonly userApi = inject(UserApiService);

  /*
   * Writable State
   */
  private readonly _users = signal<User[]>([]);
  private readonly _totalUsers = signal<number>(0);
  private readonly _selectedUser = signal<User | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _isSaving = signal<boolean>(false);
  private readonly _isDeleting = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _searchTerm = signal<string>('');

  /*
   * Readonly State
   */
  readonly users = this._users.asReadonly();
  readonly totalUsers = this._totalUsers.asReadonly();
  readonly selectedUser = this._selectedUser.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isSaving = this._isSaving.asReadonly();
  readonly isDeleting = this._isDeleting.asReadonly();
  readonly error = this._error.asReadonly();
  readonly searchTerm = this._searchTerm.asReadonly();

  /*
   * Computed State
   */
  readonly userCount = computed(() => this._users().length);

  readonly filteredUsers = computed(() => {
    const search = this._searchTerm().trim().toLowerCase();
    const users = this._users();

    if (!search) {
      return users;
    }

    return users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.role?.toLowerCase().includes(search) ||
        user.department?.toLowerCase().includes(search) ||
        user.phone?.toLowerCase().includes(search),
    );
  });

  /*
   * LOAD ALL USERS
   */
  async loadUsers(): Promise<void> {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      const response = await firstValueFrom(this.userApi.getUsers());
      this._users.set(response || []);
    } catch (error) {
      console.error('Error loading users:', error);
      this._users.set([]);
      this._error.set('Failed to load users.');
    } finally {
      this._isLoading.set(false);
    }
  }

  /*
   * LOAD USER BY ID
   */
  async loadUserById(id: number): Promise<void> {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      const user = await firstValueFrom(this.userApi.getUserById(id));
      this._selectedUser.set(user);
    } catch (error) {
      console.error('Error loading user:', error);
      this._selectedUser.set(null);
      this._error.set('Failed to load user details.');
    } finally {
      this._isLoading.set(false);
    }
  }

  /*
   * CREATE USER
   */
  async createUser(request: UserRequest): Promise<boolean> {
    try {
      this._isSaving.set(true);
      this._error.set(null);

      const response = await firstValueFrom(this.userApi.createUser(request));

      if (response.data) {
        this._users.update((users) => [response.data, ...users]);
      }
      return true;
    } catch (error) {
      console.error('Error creating user:', error);
      this._error.set('Failed to create user.');
      return false;
    } finally {
      this._isSaving.set(false);
    }
  }

  /*
   * UPDATE USER
   */
  async updateUser(id: number, request: UserRequest): Promise<boolean> {
    try {
      this._isSaving.set(true);
      this._error.set(null);

      const response = await firstValueFrom(this.userApi.updateUser(id, request));

      if (response.data) {
        this._users.update((users) =>
          users.map((user) => (user.userID === id ? response.data : user)),
        );
        this._selectedUser.set(response.data);
      }
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      this._error.set('Failed to update user.');
      return false;
    } finally {
      this._isSaving.set(false);
    }
  }

  /*
   * DELETE USER
   */
  async deleteUser(id: number): Promise<boolean> {
    try {
      this._isDeleting.set(true);
      this._error.set(null);

      await firstValueFrom(this.userApi.deleteUser(id));

      this._users.update((users) => users.filter((user) => user.userID !== id));

      if (this._selectedUser()?.userID === id) {
        this._selectedUser.set(null);
      }
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      this._error.set('Failed to delete user.');
      return false;
    } finally {
      this._isDeleting.set(false);
    }
  }

  /*
   * SELECT & SEARCH ACTIONS
   */
  selectUser(user: User): void {
    this._selectedUser.set(user);
  }

  clearSelectedUser(): void {
    this._selectedUser.set(null);
  }

  setSearchTerm(value: string): void {
    this._searchTerm.set(value);
  }

  clearSearch(): void {
    this._searchTerm.set('');
  }

  clearError(): void {
    this._error.set(null);
  }

  resetStore(): void {
    this._users.set([]);
    this._selectedUser.set(null);
    this._isLoading.set(false);
    this._isSaving.set(false);
    this._isDeleting.set(false);
    this._error.set(null);
    this._searchTerm.set('');
  }
}
