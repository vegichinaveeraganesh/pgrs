// frontend/src/app/features/admin/users/users.component.ts
import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
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
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  editingUser: User | null = null;
  editData: Partial<User> = {};

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.adminService.getAll().subscribe(res => {
      if (res.success) this.users = res.data;
    });
  }

  startEdit(user: User) {
    this.editingUser = { ...user };
    this.editData = { name: user.name, email: user.email, phone: user.phone, role: user.role, active: user.active };
  }

  cancelEdit() {
    this.editingUser = null;
    this.editData = {};
  }

  saveEdit() {
    if (!this.editingUser) return;
    const payload = { ...this.editData };
    this.adminService.update(this.editingUser._id, payload).subscribe(res => {
      if (res.success) {
        this.loadUsers();
        this.cancelEdit();
      }
    });
  }

  deleteUser(user: User) {
    if (!confirm(`Delete user ${user.name}?`)) return;
    this.adminService.delete(user._id).subscribe(res => {
      if (res.success) this.loadUsers();
    });
  }
}
