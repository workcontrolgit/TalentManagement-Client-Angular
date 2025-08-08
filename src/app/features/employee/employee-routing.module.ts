import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

import { EmployeeComponent } from './employee.component';
import { EmployeeFormComponent } from './form/employee-form.component';

const routes: Routes = [
  // Module is lazy loaded, see app-routing.module.ts
  {
    path: '',
    component: EmployeeComponent,
    data: { title: marker('Employee') },
  },
  {
    path: 'new',
    component: EmployeeFormComponent,
    data: { title: marker('New Employee') },
  },
  {
    path: 'edit/:id',
    component: EmployeeFormComponent,
    data: { title: marker('Edit Employee') },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class EmployeeRoutingModule {}
