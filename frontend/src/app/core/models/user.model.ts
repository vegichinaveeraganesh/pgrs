export type UserRole = 'super_admin' | 'rdo' | 'tahsildar' | 'vro' | 'staff' | 'citizen';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  designation?: string;
  mandal?: string;
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: User;
}
