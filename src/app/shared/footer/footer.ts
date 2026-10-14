import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class FooterComponent {
  protected readonly year = new Date().getFullYear();
  protected readonly email = signal('');
  protected readonly subscribed = signal(false);

  subscribe(): void {
    if (!this.email().trim()) {
      return;
    }
    this.subscribed.set(true);
    this.email.set('');
  }
}
