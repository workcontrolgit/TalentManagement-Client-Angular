import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  constructor() {}

  /**
   * Export data to Excel file
   * @param data Array of objects to export
   * @param filename Name of the file (without extension)
   * @param sheetName Name of the worksheet
   */
  exportToExcel(data: any[], filename: string, sheetName: string = 'Sheet1'): void {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    // Create workbook and worksheet
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate Excel file buffer
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    // Save file
    this.saveExcelFile(excelBuffer, filename);
  }

  /**
   * Export employees data to Excel with proper formatting
   */
  exportEmployeesToExcel(employees: any[]): void {
    if (!employees || employees.length === 0) {
      console.warn('No employees to export');
      return;
    }

    const exportData = employees.map((emp) => ({
      'Employee Number': emp.employeeNumber || '',
      'First Name': emp.firstName || '',
      'Middle Name': emp.middleName || '',
      'Last Name': emp.lastName || '',
      Email: emp.email || '',
      Phone: emp.phone || '',
      Birthday: emp.birthday ? new Date(emp.birthday).toLocaleDateString() : '',
      Gender: emp.gender === 0 ? 'Male' : emp.gender === 1 ? 'Female' : 'Other',
      Position: emp.position?.positionTitle || '',
      Department: emp.position?.department?.name || '',
      Salary: emp.salary || 0,
      Prefix: emp.prefix || '',
      Created: emp.created ? new Date(emp.created).toLocaleDateString() : '',
      'Created By': emp.createdBy || '',
    }));

    this.exportToExcel(exportData, `Employees_${this.getTimestamp()}`, 'Employees');
  }

  /**
   * Export positions data to Excel with proper formatting
   */
  exportPositionsToExcel(positions: any[]): void {
    if (!positions || positions.length === 0) {
      console.warn('No positions to export');
      return;
    }

    const exportData = positions.map((pos) => ({
      'Position Number': pos.positionNumber || '',
      'Position Title': pos.positionTitle || '',
      Description: pos.positionDescription || '',
      Department: pos.department?.name || '',
      'Salary Range': pos.salaryRange?.name || '',
      'Min Salary': pos.salaryRange?.minSalary || 0,
      'Max Salary': pos.salaryRange?.maxSalary || 0,
      'Employee Count': pos.employees?.length || 0,
      Created: pos.created ? new Date(pos.created).toLocaleDateString() : '',
      'Created By': pos.createdBy || '',
    }));

    this.exportToExcel(exportData, `Positions_${this.getTimestamp()}`, 'Positions');
  }

  /**
   * Export departments data to Excel with proper formatting
   */
  exportDepartmentsToExcel(departments: any[]): void {
    if (!departments || departments.length === 0) {
      console.warn('No departments to export');
      return;
    }

    const exportData = departments.map((dept) => ({
      'Department Name': dept.name || '',
      'Position Count': dept.positions?.length || 0,
      Created: dept.created ? new Date(dept.created).toLocaleDateString() : '',
      'Created By': dept.createdBy || '',
      'Last Modified': dept.lastModified ? new Date(dept.lastModified).toLocaleDateString() : '',
      'Last Modified By': dept.lastModifiedBy || '',
    }));

    this.exportToExcel(exportData, `Departments_${this.getTimestamp()}`, 'Departments');
  }

  /**
   * Export salary ranges data to Excel with proper formatting
   */
  exportSalaryRangesToExcel(salaryRanges: any[]): void {
    if (!salaryRanges || salaryRanges.length === 0) {
      console.warn('No salary ranges to export');
      return;
    }

    const exportData = salaryRanges.map((sr) => ({
      'Range Name': sr.name || '',
      'Minimum Salary': sr.minSalary || 0,
      'Maximum Salary': sr.maxSalary || 0,
      'Range Amount': (sr.maxSalary || 0) - (sr.minSalary || 0),
      'Position Count': sr.positions?.length || 0,
      Created: sr.created ? new Date(sr.created).toLocaleDateString() : '',
      'Created By': sr.createdBy || '',
      'Last Modified': sr.lastModified ? new Date(sr.lastModified).toLocaleDateString() : '',
      'Last Modified By': sr.lastModifiedBy || '',
    }));

    this.exportToExcel(exportData, `SalaryRanges_${this.getTimestamp()}`, 'Salary Ranges');
  }

  /**
   * Save Excel file buffer to disk
   */
  private saveExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(data, `${fileName}.xlsx`);
  }

  /**
   * Get current timestamp for filename
   */
  private getTimestamp(): string {
    const now = new Date();
    return now.toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_');
  }
}
