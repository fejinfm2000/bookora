import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { ActivityLogService, ActivityLog } from '../../core/services/activity-log.service';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="admin-container">
      <div class="admin-header">
        <h1 class="admin-title">Admin Dashboard</h1>
        <div class="admin-welcome">
          Welcome, Admin! <span class="admin-badge">👑</span>
        </div>
      </div>

      <!-- Tabs -->
      <div class="admin-tabs">
        <button 
          (click)="activeTab.set('activity')" 
          [class.active]="activeTab() === 'activity'"
          class="tab-btn"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Activity Log
        </button>
        <button 
          (click)="activeTab.set('stats')" 
          [class.active]="activeTab() === 'stats'"
          class="tab-btn"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Statistics
        </button>
      </div>

      <!-- Activity Log Tab -->
      @if (activeTab() === 'activity') {
        <div class="admin-content">
          <div class="content-header">
            <h2 class="section-title">Activity Log</h2>
            <div class="filters">
              <select [(ngModel)]="filterAction" (change)="applyFilters()" class="filter-select">
                <option value="">All Actions</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
              </select>
              <select [(ngModel)]="filterType" (change)="applyFilters()" class="filter-select">
                <option value="">All Types</option>
                <option value="book">Books</option>
                <option value="feed">Feed Posts</option>
                <option value="page">Pages</option>
              </select>
            </div>
          </div>

          @if (loading()) {
            <div class="loading-state">
              <div class="spinner-large"></div>
              <p>Loading activity logs...</p>
            </div>
          } @else if (filteredLogs().length === 0) {
            <div class="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No activity logs found</p>
            </div>
          } @else {
            <div class="activity-table-container">
              <table class="activity-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Resource</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  @for (log of filteredLogs(); track log.id) {
                    <tr>
                      <td class="time-cell">{{ formatTime(log.timestamp) }}</td>
                      <td class="user-cell">{{ log.userEmail }}</td>
                      <td>
                        <span class="action-badge" [class]="'action-' + log.action">
                          {{ log.action }}
                        </span>
                      </td>
                      <td>
                        <span class="resource-badge">{{ log.resourceType }}</span>
                      </td>
                      <td class="details-cell">{{ log.resourceName || log.resourceId || '-' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }

      <!-- Statistics Tab -->
      @if (activeTab() === 'stats') {
        <div class="admin-content">
          <h2 class="section-title">Platform Statistics</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">📚</div>
              <div class="stat-value">{{ stats.totalLogs }}</div>
              <div class="stat-label">Total Activities</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">✏️</div>
              <div class="stat-value">{{ stats.createCount }}</div>
              <div class="stat-label">Items Created</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🔄</div>
              <div class="stat-value">{{ stats.updateCount }}</div>
              <div class="stat-label">Updates Made</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🗑️</div>
              <div class="stat-value">{{ stats.deleteCount }}</div>
              <div class="stat-label">Items Deleted</div>
            </div>
          </div>

          <div class="recent-activity">
            <h3>Recent Activity</h3>
            @for (log of filteredLogs().slice(0, 5); track log.id) {
              <div class="activity-item">
                <span class="activity-time">{{ formatTime(log.timestamp) }}</span>
                <span class="activity-description">
                  <strong>{{ log.userEmail }}</strong> {{ log.action }}d a {{ log.resourceType }}
                  @if (log.resourceName) {
                    - "{{ log.resourceName }}"
                  }
                </span>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
    styles: [`
    .admin-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 2px solid var(--border-color);
    }

    .admin-title {
      font-size: 2rem;
      font-weight: 800;
      color: var(--text-main);
      margin: 0;
    }

    .admin-welcome {
      font-size: 1rem;
      color: var(--text-muted);
    }

    .admin-badge {
      font-size: 1.5rem;
    }

    .admin-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 2rem;
      border-bottom: 1px solid var(--border-color);
    }

    .tab-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: transparent;
      border: none;
      border-bottom: 3px solid transparent;
      color: var(--text-muted);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .tab-btn svg {
      width: 20px;
      height: 20px;
    }

    .tab-btn.active {
      color: var(--primary);
      border-bottom-color: var(--primary);
    }

    .tab-btn:hover {
      color: var(--text-main);
    }

    .admin-content {
      background: var(--bg-card);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: var(--shadow-md);
    }

    .content-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
    }

    .filters {
      display: flex;
      gap: 1rem;
    }

    .activity-table-container {
      overflow-x: auto;
    }

    .activity-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
    }

    .activity-table th {
      text-align: left;
      padding: 1rem;
      background: var(--bg-main);
      font-weight: 600;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      border-bottom: 2px solid var(--border-color);
    }

    .activity-table td {
      padding: 1rem;
      border-bottom: 1px solid var(--border-color);
    }

    .activity-table tbody tr:hover {
      background: var(--bg-main);
    }

    .action-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .action-create {
      background: rgba(34, 197, 94, 0.1);
      color: #22c55e;
    }

    .action-update {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }

    .action-delete {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .resource-badge {
      padding: 0.25rem 0.75rem;
      background: var(--bg-main);
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .empty-state, .loading-state {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--text-muted);
    }

    .empty-state svg, .loading-state svg {
      width: 64px;
      height: 64px;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: var(--bg-main);
      padding: 1.5rem;
      border-radius: 12px;
      text-align: center;
    }

    .stat-icon {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 0.5rem;
    }

    .stat-label {
      color: var(--text-muted);
      font-size: 0.875rem;
    }

    .recent-activity h3 {
      font-size: 1.25rem;
      margin-bottom: 1rem;
    }

    .activity-item {
      padding: 1rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      gap: 1rem;
    }

    .activity-time {
      color: var(--text-muted);
      font-size: 0.875rem;
      min-width: 150px;
    }

    .spinner-large {
      width: 48px;
      height: 48px;
      border: 4px solid var(--border-color);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
    adminService = inject(AdminService);
    activityService = inject(ActivityLogService);

    activeTab = signal<'activity' | 'stats'>('activity');
    loading = signal(true);
    allLogs = signal<ActivityLog[]>([]);
    filteredLogs = signal<ActivityLog[]>([]);

    filterAction = '';
    filterType = '';

    stats = {
        totalLogs: 0,
        createCount: 0,
        updateCount: 0,
        deleteCount: 0
    };

    ngOnInit() {
        this.loadActivityLogs();
    }

    loadActivityLogs() {
        this.loading.set(true);
        this.activityService.getActivityLogs().subscribe({
            next: (logs) => {
                this.allLogs.set(logs);
                this.filteredLogs.set(logs);
                this.calculateStats(logs);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Failed to load activity logs:', err);
                this.loading.set(false);
            }
        });
    }

    applyFilters() {
        let filtered = this.allLogs();

        if (this.filterAction) {
            filtered = filtered.filter(log => log.action === this.filterAction);
        }

        if (this.filterType) {
            filtered = filtered.filter(log => log.resourceType === this.filterType);
        }

        this.filteredLogs.set(filtered);
    }

    calculateStats(logs: ActivityLog[]) {
        this.stats.totalLogs = logs.length;
        this.stats.createCount = logs.filter(l => l.action === 'create').length;
        this.stats.updateCount = logs.filter(l => l.action === 'update').length;
        this.stats.deleteCount = logs.filter(l => l.action === 'delete').length;
    }

    formatTime(timestamp: string): string {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;

        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}
