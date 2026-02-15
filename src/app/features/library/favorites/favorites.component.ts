import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataService } from '../../../core/services/data.service';

@Component({
    selector: 'app-favorites',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="library-container">
      <div class="library-header">
        <div class="header-left">
          <h2 class="page-title">My Favorites</h2>
          <p class="page-subtitle">Books you have saved for later.</p>
        </div>
      </div>

      <div class="books-grid">
        @for (book of dataService.favoriteBooks(); track book.id) {
          <div class="book-card">
            <div class="book-cover">
              <img [src]="book.coverImage" [alt]="book.title" />
              <div class="book-overlay">
                <span class="genre-badge">{{ book.genre }}</span>
                <button (click)="router.navigate(['/read', book.id])" class="overlay-btn primary">
                  Open Reader
                </button>
                <button (click)="router.navigate(['/edit', book.id])" class="overlay-btn secondary">
                  Edit Content
                </button>
              </div>
            </div>
            <h3 class="book-title">{{ book.title }}</h3>
            <p class="book-author">{{ book.author }}</p>
            <div class="book-stats">
              <div class="stat">
                 <!-- Favorite Icon (Filled) -->
                 <button (click)="removeFavorite(book.id, $event)" class="icon-btn" title="Remove from favorites">
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon-xs" viewBox="0 0 20 20" fill="currentColor" style="color: #ef4444;">
                        <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                    </svg>
                 </button>
              </div>
            </div>
          </div>
        } @empty {
          <div class="empty-state">
             <div class="empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" class="icon-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </div>
            <h3>No favorites yet</h3>
            <p>Explore the library and heart the books you love!</p>
            <button (click)="router.navigate(['/library'])" class="btn-primary" style="margin-top: 1rem;">
              Browse Library
            </button>
          </div>
        }
      </div>
    </div>
  `,
    styles: []
})
export class FavoritesComponent {
    dataService = inject(DataService);
    router = inject(Router);

    removeFavorite(bookId: string, event: Event) {
        event.stopPropagation();
        this.dataService.toggleFavorite(bookId);
    }
}
