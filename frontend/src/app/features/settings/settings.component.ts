import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import {
  LucideShieldCheck,
  LucideClock3,
  LucideSave,
  LucideBuilding
} from '@lucide/angular';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideShieldCheck,
    LucideClock3,
    LucideSave,
    LucideBuilding
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  public loading = signal<boolean>(false);
  public saving = signal<boolean>(false);

  public settings = signal<any>({
    sla_days: 15,
    auto_gist: true,
    ivrs_enabled: true,
    notification_channels: ['SMS', 'IVRS'],
    office_name: 'Revenue Divisional Office, Bhimunipatnam',
    office_email: 'rdo.bheemili@ap.gov.in',
    office_phone: '+91 8922 241201'
  });

  constructor() {
    this.loadSettings();
  }

  loadSettings() {
    this.loading.set(true);
    this.api.getSettings().subscribe({
      next: (data: any) => {
        if (data) this.settings.set({ ...this.settings(), ...data });
        this.loading.set(false);
      },
      error: (err: any) => {
        this.toast.error('Failed to load settings');
        this.loading.set(false);
      }
    });
  }

  saveSettings() {
    this.saving.set(true);
    this.api.updateSettings(this.settings()).subscribe({
      next: () => {
        this.toast.success('Division portal settings saved successfully');
        this.saving.set(false);
      },
      error: (err: any) => {
        this.toast.error('Failed to save settings');
        this.saving.set(false);
      }
    });
  }
}
