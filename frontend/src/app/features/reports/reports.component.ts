import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Report } from '../../core/models/report.model';
import { FormatDatePipe } from '../../shared/pipes/format-date.pipe';
import {
  LucideDownload,
  LucideFileSpreadsheet,
  LucideShieldCheck
} from '@lucide/angular';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormatDatePipe,
    LucideDownload,
    LucideFileSpreadsheet,
    LucideShieldCheck
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  public reports = signal<Report[]>([]);
  public summary = signal<any>(null);
  public loading = signal<boolean>(false);

  constructor() {
    this.loadReports();
  }

  loadReports() {
    this.loading.set(true);
    this.api.getReportsSummary().subscribe({
      next: (data: any) => {
        this.summary.set(data);
        const generatedReports: Report[] = [
          {
            id: 'rep-all',
            title: 'Division Master Grievance Redressal Report',
            description: `Comprehensive export of all ${data?.total ?? 8} grievances across Bheemunipatnam Division with complete SLA compliance and endorsements.`,
            type: 'summary',
            created_at: new Date().toISOString(),
            ownerName: 'Revenue Divisional Officer (RDO)',
            downloadUrl: this.api.exportReportCsvUrl()
          },
          {
            id: 'rep-bheemili',
            title: 'Bheemunipatnam Mandal Redressal Report',
            description: `Audit report covering ${data?.mandalStats?.['Bheemunipatnam']?.total ?? 0} grievances in Bheemunipatnam Mandal with VRO action logs.`,
            type: 'mandal',
            mandal: 'Bheemunipatnam',
            created_at: new Date().toISOString(),
            ownerName: 'Tahsildar Bheemunipatnam',
            downloadUrl: this.api.exportReportCsvUrl('Bheemunipatnam')
          },
          {
            id: 'rep-padmanabham',
            title: 'Padmanabham Mandal Redressal Report',
            description: `Audit report covering ${data?.mandalStats?.['Padmanabham']?.total ?? 0} grievances in Padmanabham Mandal with resolution timelines.`,
            type: 'mandal',
            mandal: 'Padmanabham',
            created_at: new Date().toISOString(),
            ownerName: 'Tahsildar Padmanabham',
            downloadUrl: this.api.exportReportCsvUrl('Padmanabham')
          },
          {
            id: 'rep-anandapuram',
            title: 'Anandapuram Mandal Redressal Report',
            description: `Audit report covering ${data?.mandalStats?.['Anandapuram']?.total ?? 0} grievances in Anandapuram Mandal.`,
            type: 'mandal',
            mandal: 'Anandapuram',
            created_at: new Date().toISOString(),
            ownerName: 'Tahsildar Anandapuram',
            downloadUrl: this.api.exportReportCsvUrl('Anandapuram')
          },
          {
            id: 'rep-sla',
            title: 'SLA Overdue & Escalation Report',
            description: `Compliance audit highlighting ${data?.totalOverdue ?? 0} grievances that exceeded the standard 15-day SLA timeline.`,
            type: 'sla',
            created_at: new Date().toISOString(),
            ownerName: 'Divisional Redressal Cell',
            downloadUrl: this.api.exportReportCsvUrl()
          }
        ];
        this.reports.set(generatedReports);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.toast.error('Failed to load live reports data');
        this.reports.set([
          {
            id: 'rep-all',
            title: 'Division Master Grievance Redressal Report',
            description: 'Comprehensive report of all grievances across Bheemunipatnam Division.',
            type: 'summary',
            created_at: new Date().toISOString(),
            ownerName: 'Revenue Divisional Officer (RDO)',
            downloadUrl: this.api.exportReportCsvUrl()
          }
        ]);
        this.loading.set(false);
      }
    });
  }
}
