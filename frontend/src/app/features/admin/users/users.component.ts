import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  LucideUsers,
  LucideShieldCheck,
  LucideSearch,
  LucideTrash2,
  LucidePencil,
  LucideRotateCcw,
  LucideUserCheck,
  LucideMail,
  LucidePhone,
  LucideBuilding,
  LucideX,
  LucideCheck
} from '@lucide/angular';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  designation?: string;
  mandal?: string;
  village?: string;
  active: boolean;
  isEmailVerified?: boolean;
  createdAt?: string;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideShieldCheck,
    LucideSearch,
    LucideTrash2,
    LucidePencil,
    LucideRotateCcw,
    LucideMail,
    LucidePhone,
    LucideX,
    LucideCheck
  ],
  template: `
    <section class="admin-users-page">
      <div class="gov-container">
        <!-- Top Header Card -->
        <div class="users-header-card">
          <div class="header-info">
            <div class="users-badge">
              <svg lucideShieldCheck [size]="15" [strokeWidth]="2"></svg>
              <span>User &amp; Permission Administration</span>
            </div>
            <h1 class="page-title">PGRS Authorized Users Directory</h1>
            <p class="page-desc">
              Manage officer accounts, designations, assigned revenue mandals, and security access roles across Bhimunipatnam Division.
            </p>
          </div>

          <div class="header-actions">
            <button type="button" class="btn btn-outline" (click)="loadUsers()" [disabled]="loading()">
              <svg lucideRotateCcw [size]="14" [strokeWidth]="2"></svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <!-- Metric Badges Row -->
        <div class="metrics-row">
          <div class="metric-card">
            <div class="metric-label">Total Officers</div>
            <div class="metric-value">{{ users().length }}</div>
            <div class="metric-sub">Registered accounts</div>
          </div>
          <div class="metric-card metric-success">
            <div class="metric-label">Active Status</div>
            <div class="metric-value">{{ activeCount() }}</div>
            <div class="metric-sub">Active &amp; verified</div>
          </div>
          <div class="metric-card metric-info">
            <div class="metric-label">Tahsildars</div>
            <div class="metric-value">{{ tahsildarCount() }}</div>
            <div class="metric-sub">Mandal heads</div>
          </div>
          <div class="metric-card metric-purple">
            <div class="metric-label">Super Admins / RDO</div>
            <div class="metric-value">{{ adminCount() }}</div>
            <div class="metric-sub">Division leadership</div>
          </div>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="users-toolbar">
          <div class="search-box">
            <svg lucideSearch [size]="16" [strokeWidth]="1.8" class="search-icon"></svg>
            <input
              type="text"
              placeholder="Search by officer name, email, or mandal..."
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              class="search-input"
            />
          </div>

          <div class="role-filter">
            <select
              [ngModel]="selectedRole()"
              (ngModelChange)="selectedRole.set($event)"
              class="filter-select"
            >
              <option value="">All Roles ({{ users().length }})</option>
              <option value="super_admin">Super Admin</option>
              <option value="rdo">RDO</option>
              <option value="tahsildar">Tahsildar</option>
              <option value="vro">VRO</option>
              <option value="staff">Staff / Operator</option>
            </select>
          </div>
        </div>

        <!-- Content Area -->
        @if (loading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading users from database...</p>
          </div>
        } @else if (error()) {
          <div class="error-banner">
            <p>{{ error() }}</p>
            <button class="btn btn-sm btn-outline" (click)="loadUsers()">Retry</button>
          </div>
        } @else if (filteredUsers().length === 0) {
          <div class="empty-state">
            <p>No user accounts matched your search criteria.</p>
          </div>
        } @else {
          <div class="table-card">
            <table class="users-table">
              <thead>
                <tr>
                  <th>Officer Name &amp; Designation</th>
                  <th>Contact Details</th>
                  <th>Assigned Jurisdiction</th>
                  <th>System Role</th>
                  <th>Account Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (u of filteredUsers(); track u._id) {
                  <tr>
                    @if (editingUserId() !== u._id) {
                      <td>
                        <div class="user-cell-name">
                          <div class="avatar-sm">{{ u.name.charAt(0) }}</div>
                          <div>
                            <div class="officer-name">{{ u.name }}</div>
                            <div class="officer-desig">{{ u.designation || 'Revenue Official' }}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div class="contact-cell">
                          <div class="contact-item">
                            <svg lucideMail [size]="13" [strokeWidth]="1.8"></svg>
                            <span>{{ u.email }}</span>
                          </div>
                          @if (u.phone) {
                            <div class="contact-item">
                              <svg lucidePhone [size]="13" [strokeWidth]="1.8"></svg>
                              <span>{{ u.phone }}</span>
                            </div>
                          }
                        </div>
                      </td>
                      <td>
                        <span class="mandal-pill">{{ u.mandal || 'Division Office' }}</span>
                        @if (u.village) {
                          <span class="village-sub">({{ u.village }})</span>
                        }
                      </td>
                      <td>
                        <span class="role-badge" [attr.data-role]="u.role">{{ u.role }}</span>
                      </td>
                      <td>
                        @if (u.active) {
                          <span class="status-badge active"><span class="dot"></span> Active</span>
                        } @else {
                          <span class="status-badge inactive"><span class="dot"></span> Inactive</span>
                        }
                      </td>
                      <td>
                        <div class="action-buttons">
                          <button type="button" class="btn-icon edit-btn" (click)="startEdit(u)" title="Edit Officer">
                            <svg lucidePencil [size]="14" [strokeWidth]="2"></svg>
                          </button>
                          <button type="button" class="btn-icon delete-btn" (click)="deleteUser(u)" title="Delete Officer">
                            <svg lucideTrash2 [size]="14" [strokeWidth]="2"></svg>
                          </button>
                        </div>
                      </td>
                    } @else {
                      <!-- Inline Editing Row -->
                      <td>
                        <input [(ngModel)]="editData.name" class="inline-input" placeholder="Name" />
                        <input [(ngModel)]="editData.designation" class="inline-input mt-4" placeholder="Designation" />
                      </td>
                      <td>
                        <input [(ngModel)]="editData.email" class="inline-input" placeholder="Email" />
                        <input [(ngModel)]="editData.phone" class="inline-input mt-4" placeholder="Phone" />
                      </td>
                      <td>
                        <input [(ngModel)]="editData.mandal" class="inline-input" placeholder="Mandal" />
                      </td>
                      <td>
                        <select [(ngModel)]="editData.role" class="inline-select">
                          <option value="super_admin">super_admin</option>
                          <option value="rdo">rdo</option>
                          <option value="tahsildar">tahsildar</option>
                          <option value="vro">vro</option>
                          <option value="staff">staff</option>
                        </select>
                      </td>
                      <td>
                        <label class="toggle-label">
                          <input type="checkbox" [(ngModel)]="editData.active" />
                          <span>Active</span>
                        </label>
                      </td>
                      <td>
                        <div class="action-buttons">
                          <button type="button" class="btn btn-sm btn-success" (click)="saveEdit()">
                            <svg lucideCheck [size]="14" [strokeWidth]="2.2"></svg>
                            <span>Save</span>
                          </button>
                          <button type="button" class="btn btn-sm btn-ghost" (click)="cancelEdit()">
                            <svg lucideX [size]="14" [strokeWidth]="2"></svg>
                          </button>
                        </div>
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .admin-users-page {
      padding: 24px 0 60px;
    }

    .gov-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .users-header-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .users-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #eff6ff;
      color: #1d4ed8;
      font-size: 12px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 20px;
      margin-bottom: 8px;
    }

    .page-title {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 6px;
    }

    .page-desc {
      font-size: 13px;
      color: #64748b;
      margin: 0;
      max-width: 720px;
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }

    .metrics-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .metric-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px 20px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.04);
    }

    .metric-label {
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .metric-value {
      font-size: 28px;
      font-weight: 800;
      color: #0f172a;
      margin: 4px 0 2px;
    }

    .metric-sub {
      font-size: 11px;
      color: #94a3b8;
    }

    .metric-success .metric-value { color: #10b981; }
    .metric-info .metric-value { color: #0284c7; }
    .metric-purple .metric-value { color: #7c3aed; }

    .users-toolbar {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }

    .search-box {
      flex: 1;
      position: relative;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
    }

    .search-input {
      width: 100%;
      padding: 10px 14px 10px 38px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 13px;
      background: white;
      box-sizing: border-box;
    }

    .filter-select {
      padding: 10px 16px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      background: white;
      font-size: 13px;
      font-weight: 500;
      color: #334155;
    }

    .table-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .users-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .users-table th {
      background: #f8fafc;
      padding: 12px 18px;
      font-size: 12px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #e2e8f0;
    }

    .users-table td {
      padding: 14px 18px;
      font-size: 13px;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
      vertical-align: middle;
    }

    .users-table tr:hover {
      background: #f8fafc;
    }

    .user-cell-name {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .avatar-sm {
      width: 36px;
      height: 36px;
      background: #3b82f6;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      flex-shrink: 0;
    }

    .officer-name {
      font-weight: 700;
      color: #0f172a;
    }

    .officer-desig {
      font-size: 11px;
      color: #64748b;
    }

    .contact-cell {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #475569;
    }

    .mandal-pill {
      display: inline-block;
      padding: 3px 8px;
      background: #f1f5f9;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      color: #334155;
    }

    .village-sub {
      font-size: 11px;
      color: #64748b;
      margin-left: 4px;
    }

    .role-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .role-badge[data-role="super_admin"] { background: #fae8ff; color: #86198f; }
    .role-badge[data-role="rdo"] { background: #ede9fe; color: #5b21b6; }
    .role-badge[data-role="tahsildar"] { background: #e0f2fe; color: #0369a1; }
    .role-badge[data-role="vro"] { background: #ecfdf5; color: #047857; }
    .role-badge[data-role="staff"] { background: #fef3c7; color: #92400e; }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      font-weight: 600;
    }

    .status-badge .dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }

    .status-badge.active { color: #059669; }
    .status-badge.active .dot { background: #10b981; }
    .status-badge.inactive { color: #dc2626; }
    .status-badge.inactive .dot { background: #ef4444; }

    .action-buttons {
      display: flex;
      gap: 6px;
    }

    .btn-icon {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      background: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }

    .edit-btn:hover { background: #eff6ff; color: #2563eb; border-color: #93c5fd; }
    .delete-btn:hover { background: #fef2f2; color: #dc2626; border-color: #fca5a5; }

    .inline-input {
      width: 100%;
      padding: 6px 8px;
      font-size: 12px;
      border: 1px solid #3b82f6;
      border-radius: 4px;
      box-sizing: border-box;
    }

    .inline-select {
      padding: 6px;
      font-size: 12px;
      border: 1px solid #3b82f6;
      border-radius: 4px;
    }

    .mt-4 { margin-top: 4px; }

    .toggle-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
    }

    .loading-state, .empty-state {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 60px 20px;
      text-align: center;
      color: #64748b;
    }

    .error-banner {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 16px;
      color: #dc2626;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .btn-outline {
      border: 1px solid #cbd5e1;
      background: white;
      padding: 8px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .btn-outline:hover { background: #f8fafc; }
  `]
})
export class UsersComponent implements OnInit {
  private adminService = inject(AdminService);
  private toast = inject(ToastService);
  public authService = inject(AuthService);

