
# Broker Copilot - Replit Development Guide

## Overview

Broker Copilot is a comprehensive AI-powered insurance growth platform designed to revolutionize cross-sell and upsell opportunities across broker networks. The application serves as an intelligent SaaS platform that maximizes insurance portfolio expansion through data-driven insights, predictive analytics, and automated relationship management between insurance providers and broker partners.

## System Architecture

### Frontend Architecture
- **React-based SPA** with TypeScript and Vite for fast development
- **Shadcn/ui components** with Tailwind CSS for consistent design system
- **Wouter routing** for client-side navigation
- **TanStack Query (React Query)** for efficient data fetching and caching
- **React Context** for application state and environment switching
- **Lucide React and FontAwesome** for icons

### Backend Architecture
- **Express.js REST API** with TypeScript
- **Multi-environment database isolation** using PostgreSQL schemas
- **Middleware-based environment routing** for data separation
- **Drizzle ORM** for type-safe database operations
- **File upload handling** with Multer for CSV/PDF processing
- **Email Service**: SendGrid integration

### Database Design
- **PostgreSQL with schema-based isolation** (degoudse schema as primary)
- **Comprehensive entity relationships** (partners, customers, opportunities, products, etc.)
- **Mixed column naming conventions**: Main tables use camelCase (clientId, partnerId, estimatedValue), relationship tables use snake_case (customer_id, opportunity_id)
- **OKR metrics system** with hierarchical grouping
- **Upload settings and transformation scripts** for data import
- **Activity tracking and audit trails**

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

### OKR (Objectives and Key Results) System
- **Metrics creation** with customizable units and hierarchies
- **Tag-based grouping** for organizational structure
- **Template assignments** to entities for goal tracking
- **Entity Assignment**: Link metrics to partners, customers, or opportunities
- **Grouped views** with filtering and sorting capabilities
- **Template System**: Reusable metric templates across environments

### Data Upload & Transformation
- **CSV/Excel upload wizard** with field mapping
- **Transformation scripts** for custom data processing
- **Duplicate detection** based on mandatory fields
- **Upload settings** for entity-specific configurations

### Campaign Management
- **Campaign Builder**: AI-assisted email composition with template support
- **List-based targeting** with dynamic segmentation
- **Recipient Management**: Contact-based targeting with bulk operations
- **Follow-up Automation**: Configurable cadence management
- **Sender configuration** and shared campaign collaboration

### Smart Lists and Views
- **Dynamic Filtering**: Real-time filtering with saved view persistence
- **Cross-entity Relationships**: Link opportunities to customers and partners
- **Bulk Operations**: Multi-select actions across entity types
- **Share Functionality**: Generate public links for external collaboration

## Data Flow

### Upload Process
1. File upload → Format detection → Schema validation
2. Field mapping → Transformation script selection → Data validation
3. Duplicate detection → Batch processing → Database insertion
4. Success reporting → List refresh → Notification

### Request Flow
1. Client requests hit the Express.js server
2. Environment middleware determines the target environment (defaults to 'degoudse')
3. Database queries are executed against the appropriate schema
4. Response data is cached for performance optimization
5. Results are returned to the React frontend

### Environment Isolation
1. Request middleware → Environment detection → Schema routing
2. Database connection per environment → Isolated queries
3. Data boundaries maintained → No cross-environment contamination

### OKR Workflow
1. Create metrics → Tag assignment → Group creation
2. Template association → Entity assignment → Progress tracking
3. Hierarchical views → Performance analytics → Goal achievement

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

### Core Dependencies
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
- **Anthropic Claude / @anthropic-ai/sdk**: AI-powered content generation and analysis (live + future)
- **PDF Analysis**: Document comparison and text extraction

### Email Services
- **SendGrid / @sendgrid/mail**: Transactional email delivery
- **Template Management**: HTML/text email template system

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
- **Backup and restore** capabilities through admin panel

