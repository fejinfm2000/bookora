import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { Book } from '../../shared/models/book.model';
import { GithubService } from './github.service';
import { AuthService } from '../auth/auth.service';

export interface FeedItem {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    content: string;
    image?: string;
    timestamp: string;
    likes: number;
    comments: number;
    shares: number;
    hasLiked?: boolean;
    images?: string[]; // Multiple images support
}

@Injectable({
    providedIn: 'root'
})
export class SocialService {
    private http = inject(HttpClient);
    private github = inject(GithubService);
    private auth = inject(AuthService);

    private readonly FEED_PATH = 'src/assets/data/feed.json';

    private feedItemsSubject = new BehaviorSubject<FeedItem[]>([]);
    feedItems$ = this.feedItemsSubject.asObservable();

    feed = signal<FeedItem[]>([]);
    loading = signal<boolean>(false);

    constructor() {
        this.refreshFeed();
    }

    refreshFeed() {
        this.loading.set(true);
        if (!this.github.isConfigured()) {
            this.http.get<FeedItem[]>('assets/data/feed.json').subscribe({
                next: items => {
                    this.feed.set(items);
                    this.feedItemsSubject.next(items);
                    this.loading.set(false);
                },
                error: err => {
                    console.error('Failed to load local feed', err);
                    this.loading.set(false);
                }
            });
            return;
        }

        this.github.getFile<FeedItem[]>(this.FEED_PATH).subscribe({
            next: (fileData: any) => {
                if (fileData) {
                    this.feed.set(fileData.content);
                    this.feedItemsSubject.next(fileData.content);
                }
                this.loading.set(false);
            },
            error: (err: any) => {
                console.error('Failed to load feed', err);
                this.loading.set(false);
            }
        });
    }

    private saveFeed(items: FeedItem[]) {
        if (!this.github.isConfigured()) return;

        this.github.getFile<FeedItem[]>(this.FEED_PATH).pipe(
            switchMap((fileData: any) => {
                const sha = fileData ? fileData.sha : null;
                return this.github.saveFile(this.FEED_PATH, items, sha, 'Update social feed');
            })
        ).subscribe({
            error: (err: any) => console.error('Failed to save feed', err)
        });
    }

    getFeed(): Observable<FeedItem[]> {
        return this.feedItems$;
    }

    toggleLike(postId: string) {
        const updatedFeed = this.feed().map(item => {
            if (item.id === postId) {
                const hasLiked = !item.hasLiked;
                return {
                    ...item,
                    hasLiked,
                    likes: hasLiked ? item.likes + 1 : item.likes - 1
                };
            }
            return item;
        });

        this.feed.set(updatedFeed);
        this.feedItemsSubject.next(updatedFeed);
        this.saveFeed(updatedFeed);
    }

    addPost(content: string, images?: string[]) {
        const user = this.auth.currentUser();
        const newPost: FeedItem = {
            id: 'f' + Date.now(),
            userId: user?.email || 'anonymous',
            userName: user?.email?.split('@')[0] || 'User',
            userAvatar: (user?.email?.[0] || 'U').toUpperCase(),
            content,
            images: images || [],
            image: images?.[0], // For backward compatibility
            timestamp: new Date().toISOString(),
            likes: 0,
            comments: 0,
            shares: 0,
            hasLiked: false
        };

        const updatedFeed = [newPost, ...this.feed()];
        this.feed.set(updatedFeed);
        this.feedItemsSubject.next(updatedFeed);
        this.saveFeed(updatedFeed);
    }

    deletePost(postId: string) {
        const updatedFeed = this.feed().filter(item => item.id !== postId);
        this.feed.set(updatedFeed);
        this.feedItemsSubject.next(updatedFeed);
        this.saveFeed(updatedFeed);
    }

    updatePost(postId: string, content: string, images?: string[]) {
        const updatedFeed = this.feed().map(item => {
            if (item.id === postId) {
                return {
                    ...item,
                    content,
                    images: images || item.images,
                    image: (images && images.length > 0) ? images[0] : item.image
                };
            }
            return item;
        });
        this.feed.set(updatedFeed);
        this.feedItemsSubject.next(updatedFeed);
        this.saveFeed(updatedFeed);
    }

    sharePost(postId: string) {
        const updatedFeed = this.feed().map(item => {
            if (item.id === postId) {
                return { ...item, shares: item.shares + 1 };
            }
            return item;
        });
        this.feed.set(updatedFeed);
        this.feedItemsSubject.next(updatedFeed);
        this.saveFeed(updatedFeed);
    }

    addComment(postId: string) {
        const updatedFeed = this.feed().map(item => {
            if (item.id === postId) {
                return { ...item, comments: item.comments + 1 };
            }
            return item;
        });
        this.feed.set(updatedFeed);
        this.feedItemsSubject.next(updatedFeed);
        this.saveFeed(updatedFeed);
    }
}
