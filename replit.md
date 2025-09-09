# Broker Copilot - Replit Development Guide

## Overview
Broker Copilot is an AI-powered SaaS platform designed to enhance cross-sell and upsell opportunities within insurance broker networks. Its primary purpose is to expand insurance portfolios by leveraging data-driven insights, predictive analytics, and automated relationship management between insurance providers and broker partners. The platform aims to revolutionize insurance sales through intelligent automation and data utilization.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Technology Stack**: React with TypeScript and Vite for a Single Page Application (SPA).
- **UI Framework**: Shadcn/ui components styled with Tailwind CSS for a consistent design system.
- **Routing**: Wouter for client-side navigation.
- **Data Management**: TanStack Query (React Query) for data fetching and caching.
- **State Management**: React Context for application state and environment switching.
- **Icons**: Lucide React and FontAwesome.

### Backend
- **API**: Express.js REST API built with TypeScript.
- **Database Interaction**: Drizzle ORM for type-safe PostgreSQL operations.
- **File Handling**: Multer for CSV/PDF file uploads.
- **Email Service**: SendGrid integration.
- **Multi-Environment Support**: Middleware-based environment routing with PostgreSQL schema isolation for data separation (e.g., 'De Goudse', 'My Qollabi', 'ACME CO', 'Globex Corp').

### Database Design
- **Type**: PostgreSQL, using schema-based isolation for multi-environment support.
- **Key Entities**: Partners, Customers, Opportunities, Products, Contacts, Vendors.
- **Naming Conventions**: Mixed camelCase (for main tables) and snake_case (for relationship tables).
- **Features**: OKR metrics system, upload settings with transformation scripts, activity tracking, and audit trails.

### Core Features
- **Entity Management**: Comprehensive CRUD for partners, customers, opportunities, products, contacts, and vendors.
- **OKR System**: Customizable metrics, tag-based grouping, templating, and hierarchical views for goal tracking.
- **Data Upload & Transformation**: Wizard-driven CSV/Excel/PDF upload with field mapping, custom transformation scripts, and duplicate detection.
- **Campaign Management**: AI-assisted email composition, dynamic segmentation, recipient management, and follow-up automation.
- **Smart Lists and Views**: Dynamic filtering, saved view persistence, cross-entity relationship linking, and bulk operations.
- **Activity Hub**: Unified timeline for comments and tasks, integrated with AI-powered Smart Cross Sell recommendations, user-based attribution, and real-time updates.
- **Product Catalog**: Centralized management of insurance products with detailed attributes, categories, and assignments.
- **Portfolio Insights**: Dashboard with KPIs, charts, and white space analysis for identifying cross-sell/upsell opportunities.
- **Custom Environment Management**: Dynamic creation of branded environments sharing the same backend logic but with custom branding and logos.

### UI/UX Decisions
- **Design Philosophy**: Apple/Google-inspired design patterns with clean typography, consistent spacing, and subtle visual effects (e.g., glassmorphism, rounded corners).
- **Color Scheme**: Primarily uses Qollabi brand colors (#5567E5) with a professional palette of grays, blues, greens, and oranges for status indicators and visual hierarchy.
- **Interactive Elements**: Standardized button heights (32px for CTA, 36px for inputs), consistent hover states, and intuitive icon usage.
- **Modals**: Professional dialog components with consistent layouts and full-screen options for complex workflows.
- **Dynamic Content**: Context-aware display of information, such as hiding redundant source badges or showing relevant action buttons based on user selection.

## External Dependencies

### Database
- **PostgreSQL**: Primary data store.
- **Neon Serverless**: Cloud PostgreSQL provider.
- **@neondatabase/serverless**: For connection pooling.

### Core Libraries & Frameworks
- **drizzle-orm**: ORM for database operations.
- **@tanstack/react-query**: Data fetching and caching.
- **@radix-ui/react-components**: Accessible UI primitives.
- **tailwindcss**: Utility-first CSS framework.

### File Processing
- **multer**: File uploads.
- **xlsx**: Excel file processing.
- **pdf-parse**: PDF text extraction.
- **csv-parser**: CSV file processing.

### AI Integration
- **Anthropic Claude / @anthropic-ai/sdk**: AI-powered content generation and analysis (planned and existing).
- **OpenAI GPT-4o**: Used for Smart Cross Sell analysis and content generation.

### Email Services
- **SendGrid / @sendgrid/mail**: Transactional email delivery.

### UI Components & Utilities
- **Lucide React**: Icon library.
- **React Hook Form**: Form state management.
- **Recharts**: Charting library for data visualization.