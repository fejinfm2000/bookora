import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, of, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

// CONFIGURATION - TODO: Move to environment/config or user input
const GITHUB_TOKEN = ''; // User needs to provide this
const REPO_OWNER = '';   // User needs to provide this
const REPO_NAME = '';    // User needs to provide this

@Injectable({
    providedIn: 'root'
})
export class GithubService {
    private http = inject(HttpClient);
    private apiUrl = 'https://api.github.com';

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
     * Get file content from GitHub
     * Returns parsed JSON content and SHA
     */
    getFile<T>(path: string): Observable<{ content: T, sha: string } | null> {
        if (!this.isConfigured()) return throwError(() => new Error('GitHub not configured'));

        const url = `${this.apiUrl}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;

        return this.http.get<any>(url, { headers: this.headers }).pipe(
            map(response => {
                // GitHub API returns content in Base64
                // We need to decode it
                // Note: Generic unicode decoder for robustness
                const rawContent = atob(response.content.replace(/\s/g, ''));
                try {
                    // Attempt to parse JSON
                    // Handle UTF-8 characters properly
                    const jsonContent = JSON.parse(decodeURIComponent(escape(rawContent)));
                    return { content: jsonContent as T, sha: response.sha };
                } catch (e) {
                    console.error('Error parsing JSON from GitHub', e);
                    throw new Error('Invalid JSON content in file');
                }
            }),
            catchError(error => {
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

        // Encode content to Base64 (handling UTF-8)
        const jsonString = JSON.stringify(content, null, 2);
        const encodedContent = btoa(unescape(encodeURIComponent(jsonString)));

        const body: any = {
            message: message,
            content: encodedContent
        };

        if (sha) {
            body.sha = sha;
        }

        return this.http.put(url, body, { headers: this.headers });
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
