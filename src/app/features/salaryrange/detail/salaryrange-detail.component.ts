import { Component, OnInit, DestroyRef, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Logger } from '@app/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';

// api services
import { ApiHttpService } from '@app/services/api/api-http.service';
import { ApiEndpointsService } from '@app/services/api/api-endpoints.service';

// ui service modal and toaster
import { ModalService } from '@app/services/modal/modal.service';
import { ToastService } from '@app/services/toast/toast.service';

// interface classes
import { SalaryRange } from '@shared/interfaces/salaryrange';

// boostrap tooltip https://ng-bootstrap.github.io/#/components/tooltip/examples
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

// logger
const log = new Logger('SalaryRangeDetail');

@Component({
  selector: 'app-salaryrange-detail',
  templateUrl: './salaryrange-detail.component.html',
  styleUrls: ['./salaryrange-detail.component.scss'],
  imports: [ReactiveFormsModule, CommonModule, RouterLink, TranslateModule, NgbTooltipModule, DatePipe, CurrencyPipe],
  standalone: true,
})
export class SalaryRangeDetailComponent implements OnInit {
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
  readonly salaryRange = signal<SalaryRange | null>(null);
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

  readonly salaryRangeAmount = computed(() => {
    const range = this.salaryRange();
    if (!range) return 0;
    return range.maxSalary - range.minSalary;
  });

  constructor() {
    this.createForm();
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.formMode.set('Edit');
        this.loadSalaryRange(id);
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

    this.createSalaryRange(this.entryForm.value);
  }

  onUpdate(): void {
    if (!this.entryForm.valid) {
      this.error.set('Please fill all required fields correctly');
      return;
    }

    const id = this.entryForm.get('id')?.value;
    if (!id) {
      this.error.set('Salary Range ID is required for update');
      return;
    }

    this.updateSalaryRange(id, this.entryForm.value);
  }

  async onDelete(): Promise<void> {
    const id = this.entryForm.get('id')?.value;
    if (!id) {
      this.error.set('Salary Range ID is required for deletion');
      return;
    }

    try {
      const confirmed = await this.modalService.OpenConfirmDialog(
        'Salary Range deletion',
        'Are you sure you want to delete this salary range? This action cannot be undone.',
      );

      if (confirmed) {
        this.deleteSalaryRange(id);
      }
    } catch (error) {
      log.debug('Delete cancelled by user');
    }
  }

  private loadSalaryRange(id: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.apiHttpService
      .get(this.apiEndpointsService.getSalaryRangeByIdEndpoint(id), id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          if (resp.data || resp) {
            const salaryRange = resp.data || resp;
            this.salaryRange.set(salaryRange);
            this.populateForm(salaryRange);
            this.isLoading.set(false);
            log.debug('Salary Range loaded successfully:', salaryRange.id);
          }
        },
        error: (error) => {
          this.isLoading.set(false);
          this.error.set('Failed to load salary range details. Please try again.');
          log.error('Error loading salary range:', error);
        },
      });
  }

  private deleteSalaryRange(id: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.apiHttpService
      .delete(this.apiEndpointsService.deleteSalaryRangeByIdEndpoint(id), id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.showToaster('Success!', 'Salary Range deleted successfully');
          this.resetForm();
          this.formMode.set('New');
          log.debug('Salary Range deleted successfully');
        },
        error: (error) => {
          this.isLoading.set(false);
          this.error.set('Failed to delete salary range. Please try again.');
          log.error('Error deleting salary range:', error);
        },
      });
  }

  private createSalaryRange(data: Partial<SalaryRange>): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.apiHttpService
      .post(this.apiEndpointsService.postSalaryRangesEndpoint(), data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp) => {
          this.isLoading.set(false);
          this.showToaster('Success!', 'Salary Range created successfully');
          this.resetForm();
          log.debug('Salary Range created successfully:', resp.data);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.error.set('Failed to create salary range. Please try again.');
          log.error('Error creating salary range:', error);
        },
      });
  }

  private updateSalaryRange(id: string, data: Partial<SalaryRange>): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.apiHttpService
      .put(this.apiEndpointsService.putSalaryRangesEndpoint(id), data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.showToaster('Success!', 'Salary Range updated successfully');
          log.debug('Salary Range updated successfully');
        },
        error: (error) => {
          this.isLoading.set(false);
          this.error.set('Failed to update salary range. Please try again.');
          log.error('Error updating salary range:', error);
        },
      });
  }

  private createForm(): void {
    this.entryForm = this.formBuilder.group(
      {
        id: [''],
        name: ['', [Validators.required, Validators.minLength(2)]],
        minSalary: [0, [Validators.required, Validators.min(0)]],
        maxSalary: [0, [Validators.required, Validators.min(0)]],
        createdBy: [''],
        created: [''],
        lastModifiedBy: [''],
        lastModified: [''],
      },
      {
        validators: this.salaryRangeValidator,
      },
    );

    // Subscribe to form status changes to update the signal
    this.entryForm.statusChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((status) => {
      const isValid = status === 'VALID';
      this.formValid.set(isValid);
      log.debug('Form status changed:', status, 'Valid:', isValid, 'Errors:', this.entryForm.errors);
    });

    // Set initial form validity
    setTimeout(() => {
      const initialValid = this.entryForm.valid;
      this.formValid.set(initialValid);
      log.debug('Initial form validity:', initialValid, 'Errors:', this.entryForm.errors);
    }, 0);
  }

  private salaryRangeValidator(form: FormGroup) {
    const minSalary = form.get('minSalary')?.value || 0;
    const maxSalary = form.get('maxSalary')?.value || 0;

    if (minSalary >= maxSalary) {
      return { salaryRangeInvalid: true };
    }

    return null;
  }

  private populateForm(salaryRange: SalaryRange): void {
    this.entryForm.patchValue({
      id: salaryRange.id,
      name: salaryRange.name,
      minSalary: salaryRange.minSalary,
      maxSalary: salaryRange.maxSalary,
      createdBy: salaryRange.createdBy,
      created: salaryRange.created,
      lastModifiedBy: salaryRange.lastModifiedBy,
      lastModified: salaryRange.lastModified,
    });

    // Mark form fields as touched to trigger validation
    this.markFormGroupTouched();

    // Update form validity signal
    setTimeout(() => {
      this.formValid.set(this.entryForm.valid);
      log.debug('Form populated, validity set to:', this.entryForm.valid);
    }, 0);
  }

  private resetForm(): void {
    this.entryForm.reset({
      minSalary: 0,
      maxSalary: 0,
    });
    this.error.set(null);
    this.salaryRange.set(null);
    this.formValid.set(this.entryForm.valid);
  }

  private showToaster(title: string, message: string): void {
    this.toastService.show(title, message, {
      classname: 'bg-success text-light',
      delay: 3000,
      autohide: true,
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.entryForm.controls).forEach((key) => {
      const control = this.entryForm.get(key);
      control?.markAsTouched();
    });
  }

  // Convenience getter for easy access to form fields
  get f() {
    return this.entryForm.controls;
  }
}
