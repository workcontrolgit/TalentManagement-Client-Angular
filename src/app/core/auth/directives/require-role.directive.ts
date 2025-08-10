import { Directive, Input, ElementRef, Renderer2, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { RoleService } from '../role.service';
import { AuthService } from '../auth.service';

@Directive({
  selector: '[appRequireRole]',
  standalone: true,
})
export class RequireRoleDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private requiredRoles: string | string[] = [];
  private customDisabledMessage?: string;
  private originalTitle?: string;
  private clickListener?: () => void;

  @Input() set appRequireRole(roles: string | string[]) {
    this.requiredRoles = roles;
    this.updateElementState();
  }

  @Input() set disabledMessage(message: string) {
    this.customDisabledMessage = message;
    this.updateElementState();
  }

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private roleService: RoleService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    // Store original title if exists
    this.originalTitle = this.elementRef.nativeElement.getAttribute('title');

    // Listen to authentication state changes
    this.authService.isAuthenticated$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateElementState();
    });

    // Initial state update
    this.updateElementState();
  }

  ngOnDestroy() {
    // Clean up click listener
    if (this.clickListener) {
      this.clickListener();
      this.clickListener = undefined;
    }

    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateElementState(): void {
    const element = this.elementRef.nativeElement;
    const hasRole = this.hasRequiredRole();

    if (hasRole) {
      this.enableElement(element);
    } else {
      this.disableElement(element);
    }
  }

  private enableElement(element: HTMLElement): void {
    // Remove disabled state
    this.renderer.removeAttribute(element, 'disabled');
    this.renderer.removeAttribute(element, 'aria-disabled');

    // Remove disabled styling
    this.renderer.removeClass(element, 'rbac-disabled');
    this.renderer.removeStyle(element, 'opacity');
    this.renderer.removeStyle(element, 'cursor');
    this.renderer.removeStyle(element, 'pointer-events');

    // Remove click listener if it exists
    if (this.clickListener) {
      this.clickListener();
      this.clickListener = undefined;
    }

    // Restore original title or remove tooltip
    if (this.originalTitle) {
      this.renderer.setAttribute(element, 'title', this.originalTitle);
    } else {
      this.renderer.removeAttribute(element, 'title');
    }

    // Remove Bootstrap tooltip attributes
    this.renderer.removeAttribute(element, 'data-bs-toggle');
    this.renderer.removeAttribute(element, 'data-bs-placement');
  }

  private disableElement(element: HTMLElement): void {
    // Set disabled state
    this.renderer.setAttribute(element, 'disabled', 'true');
    this.renderer.setAttribute(element, 'aria-disabled', 'true');

    // Add disabled styling
    this.renderer.addClass(element, 'rbac-disabled');
    this.renderer.setStyle(element, 'opacity', '0.6');
    this.renderer.setStyle(element, 'cursor', 'not-allowed');

    // Add click prevention instead of pointer-events: none
    this.clickListener = this.renderer.listen(element, 'click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      return false;
    });

    // Set tooltip message
    const tooltipMessage = this.getDisabledMessage();
    this.renderer.setAttribute(element, 'title', tooltipMessage);

    // Add Bootstrap tooltip attributes if Bootstrap is available
    if (this.isBootstrapTooltipAvailable()) {
      this.renderer.setAttribute(element, 'data-bs-toggle', 'tooltip');
      this.renderer.setAttribute(element, 'data-bs-placement', 'top');
    }
  }

  private hasRequiredRole(): boolean {
    if (!this.roleService.isAuthenticated()) {
      return false;
    }

    if (!this.requiredRoles) {
      return true;
    }

    return this.roleService.hasRole(this.requiredRoles);
  }

  private getDisabledMessage(): string {
    if (this.customDisabledMessage) {
      return this.customDisabledMessage;
    }

    // Default messages based on element type or role requirement
    const roles = Array.isArray(this.requiredRoles) ? this.requiredRoles.join(' or ') : this.requiredRoles;

    // Try to determine action from element content or class
    const element = this.elementRef.nativeElement;
    const elementText = element.textContent?.toLowerCase() || '';
    const elementClasses = element.className?.toLowerCase() || '';

    if (elementText.includes('create') || elementText.includes('add') || elementText.includes('new')) {
      return `Only ${roles} can create records`;
    } else if (elementText.includes('edit') || elementText.includes('update') || elementText.includes('modify')) {
      return `Only ${roles} can edit records`;
    } else if (elementText.includes('delete') || elementText.includes('remove')) {
      return `Only ${roles} can delete records`;
    } else {
      return `Requires ${roles} role to perform this action`;
    }
  }

  private isBootstrapTooltipAvailable(): boolean {
    // Check if Bootstrap tooltip is available globally
    return typeof (window as any).bootstrap !== 'undefined' && (window as any).bootstrap.Tooltip;
  }
}
