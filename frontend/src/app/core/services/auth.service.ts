import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { User, AuthResponse, UserRole } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/v1/auth`;
  private readonly currentUserSignal = signal<User | null>(this.getStoredUser());
  private readonly tokenSignal = signal<string | null>(localStorage.getItem('pgrs_token'));

  public readonly currentUser = this.currentUserSignal.asReadonly();
  public readonly isAuthenticated = computed(() => !!this.currentUserSignal());
  public readonly userRole = computed(() => this.currentUserSignal()?.role || null);

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.success && res.accessToken) {
          this.setSession(res);
        }
      })
    );
  }

  register(data: { name: string; email: string; phone?: string; designation?: string; mandal?: string; role?: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/register`, data);
  }

  verifyEmail(data: { email: string; code: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/verify-email`, data).pipe(
      tap(res => {
        if (res.success && res.accessToken) {
          this.setSession(res);
        }
      })
    );
  }

  resendVerification(email: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/resend-verification`, { email });
  }

  setPassword(data: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/set-password`, data).pipe(
      tap(res => {
        if (res.success && res.accessToken) {
          this.setSession(res);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('pgrs_token');
    localStorage.removeItem('pgrs_refresh_token');
    localStorage.removeItem('pgrs_user');
    this.currentUserSignal.set(null);
    this.tokenSignal.set(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  hasRole(roles: UserRole[]): boolean {
    const current = this.currentUserSignal();
    if (!current) return false;
    if (current.role === 'super_admin') return true;
    return roles.includes(current.role);
  }

  private setSession(authResult: AuthResponse) {
    localStorage.setItem('pgrs_token', authResult.accessToken);
    localStorage.setItem('pgrs_refresh_token', authResult.refreshToken);
    localStorage.setItem('pgrs_user', JSON.stringify(authResult.user));
    this.tokenSignal.set(authResult.accessToken);
    this.currentUserSignal.set(authResult.user);
  }

  private getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem('pgrs_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
}
