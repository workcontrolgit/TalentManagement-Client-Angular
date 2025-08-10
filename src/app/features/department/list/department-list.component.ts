import { Component, OnInit } from '@angular/core';

import { Department } from '@shared/interfaces/department';
import { ApiHttpService } from '@app/services/api/api-http.service';
import { ApiEndpointsService } from '@app/services/api/api-endpoints.service';
import { DataTablesResponse } from '@shared/interfaces/data-tables-response';
import { ModalService } from '@app/services/modal/modal.service';
import { ExportService } from '@app/services/export/export.service';
import { BreadcrumbComponent, BreadcrumbItem } from '@app/@shared/breadcrumb/breadcrumb.component';

import { Logger } from '@app/core';

import { DataTablesModule } from 'angular-datatables';
import { RouterLink } from '@angular/router';
import { DatePipe, CommonModule } from '@angular/common';

const log = new Logger('Department');

@Component({
  selector: 'app-department-list',
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.scss'],
  imports: [DataTablesModule, BreadcrumbComponent, RouterLink, DatePipe, CommonModule],
})
export class DepartmentListComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  departments: Department[] = []; // For grid view
  tableData: Department[] = []; // For DataTables view
  message = '';
  viewMode: 'grid' | 'table' = 'grid';
  isLoading = true;

  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', link: '/home', icon: 'fas fa-home' },
    { label: 'Departments', icon: 'fas fa-building' },
  ];

  constructor(
    private apiHttpService: ApiHttpService,
    private apiEndpointsService: ApiEndpointsService,
    private modalService: ModalService,
    private exportService: ExportService,
  ) {}

  wholeRowClick(department: Department): void {
    let modalTitle = 'Department Detail';

    this.openModal(modalTitle, department);

    log.debug('Whole row clicked.', department);
  }

  ngOnInit() {
    // Load initial department data for grid view
    this.loadDepartmentData();

    this.dtOptions = {
      pagingType: 'simple_numbers',
      pageLength: 10,
      serverSide: true,
      processing: false, // Disable processing indicator to prevent stuck dots
      ajax: (dataTablesParameters: any, callback: any) => {
        // Call WebAPI to get departments
        this.apiHttpService
          .post(this.apiEndpointsService.postDepartmentsPagedEndpoint(), dataTablesParameters)
          .subscribe({
            next: (resp: DataTablesResponse) => {
              this.tableData = resp.data.map((dept: Department) => ({
                ...dept,
                positions: dept.positions || [],
              }));
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
      // Set column title and data field
      columns: [
        {
          title: 'Name',
          data: null,
          render: (data: any, type: any, row: any) => {
            return row.name || '';
          },
        },
        {
          title: 'Positions',
          data: null,
          orderable: false,
          render: (data: any, type: any, row: any) => {
            const positionCount = row.positions?.length || 0;
            return `${positionCount} Position${positionCount !== 1 ? 's' : ''}`;
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
            return '<button class="btn btn-sm btn-outline-primary">Edit</button>';
          },
        },
      ],
    };
  }

  openModal(title: string, department: Department) {
    this.modalService.OpenDepartmentDetailDialog(title, department);
  }

  setViewMode(mode: 'grid' | 'table') {
    this.viewMode = mode;
  }

  getPositionCount(department: Department): number {
    return department.positions?.length ?? 0;
  }

  private loadDepartmentData() {
    // Create a simple request for initial load (first page, no filters)
    const initialRequest = {
      draw: 1,
      start: 0,
      length: 50, // Load more departments for grid view
      search: { value: '', regex: false },
      order: [],
      columns: [],
    };

    this.apiHttpService.post(this.apiEndpointsService.postDepartmentsPagedEndpoint(), initialRequest).subscribe({
      next: (resp: DataTablesResponse) => {
        this.departments = resp.data.map((dept: Department) => ({
          ...dept,
          positions: dept.positions || [],
        }));
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading department data:', error);
        // Set some fallback data or show error state
        this.departments = [];
      },
    });
  }

  exportToExcel(): void {
    // Try to export from tableData first (table view), then fallback to departments (grid view)
    const dataToExport = this.tableData?.length > 0 ? this.tableData : this.departments;

    if (dataToExport && dataToExport.length > 0) {
      this.exportService.exportDepartmentsToExcel(dataToExport);
    } else {
      console.warn('No department data to export');
    }
  }
}
