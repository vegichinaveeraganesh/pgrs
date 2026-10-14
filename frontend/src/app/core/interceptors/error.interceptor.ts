import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = error.error.message;
      } else {
        // Server-side error
        if (error.status === 401) {
          if (!req.url.includes('/login')) {
            authService.logout();
            toastService.error('Session expired. Please log in again.');
          }
        } else if (error.status === 403) {
          toastService.error('Access denied: You do not have permission for this action.');
        } else if (error.error?.detail) {
          errorMessage = error.error.detail;
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else {
          errorMessage = `Server returned status code ${error.status}`;
        }
      }

      console.error('[HTTP Error]', error);
      return throwError(() => error);
    })
  );
};
