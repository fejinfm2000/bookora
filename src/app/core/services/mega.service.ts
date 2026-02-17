import { Injectable, inject } from '@angular/core';
import { from, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

declare const require: any;

@Injectable({
    providedIn: 'root'
})
export class MegaService {
    private mega: any = null;
    private storage: any = null;
    private isInitialized = false;

    constructor() {
        // Mega SDK will be dynamically imported when needed
    }

    /**
     * Initialize Mega.io connection
     */
    private async initialize(): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        try {
            const { Storage } = await import('megajs');

            if (!environment.mega.email || !environment.mega.password) {
                console.warn('Mega.io credentials not configured. Media uploads will use fallback (base64).');
                return;
            }

            this.storage = await new Storage({
                email: environment.mega.email,
                password: environment.mega.password
            }).ready;

            this.isInitialized = true;
            console.log('Mega.io initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Mega.io:', error);
            throw new Error('Mega.io initialization failed. Please check your credentials.');
        }
    }

    /**
     * Check if Mega.io is configured and available
     */
    isConfigured(): boolean {
        return !!(environment.mega.email && environment.mega.password);
    }

    /**
     * Upload a file to Mega.io and return the shareable URL
     * @param file - File or Blob to upload
     * @param filename - Name for the uploaded file
     * @returns Observable<string> - Public shareable URL
     */
    uploadFile(file: File | Blob, filename: string): Observable<string> {
        if (!this.isConfigured()) {
            return throwError(() => new Error('Mega.io is not configured. Please add credentials to environment.ts'));
        }

        return from(this.performUpload(file, filename)).pipe(
            catchError(error => {
                console.error('Mega.io upload error:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Internal upload implementation
     */
    private async performUpload(file: File | Blob, filename: string): Promise<string> {
        await this.initialize();

        if (!this.storage) {
            throw new Error('Mega.io storage not initialized');
        }

        // Convert File/Blob to Uint8Array for upload
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        // Upload file to Mega.io root directory
        const uploadedFile = await this.storage.upload({
            name: filename,
            size: buffer.length
        }, buffer).complete;

        // Get shareable link
        const link = await uploadedFile.link();

        return link;
    }

    /**
     * Upload an image from base64 data URL
     * @param dataUrl - Base64 data URL (e.g., from FileReader)
     * @param filename - Name for the uploaded file
     * @returns Observable<string> - Public shareable URL
     */
    uploadImageFromDataUrl(dataUrl: string, filename: string): Observable<string> {
        // Convert data URL to Blob
        const blob = this.dataUrlToBlob(dataUrl);
        return this.uploadFile(blob, filename);
    }

    /**
     * Upload a video file
     * @param file - Video file
     * @returns Observable<string> - Public shareable URL
     */
    uploadVideo(file: File): Observable<string> {
        return this.uploadFile(file, file.name);
    }

    /**
     * Helper: Convert data URL to Blob
     */
    private dataUrlToBlob(dataUrl: string): Blob {
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new Blob([u8arr], { type: mime });
    }

    /**
     * Generate a unique filename with timestamp
     */
    generateFilename(originalName: string, prefix: string = 'bookora'): string {
        const timestamp = Date.now();
        const extension = originalName.split('.').pop() || 'jpg';
        return `${prefix}_${timestamp}.${extension}`;
    }
}
