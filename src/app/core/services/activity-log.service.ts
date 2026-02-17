import { Injectable, inject } from '@angular/core';
import { GithubService } from './github.service';
import { AuthService } from '../auth/auth.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface ActivityLog {
    id: string;
    timestamp: string;
    userEmail: string;
    action: 'create' | 'update' | 'delete';
    resourceType: 'book' | 'feed' | 'page' | 'user';
    resourceId?: string;
    resourceName?: string;
    details?: Record<string, any>;
}

const ACTIVITY_LOG_PATH = 'src/assets/data/activity-log.json';

@Injectable({
    providedIn: 'root'
})
export class ActivityLogService {
    private githubService = inject(GithubService);
    private authService = inject(AuthService);

    /**
     * Log an activity
     */
    logActivity(
        action: ActivityLog['action'],
        resourceType: ActivityLog['resourceType'],
        resourceId?: string,
        resourceName?: string,
        details?: Record<string, any>
    ): void {
        const currentUser = this.authService.currentUser();
        if (!currentUser?.email) {
            console.warn('Cannot log activity: No user logged in');
            return;
        }

        const logEntry: ActivityLog = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            userEmail: currentUser.email,
            action,
            resourceType,
            resourceId,
            resourceName,
            details
        };

        // Fetch current logs, add new entry, save
        this.getActivityLogs().subscribe({
            next: (logs) => {
                const updatedLogs = [logEntry, ...logs].slice(0, 1000); // Keep last 1000 entries
                this.saveActivityLogs(updatedLogs).subscribe({
                    next: () => console.log('Activity logged:', action, resourceType),
                    error: (err) => console.error('Failed to log activity:', err)
                });
            },
            error: (err) => console.error('Failed to fetch activity logs:', err)
        });
    }

    /**
     * Get all activity logs
     */
    getActivityLogs(): Observable<ActivityLog[]> {
        return this.githubService.getFile<ActivityLog[]>(ACTIVITY_LOG_PATH).pipe(
            map(result => result?.content || []),
            catchError(error => {
                console.log('Activity log file not found, creating new one');
                return of([]);
            })
        );
    }

    /**
     * Get logs filtered by criteria
     */
    getFilteredLogs(filters: {
        userEmail?: string;
        action?: ActivityLog['action'];
        resourceType?: ActivityLog['resourceType'];
        startDate?: Date;
        endDate?: Date;
    }): Observable<ActivityLog[]> {
        return this.getActivityLogs().pipe(
            map(logs => logs.filter(log => {
                if (filters.userEmail && log.userEmail !== filters.userEmail) return false;
                if (filters.action && log.action !== filters.action) return false;
                if (filters.resourceType && log.resourceType !== filters.resourceType) return false;

                const logDate = new Date(log.timestamp);
                if (filters.startDate && logDate < filters.startDate) return false;
                if (filters.endDate && logDate > filters.endDate) return false;

                return true;
            }))
        );
    }

    /**
     * Save activity logs to GitHub
     */
    private saveActivityLogs(logs: ActivityLog[]): Observable<any> {
        // Get current SHA first
        return this.githubService.getFile<ActivityLog[]>(ACTIVITY_LOG_PATH).pipe(
            map(result => result?.sha || null),
            catchError(() => of(null)),
            map(sha => {
                return this.githubService.saveFile(
                    ACTIVITY_LOG_PATH,
                    logs,
                    sha,
                    'Update activity log'
                );
            })
        );
    }

    /**
     * Generate unique ID
     */
    private generateId(): string {
        return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
