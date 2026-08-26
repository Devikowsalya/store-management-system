import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { CartStore } from '../../stores/cart.store';
import { OrderStore } from '../../../orders/store/order.store';
import { AuthStore } from '../../../../core/auth/auth.store';
import { CreateOrderPayload } from '../../../orders/modals/orders.model';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [
    CurrencyPipe
  ],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartPageComponent {
  readonly cartStore = inject(CartStore);
  readonly orderStore = inject(OrderStore);
  readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);

  increment(productId: number): void {
    this.cartStore.incrementQuantity(productId);
  }

  decrement(productId: number): void {
    this.cartStore.decrementQuantity(productId);
  }

  removeItem(productId: number): void {
    this.cartStore.removeFromCart(productId);
  }

  clearCart(): void {
    this.cartStore.clearCart();
  }

  continueShopping(): void {
    this.router.navigate(['/user/products']);
  }

  async checkout(): Promise<void> {
    if (this.cartStore.isEmpty() || this.isSubmitting()) {
      return;
    }

    const itemsString = this.cartStore
      .items()
      .map((item) => `${item.product.productID}:${item.quantity}`)
      .join(',');

    const payload: CreateOrderPayload = {
      customerId: this.authStore.customerId() || 0,
      orderDate: new Date().toISOString(),
      totalAmount: this.cartStore.totalAmount(),
      items: itemsString
    };

    this.isSubmitting.set(true);
    const success = await this.orderStore.createOrder(payload);
    this.isSubmitting.set(false);

    if (success) {
      this.cartStore.clearCart();
      this.router.navigate(['/user/orders']);
    }
  }
}