## Changelog
- June 14, 2025: Initial setup
- June 14, 2025: Completed tabbed campaigns interface with Templates and Campaigns tabs, updated entity selection styling
- June 14, 2025: Streamlined Entity Upload Flow, AI-powered code generation for transformation scripts
- June 15, 2025: Cleaned legacy template flows, improved save flow, added AI content blocks, campaign wizard redesign
- June 15, 2025: Full Flow Builder rebranding with consistent UX, enhanced hierarchical entity/contact selection
- June 15, 2025: Added recipient system, tile redesigns, vertical step progress, better navigation
- June 15, 2025: Natural language transformation logic, AI explanations, template auto-loading, routing fixes
- June 21, 2025: Major database connectivity and relationship fixes - resolved PostgreSQL case sensitivity issues between camelCase schema and snake_case queries, fixed all entity relationship endpoints, application now fully functional with authentic data
- June 21, 2025: Completed 7-step entity upload flow with Product Categories (step 1) and Product Assignment (step 4) functionality - includes hierarchical category creation, product detection, and assignment tracking with validation
- June 21, 2025: Moved Products page to "More" section in sidebar navigation for better organization
- June 21, 2025: Added Portfolio Insights page with Dashboard and White Space Analysis tabs to permanent navigation - positioned directly below Partner Hub with proper tab UI consistency
- June 21, 2025: Completed comprehensive Portfolio Insights implementation with two major sections:
  - Dashboard Section: Product analysis dashboard with KPIs, charts, and product analytics using authentic data integration. Features include real-time filtering, interactive Recharts visualizations (bar charts and pie charts), responsive design, and comprehensive product category analysis with penetration rates and value calculations.
  - White Space Analysis: Interactive cross-sell/upsell matrix with customer segmentation, conversion rate controls, color-coded performance indicators, three functional tabs (Matrix view, Top Opportunities, Segment Insights), and actionable campaign creation buttons.
- June 22, 2025: Completed full subcategory editing functionality with inline edit mode, keyboard shortcuts (Enter to save, Escape to cancel), and complete CRUD operations. Translated all Dutch interface text to English for better accessibility in the unified category management system.
- June 22, 2025: Redesigned category management interface with collapsible tag-based display - moved creation form to top, implemented pill-style tags for categories with expandable sections containing subcategories, added inline color picker for category customization, combined structured collapsing with modern tag aesthetics for optimal organization and visual hierarchy.
- June 22, 2025: Enhanced category management with three-level hierarchy support - added sub-subcategories (third level) with full CRUD operations, implemented color editing capabilities for all hierarchy levels (categories, subcategories, and sub-subcategories), maintained collapsible structure with nested expandable sections for comprehensive product organization.
- June 22, 2025: Completed comprehensive insurance category database restructure - cleared existing categories and built authentic 34-category insurance hierarchy with Life (green family), Non-Life (blue family), and Services (purple family) color coding. Structure includes industry-standard categories like Death Cover, Branch 21/23, IPT/POZ, Hospitalization Insurance, Car Insurance, Fire Insurance, Cyber Insurance with smart color gradients.
- June 22, 2025: Rebuilt Product Mapping Step 4 with Apple/Google style UX - integrated authentic database products with new insurance category hierarchy, implemented interactive product selection with visual feedback (blue highlight for selected, green for mapped), expandable category tree with color-coded hierarchy, real-time mapping progress tracking, and intuitive click-to-select workflow for streamlined product categorization.
- June 22, 2025: Replaced mock products with 20 authentic insurance products properly linked to category hierarchy - includes real Belgian insurance products from major providers (Dela, AG, NN, AXA, Baloise, Ethias, Corona Direct, KBC, Allianz, Touring) covering Life (Death Cover, Branch 21/23, Pension Savings, IPT, Group Insurance), Non-Life (Health, Mobility, Property & Liability, Business), and Travel categories with detailed product descriptions and proper category associations.
- June 22, 2025: Enhanced insurance products with comprehensive CSV attributes - added provider information, contract dates, financial details (total value, premium value, premium percentage, discount percentage), customer/partner/opportunity linking, and updated Products page to display complete authentic product information with formatted financial data, contract periods, and relationship indicators.

## User Preferences

Preferred communication style: Simple, everyday language.
