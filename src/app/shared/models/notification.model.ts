export interface Notification {
    id: string;
    type: 'new_book' | 'new_post' | 'comment' | 'like';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    actionUrl?: string;
    imageUrl?: string;
}
