import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { MANDALS } from '../../../core/constants/sla.constant';

import { LucideX, LucideUserPlus, LucideSave } from '@lucide/angular';

@Component({
  selector: 'app-official-form',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideX, LucideUserPlus, LucideSave],
  templateUrl: './official-form.component.html',
  styleUrl: './official-form.component.scss'
})
export class OfficialFormComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  @Input() defaultMandal: string = 'Bheemunipatnam';
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  public isSubmitting = signal<boolean>(false);
  public mandalList = signal<string[]>(MANDALS);

  public name = signal<string>('');
  public role = signal<'VRO' | 'Tahsildar' | 'RDO'>('VRO');
  public phone = signal<string>('');
  public email = signal<string>('');
  public mandal = signal<string>('Bheemunipatnam');
  public village = signal<string>('');

  ngOnInit() {
    if (this.defaultMandal) {
      this.mandal.set(this.defaultMandal);
    }
  }

  onSubmit() {
    if (!this.name().trim() || !this.phone().trim()) {
      this.toast.error('Name and phone number are required');
      return;
    }

    this.isSubmitting.set(true);

    const payload = {
      name: this.name().trim(),
      role: this.role(),
      phone: this.phone().trim(),
      email: this.email().trim() || undefined,
      mandal: this.mandal(),
      village: this.role() === 'VRO' ? this.village().trim() : undefined,
      active: true
    };

    this.api.createOfficial(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toast.success('Official added to directory successfully');
        this.saved.emit();
      },
      error: err => {
        this.isSubmitting.set(false);
        this.toast.error(err.error?.message || 'Failed to add official');
      }
    });
  }

  onClose() {
    this.closed.emit();
  }
}
