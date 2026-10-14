import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent, FooterComponent, ToastComponent],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PublicLayoutComponent {
  public sidebarCollapsed = signal<boolean>(false);
  public mobileNavOpen = signal<boolean>(false);

  toggleSidebar() {
    this.sidebarCollapsed.update(v => !v);
  }

  toggleMobileNav() {
    this.mobileNavOpen.update(v => !v);
  }

  closeMobileNav() {
    this.mobileNavOpen.set(false);
  }
}
