import {
  ChangeDetectionStrategy,
  Component
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent
  ],
  templateUrl: './user-layout.component.html',
  styleUrl: './user-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserLayoutComponent {}
