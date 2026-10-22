// =========================
// Base Types
// =========================

import type { ValidationIssue } from "./apiError.types";

export interface BasicResponse {
  success: boolean;
  message: string;
  errors?: ValidationIssue[];
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

export interface UserResponse extends BasicResponse {
  user?: User;
}

export interface AuthResponse extends UserResponse {
  token?: string;
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

export interface AdminResponse extends BasicResponse {
  users?: User[];
  total?: number;
  offset?: number;
  limit?: number;
  count?: number;
}

export interface UserPaginationInput {
  offset?: number;
  limit?: number;
}

export interface AdminUpdateUserInput extends UpdateUserInput {
  email?: string;
}

// Generic ID input
export interface IDInput {
  id: string;
}

// Update user by ID
export interface UpdateUserByIdInput {
  id: string;
  input: AdminUpdateUserInput;
}

// =========================
// Wrapper Input Type
// =========================
export interface InputWrapper<T> {
  input: T;
}
