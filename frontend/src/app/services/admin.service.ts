// frontend/src/app/services/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = `${environment.apiUrl}/v1/admin`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/users`);
  }

  update(id: string, payload: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/users/${id}`, payload);
  }

  delete(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/users/${id}`);
  }
}
