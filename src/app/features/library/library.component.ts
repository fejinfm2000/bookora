import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  template: `
    <div class="library-container">
      <!-- Header Section -->
      <div class="library-header">
        <div class="header-left">
          <h2 class="page-title">Global Library</h2>
          <p class="page-subtitle">Discover and explore books from around the world.</p>
        </div>
        <div class="header-actions">
          <div class="view-toggle">
            <button 
              (click)="dataService.viewType.set('grid')"
              [class.active]="dataService.viewType() === 'grid'"
              class="toggle-btn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button 
              (click)="dataService.viewType.set('list')"
              [class.active]="dataService.viewType() === 'list'"
              class="toggle-btn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          <button (click)="router.navigate(['/create'])" class="btn-create">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon-sm" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Create Book
          </button>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="filters-section">
        <div class="search-wrapper">
          <input 
            type="text" 
            [value]="dataService.searchQuery()"
            (input)="onSearch($event)"
            placeholder="Search books or authors..." 
            class="search-input"
          />
          <svg xmlns="http://www.w3.org/2000/svg" class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div class="filter-controls">
          <select 
            (change)="onGenreChange($event)"
            class="filter-select"
          >
            @for (genre of dataService.getGenres(); track genre) {
              <option [value]="genre">{{ genre }}</option>
            }
          </select>

          <select 
            (change)="onSortChange($event)"
            class="filter-select"
          >
            <option value="newest">Newest First</option>
            <option value="mostViewed">Most Viewed</option>
            <option value="mostDownloaded">Most Downloaded</option>
          </select>
        </div>
      </div>

      <!-- Content Section -->
      @if (isLoading()) {
        <div class="books-grid">
          @for (i of [1,2,3,4]; track i) {
            <div class="book-card">
              <app-skeleton height="200px" radius="12px"></app-skeleton>
              <app-skeleton width="70%"></app-skeleton>
              <app-skeleton width="40%"></app-skeleton>
            </div>
          }
        </div>
      } @else {
        @if (dataService.viewType() === 'grid') {
          <div class="books-grid">
            @for (book of dataService.filteredBooks(); track book.id) {
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
                  <svg xmlns="http://www.w3.org/2000/svg" class="icon-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3>No books found</h3>
                <p>Try adjusting your search or filters.</p>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
  styles: []
})
export class LibraryComponent implements OnInit {
  dataService = inject(DataService);
  router = inject(Router);
  isLoading = signal(true);

  ngOnInit() {
    // Simulate initial loading
    setTimeout(() => {
      this.isLoading.set(false);
    }, 1200);
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.dataService.searchQuery.set(value);
  }

  onGenreChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.dataService.selectedGenre.set(value);
  }

  onSortChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.dataService.sortBy.set(value);
  }
}
