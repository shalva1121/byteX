import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { SHOP_API_BASE_URL } from '../config/api.config';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  VerifyEmailRequest,
} from '../models/auth.model';

const TOKEN_KEY = 'bytex-auth-token';
const TOKEN_KEYS = [TOKEN_KEY, 'accessToken', 'access_token', 'token', 'jwt'];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = SHOP_API_BASE_URL;

  readonly isAuthenticated = signal<boolean>(this.hasStoredToken());

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/auth/login`, payload)
      .pipe(tap((res) => this.storeToken(res)));
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, payload);
  }

  verifyEmail(payload: VerifyEmailRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/auth/verify-email`, payload)
      .pipe(tap((res) => this.storeToken(res)));
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      TOKEN_KEYS.forEach((key) => window.localStorage.removeItem(key));
    }
    this.isAuthenticated.set(false);
  }

  private storeToken(res: AuthResponse | null | undefined): void {
    const token = this.findToken(res);
    if (token && typeof window !== 'undefined') {
      window.localStorage.setItem(TOKEN_KEY, String(token));
      this.isAuthenticated.set(true);
    }
  }

  private hasStoredToken(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    return TOKEN_KEYS.some((key) => !!window.localStorage.getItem(key));
  }

  private findToken(value: unknown, depth = 0): string | undefined {
    if (depth > 2 || !value || typeof value !== 'object') {
      return undefined;
    }

    const record = value as Record<string, unknown>;
    for (const key of ['token', 'accessToken', 'access_token', 'jwt']) {
      const token = record[key];
      if (typeof token === 'string' && token.trim()) {
        return token;
      }
    }

    for (const key of ['data', 'result', 'user']) {
      const nestedToken = this.findToken(record[key], depth + 1);
      if (nestedToken) {
        return nestedToken;
      }
    }

    return undefined;
  }
}
