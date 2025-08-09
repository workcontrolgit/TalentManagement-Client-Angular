import { Component, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

import { SalaryRange } from '@shared/interfaces/salaryrange';
import { ApiHttpService } from '@app/services/api/api-http.service';
import { ApiEndpointsService } from '@app/services/api/api-endpoints.service';
import { DataTablesResponse } from '@shared/interfaces/data-tables-response';
import { ModalService } from '@app/services/modal/modal.service';
import { BreadcrumbComponent, BreadcrumbItem } from '@app/@shared/breadcrumb/breadcrumb.component';

import { Logger } from '@app/core';

import { DataTablesModule } from 'angular-datatables';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';

const log = new Logger('SalaryRange');

@Component({
  selector: 'app-salaryrange-list',
  templateUrl: './salaryrange-list.component.html',
  styleUrls: ['./salaryrange-list.component.scss'],
  imports: [DataTablesModule, BreadcrumbComponent, RouterLink, DecimalPipe],
  standalone: true,
})
export class SalaryRangeListComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  private _salaryRanges = signal<SalaryRange[]>([]); // For grid view
  private _tableData = signal<SalaryRange[]>([]); // For DataTables view
  private _viewMode = signal<'grid' | 'table'>('grid');
  private _isLoading = signal<boolean>(true);

  salaryRanges = computed(() => this._salaryRanges());
  tableData = computed(() => this._tableData());
  viewMode = computed(() => this._viewMode());
  isLoading = computed(() => this._isLoading());

  message = '';

  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', link: '/home', icon: 'fas fa-home' },
    { label: 'Salary Ranges', icon: 'fas fa-dollar-sign' },
  ];

  constructor(
    private apiHttpService: ApiHttpService,
    private apiEndpointsService: ApiEndpointsService,
    private modalService: ModalService,
    private router: Router,
  ) {}

  wholeRowClick(salaryRange: SalaryRange): void {
    this.viewSalaryRange(new Event('click'), salaryRange);
    log.debug('Whole row clicked.', salaryRange);
  }

  viewSalaryRange(event: Event, salaryRange: SalaryRange): void {
    event.stopPropagation();
    let modalTitle = 'Salary Range Detail';
    this.modalService.OpenSalaryRangeDetailDialog(modalTitle, salaryRange);
    log.debug('View salary range clicked.', salaryRange);
  }

  editSalaryRange(event: Event, salaryRange: SalaryRange): void {
    event.stopPropagation();
    this.router.navigate(['/salaryrange/edit', salaryRange.id]);
  }

  deleteSalaryRange(event: Event, salaryRange: SalaryRange): void {
    event.stopPropagation();
    if (confirm(`Are you sure you want to delete the salary range "${salaryRange.name}"?`)) {
      this.apiHttpService.delete(this.apiEndpointsService.deleteSalaryRangeByIdEndpoint(salaryRange.id)).subscribe({
        next: () => {
          this.loadSalaryRangeData();
          log.info('Salary range deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting salary range:', error);
          log.error('Error deleting salary range:', error);
        },
      });
    }
  }

  ngOnInit() {
    this.loadSalaryRangeData();

    this.dtOptions = {
      pagingType: 'simple_numbers',
      pageLength: 10,
      serverSide: true,
      processing: false, // Disable processing indicator to prevent stuck dots
      ajax: (dataTablesParameters: any, callback: any) => {
        this.apiHttpService
          .post(this.apiEndpointsService.postSalaryRangesPagedEndpoint(), dataTablesParameters)
          .subscribe({
            next: (resp: DataTablesResponse) => {
              this._tableData.set(
                resp.data.map((sr: SalaryRange) => ({
                  ...sr,
                  positions: sr.positions || [],
                })),
              );
              callback({
                recordsTotal: resp.recordsTotal,
                recordsFiltered: resp.recordsFiltered,
                data: resp.data,
              });
            },
            error: (error) => {
              console.error('Error loading DataTables data:', error);
              callback({
                recordsTotal: 0,
                recordsFiltered: 0,
                data: [],
              });
            },
          });
      },
      columns: [
        {
          title: 'Name',
          data: null,
          render: (data: any, type: any, row: any) => {
            return row.name || '';
          },
        },
        {
          title: 'Minimum Salary',
          data: null,
          render: (data: any, type: any, row: any) => {
            return `$${row.minSalary?.toLocaleString() || '0'}`;
          },
        },
        {
          title: 'Maximum Salary',
          data: null,
          render: (data: any, type: any, row: any) => {
            return `$${row.maxSalary?.toLocaleString() || '0'}`;
          },
        },
        {
          title: 'Range',
          data: null,
          orderable: false,
          render: (data: any, type: any, row: any) => {
            const range = (row.maxSalary || 0) - (row.minSalary || 0);
            return `$${range.toLocaleString()}`;
          },
        },
        {
          title: 'Positions',
          data: null,
          orderable: false,
          render: (data: any, type: any, row: any) => {
            const positionCount = row.positions?.length || 0;
            return `${positionCount}`;
          },
        },
        {
          title: 'Created',
          data: null,
          render: (data: any, type: any, row: any) => {
            return row.created ? new Date(row.created).toLocaleDateString() : '';
          },
        },
        {
          title: 'Action',
          data: null,
          orderable: false,
          render: () => {
            return (
              '<button class="btn btn-sm btn-outline-primary me-1"><i class="fas fa-edit"></i></button>' +
              '<button class="btn btn-sm btn-outline-danger"><i class="fas fa-trash"></i></button>'
            );
          },
        },
      ],
    };
  }

  setViewMode(mode: 'grid' | 'table') {
    this._viewMode.set(mode);
  }

  getPositionCount(salaryRange: SalaryRange): number {
    return salaryRange.positions?.length ?? 0;
  }

  private loadSalaryRangeData() {
    const initialRequest = {
      draw: 1,
      start: 0,
      length: 50,
      search: { value: '', regex: false },
      order: [],
      columns: [],
    };

    this.apiHttpService.post(this.apiEndpointsService.postSalaryRangesPagedEndpoint(), initialRequest).subscribe({
      next: (resp: DataTablesResponse) => {
        this._salaryRanges.set(
          resp.data.map((sr: SalaryRange) => ({
            ...sr,
            positions: sr.positions || [],
          })),
        );
        this._isLoading.set(false);
      },
      error: (error) => {
        this._isLoading.set(false);
        console.error('Error loading salary range data:', error);
        log.error('Error loading salary range data:', error);
        this._salaryRanges.set([]);
      },
    });
  }
}
