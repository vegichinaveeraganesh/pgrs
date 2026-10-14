import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatDatePipe } from '../../shared/pipes/format-date.pipe';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { NotificationMessage } from '../../core/models/notification.model';
import {
  LucideShieldCheck,
  LucideRefreshCw,
  LucidePhoneCall,
  LucideSend
} from '@lucide/angular';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    FormatDatePipe,
    LucideShieldCheck,
    LucideRefreshCw,
    LucidePhoneCall,
    LucideSend
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  public notifications = signal<NotificationMessage[]>([]);
  public loading = signal<boolean>(false);

  constructor() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.loading.set(true);
    this.api.getMessages().subscribe({
      next: (msgs: NotificationMessage[]) => {
        this.notifications.set(msgs);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.toast.error('Failed to load notifications');
        this.loading.set(false);
      }
    });
  }

  retryMessage(id: string) {
    this.api.retryMessage(id).subscribe({
      next: () => {
        this.toast.success('Dispatched simulated message transmission');
        this.loadNotifications();
      },
      error: () => this.toast.error('Failed to retry message dispatch')
    });
  }
}
