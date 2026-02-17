import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EditorService } from '../../core/services/editor.service';
import { DataService } from '../../core/services/data.service';
import { MegaService } from '../../core/services/mega.service';
import { Book } from '../../shared/models/book.model';

@Component({
  selector: 'app-book-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="editor-container">
      <!-- Back button for mobile/header -->
      <div class="editor-mobile-header mobile-only">
        <button (click)="router.navigate(['/library'])" class="back-btn-premium">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back</span>
        </button>
        <div class="header-status" [class.status-saved]="!editorService.isDirty()" [class.status-saving]="editorService.isDirty()">
           <div class="status-dot"></div>
           <span>
            {{ editorService.isDirty() ? 'Saving...' : 'Saved' }}
          </span>
        </div>
      </div>

      <!-- Sidebar: Page Navigation -->
      <aside class="editor-sidebar" [class.mobile-hidden]="isSidebarHidden">
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
            
            <!-- Mobile Toggle Sidebar -->
            <button (click)="isSidebarHidden = !isSidebarHidden" class="btn-toggle-pages mobile-only">
               <svg xmlns="http://www.w3.org/2000/svg" class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
               </svg>
               <span>{{ isSidebarHidden ? 'Show Pages' : 'Hide Pages' }}</span>
            </button>

            <div class="collapsible-toolbar desktop-only">
              <button 
                (click)="isToolbarExpanded = !isToolbarExpanded" 
                class="toolbar-toggle"
                [class.expanded]="isToolbarExpanded"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>{{ isToolbarExpanded ? 'Hide' : 'Add Content' }}</span>
              </button>
              
              <div class="toolbar-buttons" [class.expanded]="isToolbarExpanded">
                <button (click)="editorService.addBlock('heading')" class="btn-block-action">
                  <svg xmlns="http://www.w3.org/2000/svg" class="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Heading</span>
                </button>
                <button (click)="editorService.addBlock('paragraph')" class="btn-block-action">
                  <svg xmlns="http://www.w3.org/2000/svg" class="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  <span>Text</span>
                </button>
                <button (click)="editorService.addBlock('image')" class="btn-block-action">
                  <svg xmlns="http://www.w3.org/2000/svg" class="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Image</span>
                </button>
                <button (click)="editorService.addBlock('video')" class="btn-block-action">
                  <svg xmlns="http://www.w3.org/2000/svg" class="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Video</span>
                </button>
              </div>
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
                        <div class="image-placeholder" (click)="imageInput.click()">
                          <svg xmlns="http://www.w3.org/2000/svg" class="icon-lg text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span class="upload-text">Click to upload image</span>
                          <input #imageInput type="file" class="hidden-input" (change)="onImageUpload($event, block.id)" accept="image/*" />
                        </div>
                      }
                    </div>
                  }
                  @case ('video') {
                    <div class="block-video">
                      @if (block.content) {
                        <video controls class="video-preview">
                          <source [src]="block.content" type="video/mp4">
                          Your browser does not support the video tag.
                        </video>
                        <button (click)="editorService.updateBlockContent(block.id, '')" class="btn-remove-video">Remove</button>
                      } @else {
                        <div class="video-placeholder" (click)="videoInput.click()">
                          <svg xmlns="http://www.w3.org/2000/svg" class="icon-lg text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span class="upload-text">Click to upload video</span>
                          <span class="upload-hint">Uploading to Mega.io cloud...</span>
                          <input #videoInput type="file" class="hidden-input" (change)="onVideoUpload($event, block.id)" accept="video/*" />
                        </div>
                      }
                    </div>
                  }
                }
              </div>
            }
          </div>
        </div>

        <!-- Floating Add actions for mobile -->
        <div class="mobile-add-actions mobile-only">
           <button (click)="editorService.addBlock('heading')" title="Add Heading">
             <svg xmlns="http://www.w3.org/2000/svg" class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
             </svg>
           </button>
           <button (click)="editorService.addBlock('paragraph')" title="Add Text">
             <svg xmlns="http://www.w3.org/2000/svg" class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
             </svg>
           </button>
           <button (click)="editorService.addBlock('image')" title="Add Image">
             <svg xmlns="http://www.w3.org/2000/svg" class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
             </svg>
           </button>
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
  megaService = inject(MegaService);
  isSidebarHidden = true;
  isToolbarExpanded = false;
  uploadingVideo = false;

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
        next: (fullBook: Book | undefined) => {
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
      const file = input.files[0];

      // Check if Mega.io is configured
      if (this.megaService.isConfigured()) {
        const filename = this.megaService.generateFilename(file.name, 'bookora_img');
        this.megaService.uploadFile(file, filename).subscribe({
          next: (url) => {
            this.editorService.updateBlockContent(blockId, url);
            console.log('Image uploaded to Mega.io:', url);
          },
          error: (err) => {
            console.error('Failed to upload to Mega.io, using base64 fallback:', err);
            this.uploadImageAsBase64(file, blockId);
          }
        });
      } else {
        // Fallback to base64 if Mega.io not configured
        this.uploadImageAsBase64(file, blockId);
      }
    }
  }

  private uploadImageAsBase64(file: File, blockId: string) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.editorService.updateBlockContent(blockId, e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  onVideoUpload(event: Event, blockId: string) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      const file = input.files[0];

      if (!this.megaService.isConfigured()) {
        alert('Mega.io is not configured. Please add credentials to environment.ts');
        return;
      }

      this.uploadingVideo = true;
      const filename = this.megaService.generateFilename(file.name, 'bookora_video');

      this.megaService.uploadVideo(file).subscribe({
        next: (url) => {
          this.editorService.updateBlockContent(blockId, url);
          this.uploadingVideo = false;
          console.log('Video uploaded to Mega.io:', url);
        },
        error: (err) => {
          console.error('Failed to upload video to Mega.io:', err);
          alert('Video upload failed. Please check your Mega.io credentials.');
          this.uploadingVideo = false;
        }
      });
    }
  }
}
