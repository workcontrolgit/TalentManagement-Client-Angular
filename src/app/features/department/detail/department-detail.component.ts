import { Component, OnInit, DestroyRef, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Logger } from '@app/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule, DatePipe } from '@angular/common';

// api services
import { ApiHttpService } from '@app/services/api/api-http.service';
import { ApiEndpointsService } from '@app/services/api/api-endpoints.service';

// validation
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';

// ui service modal and toaster
import { ModalService } from '@app/services/modal/modal.service';
import { ToastService } from '@app/services/toast/toast.service';

// interface classes
import { Department } from '@shared/interfaces/department';

// boostrap tooltip https://ng-bootstrap.github.io/#/components/tooltip/examples
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

// logger
const log = new Logger('DepartmentDetail');

@Component({
  selector: 'app-department-detail',
  templateUrl: './department-detail.component.html',
  styleUrls: ['./department-detail.component.scss'],
  imports: [
    ReactiveFormsModule,
    RxReactiveFormsModule,
    CommonModule,
    RouterLink,
    TranslateModule,
    NgbTooltipModule,
    DatePipe,
  ],
  standalone: true,
})
export class DepartmentDetailComponent implements OnInit {
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
  readonly department = signal<Department | null>(null);

  // Computed properties
  readonly isAddNew = computed(() => this.formMode() === 'New');
  readonly canSave = computed(() => this.entryForm?.valid && !this.isLoading());
  readonly canDelete = computed(() => !this.isAddNew() && !this.isLoading());

  constructor() {
    this.createForm();
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.formMode.set('Edit');
        this.loadDepartment(id);
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

    this.createDepartment(this.entryForm.value);
  }

  onUpdate(): void {
    if (!this.entryForm.valid) {
      this.error.set('Please fill all required fields correctly');
      return;
    }

    const id = this.entryForm.get('id')?.value;
    if (!id) {
      this.error.set('Department ID is required for update');
      return;
    }

    this.updateDepartment(id, this.entryForm.value);
  }

  async onDelete(): Promise<void> {
    const id = this.entryForm.get('id')?.value;
    if (!id) {
      this.error.set('Department ID is required for deletion');
      return;
    }

    try {
      const confirmed = await this.modalService.OpenConfirmDialog(
        'Department deletion',
        'Are you sure you want to delete this department? This action cannot be undone.'
      );

      if (confirmed) {
        this.deleteDepartment(id);
      }
    } catch (error) {
      log.debug('Delete cancelled by user');
    }
  }

  private loadDepartment(id: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.apiHttpService
      .get(this.apiEndpointsService.getDepartmentByIdEndpoint(id), id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          if (resp.data || resp) {
            const department = resp.data || resp;
            this.department.set(department);
            this.populateForm(department);
            this.isLoading.set(false);
            log.debug('Department loaded successfully:', department.id);
          }
        },
        error: (error) => {
          this.isLoading.set(false);
          this.error.set('Failed to load department details. Please try again.');
          log.error('Error loading department:', error);
        },
      });
  }

  private deleteDepartment(id: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.apiHttpService
      .delete(this.apiEndpointsService.deleteDepartmentByIdEndpoint(id), id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.showToaster('Success!', 'Department deleted successfully');
          this.resetForm();
          this.formMode.set('New');
          log.debug('Department deleted successfully');
        },
        error: (error) => {
          this.isLoading.set(false);
          this.error.set('Failed to delete department. Please try again.');
          log.error('Error deleting department:', error);
        },
      });
  }

  private createDepartment(data: Partial<Department>): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.apiHttpService
      .post(this.apiEndpointsService.postDepartmentsEndpoint(), data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp) => {
          this.isLoading.set(false);
          this.showToaster('Success!', 'Department created successfully');
          this.resetForm();
          log.debug('Department created successfully:', resp.data);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.error.set('Failed to create department. Please try again.');
          log.error('Error creating department:', error);
        },
      });
  }

  private updateDepartment(id: string, data: Partial<Department>): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.apiHttpService
      .put(this.apiEndpointsService.putDepartmentsEndpoint(id), data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.showToaster('Success!', 'Department updated successfully');
          log.debug('Department updated successfully');
        },
        error: (error) => {
          this.isLoading.set(false);
          this.error.set('Failed to update department. Please try again.');
          log.error('Error updating department:', error);
        },
      });
  }

  private createForm(): void {
    this.entryForm = this.formBuilder.group({
      id: [''],
      name: ['', [Validators.required, Validators.minLength(2)]],
      createdBy: [''],
      created: [''],
      lastModifiedBy: [''],
      lastModified: [''],
    });
  }

  private populateForm(department: Department): void {
    this.entryForm.patchValue({
      id: department.id,
      name: department.name,
      createdBy: department.createdBy,
      created: department.created,
      lastModifiedBy: department.lastModifiedBy,
      lastModified: department.lastModified,
    });
  }

  private resetForm(): void {
    this.entryForm.reset();
    this.error.set(null);
    this.department.set(null);
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
