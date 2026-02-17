import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocialService } from '../../core/services/social.service';
import { Router } from '@angular/router';
import { MegaService } from '../../core/services/mega.service';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-feed-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="library-container">
      <div class="library-header">
        <div class="header-left">
          <h2 class="page-title">Share to Feed</h2>
          <p class="page-subtitle">Post updates, quotes, or thoughts on what you're reading.</p>
        </div>
      </div>

      <div class="form-card" style="max-width: 600px; margin: 2rem auto;">
        <div class="form-group">
          <label class="form-label">Update Content</label>
          <textarea 
            class="form-input" 
            rows="5" 
            [(ngModel)]="textContent"
            placeholder="What's on your mind? Share a quote or a thought..."
            style="resize: none;"
          ></textarea>
        </div>

        <div class="form-group" style="margin-top: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <label class="form-label" style="margin-bottom: 0;">Attached Images (Optional)</label>
            <button (click)="imageInput.click()" class="btn-icon-small" title="Upload from device" style="color: var(--primary);">
              <svg xmlns="http://www.w3.org/2000/svg" class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <input #imageInput type="file" class="hidden-input" (change)="onDeviceUpload($event)" accept="image/*" multiple style="display: none;" />
            </button>
          </div>

          <div class="image-url-list">
            @for (url of images(); track $index) {
              <div class="image-url-item" style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem; align-items: flex-start;">
                <div style="flex: 1;">
                   <input 
                     type="text" 
                     class="form-input" 
                     [ngModel]="url"
                     (ngModelChange)="updateImageUrl($index, $event)"
                     placeholder="https://example.com/image.jpg"
                   />
                   @if (url) {
                     <div style="margin-top: 0.5rem; border-radius: 8px; overflow: hidden; border: 1px solid var(--border-color); height: 100px; width: 100px;">
                        <img [src]="url" style="width: 100%; height: 100%; object-fit: cover;" />
                     </div>
                   }
                </div>
                <button (click)="removeImage($index)" class="btn-icon-small" style="color: #ef4444; margin-top: 0.5rem;">
                  <svg xmlns="http://www.w3.org/2000/svg" class="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            }
          </div>
          <button (click)="addImage()" class="btn-block-action" style="margin-top: 0.5rem; width: 100%; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add image URL</span>
          </button>
        </div>

        <div class="form-actions" style="margin-top: 2rem;">
           <button 
             (click)="postToFeed()" 
             class="btn-create" 
             style="width: 100%;"
             [disabled]="!textContent().trim()"
           >
             Post to Feed
           </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class FeedUploadComponent {
  socialService = inject(SocialService);
  router = inject(Router);
  megaService = inject(MegaService);

  textContent = signal('');
  images = signal<string[]>(['']);

  onDeviceUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          // Add to images signal: if the last one is empty, replace it
          this.images.update(urls => {
            const last = urls[urls.length - 1];
            if (urls.length === 1 && !last) {
              return [result];
            }
            return [...urls, result];
          });
        };
        reader.readAsDataURL(file);
      });
    }
  }

  addImage() {
    this.images.update(urls => [...urls, '']);
  }

  removeImage(index: number) {
    this.images.update(urls => urls.filter((_, i) => i !== index));
    if (this.images().length === 0) {
      this.addImage();
    }
  }

  updateImageUrl(index: number, value: string) {
    this.images.update(urls => {
      const newUrls = [...urls];
      newUrls[index] = value;
      return newUrls;
    });
  }

  postToFeed() {
    if (this.textContent().trim()) {
      const validImages = this.images().filter(url => url.trim() !== '');

      // If Mega is configured, upload any data URLs to Mega and replace them with share URLs
      if (this.megaService.isConfigured()) {
        const uploadObservables = validImages.map((img, idx) => {
          if (typeof img === 'string' && img.startsWith('data:')) {
            const filename = this.megaService.generateFilename(`feed_image_${idx}.png`, 'feed');
            return this.megaService.uploadImageFromDataUrl(img, filename);
          }
          // already a URL
          return of(img);
        });

        forkJoin(uploadObservables).subscribe({
          next: (urls: string[]) => {
            this.socialService.addPost(this.textContent(), urls);
            this.router.navigate(['/explore']);
          },
          error: (err) => {
            console.error('Failed to upload one or more images to Mega:', err);
            // fallback: post using whatever URLs we have (may include data URLs)
            this.socialService.addPost(this.textContent(), validImages);
            this.router.navigate(['/explore']);
          }
        });
      } else {
        // Mega not configured: save provided URLs or data URLs as-is (fallback)
        this.socialService.addPost(this.textContent(), validImages);
        this.router.navigate(['/explore']);
      }
    }
  }
}
