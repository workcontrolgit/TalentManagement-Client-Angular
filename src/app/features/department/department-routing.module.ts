import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AuthGuard } from '@app/core/auth/auth-guard.service';

import { DepartmentListComponent } from './list/department-list.component';
import { DepartmentDetailComponent } from './detail/department-detail.component';

const routes: Routes = [
  // Module is lazy loaded, see app-routing.module.ts
  {
    path: '',
    component: DepartmentListComponent,
    canActivate: [AuthGuard],
    data: { title: marker('Department') },
  },
  {
    path: 'new',
    component: DepartmentDetailComponent,
    canActivate: [AuthGuard],
    data: { title: marker('New Department'), role: 'HRAdmin' },
  },
  {
    path: 'edit/:id',
    component: DepartmentDetailComponent,
    canActivate: [AuthGuard],
    data: { title: marker('Edit Department'), role: 'HRAdmin' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class DepartmentRoutingModule {}
