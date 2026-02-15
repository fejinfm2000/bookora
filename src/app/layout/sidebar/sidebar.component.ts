import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="app-sidebar">
      <nav class="sidebar-nav">
        @for (item of navItems; track item.label) {
          <a
            [routerLink]="item.path"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{exact: item.exact}"
            class="nav-link"
          >
            <span [innerHTML]="item.icon" class="nav-icon"></span>
            <span class="nav-label">{{ item.label }}</span>
          </a>
        }
      </nav>

      <div class="sidebar-footer">
        <div class="upgrade-card">
          <p class="upgrade-title">Upgrade to Pro</p>
          <p class="upgrade-text">Get unlimited book creation and PDF imports.</p>
          <button class="upgrade-btn">Learn More</button>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  navItems = [
    {
      label: 'All Books',
      path: '/library',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>',
      exact: false
    },
    {
      label: 'My Books',
      path: '/library/my-books',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>',
      exact: false
    },
    {
      label: 'My Favorites',
      path: '/library/favorites',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>',
      exact: false
    },
    {
      label: 'Create New',
      path: '/create',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>',
      exact: false
    }
  ];
}
