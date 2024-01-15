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
  position: Position;
  salary: number;
}
