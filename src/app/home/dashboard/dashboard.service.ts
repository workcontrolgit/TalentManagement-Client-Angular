import { Injectable } from '@angular/core';
import { Observable, forkJoin, map, catchError, of } from 'rxjs';
import { ApiHttpService } from '@app/services/api/api-http.service';
import { ApiEndpointsService } from '@app/services/api/api-endpoints.service';
import { CountResponse } from '@shared/interfaces/api-response';

export interface DashboardStats {
  employee_count: number;
  position_count: number;
  assignment_count: number; // departments
  salaryrange_count: number;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private apiHttpService: ApiHttpService, private apiEndpointsService: ApiEndpointsService) {}

  getDashboardStats(): Observable<DashboardStats> {
    // Make parallel requests to get counts from dedicated count endpoints
    const employees$ = this.apiHttpService.get(this.apiEndpointsService.getEmployeesCountEndpoint()).pipe(
      map((response: CountResponse) => (response.succeeded ? response.data : 0)),
      catchError(() => of(0))
    );

    const positions$ = this.apiHttpService.get(this.apiEndpointsService.getPositionsCountEndpoint()).pipe(
      map((response: CountResponse) => (response.succeeded ? response.data : 0)),
      catchError(() => of(0))
    );

    const departments$ = this.apiHttpService.get(this.apiEndpointsService.getDepartmentsCountEndpoint()).pipe(
      map((response: CountResponse) => (response.succeeded ? response.data : 0)),
      catchError(() => of(0))
    );

    const salaryRanges$ = this.apiHttpService.get(this.apiEndpointsService.getSalaryRangesCountEndpoint()).pipe(
      map((response: CountResponse) => (response.succeeded ? response.data : 0)),
      catchError(() => of(0))
    );

    // Combine all requests and return the stats object
    return forkJoin({
      employee_count: employees$,
      position_count: positions$,
      assignment_count: departments$,
      salaryrange_count: salaryRanges$,
    }).pipe(
      catchError((error) => {
        console.error('Error fetching dashboard stats:', error);
        // Return default values on error
        return of({
          employee_count: 0,
          position_count: 0,
          assignment_count: 0,
          salaryrange_count: 0,
        });
      })
    );
  }
}
