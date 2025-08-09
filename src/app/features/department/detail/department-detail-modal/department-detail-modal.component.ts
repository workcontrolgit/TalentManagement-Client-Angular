import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Department } from '@shared/interfaces/department';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-department-detail-modal',
  templateUrl: './department-detail-modal.component.html',
  styleUrls: ['./department-detail-modal.component.scss'],
  imports: [CommonModule, DatePipe],
  standalone: true,
})
export class DepartmentDetailModalComponent implements OnInit {
  @Input() title: string = 'Department Detail';
  @Input() department!: Department;

  get positionCount(): number {
    return this.department.positions?.length || 0;
  }

  constructor(public activeModal: NgbActiveModal, private router: Router) {}

  ngOnInit() {}

  editDepartment() {
    console.log('Edit button clicked!', this.department);
    this.activeModal.close();
    this.router.navigate(['/department/edit', this.department.id]);
  }
}
