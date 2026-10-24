import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

interface ApiResponse {
  success: boolean;
  data?: any[];
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = `${environment.apiUrl}/v1/admin`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/users`);
  }

  update(id: string, payload: Record<string, unknown>): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.baseUrl}/users/${id}`, payload);
  }

  delete(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.baseUrl}/users/${id}`);
  }
}
