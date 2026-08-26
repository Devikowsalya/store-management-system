import { Injectable, computed, signal } from '@angular/core';
import { CartItem } from '../models/cart.model';
import { Product } from '../../products/models/product.model';

const SESSION_CART_KEY = 'cart_items';

function loadInitialCart(): CartItem[] {
  try {
    const raw = sessionStorage.getItem(SESSION_CART_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse cart items from session storage', err);
    return [];
  }
}

function saveCartToStorage(items: CartItem[]): void {
  try {
    sessionStorage.setItem(SESSION_CART_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save cart items to session storage', err);
  }
}

@Injectable({
  providedIn: 'root'
})
export class CartStore {
  readonly items = signal<CartItem[]>(loadInitialCart());

  readonly totalItemsCount = computed(() =>
    this.items().reduce((acc, item) => acc + item.quantity, 0)
  );

  readonly totalAmount = computed(() =>
    this.items().reduce((acc, item) => acc + (item.product.price * item.quantity), 0)
  );

  readonly isEmpty = computed(() => this.items().length === 0);

  constructor() {
    try {
      localStorage.removeItem('store_cart_items');
    } catch (err) {
      console.error('Failed to clean up legacy cart storage', err);
    }
  }

  getItemQuantity(productId: number): number {
    const item = this.items().find(i => i.product.productID === productId);
    return item ? item.quantity : 0;
  }

  addToCart(product: Product, quantity: number = 1): void {
    const current = [...this.items()];
    const existingIndex = current.findIndex(i => i.product.productID === product.productID);

    if (existingIndex > -1) {
      const newQty = current[existingIndex].quantity + quantity;
      const maxStock = product.stock ?? 999;
      current[existingIndex] = {
        ...current[existingIndex],
        product,
        quantity: Math.min(newQty, maxStock)
      };
    } else {
      const maxStock = product.stock ?? 999;
      current.push({
        product,
        quantity: Math.min(quantity, maxStock)
      });
    }

    this.items.set(current);
    saveCartToStorage(current);
  }

  incrementQuantity(productId: number): void {
    const current = [...this.items()];
    const itemIndex = current.findIndex(i => i.product.productID === productId);

    if (itemIndex > -1) {
      const item = current[itemIndex];
      const maxStock = item.product.stock ?? 999;
      if (item.quantity < maxStock) {
        current[itemIndex] = {
          ...item,
          quantity: item.quantity + 1
        };
        this.items.set(current);
        saveCartToStorage(current);
      }
    }
  }

  decrementQuantity(productId: number): void {
    const current = [...this.items()];
    const itemIndex = current.findIndex(i => i.product.productID === productId);

    if (itemIndex > -1) {
      const item = current[itemIndex];
      if (item.quantity > 1) {
        current[itemIndex] = {
          ...item,
          quantity: item.quantity - 1
        };
      } else {
        current.splice(itemIndex, 1);
      }
      this.items.set(current);
      saveCartToStorage(current);
    }
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const current = [...this.items()];
    const itemIndex = current.findIndex(i => i.product.productID === productId);

    if (itemIndex > -1) {
      const maxStock = current[itemIndex].product.stock ?? 999;
      current[itemIndex] = {
        ...current[itemIndex],
        quantity: Math.min(quantity, maxStock)
      };
      this.items.set(current);
      saveCartToStorage(current);
    }
  }

  removeFromCart(productId: number): void {
    const updated = this.items().filter(i => i.product.productID !== productId);
    this.items.set(updated);
    saveCartToStorage(updated);
  }

  clearCart(): void {
    this.items.set([]);
    saveCartToStorage([]);
  }
}
