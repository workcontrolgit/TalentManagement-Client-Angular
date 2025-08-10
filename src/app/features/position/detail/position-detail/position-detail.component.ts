import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Position } from '@shared/interfaces/position';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-position-detail',
  templateUrl: './position-detail.component.html',
  styleUrls: ['./position-detail.component.scss'],
  imports: [CommonModule, CurrencyPipe],
  standalone: true,
})
export class PositionDetailComponent implements OnInit {
  @Input() title: string = 'Position Detail';
  @Input() position!: Position;

  constructor(public activeModal: NgbActiveModal, private router: Router) {}

  ngOnInit() {}

  get employeeCount(): number {
    return this.position?.employees?.length || 0;
  }

  getEmployeeInitials(employee: any): string {
    if (!employee) return '??';

    // Try different property combinations for employee names
    const firstName = employee.firstName || employee.first_name || employee.name?.split(' ')[0] || '';
    const lastName = employee.lastName || employee.last_name || employee.name?.split(' ')[1] || '';

    if (firstName && lastName) {
      return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (employee.name) {
      const nameParts = employee.name.split(' ');
      return nameParts.length > 1
        ? (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase()
        : nameParts[0].charAt(0).toUpperCase();
    }

    return '??';
  }

  getEmployeeFullName(employee: any): string {
    if (!employee) return 'Unknown Employee';

    // Try different property combinations for employee names
    const firstName = employee.firstName || employee.first_name || '';
    const lastName = employee.lastName || employee.last_name || '';
    const prefix = employee.prefix || '';

    if (firstName && lastName) {
      return prefix ? `${prefix} ${firstName} ${lastName}` : `${firstName} ${lastName}`;
    } else if (employee.name) {
      return prefix ? `${prefix} ${employee.name}` : employee.name;
    } else if (firstName) {
      return prefix ? `${prefix} ${firstName}` : firstName;
    }

    return 'Unknown Employee';
  }

  editPosition() {
    console.log('Edit position clicked!', this.position);
    console.log('Navigating to: /position/edit/' + this.position.id);
    this.activeModal.close();
    this.router.navigate(['/position/edit', this.position.id]).then(
      (success) => console.log('Navigation successful:', success),
      (error) => console.log('Navigation failed:', error)
    );
  }
}
