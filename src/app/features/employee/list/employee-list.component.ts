import { Component, OnInit } from '@angular/core';

import { Employee } from '@shared/interfaces/employee';
import { ApiHttpService } from '@app/services/api/api-http.service';
import { ApiEndpointsService } from '@app/services/api/api-endpoints.service';
import { DataTablesResponse } from '@shared/interfaces/data-tables-response';
import { ModalService } from '@app/services/modal/modal.service';

import { Logger } from '@app/core';

import { DataTablesModule } from 'angular-datatables';

const log = new Logger('Employee');

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
  standalone: true,
  imports: [DataTablesModule],
})
export class EmployeeListComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  employees: Employee[] = [];
  message = '';

  constructor(
    private apiHttpService: ApiHttpService,
    private apiEndpointsService: ApiEndpointsService,
    private modalService: ModalService
  ) {}

  wholeRowClick(employee: Employee): void {
    let modalTitle = 'Employee Detail';

    this.openModal(modalTitle, employee);

    log.debug('Whole row clicked.', employee);
  }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'simple_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        // Call WebAPI to get employees
        this.apiHttpService
          .post(this.apiEndpointsService.postEmployeesPagedEndpoint(), dataTablesParameters)
          .subscribe((resp: DataTablesResponse) => {
            this.employees = resp.data;
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
          title: 'Last Name',
          data: '',
        },
        {
          title: 'First Name',
          data: '',
        },
        {
          title: 'Email',
          data: '',
        },
        {
          title: 'Employee Number',
          data: '',
        },
        {
          title: 'Position Title',
          data: '',
        },
      ],
    };
  }

  openModal(title: string, employee: Employee) {
    this.modalService.OpenEmployeeDetailDialog(title, employee);
  }
}
