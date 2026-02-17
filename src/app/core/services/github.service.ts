import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, of, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';


// CONFIGURATION
const GITHUB_TOKEN = environment.github.token;
const REPO_OWNER = environment.github.owner;
const REPO_NAME = environment.github.repo;

@Injectable({
    providedIn: 'root'
})
export class GithubService {
    private http = inject(HttpClient);
    private apiUrl = 'https://api.github.com';

    constructor() {
        console.log('GithubService initialized. Configured:', this.isConfigured());
        if (!this.isConfigured()) {
            console.warn('GitHub Configuration Missing:', {
                token: !!GITHUB_TOKEN,
                owner: !!REPO_OWNER,
                repo: !!REPO_NAME
            });
        }
    }

    private get headers(): HttpHeaders {
        return new HttpHeaders({
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        });
    }

    /**
     * Check if the service is configured
     */
    isConfigured(): boolean {
        return !!GITHUB_TOKEN && !!REPO_OWNER && !!REPO_NAME;
    }

    /**
     * Helper to encode UTF-8 string to Base64
     */
    private utf8ToBase64(str: string): string {
        try {
            const bytes = new TextEncoder().encode(str);
            const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("");
            return btoa(binString);
        } catch (e) {
            console.error('Error encoding string to Base64:', e);
            throw new Error('Failed to encode content');
        }
    }

    /**
     * Helper to decode Base64 to UTF-8 string
     */
    private base64ToUtf8(base64: string): string {
        try {
            const binString = atob(base64.replace(/\s/g, ''));
            const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
            return new TextDecoder().decode(bytes);
        } catch (e) {
            console.error('Error decoding Base64 to string:', e);
            throw new Error('Failed to decode content');
        }
    }

    /**
     * Get file content from GitHub
     * Returns parsed JSON content and SHA
     */
    getFile<T>(path: string): Observable<{ content: T, sha: string } | null> {
        // Local development fallback: if GitHub is not configured, load the file
        // directly from the `assets` folder so features like login work without a token.
        if (!this.isConfigured()) {
            const localPath = path.replace(/^src\//, '');
            const localUrl = localPath.startsWith('assets/') ? localPath : `assets/${localPath}`;
            return this.http.get<T>(localUrl).pipe(
                map(content => ({ content: content as T, sha: '' })),
                catchError(err => {
                    console.error(`Local getFile Error [${localUrl}]:`, err);
                    if (err.status === 404) return of(null as any);
                    return throwError(() => err);
                })
            );
        }

        const url = `${this.apiUrl}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;

        return this.http.get<any>(url, { headers: this.headers }).pipe(
            switchMap(response => {
                // Handle large files (> 1MB) where content is not included in the response
                if (response.type === 'file' && !response.content && response.sha) {
                    console.log(`GitHub: File ${path} is large, fetching blob ${response.sha}`);
                    const blobUrl = `${this.apiUrl}/repos/${REPO_OWNER}/${REPO_NAME}/git/blobs/${response.sha}`;
                    return this.http.get<any>(blobUrl, { headers: this.headers }).pipe(
                        map(blobResponse => ({
                            content: this.base64ToUtf8(blobResponse.content),
                            sha: response.sha
                        }))
                    );
                }
                return of({
                    content: this.base64ToUtf8(response.content),
                    sha: response.sha
                });
            }),
            map(data => {
                try {
                    const jsonContent = JSON.parse(data.content);
                    return { content: jsonContent as T, sha: data.sha };
                } catch (e) {
                    console.error('Error parsing JSON from GitHub', e);
                    throw new Error('Invalid JSON content in file');
                }
            }),
            catchError(error => {
                console.error(`GitHub getFile Error [${path}]:`, error.status, error.message);
                if (error.status === 404) {
                    return of(null); // File not found is null, not error
                }
                return throwError(() => error);
            })
        );
    }

    /**
     * Create or Update a file
     * If SHA is provided, it updates. If not, it creates.
     */
    saveFile(path: string, content: any, sha: string | null, message: string): Observable<any> {
        if (!this.isConfigured()) return throwError(() => new Error('GitHub not configured'));

        const url = `${this.apiUrl}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;

        // Ensure content is valid JSON before encoding
        let jsonString: string;
        try {
            jsonString = JSON.stringify(content, null, 2);
        } catch (e) {
            console.error('Error stringifying content for GitHub:', e);
            return throwError(() => new Error('Failed to serialize content'));
        }

        const encodedContent = this.utf8ToBase64(jsonString);

        const body: any = {
            message: message,
            content: encodedContent
        };

        if (sha) {
            body.sha = sha;
        }

        return this.http.put(url, body, { headers: this.headers }).pipe(
            catchError(error => {
                console.error(`GitHub saveFile Error [${path}]:`, error.status, error.message);
                return throwError(() => error);
            })
        );
    }

    /**
     * Delete a file
     */
    deleteFile(path: string, sha: string, message: string): Observable<any> {
        if (!this.isConfigured()) return throwError(() => new Error('GitHub not configured'));

        const url = `${this.apiUrl}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;

        const body = {
            message: message,
            sha: sha
        };

        // DELETE request with body needs special handling in Angular HttpClient
        // or passing "body" property in options
        return this.http.delete(url, {
            headers: this.headers,
            body: body
        });
    }

    /**
     * List files in a directory
     */
    listFiles(path: string): Observable<any[]> {
        if (!this.isConfigured()) return throwError(() => new Error('GitHub not configured'));

        const url = `${this.apiUrl}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
        return this.http.get<any[]>(url, { headers: this.headers });
    }
}
