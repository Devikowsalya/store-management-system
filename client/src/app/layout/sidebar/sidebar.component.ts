import { DatePipe } from '@angular/common';

import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  output,
  signal
} from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { AuthStore } from '../../core/auth/auth.store';
import { NotificationStore } from '../../core/notiffications/notification.store';
import { OrderStatusNotification } from '../../core/notiffications/notification.model';
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
    RouterLinkActive,
    DatePipe
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent implements OnInit {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  readonly cartStore = inject(CartStore);
  readonly notificationStore =
    inject(NotificationStore);

  readonly collapsed = signal(false);
  readonly notificationOpen = signal(false);

  readonly toggleState = output<boolean>();

  readonly isStaff = this.authStore.isStaff;
  readonly isUser = this.authStore.isUser;

  ngOnInit(): void {
    if (this.isStaff()) {
      this.notificationStore.loadNotifications();
    }
  }

  /*
   * Only the User role gets /user routes.
   * All staff roles get /admin routes.
   */
  readonly baseRoute = computed(() =>
    this.authStore.isUser()
      ? '/user'
      : '/admin'
  );

  readonly menuItems = computed<SidebarItem[]>(() => {
    const base = this.baseRoute();

    const items: SidebarItem[] = [
      {
        label: 'Dashboard',
        icon: '⌂',
        route: `${base}/dashboard`
      },
      {
        label: 'Products',
        icon: '▣',
        route: `${base}/products`
      },
      {
        label: 'Categories',
        icon: '▦',
        route: `${base}/categories`
      },
      {
        label: 'Orders',
        icon: '☷',
        route: `${base}/orders`
      }
    ];

    /*
     * Admin-only menu options.
     */
    if (this.authStore.isAdmin()) {
      items.push(
        {
          label: 'Users',
          icon: '👤',
          route: `${base}/users`
        },
        {
          label: 'Suppliers',
          icon: '♢',
          route: `${base}/suppliers`
        }
      );
    }

    /*
     * Only normal Users receive the Cart option.
     * Manager, Employee, Supervisor, etc. do not.
     */
    if (this.authStore.isUser()) {
      items.push({
        label: 'Cart',
        icon: '🛒',
        route: `${base}/cart`,
        badge: this.cartStore.totalItemsCount()
      });
    }

    return items;
  });

  toggle(): void {
    this.collapsed.update((value) => !value);

    this.notificationOpen.set(false);

    this.toggleState.emit(this.collapsed());
  }

  toggleNotifications(): void {
    this.notificationOpen.update(
      (value) => !value
    );

    if (this.notificationOpen()) {
      this.notificationStore.loadNotifications();
    }
  }

  markAllAsRead(): void {
    this.notificationStore.markAllAsRead();
  }

  removeNotification(
    event: MouseEvent,
    notificationId: string
  ): void {
    event.stopPropagation();

    if (notificationId) {
      this.notificationStore.removeNotification(
        notificationId
      );
    }
  }

  openNotification(
    notification: OrderStatusNotification
  ): void {
    if (notification.NotificationID) {
      this.notificationStore.markAsRead(notification.NotificationID);
    }

    this.notificationOpen.set(false);

    if (notification.ReferenceID) {
      void this.router.navigate(
        [`${this.baseRoute()}/orders`],
        {
          queryParams: {
            orderID: notification.ReferenceID
          }
        }
      );
    }
  }

  logout(): void {
    this.notificationOpen.set(false);
    this.authStore.logout();
  }
}