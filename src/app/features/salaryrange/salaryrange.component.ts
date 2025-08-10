import { Component } from '@angular/core';
import { SalaryRangeListComponent } from './list/salaryrange-list.component';

@Component({
  selector: 'app-salaryrange',
  templateUrl: './salaryrange.component.html',
  styleUrls: ['./salaryrange.component.scss'],
  imports: [SalaryRangeListComponent],
  standalone: true,
})
export class SalaryRangeComponent {}
