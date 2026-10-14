import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly toastsSignal = signal<ToastMessage[]>([]);
  public readonly toasts = this.toastsSignal.asReadonly();

  show(toast: Omit<ToastMessage, 'id'>) {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = {
      id,
      duration: 5000,
      ...toast
    };

    this.toastsSignal.update(current => [...current, newToast]);

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, newToast.duration);
    }
  }

  success(message: string, title?: string, duration = 4000) {
    this.show({ type: 'success', message, title, duration });
  }

  error(message: string, title?: string, duration = 6000) {
    this.show({ type: 'error', message, title, duration });
  }

  info(message: string, title?: string, duration = 5000) {
    this.show({ type: 'info', message, title, duration });
  }

  warning(message: string, title?: string, duration = 5000) {
    this.show({ type: 'warning', message, title, duration });
  }

  remove(id: string) {
    this.toastsSignal.update(current => current.filter(t => t.id !== id));
  }

  clear() {
    this.toastsSignal.set([]);
  }
}
