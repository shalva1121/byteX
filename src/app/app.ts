import { Component, HostBinding } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header';
import { FooterComponent } from './shared/footer/footer';
import { AuthModalComponent } from './shared/auth-modal/auth-modal';
import { ThemeService } from './core/theme/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, AuthModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor(private readonly theme: ThemeService) {}

  @HostBinding('class.dark')
  get isDark(): boolean {
    return this.theme.isDark();
  }
}
