# Insurance Market Intelligence Platform - New Replit Deployment Guide

## Overview
This guide helps you deploy a fully functional insurance market intelligence platform in a new Replit environment using the debugged and verified codebase.

## Platform Capabilities
- **Complete Insurance Portfolio Management**: 186 products, 1494 opportunities, 447 customers, 78 partners
- **Advanced Relationship Tracking**: Customer-opportunity-partner connections with authentic business data
- **Campaign Management**: 12 campaigns with email automation and template system
- **Contact Directory**: 37 contacts with proper business relationships
- **Multi-Environment Support**: Schema-based data isolation (degoudse as primary)
- **Real-Time Analytics**: Portfolio insights, cross-sell analysis, performance tracking

## Quick Setup Instructions

### Step 1: Create New Replit Environment
1. Open [Replit](https://replit.com)
2. Click "Create Repl"
3. Select "Import from GitHub"
4. Use the git branch you'll provide from this working environment

### Step 2: Database Setup
The platform requires PostgreSQL database with specific schema structure:

1. **Enable PostgreSQL Database**:
   - In Replit sidebar, click "Database" 
   - Enable PostgreSQL
   - Note the DATABASE_URL (automatically set as environment variable)

2. **Verify Environment Variables**:
   ```
   DATABASE_URL=postgresql://[connection_string]
   PGDATABASE=[database_name]
   PGHOST=[host]
   PGPASSWORD=[password]
   PGPORT=[port]
   PGUSER=[username]
   ```

### Step 3: Install Dependencies
Run in Replit console:
```bash
npm install
```

### Step 4: Initialize Database Schema
The application will automatically:
- Create `degoudse` schema
- Initialize all required tables
- Seed opportunity assessment data
- Set up proper relationships

### Step 5: Start Application
```bash
npm run dev
```

The application will be available at your Replit URL on port 5000.

## Verified API Endpoints
All endpoints tested and working with authentic data:

### Core Entities
- `GET /api/degoudse/products` - 186 insurance products
- `GET /api/degoudse/opportunities` - 1494 opportunities with pagination
- `GET /api/degoudse/customers` - 447 customers with relationship counts
- `GET /api/degoudse/partners` - 78 partners with portfolio data
- `GET /api/degoudse/contacts` - 37 contacts with business details
- `GET /api/degoudse/campaigns` - 12 campaigns with engagement metrics
- `GET /api/degoudse/categories` - 41 product categories

### Business Logic
- Customer detail pages with opportunity relationships
- Partner portfolio overviews with performance metrics
- Campaign management with email automation
- Cross-sell analysis and white space identification
- OKR metrics and goal tracking

## Database Schema
The platform uses PostgreSQL with these key tables:
- `customers` - Customer entities with business details
- `partners` - Insurance broker/partner network
- `opportunities` - Sales pipeline with probability tracking
- `products` - Insurance product catalog
- `contacts` - Business contact directory
- `campaigns` - Marketing campaign management
- `categories` - Product categorization system

## Technical Architecture
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with environment isolation
- **Caching**: In-memory with TTL for performance
- **File Processing**: CSV/Excel upload with transformation

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is properly set
- Check PostgreSQL service is running
- Ensure schema permissions are correct

### API Errors
- Check console logs for specific error details
- Verify table structure matches schema definitions
- Restart application to clear cached queries

### Frontend Loading Issues
- Ensure all dependencies are installed
- Check React Query cache invalidation
- Verify API endpoints are accessible

## Production Readiness
The platform is deployment-ready with:
- ✅ All APIs returning authentic business data
- ✅ Database relationships properly established
- ✅ Error handling and logging implemented
- ✅ Performance optimizations in place
- ✅ Responsive UI design
- ✅ Multi-environment support

## Next Steps After Deployment
1. Verify all API endpoints respond correctly
2. Test key user workflows (customer management, opportunity tracking)
3. Configure any additional environment-specific settings
4. Set up monitoring and backup procedures

## Support
The codebase includes comprehensive error handling and logging. Check console output for detailed debugging information if issues arise.

---
*This deployment package represents a fully debugged and verified insurance market intelligence platform ready for production use.*