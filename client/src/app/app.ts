import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal
} from '@angular/core';

import { RouterOutlet } from '@angular/router';
// import { NotificationStore } from './core/notiffications/notification.store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  protected readonly title =
    signal('my_store');

  /*
   * Instantiates NotificationStore once.
   * It automatically starts SignalR for logged-in staff.
   */
  // protected readonly notificationStore =
  //   inject(NotificationStore);
}