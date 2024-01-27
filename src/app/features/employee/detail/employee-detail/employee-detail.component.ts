import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Employee } from '@shared/interfaces/employee';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee-detail',
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class EmployeeDetailComponent implements OnInit {
  @Input() title: string = 'Employee Detail';
  @Input() employee!: Employee;

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit() {}
}
