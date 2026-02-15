import { Injectable, signal, effect } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private readonly THEME_KEY = 'bookora-theme';
    isDarkMode = signal<boolean>(this.getInitialTheme());

    constructor() {
        effect(() => {
            const mode = this.isDarkMode() ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', mode);
            localStorage.setItem(this.THEME_KEY, mode);
        });
    }

    toggleTheme() {
        this.isDarkMode.update(dark => !dark);
    }

    private getInitialTheme(): boolean {
        const savedTheme = localStorage.getItem(this.THEME_KEY);
        if (savedTheme) {
            return savedTheme === 'dark';
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
}
