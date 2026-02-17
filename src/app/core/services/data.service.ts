import { Injectable, signal, computed, inject } from '@angular/core';
import { Book } from '../../shared/models/book.model';
import { GithubService } from './github.service';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from './notification.service';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { jsPDF } from 'jspdf';

@Injectable({
    providedIn: 'root'
})
export class DataService {
    private github = inject(GithubService);
    private auth = inject(AuthService);
    private notificationService = inject(NotificationService);

    // Path to the books index file
    private readonly BOOKS_INDEX_PATH = 'src/assets/data/books.json';
    private readonly BOOKS_DIR_PATH = 'src/assets/data/books/';

    // All books cache
    private _books = signal<Book[]>([]); // Start empty, load from GitHub

    // Search and Filter signals
    searchQuery = signal<string>('');
    selectedGenre = signal<string>('All');
    viewType = signal<'grid' | 'list'>('grid');
    sortBy = signal<string>('newest');

    constructor() {
        this.loadBooks();
    }

    // Computed signal for filtered and sorted books
    filteredBooks = computed(() => {
        let result = this._books().filter((book: Book) => {
            const matchesSearch = book.title.toLowerCase().includes(this.searchQuery().toLowerCase()) ||
                book.author.toLowerCase().includes(this.searchQuery().toLowerCase());
            const matchesGenre = this.selectedGenre() === 'All' || book.genre === this.selectedGenre();
            return matchesSearch && matchesGenre;
        });

        // Sorting logic
        return result.sort((a: Book, b: Book) => {
            if (this.sortBy() === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (this.sortBy() === 'mostViewed') return b.viewCount - a.viewCount;
            if (this.sortBy() === 'mostDownloaded') return b.downloadCount - a.downloadCount;
            return 0;
        });
    });

    // User's My Books
    myBooks = computed(() => {
        const user = this.auth.currentUser();
        if (!user || !user.created_books) return [];
        return this._books().filter((b: Book) => user.created_books.includes(b.id));
    });

    // User's Favorites
    favoriteBooks = computed(() => {
        const user = this.auth.currentUser();
        if (!user || !user.favorite_books) return [];
        return this._books().filter((b: Book) => user.favorite_books.includes(b.id));
    });

    getGenres = computed(() => {
        const genres = this._books().map((b: Book) => b.genre);
        return ['All', ...new Set(genres)];
    });

    /**
     * Load books from GitHub index
     */
    loadBooks() {
        if (!this.github.isConfigured()) return;

        this.github.getFile<Book[]>(this.BOOKS_INDEX_PATH).subscribe({
            next: (fileData: any) => {
                if (fileData) {
                    this._books.set(fileData.content);
                } else {
                    // Index doesn't exist, create it empty
                    this.saveBooksIndex([]).subscribe();
                }
            },
            error: (err: any) => console.error('Failed to load books', err)
        });
    }

    /**
     * Get a single book (from cache or fetch if detailed content needed)
     */
    getBook(id: string): Book | undefined {
        return this._books().find((b: Book) => b.id === id);
    }

    /**
     * Fetch full book details (including content pages)
     */
    fetchBookDetails(id: string): Observable<Book | undefined> {
        const path = `${this.BOOKS_DIR_PATH}${id}.json`;
        return this.github.getFile<Book>(path).pipe(
            map((data: any) => {
                const book = data?.content;
                if (book) {
                    // Update cache with full book details
                    this._books.update((books: Book[]) => books.map((b: Book) => b.id === id ? book : b));
                }
                return book;
            })
        );
    }

    /**
     * Add a book
     */
    addBook(book: Book) {
        // Optimistic update
        const newBooks = [book, ...this._books()];
        this._books.set(newBooks);

        // 1. Save individual book file
        const bookPath = `${this.BOOKS_DIR_PATH}${book.id}.json`;
        this.github.saveFile(bookPath, book, null, `Create book ${book.title}`).pipe(
            switchMap(() => {
                // 2. Update index
                return this.saveBooksIndex(newBooks);
            }),
            switchMap(() => {
                // 3. Update User's created_books
                const user = this.auth.currentUser();
                if (user) {
                    const updatedUser = {
                        ...user,
                        created_books: [...(user.created_books || []), book.id]
                    };
                    return this.auth.updateUser(updatedUser);
                }
                return of(true);
            })
        ).subscribe({
            next: () => {
                // Create notification for new book
                this.notificationService.create(
                    'new_book',
                    'New Book Published!',
                    `"${book.title}" by ${book.author} is now available`,
                    `/read/${book.id}`,
                    book.coverImage
                );
            },
            error: (err: any) => console.error('Failed to save book', err)
        });
    }

    /**
     * Update a book
     */
    updateBook(book: Book) {
        const updatedBooks = this._books().map((b: Book) => b.id === book.id ? book : b);
        this._books.set(updatedBooks);

        // 1. Update individual file
        const bookPath = `${this.BOOKS_DIR_PATH}${book.id}.json`;
        this.github.getFile<Book>(bookPath).pipe(
            switchMap((fileData: any) => {
                const sha = fileData ? fileData.sha : null;
                return this.github.saveFile(bookPath, book, sha, `Update book ${book.title}`);
            }),
            switchMap(() => this.saveBooksIndex(updatedBooks))
        ).subscribe({
            error: (err: any) => console.error('Failed to update book', err)
        });
    }

    /**
     * Delete a book
     */
    deleteBook(id: string) {
        const book = this.getBook(id);
        if (!book) return;

        const updatedBooks = this._books().filter(b => b.id !== id);
        this._books.set(updatedBooks);

        const bookPath = `${this.BOOKS_DIR_PATH}${id}.json`;

        // 1. Delete file
        this.github.getFile<Book>(bookPath).pipe(
            switchMap((fileData: any) => {
                if (!fileData) return of(true);
                return this.github.deleteFile(bookPath, fileData.sha, `Delete book ${book.title}`);
            }),
            switchMap(() => this.saveBooksIndex(updatedBooks)),
            switchMap(() => {
                // 3. Update User's created_books
                const user = this.auth.currentUser();
                if (user) {
                    const updatedUser = {
                        ...user,
                        created_books: (user.created_books || []).filter((bib: string) => bib !== id)
                    };
                    return this.auth.updateUser(updatedUser);
                }
                return of(true);
            })
        ).subscribe({
            error: (err: any) => console.error('Failed to delete book', err)
        });
    }

    /**
     * Toggle Favorite
     */
    toggleFavorite(bookId: string) {
        const user = this.auth.currentUser();
        if (!user) return;

        const isFav = user.favorite_books?.includes(bookId);
        let newFavs;
        if (isFav) {
            newFavs = user.favorite_books.filter((id: string) => id !== bookId);
        } else {
            newFavs = [...(user.favorite_books || []), bookId];
        }

        const updatedUser = { ...user, favorite_books: newFavs };
        this.auth.updateUser(updatedUser).subscribe();
    }

    private saveBooksIndex(books: Book[]) {
        // Fetch index SHA first
        return this.github.getFile<Book[]>(this.BOOKS_INDEX_PATH).pipe(
            switchMap((fileData: any) => {
                const sha = fileData ? fileData.sha : null;
                // Exclude heavy content (pages) from index
                const indexContent = books.map((b: Book) => ({ ...b, pages: [] }));
                return this.github.saveFile(this.BOOKS_INDEX_PATH, indexContent, sha, 'Update books index');
            })
        );
    }

    /**
     * Download a book as PDF
     */
    downloadBook(book: Book) {
        const pdf = new jsPDF();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 20;
        const maxWidth = pageWidth - (margin * 2);
        let yPosition = margin;

        // Title page
        pdf.setFontSize(24);
        pdf.text(book.title, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 15;

        pdf.setFontSize(14);
        pdf.text(`by ${book.author}`, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.text(book.genre, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 20;

        // Description
        pdf.setFontSize(12);
        const descLines = pdf.splitTextToSize(book.description, maxWidth);
        descLines.forEach((line: string) => {
            if (yPosition > pageHeight - margin) {
                pdf.addPage();
                yPosition = margin;
            }
            pdf.text(line, margin, yPosition);
            yPosition += 7;
        });

        // Pages
        book.pages.forEach((page) => {
            pdf.addPage();
            yPosition = margin;

            page.content.forEach((block) => {
                // Skip video blocks - they can't be embedded in PDFs
                if (block.type === 'video') {
                    pdf.setFontSize(10);
                    pdf.setTextColor(128, 128, 128); // Gray color
                    pdf.text('[Video content not included in PDF]', margin, yPosition);
                    pdf.setTextColor(0, 0, 0); // Reset to black
                    yPosition += 10;
                    return;
                }

                if (block.type === 'heading') {
                    pdf.setFontSize(16);
                    pdf.setFont('helvetica', 'bold');
                    const headingLines = pdf.splitTextToSize(block.content, maxWidth);
                    headingLines.forEach((line: string) => {
                        if (yPosition > pageHeight - margin) {
                            pdf.addPage();
                            yPosition = margin;
                        }
                        pdf.text(line, margin, yPosition);
                        yPosition += 10;
                    });
                    pdf.setFont('helvetica', 'normal');
                } else if (block.type === 'paragraph') {
                    pdf.setFontSize(12);
                    const paraLines = pdf.splitTextToSize(block.content, maxWidth);
                    paraLines.forEach((line: string) => {
                        if (yPosition > pageHeight - margin) {
                            pdf.addPage();
                            yPosition = margin;
                        }
                        pdf.text(line, margin, yPosition);
                        yPosition += 7;
                    });
                    yPosition += 5; // Extra spacing after paragraph
                }
            });
        });

        pdf.save(`${book.title.replace(/\s+/g, '_')}.pdf`);
    }
}
