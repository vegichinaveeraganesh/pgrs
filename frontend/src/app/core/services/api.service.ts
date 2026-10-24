import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Grievance, GrievanceListResponse } from '../models/grievance.model';
import { DashboardSummary } from '../models/dashboard.model';
import { DirectoryResponse, Official } from '../models/official.model';
import { NotificationMessage } from '../models/notification.model';
import { Mandal, Village } from '../models/mandal.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Dashboard
  getDashboard(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.baseUrl}/dashboard`);
  }

  // Grievances
  getApplications(params?: {
    mandal?: string;
    stage?: string;
    sla?: string;
    q?: string;
    category?: string;
  }): Observable<GrievanceListResponse> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.mandal) httpParams = httpParams.set('mandal', params.mandal);
      if (params.stage) httpParams = httpParams.set('stage', params.stage);
      if (params.sla) httpParams = httpParams.set('sla', params.sla);
      if (params.q) httpParams = httpParams.set('q', params.q);
      if (params.category) httpParams = httpParams.set('category', params.category);
    }
    return this.http.get<GrievanceListResponse>(`${this.baseUrl}/applications`, { params: httpParams });
  }

  getApplication(id: string): Observable<Grievance> {
    return this.http.get<Grievance>(`${this.baseUrl}/applications/${id}`);
  }

  createApplication(data: Partial<Grievance>): Observable<Grievance> {
    return this.http.post<Grievance>(`${this.baseUrl}/applications`, data);
  }

  updateApplication(id: string, data: Partial<Grievance>): Observable<Grievance> {
    return this.http.patch<Grievance>(`${this.baseUrl}/applications/${id}`, data);
  }

  generateGist(id: string, customGist?: string): Observable<{ success: boolean; gist: string }> {
    return this.http.post<{ success: boolean; gist: string }>(`${this.baseUrl}/applications/${id}/gist`, { customGist });
  }

  assignOfficials(id: string, data: { vro?: any; tahsildar?: any; reason?: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/applications/${id}/assign`, data);
  }

  endorse(id: string, data: { remarks: string; officer_name: string; document?: File }): Observable<any> {
    if (data.document) {
      const formData = new FormData();
      formData.append('remarks', data.remarks);
      formData.append('officer_name', data.officer_name);
      formData.append('document', data.document);
      return this.http.post(`${this.baseUrl}/applications/${id}/endorsements`, formData);
    }
    return this.http.post(`${this.baseUrl}/applications/${id}/endorsements`, {
      remarks: data.remarks,
      officer_name: data.officer_name
    });
  }

  feedback(id: string, data: { rating: number; comment?: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/applications/${id}/feedback`, data);
  }

  triggerIvrs(id: string): Observable<{ success: boolean; script: string }> {
    return this.http.post<{ success: boolean; script: string }>(`${this.baseUrl}/applications/${id}/ivrs`, {});
  }

  // Directory & Officials
  getDirectory(): Observable<DirectoryResponse> {
    return this.http.get<DirectoryResponse>(`${this.baseUrl}/directory`);
  }

  getOfficials(params?: { role?: string; mandal?: string }): Observable<Official[]> {
    let httpParams = new HttpParams();
    if (params?.role) httpParams = httpParams.set('role', params.role);
    if (params?.mandal) httpParams = httpParams.set('mandal', params.mandal);
    return this.http.get<Official[]>(`${this.baseUrl}/v1/officials`, { params: httpParams });
  }

  createOfficial(official: Partial<Official>): Observable<any> {
    return this.http.post(`${this.baseUrl}/v1/officials`, official);
  }

  updateOfficial(id: string, official: Partial<Official>): Observable<any> {
    return this.http.patch(`${this.baseUrl}/v1/officials/${id}`, official);
  }

  // Notifications / Messages
  getMessages(params?: { channel?: string; role?: string; q?: string }): Observable<NotificationMessage[]> {
    let httpParams = new HttpParams();
    if (params?.channel) httpParams = httpParams.set('channel', params.channel);
    if (params?.role) httpParams = httpParams.set('role', params.role);
    if (params?.q) httpParams = httpParams.set('q', params.q);
    return this.http.get<NotificationMessage[]>(`${this.baseUrl}/messages`, { params: httpParams });
  }

  retryMessage(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/v1/notifications/${id}/retry`, {});
  }

  // PGRS Synchronization
  sync(): Observable<{ status: string; message: string; totalRecords: number }> {
    return this.http.post<{ status: string; message: string; totalRecords: number }>(`${this.baseUrl}/pgrs/sync`, {});
  }

  uploadPgrsCsv(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/v1/integrations/pgrs/upload-csv`, formData);
  }

  uploadPgrsCsvText(csvText: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/v1/integrations/pgrs/upload-csv`, { csv: csvText });
  }

  // Public Tracking
  track(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/v1/public/track/${id}`);
  }

  // Mandals & Villages
  getMandals(): Observable<Mandal[]> {
    return this.http.get<Mandal[]>(`${this.baseUrl}/v1/mandals/mandals`);
  }

  getVillages(mandal?: string): Observable<Village[]> {
    let params = new HttpParams();
    if (mandal) params = params.set('mandal', mandal);
    return this.http.get<Village[]>(`${this.baseUrl}/v1/mandals/villages`, { params });
  }

  // Reports
  getReportsSummary(): Observable<any> {
    return this.http.get(`${this.baseUrl}/v1/reports/summary`);
  }

  exportReportCsvUrl(mandal?: string): string {
    const query = mandal ? `?format=csv&mandal=${encodeURIComponent(mandal)}` : '?format=csv';
    return `${this.baseUrl}/v1/reports/export${query}`;
  }

  // Settings
  getSettings(): Observable<any> {
    return this.http.get(`${this.baseUrl}/v1/settings`);
  }

  updateSettings(data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/v1/settings`, data);
  }
}
