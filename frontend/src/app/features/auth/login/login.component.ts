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
  LucideArrowRight,
  LucideUserPlus,
  LucideUser,
  LucidePhone,
  LucideKeyRound,
  LucideCheckCircle2,
  LucideRotateCcw
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
    LucideArrowRight,
    LucideUserPlus,
    LucideUser,
    LucidePhone,
    LucideKeyRound,
    LucideCheckCircle2,
    LucideRotateCcw
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Active view: 'login' | 'register' | 'verify' | 'set-password'
  public authMode = signal<'login' | 'register' | 'verify' | 'set-password'>('login');

  constructor() {
    if (this.auth.isAuthenticated()) {
      const rawReturn = this.route.snapshot.queryParams['returnUrl'];
      const returnUrl = (rawReturn && rawReturn !== '/' && rawReturn !== '/auth/login') ? rawReturn : '/overview';
      this.router.navigateByUrl(returnUrl);
    }
  }

  // Login form
  public email = signal<string>('');
  public password = signal<string>('');
  public isLoading = signal<boolean>(false);
  public showPassword = signal<boolean>(false);

  // Registration form
  public regName = signal<string>('');
  public regEmail = signal<string>('');
  public regPhone = signal<string>('');
  public regMandal = signal<string>('Bheemunipatnam');

  // Verification form
  public verifyEmailAddress = signal<string>('');
  public verifyCode = signal<string>('');
  public generatedDemoCode = signal<string>('');

  // Set password form (after OTP)
  public newPassword = signal<string>('');
  public confirmPassword = signal<string>('');
  public showNewPassword = signal<boolean>(false);

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
          const rawReturn = this.route.snapshot.queryParams['returnUrl'];
          const returnUrl = (rawReturn && rawReturn !== '/' && rawReturn !== '/auth/login') ? rawReturn : '/overview';
          this.router.navigateByUrl(returnUrl);
        }
      },
      error: err => {
        this.isLoading.set(false);
        if (err.error?.needsVerification) {
          this.verifyEmailAddress.set(err.error.email || this.email());
          this.authMode.set('verify');
          this.toast.warning('Please enter the 6-digit validation code sent to your email.');
        } else {
          this.toast.error(err.error?.message || 'Invalid credentials. Please try again.');
        }
      }
    });
  }

  onRegister() {
    if (!this.regName() || !this.regEmail()) {
      this.toast.error('Please provide your Name and Email');
      return;
    }

    this.isLoading.set(true);
    this.auth.register({
      name: this.regName(),
      email: this.regEmail(),
      phone: this.regPhone(),
      mandal: this.regMandal(),
      role: 'staff'
    }).subscribe({
      next: res => {
        this.isLoading.set(false);
        this.verifyEmailAddress.set(this.regEmail());
        this.authMode.set('verify');
        this.toast.success(res.message || 'OTP sent to your email! Please check your inbox.');
      },
      error: err => {
        this.isLoading.set(false);
        this.toast.error(err.error?.message || 'Registration failed. Please check inputs.');
      }
    });
  }

  onVerifyCode() {
    if (!this.verifyEmailAddress() || !this.verifyCode()) {
      this.toast.error('Please enter the 6-digit OTP code');
      return;
    }

    this.isLoading.set(true);
    this.auth.verifyEmail({
      email: this.verifyEmailAddress(),
      code: this.verifyCode().trim()
    }).subscribe({
      next: res => {
        this.isLoading.set(false);
        if (res.success) {
          // OTP verified — now go to set-password step
          this.authMode.set('set-password');
          this.toast.success('Email verified! Please create your password.');
        }
      },
      error: err => {
        this.isLoading.set(false);
        this.toast.error(err.error?.message || 'Invalid OTP. Please try again.');
      }
    });
  }

  onSetPassword() {
    if (!this.newPassword() || this.newPassword().length < 8) {
      this.toast.error('Password must be at least 8 characters');
      return;
    }
    if (this.newPassword() !== this.confirmPassword()) {
      this.toast.error('Passwords do not match');
      return;
    }

    this.isLoading.set(true);
    this.auth.setPassword({
      email: this.verifyEmailAddress(),
      password: this.newPassword()
    }).subscribe({
      next: res => {
        this.isLoading.set(false);
        if (res.success) {
          this.toast.success(`Welcome, ${res.user?.name}! Account ready.`);
          const rawReturn = this.route.snapshot.queryParams['returnUrl'];
          const returnUrl = (rawReturn && rawReturn !== '/' && rawReturn !== '/auth/login') ? rawReturn : '/overview';
          this.router.navigateByUrl(returnUrl);
        }
      },
      error: err => {
        this.isLoading.set(false);
        this.toast.error(err.error?.message || 'Failed to set password. Try again.');
      }
    });
  }

  onResendCode() {
    if (!this.verifyEmailAddress()) return;
    this.isLoading.set(true);
    this.auth.resendVerification(this.verifyEmailAddress()).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toast.success('Fresh OTP sent to your email! Please check your inbox.');
      },
      error: err => {
        this.isLoading.set(false);
        this.toast.error(err.error?.message || 'Failed to resend OTP');
      }
    });
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword.update(v => !v);
  }

  togglePasswordVisibility() {
    this.showPassword.update(v => !v);
  }

  fillDemo(email: string) {
    this.email.set(email);
    this.password.set('Admin@12345');
    this.authMode.set('login');
  }
}
