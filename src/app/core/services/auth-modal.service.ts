import { Injectable, signal } from '@angular/core';

export type AuthModalMode = 'sign-in' | 'sign-up' | 'verify';

@Injectable({ providedIn: 'root' })
export class AuthModalService {
  readonly mode = signal<AuthModalMode | null>(null);
  readonly pendingEmail = signal<string>('');

  open(mode: AuthModalMode = 'sign-in'): void {
    this.mode.set(mode);
  }

  switchTo(mode: AuthModalMode): void {
    this.mode.set(mode);
  }

  close(): void {
    this.mode.set(null);
  }

  setPendingEmail(email: string): void {
    this.pendingEmail.set(email);
  }
}
