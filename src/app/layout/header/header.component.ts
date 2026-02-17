import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="app-header">
      <div class="header-brand">
        <h1 class="brand-name" routerLink="/library" style="cursor: pointer;">Bookora</h1>
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
        <!-- Notification Bell -->
        <div class="notification-container">
          <button 
            (click)="toggleNotifications()"
            class="icon-btn notification-btn"
            title="Notifications"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="icon-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            @if (notificationService.hasUnread()) {
              <span class="notification-badge">{{ notificationService.unreadCount() }}</span>
            }
          </button>

          <!-- Notification Dropdown -->
          @if (showNotifications()) {
            <div class="notification-dropdown">
              <div class="notification-header">
                <h3>Notifications</h3>
                @if (notificationService.hasUnread()) {
                  <button (click)="markAllAsRead()" class="mark-all-read">Mark all as read</button>
                }
              </div>

              <div class="notification-list">
                @if (notificationService.notifications().length === 0) {
                  <div class="empty-notifications">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p>No notifications yet</p>
                  </div>
                } @else {
                  @for (notification of notificationService.notifications().slice(0, 10); track notification.id) {
                    <div 
                      class="notification-item"
                      [class.unread]="!notification.read"
                      (click)="handleNotificationClick(notification)"
                    >
                      <div class="notification-icon" [class]="'icon-' + notification.type">
                        @switch (notification.type) {
                          @case ('new_book') {
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
                            </svg>
                          }
                          @case ('new_post') {
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-.856.12-1.685.344-2.47" />
                            </svg>
                          }
                          @default {
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                            </svg>
                          }
                        }
                      </div>
                      <div class="notification-content">
                        <div class="notification-title">{{ notification.title }}</div>
                        <div class="notification-message">{{ notification.message }}</div>
                        <div class="notification-time">{{ notificationService.formatTimestamp(notification.timestamp) }}</div>
                      </div>
                      @if (!notification.read) {
                        <div class="unread-indicator"></div>
                      }
                    </div>
                  }
                }
              </div>

              @if (notificationService.notifications().length > 0) {
                <div class="notification-footer">
                  <button (click)="clearAll()" class="clear-all-btn">Clear all</button>
                </div>
              }
            </div>
          }
        </div>

        <!-- Theme Toggle -->
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
        
        <!-- User Profile -->
        <div class="user-profile" routerLink="/profile" style="cursor: pointer;">
          <div class="user-avatar text-white">
            {{ getUserInitials() }}
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .notification-container {
      position: relative;
    }

    .notification-btn {
      position: relative;
    }

    .notification-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #ef4444;
      color: white;
      font-size: 0.6875rem;
      font-weight: 700;
      padding: 0.125rem 0.375rem;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
    }

    .notification-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 380px;
      max-width: 90vw;
      background: var(--bg-card);
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      z-index: 1000;
      max-height: 500px;
      display: flex;
      flex-direction: column;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid var(--border-color);
    }

    .notification-header h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
    }

    .mark-all-read {
      background: none;
      border: none;
      color: var(--primary);
      font-size: 0.8125rem;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
    }

    .mark-all-read:hover {
      text-decoration: underline;
    }

    .notification-list {
      overflow-y: auto;
      max-height: 380px;
    }

    .empty-notifications {
      padding: 3rem 2rem;
      text-align: center;
      color: var(--text-muted);
    }

    .empty-notifications svg {
      width: 48px;
      height: 48px;
      margin-bottom: 0.5rem;
      opacity: 0.5;
    }

    .notification-item {
      display: flex;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      cursor: pointer;
      transition: background 0.2s;
      border-bottom: 1px solid var(--border-color);
      position: relative;
    }

    .notification-item:hover {
      background: var(--bg-main);
    }

    .notification-item.unread {
      background: rgba(99, 102, 241, 0.05);
    }

    .notification-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .notification-icon svg {
      width: 20px;
      height: 20px;
    }

    .icon-new_book {
      background: rgba(99, 102, 241, 0.1);
      color: #6366f1;
    }

    .icon-new_post {
      background: rgba(34, 197, 94, 0.1);
      color: #22c55e;
    }

    .icon-like, .icon-comment {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-title {
      font-weight: 600;
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }

    .notification-message {
      font-size: 0.8125rem;
      color: var(--text-muted);
      margin-bottom: 0.25rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .notification-time {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .unread-indicator {
      width: 8px;
      height: 8px;
      background: var(--primary);
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 0.5rem;
    }

    .notification-footer {
      padding: 0.75rem;
      border-top: 1px solid var(--border-color);
      text-align: center;
    }

    .clear-all-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 0.875rem;
      cursor: pointer;
      padding: 0.5rem 1rem;
    }

    .clear-all-btn:hover {
      color: var(--text-main);
    }
  `]
})
export class HeaderComponent {
  themeService = inject(ThemeService);
  authService = inject(AuthService);
  notificationService = inject(NotificationService);
  router = inject(Router);

  showNotifications = signal(false);

  getUserInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return 'GU';
    const name = user.username || user.email;
    return name.substring(0, 2).toUpperCase();
  }

  toggleNotifications(): void {
    this.showNotifications.update(v => !v);
  }

  handleNotificationClick(notification: any): void {
    this.notificationService.markAsRead(notification.id);
    if (notification.actionUrl) {
      this.router.navigate([notification.actionUrl]);
    }
    this.showNotifications.set(false);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  clearAll(): void {
    if (confirm('Are you sure you want to clear all notifications?')) {
      this.notificationService.deleteAll();
      this.showNotifications.set(false);
    }
  }
}
