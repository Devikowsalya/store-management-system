export interface Order {
  orderID: number;
  customerName?: string;
  orderDate: string;
  totalAmount: number;
  items?: OrderItem[];
}

export interface OrderSummary {
  orderID: number;
  customerId: number;
  orderDate: string;
  totalAmount: number;
}

export interface OrderSummaryResponse {
  totalOrders: number;
  totalOrdersThisMonth: number;
  totalOrderValue: number;
  orders: OrderSummary[];
}

 
export interface OrderItem {
  orderItemID?: number;
  orderID?: number;
  productID: number;
  productName?: string;
  quantity: number;
  unitPrice:number;
}

export interface OrderFormValue {
  customerName?: string;
  orderDate: string;
  status?: string;
  items: OrderItemFormValue[];
}

export interface OrderItemFormValue {
  productID: number;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderPayload {
  customerId: number;
  orderDate: string;
  totalAmount: number;
  items: string;
}