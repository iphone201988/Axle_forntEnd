# Admin Panel for On-Demand Service Platform

## Overview

This repository contains a full-stack admin panel for an on-demand service platform (similar to Uber Eats but for services like car washing, electrician, plumber, barber, etc.). The application provides a comprehensive dashboard for managing service providers, bookings, customers, payments, and other platform operations.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite for development and build tooling
- **Routing**: Wouter for client-side routing
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack React Query for server state management
- **Icons**: Lucide React for consistent iconography

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Session Management**: Express sessions with PostgreSQL store

### Build System
- **Development**: Vite with HMR and React support
- **Production**: ESBuild for server bundling, Vite for client build
- **TypeScript**: Strict configuration with path mapping for clean imports

## Key Components

### Database Schema
The application uses PostgreSQL with the following main entities:
- **Users**: Admin authentication and management
- **Service Providers**: Professional service providers with categories, ratings, and status
- **Customers**: End users who book services
- **Bookings**: Service requests with scheduling and status tracking
- **Additional tables**: Support for reviews, payments, and categories

### UI Layout Structure
- **Layout System**: Responsive admin layout with sidebar navigation and top bar
- **Sidebar Navigation**: Fixed navigation with icons for all major sections
- **Content Areas**: Dynamic content based on route with consistent spacing and typography
- **Component Library**: Comprehensive UI components following modern design patterns

### Page Structure
- **Dashboard**: Overview statistics and recent activities
- **Service Providers**: Provider management with filtering and status controls
- **Bookings**: Booking tracking with status management
- **Customers**: Customer profiles and activity tracking
- **Additional pages**: Payments, Reviews, Support, Categories, and Settings

## Data Flow

### Client-Server Communication
- RESTful API architecture with `/api` prefix for all endpoints
- Type-safe data contracts using shared schema definitions
- Optimistic updates and caching through React Query
- Error handling with toast notifications

### State Management
- Server state managed by TanStack React Query
- Local component state for UI interactions
- Form state management with React Hook Form (configured but not fully implemented)
- Global toast notifications for user feedback

### Data Persistence
- Drizzle ORM provides type-safe database operations
- Migration system for schema changes
- Connection pooling for production environments
- Environment-based configuration

## External Dependencies

### UI and Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Consistent icon library
- **Class Variance Authority**: Type-safe component variants

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across the stack
- **ESBuild**: Fast production bundling
- **PostCSS**: CSS processing with Tailwind

### Database and Backend
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle Kit**: Database migration and schema management
- **Express.js**: Web framework for API routes
- **Connect PG Simple**: PostgreSQL session store

## Deployment Strategy

### Development Environment
- Vite development server with hot module replacement
- Express server with middleware for API routes
- TypeScript compilation with strict checking
- Automatic restart on server changes

### Production Build
- Client: Vite builds optimized React bundle to `dist/public`
- Server: ESBuild bundles Express server to `dist/index.js`
- Static assets served by Express in production
- Environment variables for database and external service configuration

### Database Management
- Drizzle migrations for schema versioning
- Environment-based database connections
- Production-ready connection pooling
- Backup and restore capabilities through hosting provider

## Changelog

```
Changelog:
- July 03, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```