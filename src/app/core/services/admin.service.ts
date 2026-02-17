import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

export interface UserRole {
    email: string;
    roles: string[];
    grantedAt?: string;
    grantedBy?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private authService = inject(AuthService);

    // Current user's admin status
    isAdmin = signal<boolean>(false);

    constructor() {
        // Check admin status when service initializes
        this.checkAdminStatus();
    }

    /**
     * Check if current user is an admin
     */
    private checkAdminStatus(): void {
        const currentUser = this.authService.currentUser();
        if (currentUser?.email) {
            const isAdminUser = this.isUserAdmin(currentUser.email);
            this.isAdmin.set(isAdminUser);
        } else {
            this.isAdmin.set(false);
        }
    }

    /**
     * Check if a specific email is in the admin list
     */
    isUserAdmin(email: string): boolean {
        const adminEmails = environment.adminEmails || [];
        return adminEmails.includes(email.toLowerCase());
    }

    /**
     * Get list of admin emails from environment
     */
    getAdminEmails(): string[] {
        return environment.adminEmails || [];
    }

    /**
     * Check if current user can access admin features
     */
    canAccessAdmin(): boolean {
        return this.isAdmin();
    }

    /**
     * Verify admin access and throw error if not authorized
     */
    requireAdmin(): void {
        if (!this.canAccessAdmin()) {
            throw new Error('Unauthorized: Admin access required');
        }
    }
}
