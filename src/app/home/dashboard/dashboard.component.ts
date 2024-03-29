import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink],
})
export class DashboardComponent implements OnInit {
  itemList: any;

  constructor() {}

  ngOnInit(): void {
    this.itemList = [
      {
        position_count: 50,
        employee_count: 1000,
        assignment_count: 5,
      },
    ];
  }
}
