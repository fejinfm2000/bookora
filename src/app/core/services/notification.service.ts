import { Injectable, signal, computed } from '@angular/core';
import { Notification } from '../../shared/models/notification.model';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private readonly STORAGE_KEY = 'bookora_notifications';
    private readonly MAX_NOTIFICATIONS = 50; // Limit stored notifications

    // Signal for all notifications
    private _notifications = signal<Notification[]>([]);

    // Public computed signals
    notifications = computed(() => this._notifications());
    unreadCount = computed(() => this._notifications().filter(n => !n.read).length);
    hasUnread = computed(() => this.unreadCount() > 0);

    constructor() {
        this.loadFromStorage();
    }

    /**
     * Create a new notification
     */
    create(
        type: Notification['type'],
        title: string,
        message: string,
        actionUrl?: string,
        imageUrl?: string
    ): void {
        const notification: Notification = {
            id: this.generateId(),
            type,
            title,
            message,
            timestamp: new Date().toISOString(),
            read: false,
            actionUrl,
            imageUrl
        };

        this._notifications.update(notifications => {
            const updated = [notification, ...notifications];
            // Keep only the most recent notifications
            const trimmed = updated.slice(0, this.MAX_NOTIFICATIONS);
            this.saveToStorage(trimmed);
            return trimmed;
        });
    }

    /**
     * Mark a notification as read
     */
    markAsRead(id: string): void {
        this._notifications.update(notifications => {
            const updated = notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            );
            this.saveToStorage(updated);
            return updated;
        });
    }

    /**
     * Mark all notifications as read
     */
    markAllAsRead(): void {
        this._notifications.update(notifications => {
            const updated = notifications.map(n => ({ ...n, read: true }));
            this.saveToStorage(updated);
            return updated;
        });
    }

    /**
     * Delete a notification
     */
    delete(id: string): void {
        this._notifications.update(notifications => {
            const updated = notifications.filter(n => n.id !== id);
            this.saveToStorage(updated);
            return updated;
        });
    }

    /**
     * Delete all notifications
     */
    deleteAll(): void {
        this._notifications.set([]);
        this.saveToStorage([]);
    }

    /**
     * Get recent unread notifications (for dropdown)
     */
    getRecentUnread(limit: number = 5): Notification[] {
        return this._notifications()
            .filter(n => !n.read)
            .slice(0, limit);
    }

    /**
     * Format timestamp for display
     */
    formatTimestamp(timestamp: string): string {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        if (diffMins < 10080) return `${Math.floor(diffMins / 1440)}d ago`;

        return date.toLocaleDateString();
    }

    // Private helper methods
    private generateId(): string {
        return `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }

    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const notifications = JSON.parse(stored) as Notification[];
                this._notifications.set(notifications);
            }
        } catch (error) {
            console.error('Failed to load notifications from storage:', error);
        }
    }

    private saveToStorage(notifications: Notification[]): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifications));
        } catch (error) {
            console.error('Failed to save notifications to storage:', error);
        }
    }
}
