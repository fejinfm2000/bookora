import { Injectable, signal, computed, inject } from '@angular/core';
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
    private readonly USER_data_PATH = 'src/assets/data/users/'; // Directory for user files

    // Current user state
    currentUser = signal<User | null>(null);

    constructor() {
        // Try to restore session from localStorage if needed, 
        // but for now we'll start fresh or maybe store email in localstorage
        const savedEmail = localStorage.getItem('bookora_user_email');
        if (savedEmail) {
            // Potentially re-fetch user data here
            // this.loadUser(savedEmail);
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
                if (!fileData) return false; // User not found
                const user = fileData.content;

                if (user.password === password) {
                    this.currentUser.set(user);
                    localStorage.setItem('bookora_user_email', email);
                    return true;
                }
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
                localStorage.setItem('bookora_user_email', email);
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
                return true;
            }),
            catchError(() => of(false))
        );
    }

    logout() {
        this.currentUser.set(null);
        localStorage.removeItem('bookora_user_email');
    }

    private getEmailFilename(email: string): string {
        // Simple sanitization for filename
        return email.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.json';
    }
}
