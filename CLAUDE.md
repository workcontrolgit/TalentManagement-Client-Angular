# Talent Management Angular Client

This is an Angular application for talent management built with Angular CLI.

## Project Structure

- **src/app/features/**: Feature modules (department, employee, position, salaryrange, profile)
- **src/app/@shared/**: Shared components and services
- **src/app/core/**: Core services and authentication
- **src/app/shell/**: Application shell with header and navigation
- **docs/**: Project documentation

## Key Technologies

- Angular (with TypeScript)
- Bootstrap (UI components)
- OpenID Connect (OIDC) for authentication
- Role-based Access Control (RBAC)
- Cypress for E2E testing

## Development Commands

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run unit tests
- `npm run e2e` - Run E2E tests with Cypress
- `npm run lint` - Lint the code

## Authentication

The application uses OIDC for authentication with role-based access control. See `src/app/core/auth/` for implementation.

## Features

- Employee management
- Department management
- Position management
- Salary range management
- User profile management
- Dashboard with analytics
