import { Component, ChangeDetectionStrategy, inject, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import {
  LucideHouse,
  LucideRoute,
  LucideLayoutDashboard,
  LucideSearch,
  LucideUsersRound,
  LucideClock3,
  LucideMessageSquareText,
  LucideChartNoAxesCombined,
  LucideSettings,
  LucideChevronLeft,
  LucideChevronRight,
  LucideShieldCheck,
  LucideLogOut,
  LucideLogIn,
  LucideX
} from '@lucide/angular';

export interface NavGroup {
  group: string;
  items: {
    path: string;
    label: string;
    icon: any;
    badge?: string;
  }[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideHouse,
    LucideRoute,
    LucideLayoutDashboard,
    LucideSearch,
    LucideUsersRound,
    LucideClock3,
    LucideMessageSquareText,
    LucideChartNoAxesCombined,
    LucideSettings,
    LucideChevronLeft,
    LucideChevronRight,
    LucideShieldCheck,
    LucideLogOut,
    LucideLogIn,
    LucideX
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  public authService = inject(AuthService);

  @Input() collapsed: boolean = false;
  @Input() mobileOpen: boolean = false;
  @Output() toggleCollapse = new EventEmitter<void>();
  @Output() closeMobile = new EventEmitter<void>();

  public readonly navGroups: NavGroup[] = [
    {
      group: 'Core Redressal',
      items: [
        { path: '/overview', label: 'Overview', icon: 'house' },
        { path: '/workflow', label: 'Workflow Pipeline', icon: 'route' },
        { path: '/dashboard', label: 'RDO Dashboard', icon: 'dashboard', badge: 'Live' },
        { path: '/tracking', label: 'Track Grievance', icon: 'search' }
      ]
    },
    {
      group: 'Administration',
      items: [
        { path: '/officials', label: 'Officials Directory', icon: 'officials' },
        { path: '/sla-monitoring', label: 'SLA Monitoring', icon: 'sla', badge: '15d' },
        { path: '/notifications', label: 'SMS & IVRS Logs', icon: 'notifications' }
      ]
    },
    {
      group: 'Intelligence',
      items: [
        { path: '/reports', label: 'Reports & Export', icon: 'reports' },
        { path: '/settings', label: 'System Settings', icon: 'settings' }
      ]
    }
  ];

  onToggle() {
    this.toggleCollapse.emit();
  }

  onCloseMobile() {
    this.closeMobile.emit();
  }

  logout() {
    this.authService.logout();
  }
}
