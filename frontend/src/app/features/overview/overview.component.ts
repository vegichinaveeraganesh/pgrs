import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { DashboardSummary } from '../../core/models/dashboard.model';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { Grievance } from '../../core/models/grievance.model';
import { GrievanceDetailComponent } from '../grievances/grievance-detail';
import {
  LucideSearch,
  LucideShieldCheck,
  LucideFileText,
  LucideRoute,
  LucidePhoneCall,
  LucideClock3,
  LucideCircleCheck,
  LucideStar,
  LucideArrowUpRight,
  LucideSparkles
} from '@lucide/angular';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    StatCardComponent,
    GrievanceDetailComponent,
    LucideSearch,
    LucideShieldCheck,
    LucideFileText,
    LucideRoute,
    LucidePhoneCall,
    LucideClock3,
    LucideCircleCheck,
    LucideStar,
    LucideArrowUpRight,
    LucideSparkles
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class OverviewComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private router = inject(Router);

  public searchInput = signal<string>('');
  public isSearching = signal<boolean>(false);
  public summary = signal<DashboardSummary | null>(null);
  public selectedGrievance = signal<Grievance | null>(null);

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.api.getDashboard().subscribe({
      next: data => this.summary.set(data),
      error: () => console.warn('Could not load summary statistics')
    });
  }

  onQuickTrack() {
    const q = this.searchInput().trim();
    if (!q) {
      this.toast.error('Enter a PGRS application number, applicant name, or mobile number');
      return;
    }

    this.isSearching.set(true);
    this.api.getApplications({ q }).subscribe({
      next: res => {
        this.isSearching.set(false);
        if (res.applications && res.applications.length > 0) {
          this.selectedGrievance.set(res.applications[0]);
          this.toast.success(`Found grievance: ${res.applications[0].pgrs_no}`);
        } else {
          this.toast.error('No grievance found matching your search. Please check the reference number.');
        }
      },
      error: () => {
        this.isSearching.set(false);
        this.toast.error('Unable to reach grievance tracking service');
      }
    });
  }

  closeDetail() {
    this.selectedGrievance.set(null);
  }
}
