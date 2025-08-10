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
import { Router, RouterLink } from '@angular/router';
import { RequireRoleDirective } from '@app/core/auth/directives';
import { FormsModule } from '@angular/forms';

const log = new Logger('Employee');

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
  imports: [DataTablesModule, BreadcrumbComponent, RouterLink, RequireRoleDirective, FormsModule],
})
export class EmployeeListComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  paginatedEmployees: Employee[] = [];

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;

  // Search properties
  searchTerm = '';

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
    private router: Router,
  ) {}

  wholeRowClick(employee: Employee): void {
    let modalTitle = 'Employee Detail';

    this.openModal(modalTitle, employee);

    log.debug('Whole row clicked.', employee);
  }

  viewEmployee(event: Event, employee: Employee): void {
    event.stopPropagation(); // Prevent card click from triggering
    let modalTitle = 'Employee Detail';
    this.openModal(modalTitle, employee);
    log.debug('View employee clicked.', employee);
  }

  editEmployee(event: Event, employee: Employee): void {
    event.stopPropagation(); // Prevent card click from triggering
    if (!employee?.id) {
      log.error('Invalid employee selected for editing');
      return;
    }

    this.router.navigate(['/employee/edit', employee.id]);
    log.debug('Edit employee clicked.', employee);
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

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.filterAndPaginateEmployees();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePaginatedEmployees();
  }

  onItemsPerPageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.itemsPerPage = parseInt(target.value, 10);
    this.currentPage = 1; // Reset to first page
    this.filterAndPaginateEmployees();
  }

  private filterAndPaginateEmployees(): void {
    // Filter employees based on search term
    if (this.searchTerm.trim() === '') {
      this.filteredEmployees = [...this.employees];
    } else {
      const searchLower = this.searchTerm.toLowerCase();
      this.filteredEmployees = this.employees.filter(
        (employee) =>
          employee.firstName?.toLowerCase().includes(searchLower) ||
          employee.lastName?.toLowerCase().includes(searchLower) ||
          employee.email?.toLowerCase().includes(searchLower) ||
          employee.position?.positionTitle?.toLowerCase().includes(searchLower),
      );
    }

    // Calculate pagination
    this.totalPages = Math.ceil(this.filteredEmployees.length / this.itemsPerPage);

    // Reset to page 1 if current page is out of range
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }

    this.updatePaginatedEmployees();
  }

  private updatePaginatedEmployees(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedEmployees = this.filteredEmployees.slice(startIndex, endIndex);
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
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredEmployees.length);
  }

  private loadEmployeeData() {
    // Create a simple request for initial load (first page, no filters)
    const initialRequest = {
      draw: 1,
      start: 0,
      length: 100, // Load more employees for client-side pagination
      search: { value: '', regex: false },
      order: [],
      columns: [],
    };

    this.apiHttpService.post(this.apiEndpointsService.postEmployeesPagedEndpoint(), initialRequest).subscribe({
      next: (resp: DataTablesResponse) => {
        this.employees = resp.data;
        this.filterAndPaginateEmployees(); // Initialize filtered and paginated data
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading employee data:', error);
        // Set some fallback data or show error state
        this.employees = [];
        this.filteredEmployees = [];
        this.paginatedEmployees = [];
      },
    });
  }

  deleteEmployee(event: Event, employee: Employee): void {
    event.stopPropagation(); // Prevent card click from triggering
    if (!employee?.id) {
      log.error('Invalid employee selected for deletion');
      return;
    }

    if (confirm(`Are you sure you want to delete employee "${employee.firstName} ${employee.lastName}"?`)) {
      this.apiHttpService.delete(this.apiEndpointsService.deleteEmployeeByIdEndpoint(employee.id)).subscribe({
        next: () => {
          this.loadEmployeeData();
          log.info('Employee deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting employee:', error);
          log.error('Error deleting employee:', error);
        },
      });
    }
  }

  exportToExcel(): void {
    if (this.employees && this.employees.length > 0) {
      this.exportService.exportEmployeesToExcel(this.employees);
    } else {
      console.warn('No employee data to export');
    }
  }
}
