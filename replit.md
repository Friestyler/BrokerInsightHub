# Broker Copilot - Replit Development Guide

## Overview

Broker Copilot is a comprehensive multi-environment broker portal powered by AI to revolutionize insurance market intelligence and operational workflows. The application serves as a SaaS platform built to streamline collaboration between insurance companies (providers) and insurance brokers (partners), with advanced entity management capabilities and AI-driven predictive analytics.

## System Architecture

### Frontend Architecture
- **React-based SPA** with TypeScript and Vite for fast development
- **Shadcn/ui components** with Tailwind CSS for consistent design system
- **Wouter routing** for client-side navigation
- **TanStack Query** for efficient data fetching and caching
- **Context-based state management** for environment switching

### Backend Architecture
- **Express.js REST API** with TypeScript
- **Multi-environment database isolation** using PostgreSQL schemas
- **Middleware-based environment routing** for data separation
- **Drizzle ORM** for type-safe database operations
- **File upload handling** with Multer for CSV/PDF processing

### Database Design
- **PostgreSQL with schema-based isolation** (degoudse schema as primary)
- **Comprehensive entity relationships** (partners, customers, opportunities, products, etc.)
- **OKR metrics system** with hierarchical grouping
- **Upload settings and transformation scripts** for data import
- **Activity tracking and audit trails**

## Key Components

### Entity Management System
- **Partners**: Broker organizations and contacts
- **Customers**: End clients with relationship tracking  
- **Opportunities**: Sales deals with probability scoring
- **Products**: Insurance product catalog
- **Vendors**: Service provider management
- **Contacts**: Unified contact management across entities

### OKR (Objectives and Key Results) System
- **Metrics creation** with customizable units and hierarchies
- **Tag-based grouping** for organizational structure
- **Template assignments** to entities for goal tracking
- **Grouped views** with filtering and sorting capabilities

### Data Upload & Transformation
- **CSV/Excel upload wizard** with field mapping
- **Transformation scripts** for custom data processing
- **Duplicate detection** based on mandatory fields
- **Upload settings** for entity-specific configurations

### Campaign Management
- **Email campaign builder** with AI assistance
- **List-based targeting** with dynamic segmentation
- **Follow-up cadences** and sender configuration
- **Shared campaign collaboration**

## Data Flow

### Upload Process
1. File upload → Format detection → Schema validation
2. Field mapping → Transformation script selection → Data validation
3. Duplicate detection → Batch processing → Database insertion
4. Success reporting → List refresh → Notification

### Environment Isolation
1. Request middleware → Environment detection → Schema routing
2. Database connection per environment → Isolated queries
3. Data boundaries maintained → No cross-environment contamination

### OKR Workflow
1. Create metrics → Tag assignment → Group creation
2. Template association → Entity assignment → Progress tracking
3. Hierarchical views → Performance analytics → Goal achievement

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Data fetching and caching
- **@radix-ui components**: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework

### File Processing
- **multer**: File upload handling
- **xlsx**: Excel file processing
- **pdf-parse**: PDF text extraction
- **csv-parser**: CSV file processing

### AI Integration
- **@anthropic-ai/sdk**: AI-powered features (future enhancement)

### Email Services
- **@sendgrid/mail**: Email campaign delivery

## Deployment Strategy

### Development Environment
- **Replit-based development** with hot reload
- **PostgreSQL 16** module for database
- **Node.js 20** runtime environment
- **Port 5000** for backend API serving

### Production Build
- **Vite build** for optimized frontend bundle
- **esbuild** for Node.js backend compilation
- **Autoscale deployment** target for dynamic scaling
- **Static file serving** from dist/public

### Database Management
- **Drizzle migrations** for schema changes
- **Environment-specific schemas** for data isolation
- **Backup and restore** capabilities through admin panel

## Changelog

- June 14, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.