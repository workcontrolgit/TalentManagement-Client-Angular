import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AuthGuard } from '@app/core/auth/auth-guard.service';

import { EmployeeListComponent } from './list/employee-list.component';
import { EmployeeFormComponent } from './form/employee-form.component';

const routes: Routes = [
  // Module is lazy loaded, see app-routing.module.ts
  {
    path: '',
    component: EmployeeListComponent,
    canActivate: [AuthGuard],
    data: { title: marker('Employee') },
  },
  {
    path: 'new',
    component: EmployeeFormComponent,
    canActivate: [AuthGuard],
    data: { title: marker('New Employee'), role: 'HRAdmin' },
  },
  {
    path: 'edit/:id',
    component: EmployeeFormComponent,
    canActivate: [AuthGuard],
    data: { title: marker('Edit Employee'), role: 'HRAdmin' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class EmployeeRoutingModule {}
