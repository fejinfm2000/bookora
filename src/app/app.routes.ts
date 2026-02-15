import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: 'library/my-books',
                loadComponent: () => import('./features/library/my-books/my-books.component').then(m => m.MyBooksComponent)
            },
            {
                path: 'library/favorites',
                loadComponent: () => import('./features/library/favorites/favorites.component').then(m => m.FavoritesComponent)
            },
            {
                path: 'library',
                loadComponent: () => import('./features/library/library.component').then(m => m.LibraryComponent)
            },
            {
                path: 'create',
                loadComponent: () => import('./features/book-creation/book-creation.component').then(m => m.BookCreationComponent)
            },
            {
                path: 'edit/:id',
                loadComponent: () => import('./features/book-editor/book-editor.component').then(m => m.BookEditorComponent)
            },
            {
                path: 'read/:id',
                loadComponent: () => import('./features/book-reader/book-reader.component').then(m => m.BookReaderComponent)
            },
            {
                path: '',
                redirectTo: 'library',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
    }
];
