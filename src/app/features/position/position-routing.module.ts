import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PositionListComponent } from './list/position-list.component';
import { PositionFormComponent } from './form/position-form.component';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AuthGuard } from '@app/core/auth/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    component: PositionListComponent,
    canActivate: [AuthGuard],
    data: { title: marker('Position') },
  },
  {
    path: 'new',
    component: PositionFormComponent,
    canActivate: [AuthGuard],
    data: { title: marker('New Position'), role: 'HRAdmin' },
  },
  {
    path: 'edit/:id',
    component: PositionFormComponent,
    canActivate: [AuthGuard],
    data: { title: marker('Edit Position'), role: 'HRAdmin' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PositionRoutingModule {}
