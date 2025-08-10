import { Component, OnInit } from '@angular/core';

import { Employee } from '@shared/interfaces/employee';
import { ApiHttpService } from '@app/services/api/api-http.service';
import { ApiEndpointsService } from '@app/services/api/api-endpoints.service';
import { DataTablesResponse } from '@shared/interfaces/data-tables-response';
import { ModalService } from '@app/services/modal/modal.service';
import { ExportService } from '@app/services/export/export.service';
import { BreadcrumbComponent, BreadcrumbItem } from '@app/@shared/breadcrumb/breadcrumb.component';

import { Logger } from '@app/core';

import { DataTablesModule } from 'angular-datatables';
import { RouterLink } from '@angular/router';

const log = new Logger('Employee');

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
  imports: [DataTablesModule, BreadcrumbComponent, RouterLink],
})
export class EmployeeListComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  employees: Employee[] = [];
  message = '';
  viewMode: 'grid' | 'table' = 'grid';
  isLoading = true;

  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', link: '/home', icon: 'fas fa-home' },
    { label: 'Employees', icon: 'fa-solid fa-people-group' },
  ];

  constructor(
    private apiHttpService: ApiHttpService,
    private apiEndpointsService: ApiEndpointsService,
    private modalService: ModalService,
    private exportService: ExportService,
  ) {}

  wholeRowClick(employee: Employee): void {
    let modalTitle = 'Employee Detail';

    this.openModal(modalTitle, employee);

    log.debug('Whole row clicked.', employee);
  }

  ngOnInit() {
    // Load initial employee data for grid view
    this.loadEmployeeData();

    this.dtOptions = {
      pagingType: 'simple_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback: any) => {
        // Call WebAPI to get employees
        this.apiHttpService
          .post(this.apiEndpointsService.postEmployeesPagedEndpoint(), dataTablesParameters)
          .subscribe((resp: DataTablesResponse) => {
            this.employees = resp.data;
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: resp.data,
            });
          });
      },
      // Set column title and data field
      columns: [
        {
          title: 'Name',
          data: null,
          render: (data: any, type: any, row: any) => {
            return `${row.firstName || ''} ${row.lastName || ''}`;
          },
        },
        {
          title: 'Title',
          data: null,
          render: (data: any, type: any, row: any) => {
            return row.position?.positionTitle || '';
          },
        },
        {
          title: 'Email',
          data: null,
          render: (data: any, type: any, row: any) => {
            return row.email || '';
          },
        },
        {
          title: 'Action',
          data: null,
          orderable: false,
          render: () => {
            return '<button class="btn btn-sm btn-outline-primary">View</button>';
          },
        },
      ],
    };
  }

  openModal(title: string, employee: Employee) {
    this.modalService.OpenEmployeeDetailDialog(title, employee);
  }

  setViewMode(mode: 'grid' | 'table') {
    this.viewMode = mode;
  }

  private loadEmployeeData() {
    // Create a simple request for initial load (first page, no filters)
    const initialRequest = {
      draw: 1,
      start: 0,
      length: 50, // Load more employees for grid view
      search: { value: '', regex: false },
      order: [],
      columns: [],
    };

    this.apiHttpService.post(this.apiEndpointsService.postEmployeesPagedEndpoint(), initialRequest).subscribe({
      next: (resp: DataTablesResponse) => {
        this.employees = resp.data;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading employee data:', error);
        // Set some fallback data or show error state
        this.employees = [];
      },
    });
  }

  exportToExcel(): void {
    if (this.employees && this.employees.length > 0) {
      this.exportService.exportEmployeesToExcel(this.employees);
    } else {
      console.warn('No employee data to export');
    }
  }
}
