import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

export type UserRole = 'Employee' | 'Manager' | 'HRAdmin';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  constructor(private authService: AuthService) {}

  /**
   * Get current user's roles
   */
  getCurrentUserRoles(): string[] {
    const identityClaims = this.authService.identityClaims;
    if (!identityClaims) {
      return [];
    }

    const userRoles = (identityClaims as any)['role'];
    if (!userRoles) {
      return [];
    }

    // Handle both single role (string) and multiple roles (array)
    return Array.isArray(userRoles) ? userRoles : [userRoles];
  }

  /**
   * Check if current user has specific role(s)
   */
  hasRole(requiredRoles: string | string[]): boolean {
    const userRoles = this.getCurrentUserRoles();
    const rolesToCheck = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    return rolesToCheck.some((role) => userRoles.includes(role));
  }

  /**
   * Check if current user has any administrative role
   */
  hasAdminRole(): boolean {
    return this.hasRole('HRAdmin');
  }

  /**
   * Check if current user can create records
   */
  canCreate(): boolean {
    return this.hasRole('HRAdmin');
  }

  /**
   * Check if current user can update records
   */
  canUpdate(): boolean {
    return this.hasRole('HRAdmin');
  }

  /**
   * Check if current user can delete records
   */
  canDelete(): boolean {
    return this.hasRole('HRAdmin');
  }

  /**
   * Check if current user can only view (no CRUD operations)
   */
  isViewOnly(): boolean {
    return this.hasRole(['Employee', 'Manager']) && !this.hasRole('HRAdmin');
  }

  /**
   * Get user role display name
   */
  getUserRoleDisplay(): string {
    const roles = this.getCurrentUserRoles();
    if (roles.length === 0) {
      return 'No Role';
    }
    return roles.join(', ');
  }

  /**
   * Check if user is authenticated and has valid token
   */
  isAuthenticated(): boolean {
    return this.authService.hasValidToken();
  }
}
