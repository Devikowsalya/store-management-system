export interface Category {
  categoryID: number;
  categoryName: string;
  productCount: number;
  isActive: boolean;
}

export interface CategoryFormValue {
  categoryName: string;
  isActive: boolean;
}

export interface CategoryRequest {
  CategoryName: string;
}