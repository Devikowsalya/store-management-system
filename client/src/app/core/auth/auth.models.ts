export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  firstName: string;
  lastName?: string;
  Email: string;
  Password: string;
}

export interface LoginResponse {
  token: string;
  data: {
    userID: number,
    email: string,
    roleID: number,
    role: string
  }
  message: string;
  // role?: string;
  // Role?: string;
  // userID?: number;
  // userId?: number;
  // customerID?: number;
  // customerId?: number;
}