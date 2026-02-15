import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EditorService } from '../../core/services/editor.service';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-book-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="editor-container">
      <!-- Sidebar: Page Navigation -->
      <aside class="editor-sidebar">
        <div class="sidebar-header">
          <h3 class="sidebar-title">Pages</h3>
          <button (click)="editorService.addPage()" class="btn-icon-small">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        
        <div class="pages-list">
          @for (page of editorService.currentBook()?.pages; track page.id; let i = $index) {
            <div 
              (click)="editorService.currentPageIndex.set(i)"
              [class.active]="editorService.currentPageIndex() === i"
              class="page-item"
            >
              <div class="page-info">
                <span class="page-number">{{ i + 1 }}</span>
                <span class="page-label">Page {{ i + 1 }}</span>
              </div>
              <button 
                (click)="onDeletePage($event, i)"
                class="btn-delete-page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          }
        </div>

        <div class="sidebar-status">
           <div class="status-row">
              <span class="status-label">Status</span>
              <span [class.status-saved]="!editorService.isDirty()" [class.status-saving]="editorService.isDirty()">
                {{ editorService.isDirty() ? 'Saving...' : 'All Saved' }}
              </span>
           </div>
           <p class="last-seen">Last seen: {{ editorService.lastSaved() }}</p>
        </div>
      </aside>

      <!-- Main Editor -->
      <main class="editor-main">
        <div class="editor-paper">
          <!-- Page Header -->
          <div class="paper-header">
            <div class="paper-title-group">
               <h2 class="paper-title">Page {{ editorService.currentPageIndex() + 1 }}</h2>
               <p class="book-title">{{ editorService.currentBook()?.title }}</p>
            </div>
            <div class="block-actions">
              <button (click)="editorService.addBlock('heading')" class="btn-block-action">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Heading
              </button>
              <button (click)="editorService.addBlock('paragraph')" class="btn-block-action">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Text
              </button>
              <button (click)="editorService.addBlock('image')" class="btn-block-action">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Image
              </button>
            </div>
          </div>

          <!-- Blocks -->
          <div class="content-blocks">
            @for (block of editorService.currentPage()?.content; track block.id) {
              <div class="content-block-wrapper group">
                <!-- Delete block button -->
                <button 
                  (click)="editorService.deleteBlock(block.id)"
                  class="btn-delete-block"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" class="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                   </svg>
                </button>

                @switch (block.type) {
                  @case ('heading') {
                    <input 
                      type="text" 
                      [ngModel]="block.content"
                      (ngModelChange)="editorService.updateBlockContent(block.id, $event)"
                      class="block-heading"
                      placeholder="Heading"
                    />
                  }
                  @case ('paragraph') {
                    <textarea 
                      [ngModel]="block.content"
                      (ngModelChange)="editorService.updateBlockContent(block.id, $event)"
                      class="block-paragraph"
                      placeholder="Type your story here..."
                      rows="3"
                    ></textarea>
                  }
                  @case ('image') {
                    <div class="block-image">
                      @if (block.content) {
                        <img [src]="block.content" class="image-preview" />
                        <button (click)="editorService.updateBlockContent(block.id, '')" class="btn-remove-image">Remove</button>
                      } @else {
                        <div class="image-placeholder">
                          <svg xmlns="http://www.w3.org/2000/svg" class="icon-lg text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span class="upload-text">Click to upload image</span>
                          <input type="file" class="hidden-input" (change)="onImageUpload($event, block.id)" accept="image/*" />
                        </div>
                      }
                    </div>
                  }
                }
              </div>
            }
          </div>
        </div>
      </main>
    </div>
  `
})
export class BookEditorComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  editorService = inject(EditorService);
  dataService = inject(DataService);

  ngOnInit() {
    const bookId = this.route.snapshot.paramMap.get('id');
    if (bookId) {
      // First try to set what we have in cache
      const cachedBook = this.dataService.getBook(bookId);
      if (cachedBook) {
        this.editorService.setBook(cachedBook);
      }

      // Then fetch full details (including pages) from GitHub
      this.dataService.fetchBookDetails(bookId).subscribe({
        next: (fullBook) => {
          if (fullBook) {
            this.editorService.setBook(fullBook);
          } else if (!cachedBook) {
            this.router.navigate(['/library']);
          }
        },
        error: () => this.router.navigate(['/library'])
      });
    }
  }

  onDeletePage(event: Event, index: number) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this page?')) {
      this.editorService.deletePage(index);
    }
  }

  onImageUpload(event: Event, blockId: string) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.editorService.updateBlockContent(blockId, e.target?.result as string);
      };
      reader.readAsDataURL(input.files[0]);
    }
  }
}
