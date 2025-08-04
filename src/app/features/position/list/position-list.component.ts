import { Component, OnInit, signal, computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Position } from '@shared/interfaces/position';
import { ApiHttpService } from '@app/services/api/api-http.service';
import { ApiEndpointsService } from '@app/services/api/api-endpoints.service';
import { DataTablesResponse } from '@shared/interfaces/data-tables-response';
import { Logger } from '@app/core';
import { BreadcrumbComponent, BreadcrumbItem } from '@app/@shared/breadcrumb/breadcrumb.component';

import { Router, RouterLink } from '@angular/router';

import { DataTablesModule } from 'angular-datatables';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

declare var $: any;

const log = new Logger('Position');
@Component({
  selector: 'app-position-list',
  templateUrl: './position-list.component.html',
  styleUrls: ['./position-list.component.scss'],
  imports: [RouterLink, DataTablesModule, NgbTooltipModule, CommonModule, BreadcrumbComponent],
  standalone: true,
})
export class PositionListComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly apiHttpService = inject(ApiHttpService);
  private readonly apiEndpointsService = inject(ApiEndpointsService);
  private readonly router = inject(Router);

  dtOptions: DataTables.Settings = {};

  // Modern signal-based state management
  readonly positions = signal<Position[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // View mode management
  viewMode: 'grid' | 'table' = 'grid';

  // Breadcrumb navigation
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', link: '/home', icon: 'fas fa-home' },
    { label: 'Positions', icon: 'fas fa-briefcase' },
  ];

  // Computed properties
  readonly hasPositions = computed(() => this.positions().length > 0);
  readonly displayMessage = computed(() => {
    if (this.isLoading()) return 'Loading positions...';
    if (this.error()) return this.error();
    if (!this.hasPositions()) return 'No positions available';
    return '';
  });

  wholeRowClick(position: Position): void {
    if (!position?.id) {
      log.error('Invalid position selected');
      this.error.set('Invalid position selected');
      return;
    }

    this.router.navigate(['/position/detail', { id: position.id }]);
    log.debug('Navigation to position detail:', position.id);
  }

  setViewMode(mode: 'grid' | 'table'): void {
    this.viewMode = mode;
  }

  private loadPositionData(): void {
    const initialRequest = {
      draw: 1,
      start: 0,
      length: 50,
      search: { value: '', regex: false },
      order: [{ column: 0, dir: 'asc' }],
      columns: [],
    };

    this.isLoading.set(true);
    this.apiHttpService
      .post(this.apiEndpointsService.postPositionsPagedEndpoint(), initialRequest)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: DataTablesResponse) => {
          this.positions.set(resp.data || []);
          this.isLoading.set(false);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.error.set('Failed to load positions. Please try again.');
          log.error('Error loading positions:', error);
        },
      });
  }

  ngOnInit(): void {
    this.loadPositionData();
    this.dtOptions = {
      pagingType: 'simple_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback: (data: any) => void) => {
        this.isLoading.set(true);
        this.error.set(null);

        this.apiHttpService
          .post(this.apiEndpointsService.postPositionsPagedEndpoint(), dataTablesParameters)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (resp: DataTablesResponse) => {
              this.positions.set(resp.data || []);
              this.isLoading.set(false);
              callback({
                recordsTotal: resp.recordsTotal || 0,
                recordsFiltered: resp.recordsFiltered || 0,
                data: resp.data || [],
              });
              log.debug('Positions loaded successfully', resp.data?.length);
            },
            error: (error) => {
              this.isLoading.set(false);
              this.error.set('Failed to load positions. Please try again.');
              log.error('Error loading positions:', error);
              callback({
                recordsTotal: 0,
                recordsFiltered: 0,
                data: [],
              });
            },
          });
      },
      // Set column title and data field
      columns: [
        {
          title: 'Position Number',
          data: null,
          render: (data: any, type: any, row: any) => {
            return `<span class="position-number">${row.positionNumber || ''}</span>`;
          },
        },
        {
          title: 'Title',
          data: null,
          className: 'position-cell',
          render: (data: any, type: any, row: any) => {
            return `
              <div class="position-info-inline">
                <div class="icon-small">
                  <i class="fas fa-briefcase"></i>
                </div>
                <div class="info-text">
                  <div class="name">${row.positionTitle || ''}</div>
                </div>
              </div>
            `;
          },
        },
        {
          title: 'Department',
          data: null,
          render: (data: any, type: any, row: any) => {
            return `<div class="department-badge">${row.department?.name || ''}</div>`;
          },
        },
        {
          title: 'Salary Range',
          data: null,
          render: (data: any, type: any, row: any) => {
            const minSalary = row.salaryRange?.minSalary || 0;
            const maxSalary = row.salaryRange?.maxSalary || 0;
            return `
              <div class="salary-info">
                <div class="range">$${minSalary} - $${maxSalary}</div>
              </div>
            `;
          },
        },
        {
          title: 'Action',
          data: null,
          orderable: false,
          render: () => {
            return `
              <div class="table-actions">
                <button class="table-action-btn" title="View Details">
                  <i class="fas fa-eye"></i>
                </button>
              </div>
            `;
          },
        },
      ],
      columnDefs: [
        { orderable: true, targets: 0 }, // Enable sorting on Position Number
        { orderable: true, targets: 1 }, // Enable sorting on Title
        { orderable: true, targets: 2 }, // Enable sorting on Department
        { orderable: false, targets: 3 }, // Disable sorting on Salary Range
        { orderable: false, targets: 4 }, // Disable sorting on Action
      ],
      rowCallback: (row: Node, data: any) => {
        // Add CSS class for styling
        $(row).addClass('table-row');

        // Add click event to action buttons
        $('td:last-child button', row)
          .off('click')
          .on('click', (e: any) => {
            e.stopPropagation();
            this.wholeRowClick(data);
          });

        // Add click event to entire row (excluding action buttons)
        $(row)
          .off('click')
          .on('click', (e: any) => {
            if (!$(e.target).closest('button').length) {
              this.wholeRowClick(data);
            }
          });

        return row;
      },
    };
  }
}
