import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  active: boolean;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-users">
      <h2>User Management</h2>

      <div *ngIf="loading" class="loading">Loading users...</div>
      <div *ngIf="error" class="error">{{ error }}</div>

      <table *ngIf="!loading && users.length > 0">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let user of users">
            <ng-container *ngIf="editingUser?._id !== user._id">
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.phone }}</td>
              <td>{{ user.role }}</td>
              <td>{{ user.active ? 'Yes' : 'No' }}</td>
              <td>
                <button (click)="startEdit(user)">Edit</button>
                <button (click)="deleteUser(user)" class="btn-delete">Delete</button>
              </td>
            </ng-container>
            <ng-container *ngIf="editingUser?._id === user._id">
              <td><input [(ngModel)]="editData.name" /></td>
              <td><input [(ngModel)]="editData.email" /></td>
              <td><input [(ngModel)]="editData.phone" /></td>
              <td>
                <select [(ngModel)]="editData.role">
                  <option value="super_admin">super_admin</option>
                  <option value="rdo">rdo</option>
                  <option value="tahsildar">tahsildar</option>
                  <option value="vro">vro</option>
                  <option value="staff">staff</option>
                </select>
              </td>
              <td>
                <input type="checkbox" [(ngModel)]="editData.active" />
              </td>
              <td>
                <button (click)="saveEdit()">Save</button>
                <button (click)="cancelEdit()">Cancel</button>
              </td>
            </ng-container>
          </tr>
        </tbody>
      </table>

      <p *ngIf="!loading && users.length === 0">No users found.</p>
    </div>
  `,
  styles: [`
    .admin-users { padding: 24px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 14px; border: 1px solid #333; text-align: left; }
    th { background: #1a1a2e; color: #fff; }
    tr:nth-child(even) { background: #f9f9f9; }
    input, select { width: 100%; padding: 4px; box-sizing: border-box; }
    button { margin-right: 6px; padding: 4px 12px; cursor: pointer; border: none; border-radius: 4px; background: #4a90e2; color: #fff; }
    .btn-delete { background: #e24a4a; }
    .loading { color: #888; }
    .error { color: red; }
  `]
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  editingUser: User | null = null;
  editData: Partial<User> = {};
  loading = false;
  error = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';
    this.adminService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) this.users = res.data as User[];
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load users. Please login as super_admin.';
        this.loading = false;
      }
    });
  }

  startEdit(user: User): void {
    this.editingUser = { ...user };
    this.editData = { name: user.name, email: user.email, phone: user.phone, role: user.role, active: user.active };
  }

  cancelEdit(): void {
    this.editingUser = null;
    this.editData = {};
  }

  saveEdit(): void {
    if (!this.editingUser) return;
    const payload: Record<string, unknown> = { ...this.editData };
    this.adminService.update(this.editingUser._id, payload).subscribe({
      next: (res) => {
        if (res.success) { this.loadUsers(); this.cancelEdit(); }
      },
      error: (err) => { this.error = err?.error?.message || 'Update failed.'; }
    });
  }

  deleteUser(user: User): void {
    if (!confirm(`Delete user "${user.name}"?`)) return;
    this.adminService.delete(user._id).subscribe({
      next: (res) => { if (res.success) this.loadUsers(); },
      error: (err) => { this.error = err?.error?.message || 'Delete failed.'; }
    });
  }
}
