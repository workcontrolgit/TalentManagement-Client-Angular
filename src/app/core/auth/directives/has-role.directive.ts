import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { RoleService } from '../role.service';
import { AuthService } from '../auth.service';

@Directive({
  selector: '[appHasRole]',
  standalone: true,
})
export class HasRoleDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private requiredRoles: string | string[] = [];

  @Input() set appHasRole(roles: string | string[]) {
    this.requiredRoles = roles;
    this.updateView();
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private roleService: RoleService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    // Listen to authentication state changes
    this.authService.isAuthenticated$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateView();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView(): void {
    this.viewContainer.clear();

    if (this.hasRequiredRole()) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }

  private hasRequiredRole(): boolean {
    if (!this.roleService.isAuthenticated()) {
      return false;
    }

    if (!this.requiredRoles) {
      return true; // No role requirement
    }

    return this.roleService.hasRole(this.requiredRoles);
  }
}
