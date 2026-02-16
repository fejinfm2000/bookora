import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { DataService } from '../../core/services/data.service';
import { SocialService } from '../../core/services/social.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="library-container">
      <div class="profile-header-card">
        <div class="profile-avatar">
          {{ user()?.email?.[0]?.toUpperCase() || 'U' }}
        </div>
        <div class="profile-info">
          <h2 class="profile-email">{{ user()?.email || 'User' }}</h2>
          <p class="profile-status">Premium Member</p>
        </div>
      </div>

      <div class="profile-stats">
        <div class="stat-card">
          <span class="stat-value">{{ myBooksCount() }}</span>
          <span class="stat-label">My Books</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ favoriteCount() }}</span>
          <span class="stat-label">Favorites</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ myPosts().length }}</span>
          <span class="stat-label">Posts</span>
        </div>
      </div>

      <div class="profile-sections">
        <h3 class="section-title">My Recent Activity</h3>
        <div class="activity-feed">
           @for (post of myPosts(); track post.id) {
             <div class="activity-card">
                <p class="activity-text">{{ post.content }}</p>
                @if (post.images && post.images.length > 0) {
                  <div style="display: flex; gap: 0.25rem; margin-bottom: 0.5rem; overflow-x: auto; padding-bottom: 0.5rem;">
                    @for (img of post.images; track img) {
                      <img [src]="img" style="width: 80px; height: 80px; object-fit: cover; border-radius: 6px; flex-shrink: 0;" />
                    }
                  </div>
                } @else if (post.image) {
                  <img [src]="post.image" style="width: 80px; height: 80px; object-fit: cover; border-radius: 6px; margin-bottom: 0.5rem;" />
                }
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span class="activity-time">{{ post.timestamp | date:'short' }}</span>
                  <div class="activity-stats" style="font-size: 0.75rem; color: var(--text-muted); display: flex; gap: 0.75rem;">
                    <span>❤️ {{ post.likes }}</span>
                    <span>💬 {{ post.comments }}</span>
                    <span>🔄 {{ post.shares }}</span>
                  </div>
                </div>
             </div>
           } @empty {
             <div class="empty-state">
                <p>You haven't posted anything yet.</p>
             </div>
           }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-header-card {
      background: var(--bg-card);
      border-radius: 24px;
      padding: 3rem;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-md);
      display: flex;
      align-items: center;
      gap: 2rem;
      margin-bottom: 2rem;
    }
    .profile-avatar {
      width: 100px;
      height: 100px;
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      font-weight: 800;
      box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
    }
    .profile-info {
      display: flex;
      flex-direction: column;
    }
    .profile-email {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
      color: var(--text-main);
    }
    .profile-status {
      color: var(--primary);
      font-weight: 600;
      font-size: 0.875rem;
    }
    .profile-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      margin-bottom: 3rem;
    }
    .stat-card {
      background: var(--bg-card);
      padding: 1.5rem;
      border-radius: 16px;
      text-align: center;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
    }
    .stat-value {
      display: block;
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-main);
    }
    .stat-label {
      font-size: 0.875rem;
      color: var(--text-muted);
      font-weight: 600;
    }
    .profile-sections {
      margin-top: 1rem;
    }
    .section-title {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      color: var(--text-main);
    }
    .activity-feed {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .activity-card {
      background: var(--bg-card);
      padding: 1.25rem;
      border-radius: 12px;
      border: 1px solid var(--border-color);
      transition: all 0.2s ease;
    }
    .activity-card:hover {
      border-color: var(--primary);
      transform: translateX(4px);
    }
    .activity-text {
      font-size: 1.1rem;
      color: var(--text-main);
      margin-bottom: 1rem;
      line-height: 1.5;
    }
    .activity-time {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    @media (max-width: 768px) {
      .profile-header-card {
        flex-direction: column;
        text-align: center;
        padding: 2rem 1rem;
      }
      .profile-stats {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
    }
  `]
})
export class ProfileComponent {
  authService = inject(AuthService);
  dataService = inject(DataService);
  socialService = inject(SocialService);

  user = computed(() => this.authService.currentUser());
  myBooksCount = computed(() => this.dataService.myBooks().length);
  favoriteCount = computed(() => this.dataService.favoriteBooks().length);

  myPosts = computed(() => {
    const userEmail = this.user()?.email;
    return this.socialService.feed().filter(p => p.userId === userEmail);
    // Since mock posts in feed.json use "user@bookora.com" or "reader@example.com"
  });
}
