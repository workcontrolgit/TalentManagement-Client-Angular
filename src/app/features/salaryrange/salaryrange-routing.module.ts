import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

import { SalaryRangeComponent } from './salaryrange.component';
import { SalaryRangeDetailComponent } from './detail/salaryrange-detail.component';

const routes: Routes = [
  // Module is lazy loaded, see app-routing.module.ts
  {
    path: '',
    component: SalaryRangeComponent,
    data: { title: marker('Salary Range') },
  },
  {
    path: 'new',
    component: SalaryRangeDetailComponent,
    data: { title: marker('New Salary Range') },
  },
  {
    path: 'edit/:id',
    component: SalaryRangeDetailComponent,
    data: { title: marker('Edit Salary Range') },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class SalaryRangeRoutingModule {}
