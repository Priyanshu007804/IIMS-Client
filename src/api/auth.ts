import { api } from './client';
import { User } from '../types';

export interface LoginResponse {
  token: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  role: string;
}

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  return api.post<LoginResponse>(
    '/auth/login',
    { email, password },
    { skipAuth: true }
  );
}

export async function registerApi(email: string, password: string): Promise<RegisterResponse> {
  return api.post<RegisterResponse>(
    '/auth/register',
    { email, password },
    { skipAuth: true }
  );
}
