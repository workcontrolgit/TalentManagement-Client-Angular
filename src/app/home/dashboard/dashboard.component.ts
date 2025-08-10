import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil, timer, switchMap, startWith } from 'rxjs';
import { DashboardService, DashboardStats } from './dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [CommonModule, RouterLink],
})
export class DashboardComponent implements OnInit, OnDestroy {
  itemList: DashboardStats[] = [];
  isLoading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.setupAutoRefresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardStats(): void {
    this.isLoading = true;
    this.error = null;

    this.dashboardService
      .getDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats: DashboardStats) => {
          this.itemList = [stats];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading dashboard stats:', error);
          this.error = 'Failed to load dashboard statistics';
          this.isLoading = false;
          // Set fallback data on error
          this.itemList = [
            {
              position_count: 0,
              employee_count: 0,
              assignment_count: 0,
              salaryrange_count: 0,
            },
          ];
        },
      });
  }

  private setupAutoRefresh(): void {
    // Refresh every 30 seconds
    timer(30000, 30000)
      .pipe(
        startWith(0),
        switchMap(() => this.dashboardService.getDashboardStats()),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (stats: DashboardStats) => {
          this.itemList = [stats];
          this.isLoading = false;
          this.error = null;
        },
        error: (error) => {
          console.error('Error refreshing dashboard stats:', error);
          // Don't show error on refresh failures, keep existing data
        },
      });
  }

  refreshStats(): void {
    this.loadDashboardStats();
  }
}
