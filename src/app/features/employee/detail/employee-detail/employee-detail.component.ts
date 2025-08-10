import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Employee } from '@shared/interfaces/employee';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee-detail',
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.scss'],
  imports: [CommonModule],
})
export class EmployeeDetailComponent implements OnInit {
  @Input() title: string = 'Employee Detail';
  @Input() employee!: Employee;

  constructor(public activeModal: NgbActiveModal, private router: Router) {}

  ngOnInit() {}

  editEmployee() {
    console.log('Edit button clicked!', this.employee);
    this.activeModal.close();
    this.router.navigate(['/employee/edit', this.employee.id]);
  }
}
