export type UserRole = 'Admin' | 'Manager' | 'Staff' | 'Customer';

export interface User {
  userID: number;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  department?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface UserRequest {
  fullName: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  department?: string | null;
  isActive?: boolean;
}

export interface User_Role {
  roleID: number;
  roleName: UserRole;
}


