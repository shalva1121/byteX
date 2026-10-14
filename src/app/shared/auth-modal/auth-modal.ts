import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthModalMode, AuthModalService } from '../../core/services/auth-modal.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth-modal',
  imports: [FormsModule],
  templateUrl: './auth-modal.html',
  styleUrl: './auth-modal.css',
})
export class AuthModalComponent {
  protected readonly modal = inject(AuthModalService);
  private readonly auth = inject(AuthService);

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');

  protected signInEmail = '';
  protected signInPassword = '';

  protected signUpName = '';
  protected signUpSurname = '';
  protected signUpEmail = '';
  protected signUpPassword = '';

  protected readonly codeIndexes = [0, 1, 2, 3, 4, 5];
  protected readonly codeDigits = signal<string[]>(['', '', '', '', '', '']);

  close(): void {
    this.modal.close();
    this.resetState();
  }

  switchTo(mode: AuthModalMode): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.modal.switchTo(mode);
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  forgotPassword(): void {
    this.errorMessage.set('');
    this.successMessage.set("Password recovery isn't available yet — please contact support for now.");
  }

  submitSignIn(): void {
    if (!this.signInEmail || !this.signInPassword) {
      this.errorMessage.set('Please enter your email and password.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.auth.login({ email: this.signInEmail, password: this.signInPassword }).subscribe({
      next: () => {
        this.loading.set(false);
        this.close();
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(this.extractError(err, 'Sign in failed. Please check your credentials.'));
      },
    });
  }

  submitSignUp(): void {
    if (!this.signUpName || !this.signUpSurname || !this.signUpEmail || !this.signUpPassword) {
      this.errorMessage.set('Please fill in all fields.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.auth
      .register({
        name: this.signUpName,
        surname: this.signUpSurname,
        email: this.signUpEmail,
        password: this.signUpPassword,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.modal.setPendingEmail(this.signUpEmail);
          this.codeDigits.set(['', '', '', '', '', '']);
          this.modal.switchTo('verify');
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(this.extractError(err, 'Sign up failed. Please try again.'));
        },
      });
  }

  submitVerify(): void {
    const code = this.codeDigits().join('');
    if (code.length !== 6) {
      this.errorMessage.set('Please enter the full 6-digit code.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.auth.verifyEmail({ email: this.modal.pendingEmail(), code }).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set('Email verified! You can now sign in.');
        setTimeout(() => this.modal.switchTo('sign-in'), 1200);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(this.extractError(err, 'Verification failed. Please check the code.'));
      },
    });
  }

  onCodeInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const digit = input.value.replace(/\D/g, '').slice(-1);
    const next = [...this.codeDigits()];
    next[index] = digit;
    this.codeDigits.set(next);
    input.value = digit;

    if (digit && index < this.codeIndexes.length - 1) {
      (input.nextElementSibling as HTMLInputElement | null)?.focus();
    }
  }

  onCodeBackspace(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (!input.value && index > 0) {
      (input.previousElementSibling as HTMLInputElement | null)?.focus();
    }
  }

  private resetState(): void {
    this.signInEmail = '';
    this.signInPassword = '';
    this.signUpName = '';
    this.signUpSurname = '';
    this.signUpEmail = '';
    this.signUpPassword = '';
    this.codeDigits.set(['', '', '', '', '', '']);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.loading.set(false);
  }

  private extractError(err: unknown, fallback: string): string {
    const httpErr = err as { error?: { message?: string; title?: string }; message?: string };
    return httpErr?.error?.message ?? httpErr?.error?.title ?? fallback;
  }
}
