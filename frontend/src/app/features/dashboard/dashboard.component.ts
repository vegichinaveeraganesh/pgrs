import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { DashboardSummary } from '../../core/models/dashboard.model';
import { Grievance, GrievanceStage } from '../../core/models/grievance.model';
import { NotificationMessage } from '../../core/models/notification.model';
import { STAGE_META, STAGE_ORDER } from '../../core/constants/stages.constant';
import { SLA_OPTIONS, MANDALS } from '../../core/constants/sla.constant';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { FormatDatePipe } from '../../shared/pipes/format-date.pipe';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { GrievanceDetailComponent } from '../grievances/grievance-detail/grievance-detail.component';
import { GrievanceFormComponent } from '../grievances/grievance-form/grievance-form.component';
import {
  LucideRefreshCw,
  LucidePlus,
  LucideTriangleAlert,
  LucideSearch,
  LucideEye,
  LucideMessageSquareText,
  LucideFileDown,
  LucideMapPin,
  LucideShieldCheck,
  LucideChartNoAxesCombined
} from '@lucide/angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatCardComponent,
    StatusBadgeComponent,
    FormatDatePipe,
    RelativeTimePipe,
    GrievanceDetailComponent,
    GrievanceFormComponent,
    LucideRefreshCw,
    LucidePlus,
    LucideTriangleAlert,
    LucideSearch,
    LucideEye,
    LucideMessageSquareText,
    LucideFileDown,
    LucideMapPin,
    LucideShieldCheck,
    LucideChartNoAxesCombined
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  public summary = signal<DashboardSummary | null>(null);
  public applications = signal<Grievance[]>([]);
  public messages = signal<NotificationMessage[]>([]);
  public isLoading = signal<boolean>(false);
  public isSyncing = signal<boolean>(false);

  // Filter signals
  public filterSearch = signal<string>('');
  public filterMandal = signal<string>('');
  public filterStage = signal<string>('');
  public filterSla = signal<string>('');

  // Modals
  public selectedApp = signal<Grievance | null>(null);
  public createModalOpen = signal<boolean>(false);

  // Constants
  public readonly mandals = MANDALS;
  public readonly stageOptions = STAGE_ORDER;
  public readonly stageMeta = STAGE_META;
  public readonly slaOptions = SLA_OPTIONS;

  // Helper getters for mandal breakdowns
  public mandalBreakdown = computed(() => {
    const s = this.summary();
    if (!s || !s.by_mandal) return [];
    return Object.keys(s.by_mandal).map(mandal => ({
      name: mandal,
      count: s.by_mandal[mandal],
      percentage: s.total > 0 ? Math.round((s.by_mandal[mandal] / s.total) * 100) : 0
    }));
  });

  public categoryBreakdown = computed(() => {
    const s = this.summary();
    if (!s || !s.by_category) return [];
    return Object.keys(s.by_category).map(cat => ({
      name: cat,
      count: s.by_category[cat]
    }));
  });

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.isLoading.set(true);
    this.loadSummary();
    this.loadApplications();
    this.loadMessages();
  }

  loadSummary() {
    this.api.getDashboard().subscribe({
      next: data => this.summary.set(data),
      error: () => console.warn('Could not load dashboard stats')
    });
  }

  loadApplications() {
    this.api.getApplications({
      mandal: this.filterMandal() || undefined,
      stage: this.filterStage() || undefined,
      sla: this.filterSla() || undefined,
      q: this.filterSearch() || undefined
    }).subscribe({
      next: res => {
        this.applications.set(res.applications || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.error('Failed to load grievances');
      }
    });
  }

  loadMessages() {
    this.api.getMessages().subscribe({
      next: msgs => this.messages.set(msgs || []),
      error: () => console.warn('Could not load dispatch messages')
    });
  }

  onFilterChange() {
    this.loadApplications();
  }

  onSyncPgrs() {
    this.isSyncing.set(true);
    this.api.sync().subscribe({
      next: res => {
        this.isSyncing.set(false);
        this.toast.success(res.message || 'PGRS Sync completed successfully');
        this.loadAll();
      },
      error: () => {
        this.isSyncing.set(false);
        this.toast.error('PGRS Sync failed');
      }
    });
  }

  openApplication(app: Grievance) {
    this.selectedApp.set(app);
  }

  closeApplication() {
    this.selectedApp.set(null);
  }

  onAppChanged() {
    this.loadAll();
  }

  openCreateModal() {
    this.createModalOpen.set(true);
  }

  closeCreateModal() {
    this.createModalOpen.set(false);
  }

  onGrievanceCreated() {
    this.createModalOpen.set(false);
    this.loadAll();
  }

  exportCsv() {
    window.open(this.api.exportReportCsvUrl(this.filterMandal() || undefined), '_blank');
  }

  retryMessage(id: string) {
    this.api.retryMessage(id).subscribe({
      next: () => {
        this.toast.success('Dispatched simulated message retry');
        this.loadMessages();
      },
      error: () => this.toast.error('Message retry failed')
    });
  }
}
