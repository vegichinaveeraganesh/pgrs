import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { FormatDatePipe } from '../../shared/pipes/format-date.pipe';
import {
  LucideSearch,
  LucideShieldCheck,
  LucideUser,
  LucideUsersRound,
  LucideClock3,
  LucideFileText,
  LucideCircleCheck,
  LucideStar
} from '@lucide/angular';

@Component({
  selector: 'app-grievance-tracking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatusBadgeComponent,
    FormatDatePipe,
    LucideSearch,
    LucideShieldCheck,
    LucideUser,
    LucideUsersRound,
    LucideClock3,
    LucideFileText,
    LucideCircleCheck,
    LucideStar
  ],
  templateUrl: './grievance-tracking.component.html',
  styleUrl: './grievance-tracking.component.scss'
})
export class GrievanceTrackingComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);

  public queryInput = signal<string>('PGRS-AP-2026-10411');
  public isSearching = signal<boolean>(false);
  public trackingResult = signal<any | null>(null);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.queryInput.set(params['id']);
        this.searchGrievance();
      }
    });
  }

  searchGrievance() {
    const q = this.queryInput().trim();
    if (!q) {
      this.toast.error('Please enter a valid PGRS reference ID');
      return;
    }

    this.isSearching.set(true);
    this.api.track(q).subscribe({
      next: res => {
        this.isSearching.set(false);
        if (res.success && res.data) {
          this.trackingResult.set(res.data);
          this.toast.success(`Retrieved status for ${res.data.pgrs_no}`);
        }
      },
      error: err => {
        this.isSearching.set(false);
        this.trackingResult.set(null);
        this.toast.error(err.error?.message || 'No petition found with this reference number.');
      }
    });
  }
}
