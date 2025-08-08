import { Injectable, Injector, Type } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ErrorDialogComponent } from '@shared/errors/error-dialog.component';
import { ConfirmationDialogComponent } from '@shared/confirmation-dialog/confirmation-dialog.component';
import { EmployeeDetailComponent } from '@app/features/employee/detail/employee-detail/employee-detail.component';
import { PositionDetailComponent } from '@app/features/position/detail/position-detail/position-detail.component';
import { SalaryRangeDetailModalComponent } from '@app/features/salaryrange/detail/salaryrange-detail-modal/salaryrange-detail-modal.component';
import { Employee } from '@shared/interfaces/employee';
import { Position } from '@shared/interfaces/position';
import { SalaryRange } from '@shared/interfaces/salaryrange';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  modalService = this.injector.get(NgbModal);

  constructor(private injector: Injector) {}

  OpenEmployeeDetailDialog(title: string, employee: Employee): void {
    //var modalService = this.injector.get(NgbModal);
    const modalRef = this.modalService.open(EmployeeDetailComponent);
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.employee = employee;
  }

  OpenPositionDetailDialog(title: string, position: Position): void {
    const modalRef = this.modalService.open(PositionDetailComponent);
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.position = position;
  }

  OpenSalaryRangeDetailDialog(title: string, salaryRange: SalaryRange): void {
    const modalRef = this.modalService.open(SalaryRangeDetailModalComponent);
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.salaryRange = salaryRange;
  }

  OpenErrorDialog(title: string, message: string, status?: string): void {
    //var modalService = this.injector.get(NgbModal);
    const modalRef = this.modalService.open(ErrorDialogComponent);
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.status = status;
  }

  OpenConfirmDialog(
    title: string,
    message: string,
    btnOkText: string = 'OK',
    btnCancelText: string = 'Cancel',
    dialogSize: 'sm' | 'lg' = 'sm'
  ): Promise<boolean> {
    const modalRef = this.modalService.open(ConfirmationDialogComponent, { size: dialogSize });
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.btnOkText = btnOkText;
    modalRef.componentInstance.btnCancelText = btnCancelText;
    return modalRef.result;
  }
}
