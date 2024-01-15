import { Component, OnInit } from '@angular/core';

import { Position } from '@shared/interfaces/position';
import { ApiHttpService } from '@app/services/api/api-http.service';
import { ApiEndpointsService } from '@app/services/api/api-endpoints.service';
import { DataTablesResponse } from '@shared/interfaces/data-tables-response';
import { Logger } from '@app/core';

import { Router, RouterLink } from '@angular/router';

import { DataTablesModule } from 'angular-datatables';

const log = new Logger('Position');
@Component({
  selector: 'app-position-list',
  templateUrl: './position-list.component.html',
  styleUrls: ['./position-list.component.scss'],
  standalone: true,
  imports: [RouterLink, DataTablesModule],
})
export class PositionListComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  positions: Position[] = [];
  message = '';

  constructor(
    private apiHttpService: ApiHttpService,
    private apiEndpointsService: ApiEndpointsService,
    private router: Router
  ) {}

  wholeRowClick(position: Position): void {
    // get record id
    const positionId = position ? position.id : null;
    // load detail component
    this.router.navigate(['/position/detail', { id: positionId }]);

    log.debug('Whole row clicked.', position);
  }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        // Call WebAPI to get positions
        this.apiHttpService
          .post(this.apiEndpointsService.postPositionsPagedEndpoint(), dataTablesParameters)
          .subscribe((resp: DataTablesResponse) => {
            this.positions = resp.data;
            // log.debug('dump positions', this.positions);
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: [],
            });
          });
      },
      // Set column title and data field
      columns: [
        {
          title: 'Position Number',
          data: 'PositionNumber',
        },
        {
          title: 'Position Title',
          data: 'PositionTitle',
        },
        {
          title: 'Department',
          data: 'Department',
        },
        {
          title: 'Salary Range (min-max)',
          data: '',
        },
      ],
      columnDefs: [
        { orderable: true, targets: 0 }, // Enable sorting on first column
        { orderable: true, targets: 1 }, // Enable sorting on second column
        { orderable: true, targets: 2 }, // Disable sorting on third column
        { orderable: false, targets: 3 }, // Enable sorting on fourth column
        //   // Specify orderable for other columns as needed
      ],
    };
  }
}
