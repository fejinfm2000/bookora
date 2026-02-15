import { Injectable, signal } from '@angular/core';
import { BookPage, PageBlock } from '../../shared/models/book.model';

@Injectable({
    providedIn: 'root'
})
export class PdfImportService {
    isLoading = signal<boolean>(false);

    /**
     * Mock PDF parsing logic.
     * In a real app, this would use a library like pdf.js or call a backend API.
     */
    async parsePdf(file: File): Promise<BookPage[]> {
        this.isLoading.set(true);

        // Simulate parsing delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const pages: BookPage[] = [];
        const pageCount = 5; // Mock 5 pages

        for (let i = 1; i <= pageCount; i++) {
            pages.push({
                id: Math.random().toString(36).substring(7),
                pageNumber: i,
                content: [
                    {
                        id: Math.random().toString(36).substring(7),
                        type: 'heading',
                        content: `Page ${i} Title`
                    },
                    {
                        id: Math.random().toString(36).substring(7),
                        type: 'paragraph',
                        content: `This is the mock content extracted from page ${i} of the PDF named "${file.name}". In a real implementation, we would extract the actual text and images using a PDF parsing library.`
                    }
                ]
            });
        }

        this.isLoading.set(false);
        return pages;
    }
}
