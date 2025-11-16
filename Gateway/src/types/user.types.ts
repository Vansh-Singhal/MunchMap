// =========================
// Base Types
// =========================

export interface BasicResponse {
  success: boolean;
  message: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  contact: string;
}

// =========================
// User Service Types
// =========================

export interface UserResponse<T=undefined> {
  success: boolean;
  message: string;
  user?: User;
  extra?: T;
}

// Input: update /me
export interface UpdateUserInput {
  name?: string;
  contact?: string;
}

// Input: update password
export interface UpdatePasswordInput {
  currentPassword: string;
  newPassword: string;
}

// =========================
// Auth Service Types
// =========================

export interface RegisterUserInput {
  name: string;
  email: string;
  contact: string;
  password: string;
  role: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
  role: string;
}

// =========================
// Admin Service Types
// =========================

export interface AdminResponse {
  success: boolean;
  message: string;
  users?: User[];
}

// Generic ID input
export interface IDInput {
  id: string;
}

// Update user by ID
export interface UpdateUserByIdInput {
  id: string;
  input: UpdateUserInput;
}

// =========================
// Wrapper Input Type
// =========================
export interface InputWrapper<T> {
  input: T;
}