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

  // Active view: 'login' | 'register' | 'verify'
  public authMode = signal<'login' | 'register' | 'verify'>('login');

  // Login form
  public email = signal<string>('rdo@bhimili.gov.in');
  public password = signal<string>('admin123');
  public isLoading = signal<boolean>(false);
  public showPassword = signal<boolean>(false);

  // Registration form
  public regName = signal<string>('');
  public regEmail = signal<string>('');
  public regPassword = signal<string>('');
  public regPhone = signal<string>('');
  public regMandal = signal<string>('Bheemunipatnam');

  // Verification form
  public verifyEmailAddress = signal<string>('');
  public verifyCode = signal<string>('');
  public generatedDemoCode = signal<string>('');

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
    if (!this.regName() || !this.regEmail() || !this.regPassword()) {
      this.toast.error('Please provide your Name, Email, and Password');
      return;
    }

    this.isLoading.set(true);
    this.auth.register({
      name: this.regName(),
      email: this.regEmail(),
      password: this.regPassword(),
      phone: this.regPhone(),
      mandal: this.regMandal(),
      role: 'rdo'
    }).subscribe({
      next: res => {
        this.isLoading.set(false);
        this.verifyEmailAddress.set(this.regEmail());
        if (res.verificationCode) {
          this.generatedDemoCode.set(res.verificationCode);
          this.verifyCode.set(res.verificationCode); // auto-fill for quick convenience
        }
        this.authMode.set('verify');
        this.toast.success(res.message || 'Registration successful! Verification code generated.');
      },
      error: err => {
        this.isLoading.set(false);
        this.toast.error(err.error?.message || 'Registration failed. Please check inputs.');
      }
    });
  }

  onVerifyCode() {
    if (!this.verifyEmailAddress() || !this.verifyCode()) {
      this.toast.error('Please enter the 6-digit verification code');
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
          this.toast.success('Email validated successfully! Access granted.');
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
          this.router.navigateByUrl(returnUrl);
        }
      },
      error: err => {
        this.isLoading.set(false);
        this.toast.error(err.error?.message || 'Verification failed. Invalid code.');
      }
    });
  }

  onResendCode() {
    if (!this.verifyEmailAddress()) return;
    this.isLoading.set(true);
    this.auth.resendVerification(this.verifyEmailAddress()).subscribe({
      next: res => {
        this.isLoading.set(false);
        if (res.verificationCode) {
          this.generatedDemoCode.set(res.verificationCode);
          this.verifyCode.set(res.verificationCode);
        }
        this.toast.success('Fresh verification code sent!');
      },
      error: err => {
        this.isLoading.set(false);
        this.toast.error(err.error?.message || 'Failed to resend code');
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword.update(v => !v);
  }

  fillDemo(email: string) {
    this.email.set(email);
    this.password.set('admin123');
    this.authMode.set('login');
  }
}
