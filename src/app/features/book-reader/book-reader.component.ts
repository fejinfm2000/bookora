import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { Book } from '../../shared/models/book.model';

@Component({
  selector: 'app-book-reader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reader-container">
      <!-- Header Area -->
      <div class="reader-header">
        <button 
          (click)="router.navigate(['/library'])"
          class="back-btn-premium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Library
        </button>

        <button 
          *ngIf="book()"
          (click)="dataService.downloadBook(book()!)"
          class="back-btn-premium"
          style="margin-left: auto; border-color: var(--primary); color: var(--primary);"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Book
        </button>
      </div>

      <!-- Book Container -->
      <div class="book-viewport">
        
        <!-- Left Side (Previous page or Cover) -->
        <div class="page-side page-left">
          @if (currentPageIndex() > 0) {
            <div class="page-content">
              @for (block of book()?.pages?.[currentPageIndex() - 1]?.content; track block.id) {
                @switch (block.type) {
                  @case ('heading') { <h2 class="page-heading">{{ block.content }}</h2> }
                  @case ('paragraph') { <p class="page-text">{{ block.content }}</p> }
                  @case ('image') { <img [src]="block.content" class="page-image" /> }
                }
              }
            </div>
          } @else {
            <div class="book-cover-view">
               <img [src]="book()?.coverImage" class="cover-image" />
               <h1 class="cover-title">{{ book()?.title }}</h1>
               <p class="cover-author">{{ book()?.author }}</p>
            </div>
          }
          <div class="page-number-left" *ngIf="currentPageIndex() > 0">{{ currentPageIndex() }}</div>
        </div>

        <!-- Right Side (Current page) -->
        <div class="page-side page-right">
          <div class="page-content">
            @for (block of book()?.pages?.[currentPageIndex()]?.content; track block.id) {
              @switch (block.type) {
                @case ('heading') { <h2 class="page-heading">{{ block.content }}</h2> }
                @case ('paragraph') { <p class="page-text">{{ block.content }}</p> }
                @case ('image') { <img [src]="block.content" class="page-image" /> }
              }
            } @empty {
              <div class="empty-page-state">
                This page is empty.
              </div>
            }
          </div>
           <div class="page-number-right">{{ currentPageIndex() + 1 }}</div>
        </div>

        <!-- Navigation Buttons -->
        <button 
          (click)="prevPage()"
          [disabled]="currentPageIndex() === 0"
          class="nav-btn nav-prev"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="icon-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button 
          (click)="nextPage()"
          [disabled]="currentPageIndex() >= (book()?.pages?.length || 0) - 1"
          class="nav-btn nav-next"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="icon-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Reading Progress -->
      <div class="reading-progress">
        <span class="progress-text">Page {{ currentPageIndex() + 1 }} of {{ book()?.pages?.length || 0 }}</span>
        <div class="progress-bar-container">
          <div 
            class="progress-bar-fill"
            [style.width.%]="((currentPageIndex() + 1) / (book()?.pages?.length || 1)) * 100"
          ></div>
        </div>
      </div>
    </div>
  `
})
export class BookReaderComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  dataService = inject(DataService);

  book = signal<Book | undefined>(undefined);
  currentPageIndex = signal<number>(0);
  isFlipping = signal<boolean>(false);

  ngOnInit() {
    const bookId = this.route.snapshot.paramMap.get('id');
    if (bookId) {
      // First try to set what we have in cache
      const cachedBook = this.dataService.getBook(bookId);
      if (cachedBook) {
        this.book.set(cachedBook);
      }

      // Then fetch full details (including pages) from GitHub
      this.dataService.fetchBookDetails(bookId).subscribe({
        next: (fullBook: Book | undefined) => {
          if (fullBook) {
            this.book.set(fullBook);
          } else if (!cachedBook) {
            this.router.navigate(['/library']);
          }
        },
        error: () => this.router.navigate(['/library'])
      });
    }
  }

  nextPage() {
    const book = this.book();
    if (book && this.currentPageIndex() < (book.pages?.length || 0) - 1) {
      this.isFlipping.set(true);
      setTimeout(() => {
        this.currentPageIndex.update(i => i + 1);
        this.isFlipping.set(false);
      }, 300);
    }
  }

  prevPage() {
    if (this.currentPageIndex() > 0) {
      this.currentPageIndex.update(i => i - 1);
    }
  }
}
