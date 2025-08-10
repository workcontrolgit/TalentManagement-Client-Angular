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
import { Router, RouterLink } from '@angular/router';
import { DatePipe, CommonModule } from '@angular/common';
import { RequireRoleDirective } from '@app/core/auth/directives';
import { FormsModule } from '@angular/forms';

const log = new Logger('Department');

@Component({
  selector: 'app-department-list',
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.scss'],
  imports: [
    DataTablesModule,
    BreadcrumbComponent,
    RouterLink,
    DatePipe,
    CommonModule,
    RequireRoleDirective,
    FormsModule,
  ],
})
export class DepartmentListComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  departments: Department[] = []; // For grid view
  tableData: Department[] = []; // For DataTables view

  // Pagination and search state
  filteredDepartments: Department[] = [];
  paginatedDepartments: Department[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  searchTerm = '';

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
    private router: Router,
  ) {}

  wholeRowClick(department: Department): void {
    let modalTitle = 'Department Detail';

    this.openModal(modalTitle, department);

    log.debug('Whole row clicked.', department);
  }

  viewDepartment(event: Event, department: Department): void {
    event.stopPropagation(); // Prevent card click from triggering
    let modalTitle = 'Department Detail';
    this.openModal(modalTitle, department);
    log.debug('View department clicked.', department);
  }

  editDepartment(event: Event, department: Department): void {
    event.stopPropagation(); // Prevent card click from triggering
    if (!department?.id) {
      log.error('Invalid department selected for editing');
      return;
    }

    this.router.navigate(['/department/edit', department.id]);
    log.debug('Edit department clicked.', department);
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

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.filterAndPaginateDepartments();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePaginatedDepartments();
  }

  onItemsPerPageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.itemsPerPage = parseInt(target.value, 10);
    this.currentPage = 1; // Reset to first page
    this.filterAndPaginateDepartments();
  }

  private filterAndPaginateDepartments(): void {
    // Filter departments based on search term
    if (this.searchTerm.trim() === '') {
      this.filteredDepartments = [...this.departments];
    } else {
      const searchLower = this.searchTerm.toLowerCase();
      this.filteredDepartments = this.departments.filter(
        (department) =>
          department.name?.toLowerCase().includes(searchLower) ||
          department.createdBy?.toLowerCase().includes(searchLower),
      );
    }

    // Calculate pagination
    this.totalPages = Math.ceil(this.filteredDepartments.length / this.itemsPerPage);

    // Reset to page 1 if current page is out of range
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }

    this.updatePaginatedDepartments();
  }

  private updatePaginatedDepartments(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedDepartments = this.filteredDepartments.slice(startIndex, endIndex);
  }

  getPaginationPages(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    startPage = Math.max(1, endPage - maxVisiblePages + 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredDepartments.length);
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
        this.filterAndPaginateDepartments(); // Initialize filtered and paginated data
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading department data:', error);
        // Set some fallback data or show error state
        this.departments = [];
        this.filteredDepartments = [];
        this.paginatedDepartments = [];
      },
    });
  }

  deleteDepartment(event: Event, department: Department): void {
    event.stopPropagation(); // Prevent card click from triggering
    if (!department?.id) {
      log.error('Invalid department selected for deletion');
      return;
    }

    if (confirm(`Are you sure you want to delete department "${department.name}"?`)) {
      this.apiHttpService.delete(this.apiEndpointsService.deleteDepartmentByIdEndpoint(department.id)).subscribe({
        next: () => {
          this.loadDepartmentData();
          log.info('Department deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting department:', error);
          log.error('Error deleting department:', error);
        },
      });
    }
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
