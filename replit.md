# Broker Copilot - Replit Development Guide

## Overview

Broker Copilot is a comprehensive multi-environment broker portal powered by AI designed to revolutionize insurance market intelligence and operational workflows. The application serves as a SaaS platform that streamlines collaboration between insurance companies (providers) and brokers/advisors (partners), focusing on data-driven insights for cross-sell/upsell opportunities.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and building
- **UI Library**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query for server state, React Context for application state
- **Routing**: Wouter for client-side routing
- **Icons**: Lucide React and FontAwesome

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database ORM**: Drizzle ORM
- **Database**: PostgreSQL (configured for Neon serverless)
- **File Processing**: PDF parsing, Excel/CSV processing
- **Email Service**: SendGrid integration

### Multi-Environment Structure
The application supports isolated environments:
- **De Goudse** (primary environment)
- **My Qollabi** (reference environment)
- **ACME CO** (client environment)
- **Globex Corp** (client environment)

Each environment maintains its own data isolation while sharing the same application logic.

## Key Components

### Entity Management System
- **Partners**: Insurance brokers and distribution partners
- **Customers**: End clients with relationship management
- **Opportunities**: Sales pipeline management with probability tracking
- **Products**: Insurance product catalog
- **Contacts**: Universal contact management linked to any entity
- **Vendors**: Supplier and vendor relationship management

### Campaign Management
- **Campaign Builder**: AI-assisted email composition with template support
- **Recipient Management**: Contact-based targeting with bulk operations
- **Follow-up Automation**: Configurable cadence management
- **Shared Campaigns**: Cross-organization campaign collaboration

### OKR (Objectives and Key Results) System
- **Metrics Creation**: Define and track key performance indicators
- **Tag-based Grouping**: Organize metrics with hierarchical tagging
- **Entity Assignment**: Link metrics to partners, customers, or opportunities
- **Template System**: Reusable metric templates across environments

### Smart Lists and Views
- **Dynamic Filtering**: Real-time filtering with saved view persistence
- **Cross-entity Relationships**: Link opportunities to customers and partners
- **Bulk Operations**: Multi-select actions across entity types
- **Share Functionality**: Generate public links for external collaboration

## Data Flow

### Request Flow
1. Client requests hit the Express.js server
2. Environment middleware determines the target environment (defaults to 'degoudse')
3. Database queries are executed against the appropriate schema
4. Response data is cached for performance optimization
5. Results are returned to the React frontend

### Data Processing Pipeline
1. **File Upload**: Handles Excel, CSV, and PDF files through multer middleware
2. **PDF Processing**: Extracts text using pdf-parse for document comparison
3. **Data Transformation**: Converts uploaded data to database schema format
4. **Validation**: Ensures data integrity before database insertion
5. **Relationship Mapping**: Links entities (customers↔opportunities↔partners)

### Caching Strategy
- Aggressive in-memory caching for frequently accessed data
- 5-minute TTL for standard endpoints
- 10-minute TTL for critical entities (partners/customers)
- Cache invalidation on data mutations

## External Dependencies

### Database
- **PostgreSQL**: Primary data store with environment-based schemas
- **Neon Serverless**: Cloud PostgreSQL provider
- **Connection Pooling**: Managed through @neondatabase/serverless

### AI Integration
- **Anthropic Claude**: AI-powered content generation and analysis
- **PDF Analysis**: Document comparison and text extraction

### Email Services
- **SendGrid**: Transactional email delivery
- **Template Management**: HTML/text email template system

### File Processing
- **PDF-Parse**: Extract text content from PDF documents
- **XLSX**: Excel file processing and data extraction
- **Multer**: File upload handling middleware

### UI Components
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Modern icon library
- **React Hook Form**: Form state management

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20
- **Database**: PostgreSQL 16
- **Package Manager**: npm
- **Development Server**: Vite dev server with HMR
- **Port Configuration**: Local port 5000, external port 80

### Build Process
1. **Frontend Build**: Vite builds React application to `dist/public`
2. **Backend Build**: esbuild bundles server code to `dist/index.js`
3. **Static Assets**: Served from build directory
4. **Environment Variables**: DATABASE_URL, SENDGRID_API_KEY

### Production Deployment
- **Target**: Autoscale deployment on Replit
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Health Check**: Waits for port 5000 availability

### Database Management
- **Schema Sync**: Automatic schema synchronization across environments
- **Migrations**: Drizzle Kit handles database migrations
- **Seeding**: Initial data population for development environments

## Changelog
- June 14, 2025: Initial setup
- June 14, 2025: Completed tabbed campaigns interface with Templates and Campaigns tabs, updated entity selection styling to grey default with color on hover/selection, removed heavy frames for seamless design
- June 15, 2025: Cleaned up legacy template creation flows by removing old components (TemplateCreator, CleanEmailBuilder, EnhancedEmailBuilder) and ensured single source of truth for template creation through CampaignCreator
- June 15, 2025: Completed campaign template save functionality with full database integration, mutation handling, loading states, error handling, and automatic redirection to templates page after successful save
- June 15, 2025: Fixed critical template save validation bug where email subject field was updating wrong email index, preventing save button activation. Corrected ImprovedEmailBuilder to use activeEmailIndex instead of expandedEmailIndex for updateEmailField function
- June 15, 2025: Added custom AI blocks - AI Paragraph Generator and AI Data Fetching blocks with specialized editing interfaces, removed Fundraising content option, fixed redundancy issues where content appeared twice
- June 15, 2025: Completed comprehensive rebranding from "Email Builder" to "Flow Builder" throughout the entire application - updated component names, UI text, step terminology, header titles, preview labels, empty state messages, and all user-facing references for consistent terminology
- June 15, 2025: Redesigned entity selection and template tiles with modern Apple/Google style approach featuring entity-specific color coding (green for opportunities, blue for customers, purple for partners, orange for internal), animated gradient icons, selection checkmarks, smooth hover transitions, and premium visual effects for enhanced UX
- June 15, 2025: Refined template tiles design with subtle interactions - removed heavy hover overlays, positioned action buttons below content, minimized status indicators, and created balanced layout with entity type tags for improved user experience
- June 15, 2025: Added entity filter selector to templates page with button-style filters (All Templates, Partners, Customers, Opportunities, Internal) using Partner Copilot styling and real-time filtering functionality
- June 15, 2025: Enhanced template tiles with larger icons (14x14) and tighter spacing for more proportionate Google/Apple-style design
- June 15, 2025: Redesigned Campaign Creator step progress indicator with vertical layout placing step text below check marker icons, improved connecting lines, and proper visual hierarchy for both new and existing template workflows

## User Preferences

Preferred communication style: Simple, everyday language.