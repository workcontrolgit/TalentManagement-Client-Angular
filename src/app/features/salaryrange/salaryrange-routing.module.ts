import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AuthGuard } from '@app/core/auth/auth-guard.service';

import { SalaryRangeListComponent } from './list/salaryrange-list.component';
import { SalaryRangeDetailComponent } from './detail/salaryrange-detail.component';

const routes: Routes = [
  // Module is lazy loaded, see app-routing.module.ts
  {
    path: '',
    component: SalaryRangeListComponent,
    canActivate: [AuthGuard],
    data: { title: marker('Salary Range') },
  },
  {
    path: 'new',
    component: SalaryRangeDetailComponent,
    canActivate: [AuthGuard],
    data: { title: marker('New Salary Range'), role: 'HRAdmin' },
  },
  {
    path: 'edit/:id',
    component: SalaryRangeDetailComponent,
    canActivate: [AuthGuard],
    data: { title: marker('Edit Salary Range'), role: 'HRAdmin' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class SalaryRangeRoutingModule {}
