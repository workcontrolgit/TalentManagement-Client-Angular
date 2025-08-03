import { Component, OnInit } from '@angular/core';

import { environment } from '@env/environment';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  imports: [TranslateModule],
})
export class AboutComponent implements OnInit {
  version: string | null = environment.version;

  ngOnInit() {
    console.log(JSON.stringify(environment));
  }
}
