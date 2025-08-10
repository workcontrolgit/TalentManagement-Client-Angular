import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { RoleService } from './role.service';
import { ToastService } from '@app/services/toast/toast.service';

@Injectable()
export class AuthGuard {
  constructor(
    private authService: AuthService,
    private roleService: RoleService,
    private toastService: ToastService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authService.canActivateProtectedRoutes$.pipe(
      map((isAuthenticated: boolean) => {
        // Step 1: Check authentication
        if (!isAuthenticated) {
          console.log('Access denied', 'Please login to continue access');
          this.showToaster('Access denied', 'Please login to continue access');
          return false;
        }

        // Step 2: Check role authorization (if required)
        const requiredRole = route.data['role'];
        if (requiredRole) {
          if (!this.roleService.hasRole(requiredRole)) {
            console.log('Role access denied', `You do not have role ${requiredRole}`);
            this.showToaster('Access denied', `You do not have role ${requiredRole}`);
            return false;
          }
        }

        return true;
      }),
    );
  }

  private showToaster(title: string, message: string): void {
    this.toastService.show(title, message, {
      classname: 'bg-danger text-light',
      delay: 2000,
      autohide: true,
      headertext: title,
    });
  }
}
