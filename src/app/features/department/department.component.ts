import { Component, OnInit } from '@angular/core';
import { DepartmentListComponent } from './list/department-list.component';

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.scss'],
  imports: [DepartmentListComponent],
})
export class DepartmentComponent implements OnInit {
  active = 1;
  constructor() {}

  ngOnInit() {}
}
