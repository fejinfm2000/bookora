import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GithubService } from '../services/github.service';
import { Observable, from, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';

export interface User {
    email: string;
    password?: string; // stored for simple auth simulation
    username: string; // derived from email or set
    favorite_books: string[];
    created_books: string[];
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private githubService = inject(GithubService);
    private router = inject(Router);
    private readonly USER_data_PATH = 'src/assets/data/users/'; // Directory for user files

    // Current user state
    currentUser = signal<User | null>(null);

    constructor() {
        // Try to restore user from localStorage so session persists across tabs
        try {
            const raw = localStorage.getItem('bookora_user');
            if (raw) {
                const parsed = JSON.parse(raw) as User;
                if (parsed && parsed.email) {
                    this.currentUser.set(parsed);
                    // If the user returns to the app (or opens a blank route),
                    // redirect to the library for convenience.
                    try {
                        const p = window.location.pathname;
                        if (p === '/' || p === '/login' || p === '') {
                            this.router.navigate(['/library']);
                        }
                    } catch (e) {
                        // ignore navigation errors during early bootstrap
                    }
                }
            }
        } catch (e) {
            console.warn('AuthService: failed to restore user from localStorage', e);
        }
    }

    isAuthenticated = computed(() => !!this.currentUser());

    /**
     * Login by fetching user file and checking password
     */
    login(email: string, password: string): Observable<boolean> {
        const filename = this.getEmailFilename(email);
        const path = `${this.USER_data_PATH}${filename}`;

        return this.githubService.getFile<User>(path).pipe(
            map(fileData => {
                if (!fileData) {
                    console.warn('AuthService.login: user file not found', path);
                    return false; // User not found
                }
                const user = fileData.content;
                console.debug('AuthService.login: loaded user', { email: user.email, hasPassword: !!user.password });

                if (user.password === password) {
                    this.currentUser.set(user);
                    try { localStorage.setItem('bookora_user', JSON.stringify(user)); } catch (e) { /* ignore */ }
                    return true;
                }
                console.warn('AuthService.login: password mismatch', { expected: !!user.password, provided: !!password });
                return false;
            }),
            catchError(err => {
                console.error('Login error', err);
                return of(false);
            })
        );
    }

    /**
     * Register by creating a new user file
     */
    register(email: string, password: string): Observable<boolean> {
        const filename = this.getEmailFilename(email);
        const path = `${this.USER_data_PATH}${filename}`;

        const newUser: User = {
            email,
            password,
            username: email.split('@')[0],
            favorite_books: [],
            created_books: []
        };

        return this.githubService.saveFile(path, newUser, null, `Create user ${email}`).pipe(
            map(() => {
                this.currentUser.set(newUser);
                try { localStorage.setItem('bookora_user', JSON.stringify(newUser)); } catch (e) { /* ignore */ }
                return true;
            }),
            catchError(err => {
                console.error('Registration error details:', err);
                return of(false);
            })
        );
    }

    /**
     * Update current user data (e.g. favorites)
     */
    updateUser(user: User): Observable<boolean> {
        const filename = this.getEmailFilename(user.email);
        const path = `${this.USER_data_PATH}${filename}`;

        // We need the SHA to update, so we fetch first? 
        // Or we can rely on GithubService to handle SHA fetching if we implemented it that way?
        // Our GithubService expects SHA.
        // Let's first fetch to get SHA.
        return this.githubService.getFile<User>(path).pipe(
            switchMap(fileData => {
                if (!fileData) return of(false);
                return this.githubService.saveFile(path, user, fileData.sha, `Update user ${user.email}`);
            }),
            map(() => {
                this.currentUser.set(user);
                try { localStorage.setItem('bookora_user', JSON.stringify(user)); } catch (e) { /* ignore */ }
                return true;
            }),
            catchError(() => of(false))
        );
    }

    logout() {
        this.currentUser.set(null);
        try { localStorage.removeItem('bookora_user'); } catch (e) { /* ignore */ }
    }

    private getEmailFilename(email: string): string {
        // Simple sanitization for filename
        return email.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.json';
    }
}
