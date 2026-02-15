import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="app-header">
      <div class="header-brand">
        <h1 class="brand-name">Bookora</h1>
      </div>

      <div class="header-search">
        <input 
          type="text" 
          placeholder="Search books, authors, genres..." 
          class="search-input"
        />
        <svg xmlns="http://www.w3.org/2000/svg" class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <div class="header-actions">
        <button 
          (click)="themeService.toggleTheme()" 
          class="icon-btn"
          [title]="themeService.isDarkMode() ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        >
          @if (themeService.isDarkMode()) {
            <svg xmlns="http://www.w3.org/2000/svg" class="icon-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m10.586-.707l.707.707M7.758 7.758l.707-.707M12 8a4 4 0 110 8 4 4 0 010-8z" />
            </svg>
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" class="icon-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          }
        </button>
        
        <div class="user-profile">
          <div class="user-avatar">GU</div>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  themeService = inject(ThemeService);
}
