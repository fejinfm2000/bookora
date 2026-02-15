import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { PdfImportService } from '../../core/services/pdf-import.service';
import { Book } from '../../shared/models/book.model';

@Component({
  selector: 'app-book-creation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="create-container">
      <div class="create-header">
        <button 
          (click)="router.navigate(['/library'])"
          class="back-btn"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="icon-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 class="page-title">Create New Book</h2>
      </div>

      <div class="create-grid">
        <!-- Main Form -->
        <div class="form-column">
          <div class="form-card">
            <h3 class="section-title">Book Metadata</h3>
            <form [formGroup]="bookForm" (ngSubmit)="onSubmit()" class="create-form">
              <div class="form-field">
                <label class="field-label">Book Title</label>
                <input 
                  type="text" 
                  formControlName="title"
                  placeholder="Enter a catchy title"
                  class="field-input"
                />
              </div>

              <div class="form-row">
                <div class="form-field">
                  <label class="field-label">Author</label>
                  <input 
                    type="text" 
                    formControlName="author"
                    placeholder="Author name"
                    class="field-input"
                  />
                </div>
                <div class="form-field">
                  <label class="field-label">Genre</label>
                  <select 
                    formControlName="genre"
                    class="field-select"
                  >
                    @for (genre of genres; track genre) {
                      <option [value]="genre">{{ genre }}</option>
                    }
                  </select>
                </div>
              </div>

              <div class="form-field">
                <label class="field-label">Description</label>
                <textarea 
                  formControlName="description"
                  rows="4"
                  placeholder="What is your book about?"
                  class="field-textarea"
                ></textarea>
              </div>

              <div class="form-actions">
                <button 
                  type="submit"
                  [disabled]="bookForm.invalid || isSaving()"
                  class="btn-primary-full"
                >
                  @if (isSaving()) {
                    <span>Saving...</span>
                  } @else {
                    Continue to Editor
                  }
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Sidebar Options -->
        <div class="sidebar-column">
          <!-- PDF Import Card -->
          <div class="option-card">
            <h3 class="option-title">
              <svg xmlns="http://www.w3.org/2000/svg" class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Import from PDF
            </h3>
            <p class="option-text">Have an existing PDF? Upload it and we'll extract the content for you.</p>
            <input 
              type="file" 
              id="pdf-upload"
              accept=".pdf"
              (change)="onPdfUpload($event)"
              class="hidden-input"
            />
            <label for="pdf-upload" class="upload-btn">
              <svg xmlns="http://www.w3.org/2000/svg" class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Choose PDF File
            </label>
            @if (isProcessing()) {
              <p class="processing-text">Processing PDF...</p>
            }
          </div>

          <!-- Tips Card -->
          <div class="tips-card">
            <h3 class="tips-title">💡 Quick Tips</h3>
            <ul class="tips-list">
              <li>Choose a compelling title that grabs attention</li>
              <li>Write a clear description to help readers find your book</li>
              <li>You can always edit these details later</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BookCreationComponent {
  fb = inject(FormBuilder);
  router = inject(Router);
  dataService = inject(DataService);
  pdfImportService = inject(PdfImportService);

  isSaving = signal(false);
  isProcessing = signal(false);

  genres = ['Fantasy', 'Science Fiction', 'Mystery', 'Romance', 'Thriller', 'Non-Fiction', 'Biography', 'Self-Help'];

  bookForm = this.fb.group({
    title: ['', Validators.required],
    author: ['', Validators.required],
    genre: ['Fantasy', Validators.required],
    description: ['']
  });

  onSubmit() {
    if (this.bookForm.valid) {
      this.isSaving.set(true);

      const newBook: Book = {
        id: Date.now().toString(),
        title: this.bookForm.value.title!,
        author: this.bookForm.value.author!,
        genre: this.bookForm.value.genre!,
        description: this.bookForm.value.description || '',
        coverImage: `https://picsum.photos/seed/${Date.now()}/400/600`,
        pageCount: 0,
        viewCount: 0,
        downloadCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pages: []
      };

      setTimeout(() => {
        this.dataService.addBook(newBook);
        this.isSaving.set(false);
        this.router.navigate(['/edit', newBook.id]);
      }, 1000);
    }
  }

  async onPdfUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file && file.type === 'application/pdf') {
      this.isProcessing.set(true);

      try {
        const pages = await this.pdfImportService.parsePdf(file);

        const newBook: Book = {
          id: Date.now().toString(),
          title: this.bookForm.value.title || file.name.replace('.pdf', ''),
          author: this.bookForm.value.author || 'Unknown Author',
          genre: this.bookForm.value.genre!,
          description: this.bookForm.value.description || '',
          coverImage: `https://picsum.photos/seed/${Date.now()}/400/600`,
          pageCount: pages.length,
          viewCount: 0,
          downloadCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          pages
        };

        this.dataService.addBook(newBook);
        this.isProcessing.set(false);
        this.router.navigate(['/edit', newBook.id]);
      } catch (error) {
        console.error('Error processing PDF:', error);
        this.isProcessing.set(false);
      }
    }
  }
}
