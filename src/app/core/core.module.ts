import { ModuleWithProviders, NgModule, Optional, SkipSelf, inject, provideAppInitializer } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { RouteReuseStrategy, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { RouteReusableStrategy } from './route-reusable-strategy';

// OIDC Integration
import { AuthConfig, OAuthModule, OAuthModuleConfig, OAuthStorage } from 'angular-oauth2-oidc';
import { authAppInitializerFactory } from './auth/auth-app-initializer.factory';
import { authConfig } from './auth/auth-config';
import { AuthGuardWithForcedLogin } from './auth/auth-guard-with-forced-login.service';
import { AuthGuard } from './auth/auth-guard.service';
import { authModuleConfig } from './auth/auth-module-config';
import { AuthService } from './auth/auth.service';
import { RoleService } from './auth/role.service';

// We need a factory since localStorage is not available at AOT build time
export function storageFactory(): OAuthStorage {
  return localStorage;
}

@NgModule({
  imports: [CommonModule, OAuthModule.forRoot(), TranslateModule, RouterModule],
  providers: [
    AuthService,
    AuthGuard,
    RoleService,
    AuthGuardWithForcedLogin,
    {
      provide: RouteReuseStrategy,
      useClass: RouteReusableStrategy,
    },
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class CoreModule {
  static forRoot(): ModuleWithProviders<CoreModule> {
    return {
      ngModule: CoreModule,
      providers: [
        provideAppInitializer(() => {
          const initializerFn = authAppInitializerFactory(inject(AuthService));
          return initializerFn();
        }),
        { provide: AuthConfig, useValue: authConfig },
        { provide: OAuthModuleConfig, useValue: authModuleConfig },
        { provide: OAuthStorage, useFactory: storageFactory },
      ],
    };
  }
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    // Import guard
    if (parentModule) {
      throw new Error(`${parentModule} has already been loaded. Import Core module in the AppModule only.`);
    }
  }
}
