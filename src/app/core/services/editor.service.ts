import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Book, BookPage, PageBlock } from '../../shared/models/book.model';
import { DataService } from './data.service';

@Injectable({
    providedIn: 'root'
})
export class EditorService {
    private dataService = inject(DataService);

    // Current book being edited
    currentBook = signal<Book | null>(null);

    // Currently active page index
    currentPageIndex = signal<number>(0);

    // Computed signal for the current page
    currentPage = computed(() => {
        const book = this.currentBook();
        if (!book || !book.pages.length) return null;
        return book.pages[this.currentPageIndex()];
    });

    lastSaved = signal<string>(new Date().toLocaleTimeString());
    isDirty = signal<boolean>(false);

    constructor() {
        // Autosave effect
        effect(() => {
            if (this.isDirty()) {
                const timeout = setTimeout(() => {
                    this.saveChanges();
                }, 3000); // 3 seconds debounce for autosave
                return () => clearTimeout(timeout);
            }
            return undefined;
        });
    }

    setBook(book: Book) {
        this.currentBook.set(book);
        this.currentPageIndex.set(0);
        this.isDirty.set(false);
    }

    addPage() {
        const book = this.currentBook();
        if (!book) return;

        const newPage: BookPage = {
            id: Math.random().toString(36).substring(7),
            pageNumber: book.pages.length + 1,
            content: []
        };

        this.currentBook.update((b: Book | null) => {
            if (!b) return null;
            return { ...b, pages: [...b.pages, newPage], pageCount: b.pageCount + 1 };
        });
        this.currentPageIndex.set(book.pages.length);
        this.isDirty.set(true);
    }

    deletePage(index: number) {
        this.currentBook.update((b: Book | null) => {
            if (!b) return null;
            const newPages = b.pages.filter((_, i: number) => i !== index);
            return { ...b, pages: newPages, pageCount: newPages.length };
        });
        if (this.currentPageIndex() >= index && this.currentPageIndex() > 0) {
            this.currentPageIndex.update((i: number) => i - 1);
        }
        this.isDirty.set(true);
    }

    addBlock(type: 'paragraph' | 'heading' | 'image') {
        const block: PageBlock = {
            id: Math.random().toString(36).substring(7),
            type,
            content: ''
        };

        this.currentBook.update((b: Book | null) => {
            if (!b) return null;
            const pages = [...b.pages];
            const page = { ...pages[this.currentPageIndex()] };
            page.content = [...page.content, block];
            pages[this.currentPageIndex()] = page;
            return { ...b, pages };
        });
        this.isDirty.set(true);
    }

    updateBlockContent(blockId: string, content: string) {
        this.currentBook.update((b: Book | null) => {
            if (!b) return null;
            const pages = [...b.pages];
            const page = { ...pages[this.currentPageIndex()] };
            page.content = page.content.map((block: PageBlock) =>
                block.id === blockId ? { ...block, content } : block
            );
            pages[this.currentPageIndex()] = page;
            return { ...b, pages };
        });
        this.isDirty.set(true);
    }

    deleteBlock(blockId: string) {
        this.currentBook.update((b: Book | null) => {
            if (!b) return null;
            const pages = [...b.pages];
            const page = { ...pages[this.currentPageIndex()] };
            page.content = page.content.filter((block: PageBlock) => block.id !== blockId);
            pages[this.currentPageIndex()] = page;
            return { ...b, pages };
        });
        this.isDirty.set(true);
    }

    saveChanges() {
        const book = this.currentBook();
        if (!book) return;

        console.log('Autosaving changes to GitHub...', book.title);
        this.dataService.updateBook(book);

        this.lastSaved.set(new Date().toLocaleTimeString());
        this.isDirty.set(false);
    }
}
