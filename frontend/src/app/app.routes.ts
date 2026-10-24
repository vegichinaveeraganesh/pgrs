import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      {
        path: 'overview',
        loadComponent: () =>
          import('./features/overview/overview.component').then(m => m.OverviewComponent)
      },
      {
        path: 'workflow',
        loadComponent: () =>
          import('./features/workflow/workflow-pipeline.component').then(m => m.WorkflowPipelineComponent)
      },
      {
        path: 'tracking',
        loadComponent: () =>
          import('./features/grievance-tracking/grievance-tracking.component').then(m => m.GrievanceTrackingComponent)
      },
      {
        path: 'auth/login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'officials',
        loadComponent: () =>
          import('./features/officials/officials-directory/officials-directory.component').then(m => m.OfficialsDirectoryComponent)
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/notifications/notifications.component').then(m => m.NotificationsComponent)
      },
      {
        path: 'sla-monitoring',
        loadComponent: () =>
          import('./features/sla-monitoring/sla-monitoring.component').then(m => m.SlaMonitoringComponent)
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports.component').then(m => m.ReportsComponent)
      },
      {
        path: 'settings',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: 'admin/users',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/admin/users/users.component').then(m => m.UsersComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'overview' }
];
