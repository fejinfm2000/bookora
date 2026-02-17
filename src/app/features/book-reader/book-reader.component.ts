import { Component, inject, signal, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { Book } from '../../shared/models/book.model';

@Component({
  selector: 'app-book-reader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reader-container" #readerContainer>
      <!-- Header Area -->
      <div class="reader-header">
        <button 
          (click)="router.navigate(['/library'])"
          class="back-btn-premium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span class="mobile-hidden">Back to Library</span>
        </button>

        <button 
          *ngIf="book()"
          (click)="dataService.downloadBook(book()!)"
          class="back-btn-premium download-btn"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span class="mobile-hidden">Download Book</span>
        </button>
      </div>

      <!-- Book Viewport with Touch Support -->
      <div 
        class="book-viewport"
        (touchstart)="onTouchStart($event)"
        (touchmove)="onTouchMove($event)"
        (touchend)="onTouchEnd($event)"
      >
        
        <!-- Mobile Single Page View -->
        <div class="mobile-page-view mobile-only">
          <div class="page-content-mobile">
            @if (currentPageIndex() === 0) {
              <div class="book-cover-view-mobile">
                <img [src]="book()?.coverImage" class="cover-image-mobile" />
                <h1 class="cover-title-mobile">{{ book()?.title }}</h1>
                <p class="cover-author-mobile">{{ book()?.author }}</p>
              </div>
            } @else {
              @for (block of book()?.pages?.[currentPageIndex()]?.content; track block.id) {
                @switch (block.type) {
                  @case ('heading') { <h2 class="page-heading">{{ block.content }}</h2> }
                  @case ('paragraph') { <p class="page-text">{{ block.content }}</p> }
                  @case ('image') { <img [src]="block.content" class="page-image" /> }
                  @case ('video') { 
                    <video controls class="page-video">
                      <source [src]="block.content" type="video/mp4">
                      Your browser does not support the video tag.
                    </video>
                  }
                }
              }
            }
          </div>
        </div>

        <!-- Desktop Two-Page View -->
        <div class="desktop-page-view desktop-only">
          <!-- Left Side (Previous page or Cover) -->
          <div class="page-side page-left">
            @if (currentPageIndex() > 0) {
              <div class="page-content">
                @for (block of book()?.pages?.[currentPageIndex() - 1]?.content; track block.id) {
                  @switch (block.type) {
                    @case ('heading') { <h2 class="page-heading">{{ block.content }}</h2> }
                    @case ('paragraph') { <p class="page-text">{{ block.content }}</p> }
                    @case ('image') { <img [src]="block.content" class="page-image" /> }
                    @case ('video') { 
                      <video controls class="page-video">
                        <source [src]="block.content" type="video/mp4">
                        Your browser does not support the video tag.
                      </video>
                    }
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
                  @case ('video') { 
                    <video controls class="page-video">
                      <source [src]="block.content" type="video/mp4">
                      Your browser does not support the video tag.
                    </video>
                  }
                }
              } @empty {
                <div class="empty-page-state">
                  This page is empty.
                </div>
              }
            </div>
            <div class="page-number-right">{{ currentPageIndex() + 1 }}</div>
          </div>
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
  @ViewChild('readerContainer') readerContainer!: ElementRef;

  route = inject(ActivatedRoute);
  router = inject(Router);
  dataService = inject(DataService);

  book = signal<Book | undefined>(undefined);
  currentPageIndex = signal<number>(0);
  isFlipping = signal<boolean>(false);

  // Touch gesture tracking
  private touchStartX = 0;
  private touchEndX = 0;
  private readonly SWIPE_THRESHOLD = 50;

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

  // Keyboard navigation
  @HostListener('window:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent) {
    if (event.key === 'ArrowRight') {
      this.nextPage();
    } else if (event.key === 'ArrowLeft') {
      this.prevPage();
    }
  }

  // Touch gesture handlers
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchMove(event: TouchEvent) {
    this.touchEndX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent) {
    const swipeDistance = this.touchStartX - this.touchEndX;

    if (Math.abs(swipeDistance) > this.SWIPE_THRESHOLD) {
      if (swipeDistance > 0) {
        // Swipe left - next page
        this.nextPage();
      } else {
        // Swipe right - previous page
        this.prevPage();
      }
    }

    // Reset touch tracking
    this.touchStartX = 0;
    this.touchEndX = 0;
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
