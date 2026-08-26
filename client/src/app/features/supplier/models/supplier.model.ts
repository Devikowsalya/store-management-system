export interface Supplier {
  supplierID: number;
  supplierName: string;
  contactPerson: string;
  address?: string;
  Address?: string;
  phone?: string | number;
  Phone?: string | number;
  email: string;
  isActive?: boolean;
}

export interface SupplierRequest {
  supplierName: string;
  contactPerson: string;
  address?: string | null;
  phone?: string | null;
  email: string;
  isActive?: boolean;
}

export interface UpdateSupplierRequest {
  supplierName: string;
  contactPerson: string;
  address?: string | null;
  phone?: string | null;
  email: string;
  isActive: boolean;
}