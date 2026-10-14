import { Component, Output, EventEmitter, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import {
  LucideSearch,
  LucideBellRing,
  LucideCalendarDays,
  LucideMenu,
  LucideLogOut,
  LucideLogIn,
  LucideChevronDown,
  LucideSlidersHorizontal
} from '@lucide/angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideSearch,
    LucideBellRing,
    LucideCalendarDays,
    LucideMenu,
    LucideLogOut,
    LucideLogIn,
    LucideChevronDown,
    LucideSlidersHorizontal
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  public authService = inject(AuthService);
  private router = inject(Router);

  public mobileMenuOpen = signal<boolean>(false);
  public profileMenuOpen = signal<boolean>(false);
  public currentUrl = signal<string>(this.router.url);

  @Output() toggleMobile = new EventEmitter<void>();
  @Output() trackClick = new EventEmitter<void>();
  @Output() newGrievanceClick = new EventEmitter<void>();

  public readonly currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  public readonly pageMeta = computed(() => {
    const url = this.currentUrl();
    if (url.includes('/dashboard')) return { title: 'RDO Dashboard', section: 'Analytics' };
    if (url.includes('/workflow')) return { title: 'Workflow Pipeline', section: '7-Step Redressal' };
    if (url.includes('/tracking')) return { title: 'Grievance Tracking', section: 'Citizen Services' };
    if (url.includes('/officials')) return { title: 'Officials Directory', section: 'Division Staff' };
    if (url.includes('/sla-monitoring')) return { title: 'SLA Compliance & Escalations', section: 'Monitoring' };
    if (url.includes('/notifications')) return { title: 'SMS & IVRS Activity Logs', section: 'Communications' };
    if (url.includes('/reports')) return { title: 'Reports & Export', section: 'Intelligence' };
    if (url.includes('/settings')) return { title: 'Division Settings', section: 'Configuration' };
    if (url.includes('/auth/login')) return { title: 'Official Authentication', section: 'Portal Access' };
    return { title: 'Division Overview', section: 'Home' };
  });

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentUrl.set(event.urlAfterRedirects || event.url);
        this.mobileMenuOpen.set(false);
        this.profileMenuOpen.set(false);
      });
  }

  toggleMobileMenu() {
    this.toggleMobile.emit();
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  toggleProfileMenu() {
    this.profileMenuOpen.update(v => !v);
  }

  logout() {
    this.profileMenuOpen.set(false);
    this.authService.logout();
  }
}
