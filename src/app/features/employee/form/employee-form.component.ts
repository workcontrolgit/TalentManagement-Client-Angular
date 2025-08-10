import { Component, OnInit, AfterViewInit, DestroyRef, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Logger } from '@app/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

// api services
import { ApiHttpService } from '@app/services/api/api-http.service';
import { ApiEndpointsService } from '@app/services/api/api-endpoints.service';

// ui service modal and toaster
import { ModalService } from '@app/services/modal/modal.service';
import { ToastService } from '@app/services/toast/toast.service';

// interface classes
import { Employee } from '@shared/interfaces/employee';
import { Position } from '@shared/interfaces/position';
import { Department } from '@app/@shared/interfaces/department';

// dropdownbox library ng-select https://github.com/ng-select/ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// boostrap tooltip https://ng-bootstrap.github.io/#/components/tooltip/examples
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { RequireRoleDirective } from '@app/core/auth/directives';

// logger
const log = new Logger('EmployeeForm');

@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss'],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterLink,
    TranslateModule,
    NgbTooltipModule,
    NgSelectModule,
    RequireRoleDirective,
  ],
  standalone: true,
})
export class EmployeeFormComponent implements OnInit, AfterViewInit {
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
  readonly employee = signal<Employee | null>(null);
  readonly positions = signal<Position[]>([]);
  readonly departments = signal<Department[]>([]);
  readonly formValid = signal<boolean>(false);

  // Computed properties
  readonly isAddNew = computed(() => this.formMode() === 'New');
  readonly canSave = computed(() => {
    const valid = this.formValid();
    const loading = this.isLoading();
    const canSave = valid && !loading;
    log.debug('canSave computed:', { valid, loading, canSave });
    return canSave;
  });
  readonly canDelete = computed(() => !this.isAddNew() && !this.isLoading());

