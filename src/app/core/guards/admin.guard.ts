import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AdminService } from '../services/admin.service';

export const adminGuard: CanActivateFn = (route, state) => {
    const adminService = inject(AdminService);
    const router = inject(Router);

    if (adminService.canAccessAdmin()) {
        return true;
    }

    // Redirect to library if not admin
    console.warn('Access denied: Admin privileges required');
    router.navigate(['/library']);
    return false;
};
