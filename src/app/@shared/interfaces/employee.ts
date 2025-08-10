import { Position } from './position';

export interface Employee {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  birthday: Date;
  email: string;
  gender: number;
  employeeNumber: string;
  prefix: string;
  phone: string;
  position: Position | null;
  positionId: string;
  salary: number;
  createdBy?: string;
  created?: string;
  lastModifiedBy?: string;
  lastModified?: string;
}
