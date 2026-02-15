import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataService } from '../../../core/services/data.service';

@Component({
    selector: 'app-my-books',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="library-container">
      <div class="library-header">
        <div class="header-left">
          <h2 class="page-title">My Books</h2>
          <p class="page-subtitle">Books you have created and published.</p>
        </div>
        <div class="header-actions">
          <button (click)="router.navigate(['/create'])" class="btn-create">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon-sm" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Create Book
          </button>
        </div>
      </div>

      <div class="books-grid">
        @for (book of dataService.myBooks(); track book.id) {
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
                <svg xmlns="http://www.w3.org/2000/svg" class="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                {{ book.viewCount }}
              </div>
              <div class="stat">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                {{ book.downloadCount }}
              </div>
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <div class="empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" class="icon-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
            </div>
            <h3>You haven't created any books yet</h3>
            <p>Start writing your first masterpiece todaY!</p>
            <button (click)="router.navigate(['/create'])" class="btn-primary" style="margin-top: 1rem;">
              Create Book
            </button>
          </div>
        }
      </div>
    </div>
  `,
    styles: []
})
export class MyBooksComponent {
    dataService = inject(DataService);
    router = inject(Router);
}
