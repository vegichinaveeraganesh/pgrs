import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { DirectoryResponse, MandalDirectoryItem } from '../../../core/models/official.model';
import { OfficialFormComponent } from '../official-form/official-form.component';
import {
  LucidePhoneCall,
  LucideMapPin,
  LucidePlus,
  LucideBuilding,
  LucideShieldCheck
} from '@lucide/angular';

@Component({
  selector: 'app-officials-directory',
  standalone: true,
  imports: [
    CommonModule,
    OfficialFormComponent,
    LucidePhoneCall,
    LucideMapPin,
    LucidePlus,
    LucideBuilding,
    LucideShieldCheck
  ],
  templateUrl: './officials-directory.component.html',
  styleUrl: './officials-directory.component.scss'
})
export class OfficialsDirectoryComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  public directoryData = signal<DirectoryResponse | null>(null);
  public isLoading = signal<boolean>(false);
  public officialModalOpen = signal<boolean>(false);
  public selectedMandalForAdd = signal<string>('Bheemunipatnam');

  ngOnInit() {
    this.loadDirectory();
  }

  loadDirectory() {
    this.isLoading.set(true);
    this.api.getDirectory().subscribe({
      next: data => {
        this.directoryData.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.error('Failed to load officials directory');
      }
    });
  }

  openAddOfficialModal(mandalName?: string) {
    if (mandalName) {
      this.selectedMandalForAdd.set(mandalName);
    }
    this.officialModalOpen.set(true);
  }

  closeOfficialModal() {
    this.officialModalOpen.set(false);
  }

  onOfficialSaved() {
    this.officialModalOpen.set(false);
    this.loadDirectory();
  }
}
