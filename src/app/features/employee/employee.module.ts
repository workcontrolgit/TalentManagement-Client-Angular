import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared';

import { EmployeeComponent } from './employee.component';
import { EmployeeListComponent } from './list/employee-list.component';
import { EmployeeFormComponent } from './form/employee-form.component';
import { EmployeeRoutingModule } from './employee-routing.module';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    EmployeeRoutingModule,
    NgbNavModule,
    TranslateModule,
    SharedModule,
    EmployeeComponent,
    EmployeeListComponent,
    EmployeeFormComponent,
  ],
})
export class EmployeeModule {}
