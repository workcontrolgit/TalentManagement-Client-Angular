import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Logger } from '@app/core';
import { ApiHttpService } from '@app/services/api/api-http.service';
import { ApiEndpointsService } from '@app/services/api/api-endpoints.service';
import { Position } from '@shared/interfaces/position';
import { DataResponsePosition } from '@shared/interfaces/data-response-position';
import { ModalService } from '@app/services/modal/modal.service';

import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { ToastService } from '@app/services/toast/toast.service';

import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { Department } from '@app/@shared/interfaces/department';
import { SalaryRange } from '@app/@shared/interfaces/salaryrange';

import { NgSelectModule } from '@ng-select/ng-select';

const log = new Logger('Detail');

@Component({
  selector: 'app-detail',
  templateUrl: './position-detail.component.html',
  styleUrls: ['./position-detail.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, RxReactiveFormsModule, CommonModule, RouterLink, TranslateModule, NgSelectModule],
})
export class PositionDetailComponent implements OnInit {
  formMode = 'New';
  sub: any;
  id: any;
  entryForm!: FormGroup;
  error: string | undefined;
  position!: Position;
  isAddNew: boolean = false;
  submitted = false;

  departments!: Department[];
  salaryRanges!: SalaryRange[];

  selectedCar!: number;

  cars = [
    { id: 1, name: 'Volvo' },
    { id: 2, name: 'Saab' },
    { id: 3, name: 'Opel' },
    { id: 4, name: 'Audi' },
  ];

  constructor(
    private toastService: ToastService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private apiHttpService: ApiHttpService,
    private apiEndpointsService: ApiEndpointsService,
    private modalService: ModalService
  ) {
    this.createForm();
    this.selectedCar = 1;
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe((params) => {
      this.id = params['id'];
      if (this.id !== undefined) {
        this.read(this.route.snapshot.paramMap.get('id'));
        this.formMode = 'Edit';
      } else {
        this.isAddNew = true;
        this.formMode = 'New';
      }
    });
    log.debug('ngOnInit:', this.id);
    this.readDepartments();
    this.readSalaryRanges();
  }

  // Handle Create button click
  onCreate() {
    this.create(this.entryForm.value);
    log.debug('OnInsert: ', this.entryForm.value);
    log.debug('OnInsert: ', this.entryForm.get('positionNumber')!.value);
  }

  // Handle Update button click
  onUpdate() {
    this.put(this.entryForm.get('id')!.value, this.entryForm.value);
    this.showToaster('Great job!', 'Data is updated');
  }

  // Handle Delete button click
  onDelete() {
    this.modalService
      .OpenConfirmDialog('Position deletion', 'Are you sure you want to delete?')
      .then((Yes) => {
        if (Yes) {
          this.delete(this.entryForm.get('id')!.value);
          log.debug('onDelete: ', this.entryForm.value);
        }
      })
      .catch(() => {
        log.debug('onDelete: ', 'Cancel');
      });
  }
  // CRUD > Read, map to REST/HTTP GET
  read(id: any): void {
    this.apiHttpService.get(this.apiEndpointsService.getPositionByIdEndpoint(id), id).subscribe({
      //Assign resp to class-level model object.
      next: (resp: DataResponsePosition) => {
        //Assign data to class-level model object.
        this.position = resp.data;
        //Populate reactive form controls with model object properties.
        this.entryForm.setValue({
          id: this.position.id,
          positionNumber: this.position.positionNumber,
          positionTitle: this.position.positionTitle,
          positionDescription: this.position.positionDescription,
          departmentId: this.position.departmentId,
          salaryRangeId: this.position.salaryRangeId,
        });
      },
      error: (error) => {
        log.debug(error);
      },
    });
  }

  delete(id: any): void {
    this.apiHttpService.delete(this.apiEndpointsService.deletePositionByIdEndpoint(id), id).subscribe({
      next: (resp: any) => {
        log.debug(resp);
        this.showToaster('Great job!', 'Data is deleted');
        this.entryForm.reset();
        this.isAddNew = true;
      },
      error: (error) => {
        log.debug(error);
      },
    });
  }

  // CRUD > Create, map to REST/HTTP POST
  create(data: any): void {
    this.apiHttpService.post(this.apiEndpointsService.postPositionsEndpoint(), data).subscribe({
      next: (resp: any) => {
        this.id = resp.data; //guid return in data
        this.showToaster('Great job!', 'Data is inserted');
        this.entryForm.reset();
      },
      error: (error) => {
        log.debug(error);
      },
    });
  }

  // CRUD > Update, map to REST/HTTP PUT
  put(id: string, data: any): void {
    this.apiHttpService.put(this.apiEndpointsService.putPositionsPagedEndpoint(id), data).subscribe({
      next: (resp: any) => {
        this.id = resp.data; //guid return in data
      },
      error: (error) => {
        log.debug(error);
      },
    });
  }

  readDepartments(): void {
    this.apiHttpService.get(this.apiEndpointsService.getDepartmentsEndpoint()).subscribe({
      //Assign resp to class-level model object.
      next: (resp: Department[]) => {
        //Assign data to class-level model object.
        this.departments = resp;
        log.debug('Departments ', this.departments);
      },
      error: (error) => {
        log.debug(error);
      },
    });
  }

  readSalaryRanges(): void {
    this.apiHttpService.get(this.apiEndpointsService.getSalaryRangesEndpoint()).subscribe({
      //Assign resp to class-level model object.
      next: (resp: SalaryRange[]) => {
        //Assign data to class-level model object.
        this.salaryRanges = resp;
        log.debug('SalaryRanges ', this.salaryRanges);
      },
      error: (error) => {
        log.debug(error);
      },
    });
  }

  // reactive form
  private createForm() {
    this.entryForm = this.formBuilder.group({
      id: [''],
      positionNumber: ['', Validators.required],
      positionTitle: ['', Validators.required],
      positionDescription: ['', Validators.required],
      departmentId: ['', Validators.required],
      salaryRangeId: ['', Validators.required],
      department: ['', Validators.required],
      salaryRange: ['', Validators.required],
    });
  }

  // call modal service
  showToaster(title: string, message: string) {
    this.toastService.show(title, message, {
      classname: 'bg-success text-light',
      delay: 2000,
      autohide: true,
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.entryForm.controls;
  }
}
