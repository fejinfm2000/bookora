import { TestBed } from '@angular/core/testing';
import { DataService } from './data.service';
import { describe, it, expect, beforeEach } from 'vitest';

describe('DataService', () => {
    let service: DataService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [DataService]
        });
        service = TestBed.inject(DataService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have initial mock books', () => {
        const books = service.filteredBooks();
        expect(books.length).toBeGreaterThan(0);
    });

    it('should filter books by search query', () => {
        service.searchQuery.set('Echoes');
        const filtered = service.filteredBooks();
        expect(filtered.length).toBe(1);
        expect(filtered[0].title).toContain('Echoes');
    });

    it('should filter books by genre', () => {
        service.selectedGenre.set('Sci-Fi');
        const filtered = service.filteredBooks();
        expect(filtered.every(b => b.genre === 'Sci-Fi')).toBe(true);
    });
});
