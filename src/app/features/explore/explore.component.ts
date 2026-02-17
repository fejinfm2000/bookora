import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialService, FeedItem } from '../../core/services/social.service';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="library-container">
      <div class="library-header">
        <div class="header-left">
          <h2 class="page-title">Explore Community</h2>
          <p class="page-subtitle">See what others are reading and sharing.</p>
        </div>
        <div class="header-actions" style="display: flex; gap: 0.75rem;">
          <button (click)="socialService.refreshFeed()" class="btn-icon-small" [class.spinning]="socialService.loading()" title="Refresh feed">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button (click)="router.navigate(['/feed'])" class="btn-create">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Share Post
          </button>
        </div>
      </div>

      <div class="explore-feed">
         @if (socialService.loading() && socialService.feed().length === 0) {
           <div class="loading-state" style="text-align: center; padding: 3rem;">
              <div class="spinner-large" style="margin-bottom: 1rem;"></div>
              <p>Loading community feed...</p>
           </div>
         }
         
         @for (post of socialService.feed(); track post.id) {
           <div class="feed-card">
              <!-- Post Header -->
              <div class="feed-card-header">
                <div class="user-info">
                   <div class="user-avatar">{{ post.userAvatar }}</div>
                   <div class="user-meta">
                      <span class="user-name">{{ post.userName }}</span>
                      <span class="post-time">{{ post.timestamp | date:'medium' }}</span>
                   </div>
                </div>
                 
                 <div class="header-actions" style="display: flex; gap: 0.5rem;">
                   @if (isOwnPost(post)) {
                     <button (click)="startEdit(post)" class="btn-icon-small" title="Edit post">
                       <svg xmlns="http://www.w3.org/2000/svg" class="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                       </svg>
                     </button>
                     <button (click)="deletePost(post.id)" class="btn-icon-small" title="Delete post" style="color: #ef4444;">
                       <svg xmlns="http://www.w3.org/2000/svg" class="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                       </svg>
                     </button>
                   }
                   <button class="btn-icon-small">
                     <svg xmlns="http://www.w3.org/2000/svg" class="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                     </svg>
                   </button>
                 </div>
               </div>

               <!-- Post Content -->
               <div class="feed-card-content">
                  @if (editingPostId() === post.id) {
                    <textarea 
                      [(ngModel)]="editContent" 
                      class="form-input" 
                      rows="3" 
                      style="width: 100%; margin-bottom: 0.5rem;"
                    ></textarea>
                    <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                      <button (click)="cancelEdit()" class="btn-icon-small">Cancel</button>
                      <button (click)="saveEdit(post.id)" class="btn-create" style="padding: 0.25rem 0.75rem; font-size: 0.8rem;">Save</button>
                    </div>
                  } @else {
                    <p class="post-text">{{ post.content }}</p>
                  }

                  <!-- Images Grid -->
                  @if (post.images && post.images.length > 0) {
                    <div class="post-images-grid" [class.multiple]="post.images.length > 1">
                       @for (img of post.images; track img) {
                         <img [src]="post.imageThumbs && post.imageThumbs.length > 0 && post.imageThumbs[post.images.indexOf(img)] ? post.imageThumbs[post.images.indexOf(img)] : img" class="post-image" />
                       }
                    </div>
                  } @else if (post.image) {
                    <div class="post-image-container">
                       <img [src]="post.image" class="post-image" />
                    </div>
                  }
               </div>

              <!-- Post Actions -->
              <div class="feed-card-actions">
                 <div class="action-group">
                   <button 
                     (click)="socialService.toggleLike(post.id)" 
                     class="action-btn"
                     [class.liked]="post.hasLiked"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" class="icon-sm" [attr.fill]="post.hasLiked ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                     </svg>
                      <span>{{ post.likes }}</span>
                    </button>
                    <button (click)="socialService.addComment(post.id)" class="action-btn">
                      <svg xmlns="http://www.w3.org/2000/svg" class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>{{ post.comments }}</span>
                    </button>
                    <button (click)="socialService.sharePost(post.id)" class="action-btn">
                      <svg xmlns="http://www.w3.org/2000/svg" class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      <span>{{ post.shares }}</span>
                    </button>
                 </div>
                  <button (click)="downloadPost(post)" class="btn-icon-small" title="Download content as PDF">
                     <svg xmlns="http://www.w3.org/2000/svg" class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                     </svg>
                  </button>
              </div>
           </div>
         } @empty {
           <div class="empty-state">
             <div class="empty-icon">
               <svg xmlns="http://www.w3.org/2000/svg" class="icon-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
               </svg>
             </div>
             <h3>No feed items yet</h3>
             <p>Be the first to share something with the community!</p>
           </div>
         }
      </div>
    </div>
  `,
  styles: [`
    .explore-feed {
      margin: 2rem auto;
      max-width: 600px;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .feed-card {
      background: var(--bg-card);
      border-radius: 20px;
      border: 1px solid var(--border-color);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }
    .feed-card-header {
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .user-avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.875rem;
    }
    .user-meta {
      display: flex;
      flex-direction: column;
    }
    .user-name {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .post-time {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .feed-card-content {
      padding: 0 1rem 1rem;
    }
    .post-text {
      font-size: 1rem;
      color: var(--text-main);
      margin-bottom: 1rem;
      line-height: 1.5;
    }
    .post-image-container {
      margin: 0 -1rem -1rem;
      background: var(--bg-main);
    }
    .post-image {
      width: 100%;
      max-height: 500px;
      object-fit: cover;
    }
    .post-images-grid {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin: 0 -1rem -1rem;
      background: var(--bg-main);
    }
    .post-images-grid.multiple {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1px;
    }
    .post-images-grid img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      min-height: 200px;
    }
    .feed-card-actions {
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--border-color);
    }
    .action-group {
      display: flex;
      gap: 1rem;
    }
    .action-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 600;
      transition: all 0.2s ease;
    }
    .action-btn:hover {
      color: var(--primary);
    }
    .action-btn.liked {
      color: #ef4444;
    }
    .btn-icon-small {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    .btn-icon-small:hover {
      background: var(--bg-main);
      color: var(--primary);
    }
    .spinning svg {
      animation: rotate 1s linear infinite;
    }
    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .spinner-large {
      width: 48px;
      height: 48px;
      border: 4px solid var(--border-color);
      border-top: 4px solid var(--primary);
      border-radius: 50%;
      animation: rotate 1s linear infinite;
      margin: 0 auto;
    }
  `]
})
export class ExploreComponent implements OnInit {
  socialService = inject(SocialService);
  authService = inject(AuthService);
  router = inject(Router);

  editingPostId = signal<string | null>(null);
  editContent = '';

  ngOnInit() {
    this.socialService.refreshFeed();
  }

  isOwnPost(post: FeedItem): boolean {
    return post.userId === this.authService.currentUser()?.email;
  }

  deletePost(postId: string) {
    if (confirm('Are you sure you want to delete this post?')) {
      this.socialService.deletePost(postId);
    }
  }

  startEdit(post: FeedItem) {
    this.editingPostId.set(post.id);
    this.editContent = post.content;
  }

  cancelEdit() {
    this.editingPostId.set(null);
    this.editContent = '';
  }

  saveEdit(postId: string) {
    if (this.editContent.trim()) {
      this.socialService.updatePost(postId, this.editContent);
      this.cancelEdit();
    }
  }

  downloadPost(post: FeedItem) {
    const doc = new jsPDF();
    let yOffset = 20;

    // Header
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Bookora Social Feed - ${new Date(post.timestamp).toLocaleString()}`, 20, yOffset);
    yOffset += 15;

    // User Info
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text(post.userName, 20, yOffset);
    yOffset += 10;

    // Content
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const splitText = doc.splitTextToSize(post.content, 170);
    doc.text(splitText, 20, yOffset);
    yOffset += (splitText.length * 7) + 10;

    // Images Info
    if (post.images && post.images.length > 0) {
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(`Included ${post.images.length} image(s)`, 20, yOffset);
      yOffset += 10;
    }

    // Stats
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Likes: ${post.likes} | Comments: ${post.comments} | Shares: ${post.shares}`, 20, yOffset);

    doc.save(`post_${post.id}.pdf`);
  }
}
