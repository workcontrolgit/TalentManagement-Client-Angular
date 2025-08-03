import { Component, OnInit, signal, computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Position } from '@shared/interfaces/position';
import { ApiHttpService } from '@app/services/api/api-http.service';
import { ApiEndpointsService } from '@app/services/api/api-endpoints.service';
import { DataTablesResponse } from '@shared/interfaces/data-tables-response';
import { Logger } from '@app/core';

import { Router, RouterLink } from '@angular/router';

import { DataTablesModule } from 'angular-datatables';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

const log = new Logger('Position');
@Component({
  selector: 'app-position-list',
  templateUrl: './position-list.component.html',
  styleUrls: ['./position-list.component.scss'],
  imports: [RouterLink, DataTablesModule, NgbTooltipModule, CommonModule],
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

  ngOnInit(): void {
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
                data: [],
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
          data: 'PositionNumber',
        },
        {
          title: 'Position Title',
          data: 'PositionTitle',
        },
        {
          title: 'Department',
          data: 'Department',
        },
        {
          title: 'Salary Range (min-max)',
          data: '',
        },
      ],
      columnDefs: [
        { orderable: true, targets: 0 }, // Enable sorting on first column
        { orderable: true, targets: 1 }, // Enable sorting on second column
        { orderable: true, targets: 2 }, // Disable sorting on third column
        { orderable: false, targets: 3 }, // Enable sorting on fourth column
        //   // Specify orderable for other columns as needed
      ],
    };
  }
}
