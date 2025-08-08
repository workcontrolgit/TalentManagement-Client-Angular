import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Position } from '@shared/interfaces/position';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-position-detail',
  templateUrl: './position-detail.component.html',
  styleUrls: ['./position-detail.component.scss'],
  imports: [CommonModule],
  standalone: true,
})
export class PositionDetailComponent implements OnInit {
  @Input() title: string = 'Position Detail';
  @Input() position!: Position;

  constructor(public activeModal: NgbActiveModal, private router: Router) {}

  ngOnInit() {}

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
