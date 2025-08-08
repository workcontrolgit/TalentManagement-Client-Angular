import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { SalaryRange } from '@shared/interfaces/salaryrange';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-salaryrange-detail-modal',
  templateUrl: './salaryrange-detail-modal.component.html',
  styleUrls: ['./salaryrange-detail-modal.component.scss'],
  imports: [CommonModule, CurrencyPipe],
})
export class SalaryRangeDetailModalComponent implements OnInit {
  @Input() title: string = 'Salary Range Detail';
  @Input() salaryRange!: SalaryRange;

  constructor(public activeModal: NgbActiveModal, private router: Router) {}

  ngOnInit() {}

  editSalaryRange() {
    console.log('Edit button clicked!', this.salaryRange);
    this.activeModal.close();
    this.router.navigate(['/salaryrange/edit', this.salaryRange.id]);
  }

  get salaryRangeAmount(): number {
    return this.salaryRange ? this.salaryRange.maxSalary - this.salaryRange.minSalary : 0;
  }

  get positionCount(): number {
    return this.salaryRange?.positions?.length || 0;
  }
}
