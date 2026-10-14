import { Component, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { Mandal, Village } from '../../../core/models/mandal.model';
import { MANDALS } from '../../../core/constants/sla.constant';

import {
  LucideX,
  LucideSend,
  LucideFilePlus2,
  LucideUser,
  LucideMapPin,
  LucideFileText
} from '@lucide/angular';

@Component({
  selector: 'app-grievance-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideX,
    LucideSend,
    LucideFilePlus2,
    LucideUser,
    LucideMapPin,
    LucideFileText
  ],
  templateUrl: './grievance-form.component.html',
  styleUrl: './grievance-form.component.scss'
})
export class GrievanceFormComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  @Output() closed = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  public isSubmitting = signal<boolean>(false);
  public mandalList = signal<string[]>(MANDALS);
  public villageList = signal<Village[]>([]);

  // Form Fields
  public applicantName = signal<string>('');
  public phone = signal<string>('');
  public email = signal<string>('');
  public mandal = signal<string>('Bheemunipatnam');
  public village = signal<string>('');
  public category = signal<string>('Land Revenue');
  public subject = signal<string>('');
  public description = signal<string>('');
  public slaDays = signal<number>(15);

  public readonly categories = [
    'Land Revenue',
    'Pensions',
    'Civil Supplies',
    'Housing & House Sites',
    'Encroachments',
    'Rural Water Supply',
    'Panchayat Raj & Roads'
  ];

  ngOnInit() {
    this.loadVillages(this.mandal());
  }

  onMandalChange(newMandal: string) {
    this.mandal.set(newMandal);
    this.village.set('');
    this.loadVillages(newMandal);
  }

  loadVillages(mandalName: string) {
    this.api.getVillages(mandalName).subscribe({
      next: list => {
        this.villageList.set(list || []);
        if (list && list.length > 0) {
          this.village.set(list[0].name);
        }
      },
      error: () => console.warn('Could not load villages')
    });
  }

  onSubmit() {
    if (!this.applicantName().trim() || !this.phone().trim() || !this.subject().trim() || !this.description().trim()) {
      this.toast.error('Please fill in all required fields');
      return;
    }

    this.isSubmitting.set(true);

    const payload = {
      applicant_name: this.applicantName().trim(),
      phone: this.phone().trim(),
      email: this.email().trim() || undefined,
      mandal: this.mandal(),
      village: this.village() || this.mandal(),
      category: this.category(),
      subject: this.subject().trim(),
      description: this.description().trim(),
      sla_days: this.slaDays()
    };

    this.api.createApplication(payload).subscribe({
      next: createdApp => {
        this.isSubmitting.set(false);
        this.toast.success(`Grievance ${createdApp.pgrs_no} registered and auto-routed to VRO`);
        this.created.emit();
      },
      error: err => {
        this.isSubmitting.set(false);
        this.toast.error(err.error?.detail || err.error?.message || 'Failed to register grievance');
      }
    });
  }

  onClose() {
    this.closed.emit();
  }
}