  constructor() {
    this.createForm();
    this.loadDepartments();
    this.loadPositions();
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.formMode.set('Edit');
        this.loadEmployee(id);
      } else {
        this.formMode.set('New');
        this.resetForm();
      }
      log.debug('Form mode set to:', this.formMode());
    });
  }

  ngAfterViewInit(): void {
    // Final attempt to set position after view is fully initialized
    setTimeout(() => {
      const currentEmployee = this.employee();
      const positions = this.positions();

      if (currentEmployee?.positionId && positions.length > 0 && this.formMode() === 'Edit') {
        const currentFormValue = this.entryForm.get('positionId')?.value;
        if (currentFormValue !== currentEmployee.positionId) {
          this.entryForm.get('positionId')?.setValue(currentEmployee.positionId, { emitEvent: true });
          this.entryForm.get('positionId')?.updateValueAndValidity();
        }
      }
    }, 500);
  }

  onCreate(): void {
    if (!this.entryForm.valid) {
      this.error.set('Please fill all required fields correctly');
      return;
    }

    this.createEmployee(this.entryForm.value);
  }

  onUpdate(): void {
    if (!this.entryForm.valid) {
      this.error.set('Please fill all required fields correctly');
      return;
    }

    const id = this.entryForm.get('id')?.value;
    if (!id) {
      this.error.set('Employee ID is required for update');
      return;
    }

    this.updateEmployee(id, this.entryForm.value);
  }

  async onDelete(): Promise<void> {
    const id = this.entryForm.get('id')?.value;
    if (!id) {
      this.error.set('Employee ID is required for deletion');
      return;
    }

    try {
      const confirmed = await this.modalService.OpenConfirmDialog(
        'Employee deletion',
        'Are you sure you want to delete this employee? This action cannot be undone.',
      );

      if (confirmed) {
        this.deleteEmployee(id);
      }
    } catch (error) {
      log.debug('Delete cancelled by user');
    }
  }

  private loadEmployee(id: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.apiHttpService
      .get(this.apiEndpointsService.getEmployeeByIdEndpoint(id), id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          if (resp.data || resp) {
            const employee = resp.data || resp;
            this.employee.set(employee);
            this.populateForm(employee);
            this.isLoading.set(false);
            log.debug('Employee loaded successfully:', employee.id);
          }
        },
        error: (error) => {
          this.isLoading.set(false);
          this.error.set('Failed to load employee details. Please try again.');
          log.error('Error loading employee:', error);
        },
      });
  }

  private deleteEmployee(id: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.apiHttpService
      .delete(this.apiEndpointsService.deleteEmployeeByIdEndpoint(id), id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.showToaster('Success!', 'Employee deleted successfully');
          this.resetForm();
          this.formMode.set('New');
          log.debug('Employee deleted successfully');
        },
        error: (error) => {
          this.isLoading.set(false);
          this.error.set('Failed to delete employee. Please try again.');
          log.error('Error deleting employee:', error);
        },
      });
  }

  private createEmployee(data: Partial<Employee>): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.apiHttpService
      .post(this.apiEndpointsService.postEmployeesEndpoint(), data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp) => {
          this.isLoading.set(false);
          this.showToaster('Success!', 'Employee created successfully');
          this.resetForm();
          log.debug('Employee created successfully:', resp.data);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.error.set('Failed to create employee. Please try again.');
          log.error('Error creating employee:', error);
        },
      });
  }

  private updateEmployee(id: string, data: Partial<Employee>): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.apiHttpService
      .put(this.apiEndpointsService.putEmployeesEndpoint(id), data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.showToaster('Success!', 'Employee updated successfully');
          log.debug('Employee updated successfully');
        },
        error: (error) => {
          this.isLoading.set(false);
          this.error.set('Failed to update employee. Please try again.');
          log.error('Error updating employee:', error);
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

  private loadPositions(): void {
    // Use the same endpoint as the position component - we'll need to create this
    // For now, we'll create a simple request to get all positions
    const initialRequest = {
      draw: 1,
      start: 0,
      length: 1000, // Get all positions
      search: { value: '', regex: false },
      order: [],
      columns: [],
    };

    this.apiHttpService
      .post(this.apiEndpointsService.postPositionsPagedEndpoint(), initialRequest)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          const positions = resp.data || [];
          this.positions.set(positions);

          // If we have an employee loaded but form wasn't populated yet due to missing positions, populate now
          const currentEmployee = this.employee();
          if (currentEmployee && this.formMode() === 'Edit') {
            this.populateForm(currentEmployee);

            // Force position selection after positions are loaded
            setTimeout(() => {
              const positionId = currentEmployee.positionId;
              if (positionId) {
                this.entryForm.get('positionId')?.setValue(positionId, { emitEvent: true });
                this.entryForm.get('positionId')?.updateValueAndValidity();
              }
            }, 100);
          }
        },
        error: (error) => {
          this.error.set('Failed to load positions');
          log.error('Error loading positions:', error);
        },
      });
  }

  private createForm(): void {
    this.entryForm = this.formBuilder.group({
      id: [''],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      middleName: [''],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      birthday: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      gender: [0, Validators.required],
      employeeNumber: ['', [Validators.required, Validators.minLength(2)]],
      prefix: [''],
      phone: ['', Validators.required],
      positionId: ['', Validators.required],
      salary: [0, [Validators.required, Validators.min(0)]],
    });

    // Subscribe to form status changes to update the signal
    this.entryForm.statusChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((status) => {
      this.formValid.set(status === 'VALID');
      log.debug('Form status changed:', status, 'Valid:', status === 'VALID');
    });

    // Set initial form validity
    this.formValid.set(this.entryForm.valid);
    log.debug('Initial form validity:', this.entryForm.valid);
  }

  private populateForm(employee: Employee): void {
    // Check if positions are loaded
    const availablePositions = this.positions();
    if (availablePositions.length === 0) {
      // Positions not loaded yet, will retry after positions load
      return;
    }

    // Use employee.positionId directly since that's what the API returns
    const positionId = employee.positionId || '';

    this.entryForm.patchValue({
      id: employee.id,
      firstName: employee.firstName,
      middleName: employee.middleName,
      lastName: employee.lastName,
      birthday: employee.birthday ? new Date(employee.birthday).toISOString().split('T')[0] : '',
      email: employee.email,
      gender: employee.gender,
      employeeNumber: employee.employeeNumber,
      prefix: employee.prefix,
      phone: employee.phone,
      positionId: positionId,
      salary: employee.salary,
    });

    // Force position selection after form is patched
    if (employee.positionId && availablePositions.length > 0) {
      setTimeout(() => {
        this.entryForm.get('positionId')?.setValue(employee.positionId, { emitEvent: true });
        this.entryForm.get('positionId')?.updateValueAndValidity();
      }, 200);
    }

    this.formValid.set(this.entryForm.valid);
  }

  // Compare function for ng-select to ensure proper selection
  comparePositions(pos1: any, pos2: any): boolean {
    const id1 = pos1?.id || pos1;
    const id2 = pos2?.id || pos2;
    return id1 === id2;
  }

  private resetForm(): void {
    this.entryForm.reset();
    this.error.set(null);
    this.employee.set(null);
    this.formValid.set(this.entryForm.valid);
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
