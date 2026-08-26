import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal
} from '@angular/core';

import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStore } from '../../core/auth/auth.store';
import { CartStore } from '../../features/cart/stores/cart.store';

interface SidebarItem {
  label: string;
  icon: string;
  route: string;
  class?: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  private readonly authStore = inject(AuthStore);
  readonly cartStore = inject(CartStore);

  readonly collapsed = signal(false);

  readonly toggleState = output<boolean>();

  readonly baseRoute = computed(() => (this.authStore.isAdmin() ? '/admin' : '/user'));

  readonly menuItems = computed<SidebarItem[]>(() => {
    const base = this.baseRoute();
    const items: SidebarItem[] = [
      {
        label: 'Dashboard',
        icon: '⌂',
        route: `${base}/dashboard`,
        class: ''
      },
      {
        label: 'Products',
        icon: '▣',
        route: `${base}/products`,
        class: ''
      },
      {
        label: 'Categories',
        icon: '▦',
        route: `${base}/categories`,
        class: ''
      },
      {
        label: 'Orders',
        icon: '☷',
        route: `${base}/orders`,
        class: ''
      }
    ];

    if (this.authStore.isAdmin()) {
      items.push(
        {
          label: 'Users',
          icon: '👤',
          route: `${base}/users`,
          class: ''
        },
        {
          label: 'Suppliers',
          icon: '♢',
          route: `${base}/suppliers`,
          class: ''
        }
      );
    } else {
      items.push({
        label: 'Cart',
        icon: '🛒',
        route: `${base}/cart`,
        badge: this.cartStore.totalItemsCount(),
        class: ''
      });
    }

    return items;
  });

  toggle(): void {
    this.collapsed.update(value => !value);

    this.toggleState.emit(this.collapsed());
  }

  logout(): void {
    this.authStore.logout();
  }
}