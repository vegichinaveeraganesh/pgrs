import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Grievance } from '../../../core/models/grievance.model';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';

import {
  LucideX,
  LucideFileText,
  LucideHistory,
  LucideFileCheck,
  LucideStar,
  LucideSparkles,
  LucideRotateCcw,
  LucideEdit3,
  LucidePhoneCall,
  LucidePaperclip,
  LucideSend,
  LucideCheckCircle2,
  LucideUserCheck,
  LucideBuilding2,
  LucideMapPin
} from '@lucide/angular';

@Component({
  selector: 'app-grievance-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatusBadgeComponent,
    FormatDatePipe,
    LucideX,
    LucideFileText,
    LucideHistory,
    LucideFileCheck,
    LucideStar,
    LucideSparkles,
    LucideRotateCcw,
    LucideEdit3,
    LucidePhoneCall,
    LucidePaperclip,
    LucideSend,
    LucideCheckCircle2,
    LucideUserCheck,
    LucideBuilding2,
    LucideMapPin
  ],
  templateUrl: './grievance-detail.component.html',
  styleUrl: './grievance-detail.component.scss'
})
export class GrievanceDetailComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  @Input({ required: true }) application!: Grievance;
  @Output() closed = new EventEmitter<void>();
  @Output() changed = new EventEmitter<void>();

  public currentApp = signal<Grievance | null>(null);
  public activeTab = signal<'overview' | 'timeline' | 'endorse' | 'feedback' | 'routing'>('overview');
  public isBusy = signal<boolean>(false);

  // Form states
  public endorsementRemarks = signal<string>('');
  public endorsementOfficer = signal<string>('');
  public selectedFile: File | null = null;

  public feedbackRating = signal<number>(5);
  public feedbackComment = signal<string>('');

  public editGistMode = signal<boolean>(false);
  public customGistText = signal<string>('');

  ngOnInit() {
    this.currentApp.set(this.application);
    if (this.application?.tahsildar?.name) {
      this.endorsementOfficer.set(this.application.tahsildar.name);
    }
  }

  refreshSelf() {
    if (!this.currentApp()) return;
    this.api.getApplication(this.currentApp()!.id).subscribe({
      next: fresh => {
        this.currentApp.set(fresh);
        this.changed.emit();
      },
      error: () => console.warn('Could not refresh grievance')
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  sendIvrsCall() {
    if (!this.currentApp()) return;
    this.isBusy.set(true);

    this.api.triggerIvrs(this.currentApp()!.id).subscribe({
      next: res => {
        this.isBusy.set(false);
        this.toast.success('IVRS voice call placed to applicant (Simulated)');
        this.toast.info(`Script: "${res.script}"`, 'Automated IVRS Dispatch', 8000);
        this.refreshSelf();
      },
      error: () => {
        this.isBusy.set(false);
        this.toast.error('IVRS dispatch simulation failed');
      }
    });
  }

  submitEndorsement() {
    if (!this.endorsementRemarks().trim() || !this.endorsementOfficer().trim()) {
      this.toast.error('Enter endorsement remarks and officer name');
      return;
    }

    this.isBusy.set(true);
    this.api.endorse(this.currentApp()!.id, {
      remarks: this.endorsementRemarks().trim(),
      officer_name: this.endorsementOfficer().trim(),
      document: this.selectedFile || undefined
    }).subscribe({
      next: () => {
        this.isBusy.set(false);
        this.toast.success('Endorsement uploaded — compliance notification sent to applicant from RDO Bhimunipatnam');
        this.endorsementRemarks.set('');
        this.selectedFile = null;
        this.refreshSelf();
        this.activeTab.set('overview');
      },
      error: err => {
        this.isBusy.set(false);
        this.toast.error(err.error?.detail || 'Endorsement upload failed');
      }
    });
  }

  submitFeedback() {
    const rating = this.feedbackRating();
    if (rating < 1 || rating > 5) {
      this.toast.error('Please select a rating between 1 and 5 stars');
      return;
    }

    this.isBusy.set(true);
    this.api.feedback(this.currentApp()!.id, {
      rating,
      comment: this.feedbackComment().trim()
    }).subscribe({
      next: () => {
        this.isBusy.set(false);
        this.toast.success('Citizen IVRS feedback recorded and forwarded to Tahsildar & VRO');
        this.feedbackComment.set('');
        this.refreshSelf();
        this.activeTab.set('overview');
      },
      error: err => {
        this.isBusy.set(false);
        this.toast.error(err.error?.detail || 'Feedback submission failed');
      }
    });
  }

  regenerateGist() {
    this.isBusy.set(true);
    this.api.generateGist(this.currentApp()!.id).subscribe({
      next: res => {
        this.isBusy.set(false);
        this.toast.success('Gist re-generated successfully');
        this.refreshSelf();
      },
      error: () => {
        this.isBusy.set(false);
        this.toast.error('Gist generation failed');
      }
    });
  }

  saveCustomGist() {
    if (!this.customGistText().trim()) return;
    this.isBusy.set(true);
    this.api.generateGist(this.currentApp()!.id, this.customGistText().trim()).subscribe({
      next: () => {
        this.isBusy.set(false);
        this.toast.success('Custom gist saved');
        this.editGistMode.set(false);
        this.refreshSelf();
      },
      error: () => {
        this.isBusy.set(false);
        this.toast.error('Failed to update gist');
      }
    });
  }

  onClose() {
    this.closed.emit();
  }
}
