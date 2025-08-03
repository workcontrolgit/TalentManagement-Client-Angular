import { Component, OnInit, DestroyRef, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Logger } from '@app/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

// api services
import { ApiHttpService } from '@app/services/api/api-http.service';
import { ApiEndpointsService } from '@app/services/api/api-endpoints.service';
// interface class mapping to web api DTO (data transfer object)
import { DataResponsePosition } from '@shared/interfaces/data-response-position';

// validation
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';

// ui service modal and toaster
import { ModalService } from '@app/services/modal/modal.service';
import { ToastService } from '@app/services/toast/toast.service';

// interface classes
import { Position } from '@shared/interfaces/position';
import { Department } from '@app/@shared/interfaces/department';
import { SalaryRange } from '@app/@shared/interfaces/salaryrange';

// dropdownbox library ng-select https://github.com/ng-select/ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// boostrap tooltip https://ng-bootstrap.github.io/#/components/tooltip/examples
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

// logger
const log = new Logger('Detail');

@Component({
  selector: 'app-detail',
  templateUrl: './position-detail.component.html',
  styleUrls: ['./position-detail.component.scss'],
  imports: [
    ReactiveFormsModule,
    RxReactiveFormsModule,
    CommonModule,
    RouterLink,
    TranslateModule,
    NgSelectModule,
    NgbTooltipModule,
  ],
  standalone: true,
})
export class PositionDetailComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastService = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly apiHttpService = inject(ApiHttpService);
  private readonly apiEndpointsService = inject(ApiEndpointsService);
  private readonly modalService = inject(ModalService);

  entryForm!: FormGroup;

  // Signal-based state management
  readonly formMode = signal<'New' | 'Edit'>('New');
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly position = signal<Position | null>(null);
  readonly departments = signal<Department[]>([]);
  readonly salaryRanges = signal<SalaryRange[]>([]);

  // Computed properties
  readonly isAddNew = computed(() => this.formMode() === 'New');
  readonly canSave = computed(() => this.entryForm?.valid && !this.isLoading());
  readonly canDelete = computed(() => !this.isAddNew() && !this.isLoading());

  constructor() {
    this.createForm();
    this.loadDepartments();
    this.loadSalaryRanges();
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.formMode.set('Edit');
        this.loadPosition(id);
      } else {
        this.formMode.set('New');
        this.resetForm();
      }
      log.debug('Form mode set to:', this.formMode());
    });
  }

  onCreate(): void {
    if (!this.entryForm.valid) {
      this.error.set('Please fill all required fields correctly');
      return;
    }

    this.createPosition(this.entryForm.value);
  }

  onUpdate(): void {
    if (!this.entryForm.valid) {
      this.error.set('Please fill all required fields correctly');
      return;
    }

    const id = this.entryForm.get('id')?.value;
    if (!id) {
      this.error.set('Position ID is required for update');
      return;
    }

    this.updatePosition(id, this.entryForm.value);
  }

  async onDelete(): Promise<void> {
    const id = this.entryForm.get('id')?.value;
    if (!id) {
      this.error.set('Position ID is required for deletion');
      return;
    }

    try {
      const confirmed = await this.modalService.OpenConfirmDialog(
        'Position deletion',
        'Are you sure you want to delete this position? This action cannot be undone.'
      );

      if (confirmed) {
        this.deletePosition(id);
      }
    } catch (error) {
      log.debug('Delete cancelled by user');
    }
  }
  private loadPosition(id: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.apiHttpService
      .get(this.apiEndpointsService.getPositionByIdEndpoint(id), id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: DataResponsePosition) => {
          if (resp.data) {
            this.position.set(resp.data);
            this.populateForm(resp.data);
            this.isLoading.set(false);
            log.debug('Position loaded successfully:', resp.data.id);
          }
        },
        error: (error) => {
          this.isLoading.set(false);
          this.error.set('Failed to load position details. Please try again.');
          log.error('Error loading position:', error);
        },
      });
  }

  private deletePosition(id: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.apiHttpService
      .delete(this.apiEndpointsService.deletePositionByIdEndpoint(id), id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.showToaster('Success!', 'Position deleted successfully');
          this.resetForm();
          this.formMode.set('New');
          log.debug('Position deleted successfully');
        },
        error: (error) => {
          this.isLoading.set(false);
          this.error.set('Failed to delete position. Please try again.');
          log.error('Error deleting position:', error);
        },
      });
  }

  private createPosition(data: Partial<Position>): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.apiHttpService
      .post(this.apiEndpointsService.postPositionsEndpoint(), data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp) => {
          this.isLoading.set(false);
          this.showToaster('Success!', 'Position created successfully');
          this.resetForm();
          log.debug('Position created successfully:', resp.data);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.error.set('Failed to create position. Please try again.');
          log.error('Error creating position:', error);
        },
      });
  }

  private updatePosition(id: string, data: Partial<Position>): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.apiHttpService
      .put(this.apiEndpointsService.putPositionsEndpoint(id), data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.showToaster('Success!', 'Position updated successfully');
          log.debug('Position updated successfully');
        },
        error: (error) => {
          this.isLoading.set(false);
          this.error.set('Failed to update position. Please try again.');
          log.error('Error updating position:', error);
        },
      });
  }

  private loadDepartments(): void {
    this.apiHttpService
      .get(this.apiEndpointsService.getDepartmentsEndpoint())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (departments: Department[]) => {
          this.departments.set(departments || []);
          log.debug('Departments loaded:', departments?.length);
        },
        error: (error) => {
          this.error.set('Failed to load departments');
          log.error('Error loading departments:', error);
        },
      });
  }

  private loadSalaryRanges(): void {
    this.apiHttpService
      .get(this.apiEndpointsService.getSalaryRangesEndpoint())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (salaryRanges: SalaryRange[]) => {
          this.salaryRanges.set(salaryRanges || []);
          log.debug('Salary ranges loaded:', salaryRanges?.length);
        },
        error: (error) => {
          this.error.set('Failed to load salary ranges');
          log.error('Error loading salary ranges:', error);
        },
      });
  }

  private createForm(): void {
    this.entryForm = this.formBuilder.group({
      id: [''],
      positionNumber: ['', [Validators.required, Validators.minLength(2)]],
      positionTitle: ['', [Validators.required, Validators.minLength(3)]],
      positionDescription: ['', [Validators.required, Validators.minLength(10)]],
      departmentId: ['', Validators.required],
      salaryRangeId: ['', Validators.required],
    });
  }

  private populateForm(position: Position): void {
    this.entryForm.patchValue({
      id: position.id,
      positionNumber: position.positionNumber,
      positionTitle: position.positionTitle,
      positionDescription: position.positionDescription,
      departmentId: position.departmentId,
      salaryRangeId: position.salaryRangeId,
    });
  }

  private resetForm(): void {
    this.entryForm.reset();
    this.error.set(null);
    this.position.set(null);
  }

  private showToaster(title: string, message: string): void {
    this.toastService.show(title, message, {
      classname: 'bg-success text-light',
      delay: 3000,
      autohide: true,
    });
  }

  // Convenience getter for easy access to form fields
  get f() {
    return this.entryForm.controls;
  }
}
