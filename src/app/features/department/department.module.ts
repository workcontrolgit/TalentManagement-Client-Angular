import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared';
import { DataTablesModule } from 'angular-datatables';

import { DepartmentComponent } from './department.component';
import { DepartmentListComponent } from './list/department-list.component';
import { DepartmentDetailComponent } from './detail/department-detail.component';
import { DepartmentRoutingModule } from './department-routing.module';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    DepartmentRoutingModule,
    NgbNavModule,
    TranslateModule,
    SharedModule,
    DataTablesModule,
    DepartmentComponent,
    DepartmentListComponent,
    DepartmentDetailComponent,
  ],
})
export class DepartmentModule {}
