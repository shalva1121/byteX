import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../core/theme/theme.service';
import { AuthModalService } from '../../core/services/auth-modal.service';

@Component({
  selector: 'app-header',
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {
  protected readonly menuOpen = signal(false);
  protected searchTerm = '';

  constructor(
    protected readonly theme: ThemeService,
    protected readonly authModal: AuthModalService,
    private readonly router: Router,
  ) {}

  openSignIn(): void {
    this.authModal.open('sign-in');
    this.closeMenu();
  }

  search(): void {
    const query = this.searchTerm.trim();
    this.router.navigate(['/shop'], {
      queryParams: query ? { query } : {},
    });
    this.closeMenu();
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  toggleTheme(): void {
    this.theme.toggle();
  }
}
