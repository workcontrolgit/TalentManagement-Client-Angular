import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [NgbCarouselModule, CommonModule],
  templateUrl: './carousel.component.html',
})
export class CarouselComponent {
  showNavigationArrows = true;
  showNavigationIndicators = true;
  images = [944, 1011, 984].map((n) => `https://picsum.photos/id/${n}/900/500`);
}
