import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Grievance } from '../../core/models/grievance.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { FormatDatePipe } from '../../shared/pipes/format-date.pipe';
import { SLA_OPTIONS, MANDALS } from '../../core/constants/sla.constant';
import {
  LucideClock3,
  LucideShieldCheck,
  LucideTriangleAlert,
  LucideCircleCheck
} from '@lucide/angular';

@Component({
  selector: 'app-sla-monitoring',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatusBadgeComponent,
    FormatDatePipe,
    LucideClock3,
    LucideShieldCheck,
    LucideTriangleAlert,
    LucideCircleCheck
  ],
  templateUrl: './sla-monitoring.component.html',
  styleUrl: './sla-monitoring.component.scss'
})
export class SlaMonitoringComponent {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  public grievances = signal<Grievance[]>([]);
  public loading = signal<boolean>(false);
  public filterMandal = signal<string>('');
  public filterSla = signal<string>('');

  public slaOptions = SLA_OPTIONS;
  public mandals = MANDALS;

  public stats = signal<{ onTrack: number; nearBreach: number; beyondSla: number; resolved: number }>({
    onTrack: 0, nearBreach: 0, beyondSla: 0, resolved: 0
  });

  constructor() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    const params: any = {};
    if (this.filterMandal()) params.mandal = this.filterMandal();
    if (this.filterSla()) params.sla = this.filterSla();

    this.api.getApplications(params).subscribe({
      next: (res: any) => {
        const list = res.applications || res.data || (Array.isArray(res) ? res : []);
        this.grievances.set(list);
        this.computeStats(list);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.toast.error('Failed to load SLA data');
        this.loading.set(false);
      }
    });
  }

  computeStats(list: Grievance[]) {
    let onTrack = 0, nearBreach = 0, beyondSla = 0, resolved = 0;
    for (const g of list) {
      const status = g.sla?.status;
      switch (status) {
        case 'on_track': onTrack++; break;
        case 'near_breach': nearBreach++; break;
        case 'beyond_sla': beyondSla++; break;
        case 'resolved': resolved++; break;
      }
    }
    this.stats.set({ onTrack, nearBreach, beyondSla, resolved });
  }

  onFilter() {
    this.loadData();
  }
}