  public users = signal<User[]>([]);
  public loading = signal<boolean>(false);
  public error = signal<string>('');

  public searchQuery = signal<string>('');
  public selectedRole = signal<string>('');

  public editingUserId = signal<string | null>(null);
  public editData: Partial<User> = {};

  public activeCount = computed(() => this.users().filter(u => u.active).length);
  public tahsildarCount = computed(() => this.users().filter(u => u.role === 'tahsildar').length);
  public adminCount = computed(() => this.users().filter(u => u.role === 'super_admin' || u.role === 'rdo').length);

  public filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const r = this.selectedRole();

    return this.users().filter(u => {
      const matchQuery = !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.mandal && u.mandal.toLowerCase().includes(q)) ||
        (u.designation && u.designation.toLowerCase().includes(q));

      const matchRole = !r || u.role === r;

      return matchQuery && matchRole;
    });
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set('');

    this.adminService.getAll().subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.data) {
          this.users.set(res.data as User[]);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Failed to load user directory. Please ensure you are logged in.');
      }
    });
  }

  startEdit(user: User): void {
    this.editingUserId.set(user._id);
    this.editData = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      designation: user.designation,
      mandal: user.mandal,
      role: user.role,
      active: user.active
    };
  }

  cancelEdit(): void {
    this.editingUserId.set(null);
    this.editData = {};
  }

  saveEdit(): void {
    const id = this.editingUserId();
    if (!id) return;

    this.adminService.update(id, this.editData).subscribe({
      next: (res) => {
        if (res.success) {
          this.toast.success('Officer account updated successfully');
          this.cancelEdit();
          this.loadUsers();
        }
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Update failed');
      }
    });
  }

  deleteUser(user: User): void {
    if (!confirm(`Are you sure you want to delete account for "${user.name}"?`)) {
      return;
    }

    this.adminService.delete(user._id).subscribe({
      next: (res) => {
        if (res.success) {
          this.toast.success(`Account for "${user.name}" deleted.`);
          this.loadUsers();
        }
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Delete failed');
      }
    });
  }
}
