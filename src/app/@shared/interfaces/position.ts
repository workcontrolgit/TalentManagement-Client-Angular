import { Department } from './department';
import { SalaryRange } from './salaryrange';
export interface Position {
  positionTitle: string;
  positionNumber: string;
  positionDescription: string;
  departmentId: string;
  department: Department;
  employees: any[];
  salaryRangeId: string;
  salaryRange: SalaryRange;
  createdBy: string;
  created: Date;
  lastModifiedBy: null;
  lastModified: null;
  id: string;
}
