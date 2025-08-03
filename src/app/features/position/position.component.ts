import { Component } from '@angular/core';
import { PositionListComponent } from './list/position-list.component';

@Component({
  selector: 'app-position',
  templateUrl: './position.component.html',
  styleUrls: ['./position.component.scss'],
  imports: [PositionListComponent],
  standalone: true,
})
export class PositionComponent {}
