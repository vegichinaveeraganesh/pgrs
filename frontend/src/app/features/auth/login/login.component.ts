import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  LucideShieldCheck,
  LucideLayoutDashboard,
  LucideZap,
  LucideMail,
  LucideLock,
  LucideEye,
  LucideEyeOff,
  LucideLogIn,
  LucideArrowRight
} from '@lucide/angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LucideShieldCheck,
    LucideLayoutDashboard,
    LucideZap,
    LucideMail,
    LucideLock,
    LucideEye,
    LucideEyeOff,
    LucideLogIn,
    LucideArrowRight
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public email = signal<string>('rdo@bhimili.gov.in');
  public password = signal<string>('admin123');
  public isLoading = signal<boolean>(false);
  public showPassword = signal<boolean>(false);

  onLogin() {
    if (!this.email() || !this.password()) {
      this.toast.error('Please enter both email and password');
      return;
    }

    this.isLoading.set(true);
    this.auth.login({ email: this.email(), password: this.password() }).subscribe({
      next: res => {
        this.isLoading.set(false);
        if (res.success) {
          this.toast.success(`Welcome, ${res.user.name}!`);
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
          this.router.navigateByUrl(returnUrl);
        }
      },
      error: err => {
        this.isLoading.set(false);
        this.toast.error(err.error?.message || 'Invalid credentials. Please try again.');
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword.update(v => !v);
  }

  fillDemo(email: string) {
    this.email.set(email);
    this.password.set('admin123');
  }
}
