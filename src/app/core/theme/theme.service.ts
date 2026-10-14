import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'bytex-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal<boolean>(this.getInitialTheme());

  private getInitialTheme(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return saved === 'dark';
    }

    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }

  toggle(): void {
    this.setTheme(!this.isDark());
  }

  setTheme(dark: boolean): void {
    this.isDark.set(dark);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
    }
  }
}
