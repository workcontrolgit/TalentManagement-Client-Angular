import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

import { DepartmentComponent } from './department.component';
import { DepartmentDetailComponent } from './detail/department-detail.component';

const routes: Routes = [
  // Module is lazy loaded, see app-routing.module.ts
  {
    path: '',
    component: DepartmentComponent,
    data: { title: marker('Department') },
  },
  {
    path: 'new',
    component: DepartmentDetailComponent,
    data: { title: marker('New Department') },
  },
  {
    path: 'edit/:id',
    component: DepartmentDetailComponent,
    data: { title: marker('Edit Department') },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class DepartmentRoutingModule {}
