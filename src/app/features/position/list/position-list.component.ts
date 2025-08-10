import { Component, OnInit, signal, computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Position } from '@shared/interfaces/position';
import { ApiHttpService } from '@app/services/api/api-http.service';
import { ApiEndpointsService } from '@app/services/api/api-endpoints.service';
import { DataTablesResponse } from '@shared/interfaces/data-tables-response';
import { ModalService } from '@app/services/modal/modal.service';
import { ExportService } from '@app/services/export/export.service';
import { Logger } from '@app/core';
import { BreadcrumbComponent, BreadcrumbItem } from '@app/@shared/breadcrumb/breadcrumb.component';

import { Router, RouterLink } from '@angular/router';

import { NgbTooltipModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { RequireRoleDirective } from '@app/core/auth/directives';
import { FormsModule } from '@angular/forms';

const log = new Logger('Position');
@Component({
  selector: 'app-position-list',
  templateUrl: './position-list.component.html',
  styleUrls: ['./position-list.component.scss'],
  imports: [
    RouterLink,
    NgbTooltipModule,
    NgbDropdownModule,
    CommonModule,
    BreadcrumbComponent,
    RequireRoleDirective,
    FormsModule,
  ],
  standalone: true,
})
export class PositionListComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly apiHttpService = inject(ApiHttpService);
  private readonly apiEndpointsService = inject(ApiEndpointsService);
  private readonly router = inject(Router);
  private readonly modalService = inject(ModalService);
  private readonly exportService = inject(ExportService);

  // Modern signal-based state management
  readonly positions = signal<Position[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Pagination and search state
  filteredPositions: Position[] = [];
  paginatedPositions: Position[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  searchTerm = '';

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

    let modalTitle = 'Position Detail';
    this.openModal(modalTitle, position);
    log.debug('Whole row clicked.', position);
  }

  openModal(title: string, position: Position) {
    this.modalService.OpenPositionDetailDialog(title, position);
  }

  viewPosition(event: Event, position: Position): void {
    event.stopPropagation(); // Prevent card click from triggering
    let modalTitle = 'Position Detail';
    this.openModal(modalTitle, position);
    log.debug('View position clicked.', position);
  }

  editPosition(event: Event, position: Position): void {
    event.stopPropagation(); // Prevent card click from triggering
    if (!position?.id) {
      log.error('Invalid position selected for editing');
      this.error.set('Invalid position selected for editing');
      return;
    }

    this.router.navigate(['/position/edit', position.id]);
    log.debug('Edit position clicked.', position);
  }

  setViewMode(mode: 'grid' | 'table'): void {
    this.viewMode = mode;
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.filterAndPaginatePositions();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePaginatedPositions();
  }

  onItemsPerPageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.itemsPerPage = parseInt(target.value, 10);
    this.currentPage = 1; // Reset to first page
    this.filterAndPaginatePositions();
  }

  private filterAndPaginatePositions(): void {
    const positions = this.positions();

    // Filter positions based on search term
    if (this.searchTerm.trim() === '') {
      this.filteredPositions = [...positions];
    } else {
      const searchLower = this.searchTerm.toLowerCase();
      this.filteredPositions = positions.filter(
        (position) =>
          position.positionTitle?.toLowerCase().includes(searchLower) ||
          position.positionNumber?.toLowerCase().includes(searchLower) ||
          position.department?.name?.toLowerCase().includes(searchLower),
      );
    }

    // Calculate pagination
    this.totalPages = Math.ceil(this.filteredPositions.length / this.itemsPerPage);

    // Reset to page 1 if current page is out of range
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }

    this.updatePaginatedPositions();
  }

  private updatePaginatedPositions(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedPositions = this.filteredPositions.slice(startIndex, endIndex);
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
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredPositions.length);
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
          this.filterAndPaginatePositions(); // Initialize filtered and paginated data
          this.isLoading.set(false);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.error.set('Failed to load positions. Please try again.');
          this.filteredPositions = [];
          this.paginatedPositions = [];
          log.error('Error loading positions:', error);
        },
      });
  }

  ngOnInit(): void {
    this.loadPositionData();
  }

  deletePosition(event: Event, position: Position): void {
    event.stopPropagation(); // Prevent card click from triggering
    if (!position?.id) {
      log.error('Invalid position selected for deletion');
      this.error.set('Invalid position selected for deletion');
      return;
    }

    if (
      confirm(
        `⚠️ DELETE CONFIRMATION\n\nAre you sure you want to delete position "${position.positionTitle}"?\n\nThis action cannot be undone and will permanently remove:\n• Position record\n• Associated employee assignments\n• Related data\n\nClick OK to confirm deletion or Cancel to abort.`,
      )
    ) {
      this.apiHttpService.delete(this.apiEndpointsService.deletePositionByIdEndpoint(position.id)).subscribe({
        next: () => {
          this.loadPositionData();
          log.info('Position deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting position:', error);
          log.error('Error deleting position:', error);
          this.error.set('Failed to delete position. Please try again.');
        },
      });
    }
  }

  exportToExcel(): void {
    const positionData = this.positions();
    if (positionData && positionData.length > 0) {
      this.exportService.exportPositionsToExcel(positionData);
    } else {
      console.warn('No position data to export');
    }
  }
}
