# Product Templates System - Product Requirements Document (PRD)

## Executive Summary

The Product Templates system is a comprehensive insurance product management platform designed to streamline product catalog organization, hierarchical categorization, and cross-entity relationship management for insurance brokers and providers. This system enables insurance professionals to create, manage, and assign standardized product templates that serve as master templates for insurance products across customer, partner, and opportunity relationships.

## Document Information

**Document Version:** 1.0  
**Last Updated:** June 26, 2025  
**Document Owner:** Product Management Team  
**Technical Owner:** Development Team  
**Stakeholders:** Insurance Brokers, Account Managers, Product Managers, IT Operations

---

## 1. Product Overview

### 1.1 Product Vision
To provide a unified, hierarchical product template management system that enables insurance professionals to efficiently organize, categorize, and deploy insurance products across their entire business ecosystem while maintaining data integrity and relationship traceability.

### 1.2 Strategic Objectives
- **Standardization**: Create consistent product templates across all insurance categories
- **Efficiency**: Reduce time spent on product setup and configuration by 75%
- **Scalability**: Support unlimited product hierarchies and categories
- **Integration**: Seamless integration with existing CRM, opportunity management, and partner systems
- **Compliance**: Maintain audit trails and regulatory compliance for all product relationships

### 1.3 Success Metrics
- **Primary**: 50+ active product templates per environment
- **Secondary**: <5 seconds average product assignment time
- **Quality**: 95% user satisfaction rating
- **Adoption**: 100% of insurance categories represented in hierarchy

---

## 2. User Personas & Use Cases

### 2.1 Primary Personas

#### Insurance Product Manager
- **Role**: Responsible for maintaining product catalog integrity
- **Goals**: Create comprehensive product hierarchies, ensure accurate pricing data, maintain category organization
- **Pain Points**: Manual product entry, inconsistent categorization, difficulty tracking product relationships

#### Account Manager
- **Role**: Assigns products to customers and opportunities
- **Goals**: Quickly find appropriate products, assign to entities, track product performance
- **Pain Points**: Time-consuming product searches, unclear product hierarchies, missing product information

#### Broker Administrator
- **Role**: Manages overall system configuration and user access
- **Goals**: Maintain system organization, ensure data quality, oversee user permissions
- **Pain Points**: Complex administrative tasks, maintaining data consistency across environments

### 2.2 Core Use Cases

#### UC1: Product Template Creation
**Actor**: Insurance Product Manager  
**Goal**: Create new insurance product template with complete attributes  
**Preconditions**: User has product management permissions  
**Main Flow**:
1. Navigate to Product Templates → Templates tab
2. Click "Add product" button
3. Fill required fields: Product ID, Name, Category
4. Configure optional attributes: Provider, Pricing, Contract dates
5. Save template to database
6. Template appears in filterable table view

**Success Criteria**: Template created with all attributes correctly stored and immediately available for assignment

#### UC2: Hierarchical Category Management
**Actor**: Insurance Product Manager  
**Goal**: Create and manage three-level category hierarchy  
**Preconditions**: User has category management permissions  
**Main Flow**:
1. Navigate to Product Templates → Categories tab
2. Create root category (Level 1): Life, Non-Life, Services
3. Add subcategories (Level 2): Death Cover, Auto Insurance, etc.
4. Add sub-subcategories (Level 3): Term Life, Whole Life, etc.
5. Assign colors and descriptions for visual organization
6. Configure collapsible hierarchy display

**Success Criteria**: Complete category hierarchy visible with proper parent-child relationships and visual indicators

#### UC3: Product Assignment to Entities
**Actor**: Account Manager  
**Goal**: Assign product templates to customers, partners, or opportunities  
**Preconditions**: Entities exist in system, product templates available  
**Main Flow**:
1. Navigate to entity detail page (Customer/Partner/Opportunity)
2. Click "Add product" in product assignment section
3. Search and filter available product templates
4. Select appropriate template from hierarchical category view
5. Configure entity-specific attributes and values
6. Confirm assignment with workflow buttons

**Success Criteria**: Product successfully assigned to entity with custom attributes and visible in entity's product list

---

## 3. Functional Requirements

### 3.1 Product Template Management

#### 3.1.1 Template Creation & Editing
- **REQ-PT-001**: System SHALL support creation of product templates with following attributes:
  - Product ID (unique identifier, required)
  - Name (required, max 255 characters)
  - Description (optional, max 1000 characters)
  - Category assignment (required, hierarchical selection)
  - Provider information (vendor/partner/other)
  - Contract dates (start/end, date picker)
  - Financial data (average price, premium %, discount %)
  - Status and notes (optional metadata)
  - Tags (array of strings for additional categorization)

- **REQ-PT-002**: System SHALL validate all required fields before saving
- **REQ-PT-003**: System SHALL prevent duplicate Product IDs across environment
- **REQ-PT-004**: System SHALL support bulk editing of multiple templates
- **REQ-PT-005**: System SHALL maintain audit trail of all template modifications

#### 3.1.2 Template Display & Search
- **REQ-PT-006**: System SHALL display templates in paginated table format with sorting
- **REQ-PT-007**: System SHALL support real-time search across name and description fields
- **REQ-PT-008**: System SHALL provide category-based filtering with hierarchical selection
- **REQ-PT-009**: System SHALL show relationship counts (customers, partners, opportunities)
- **REQ-PT-010**: System SHALL support bulk selection with multi-select checkboxes

### 3.2 Category Hierarchy Management

#### 3.2.1 Category Structure
- **REQ-CH-001**: System SHALL support three-level category hierarchy:
  - Level 1: Root categories (Life, Non-Life, Services)
  - Level 2: Subcategories (Death Cover, Auto Insurance, etc.)
  - Level 3: Sub-subcategories (Term Life, Comprehensive Auto, etc.)

- **REQ-CH-002**: System SHALL enforce hierarchical relationships with proper parent-child links
- **REQ-CH-003**: System SHALL support unlimited categories at each level
- **REQ-CH-004**: System SHALL validate category names for uniqueness within parent scope
- **REQ-CH-005**: System SHALL prevent deletion of categories with associated products

#### 3.2.2 Category Visual Design
- **REQ-CH-006**: System SHALL support color coding for each category level
- **REQ-CH-007**: System SHALL display collapsible category trees with chevron controls
- **REQ-CH-008**: System SHALL show product counts per category
- **REQ-CH-009**: System SHALL provide hover effects and visual feedback for interactions
- **REQ-CH-010**: System SHALL maintain consistent visual hierarchy across all views

### 3.3 Product Assignment System

#### 3.3.1 Entity Integration
- **REQ-PA-001**: System SHALL support product assignment to:
  - Customers (individual client relationships)
  - Partners (broker/distributor relationships)
  - Opportunities (sales pipeline integration)

- **REQ-PA-002**: System SHALL display assigned products in entity detail pages
- **REQ-PA-003**: System SHALL support custom attribute values per assignment
- **REQ-PA-004**: System SHALL track assignment history and modifications
- **REQ-PA-005**: System SHALL prevent duplicate product assignments to same entity

#### 3.3.2 Assignment Workflow
- **REQ-PA-006**: System SHALL provide modal dialog for product assignment
- **REQ-PA-007**: System SHALL display hierarchical category selection in assignment flow
- **REQ-PA-008**: System SHALL support multiple assignment workflow options:
  - "Add & continue" (assign and keep dialog open)
  - "Add & close" (assign and close dialog)
  - "Close" (cancel without assignment)

- **REQ-PA-009**: System SHALL validate assignment data before confirmation
- **REQ-PA-010**: System SHALL provide immediate visual feedback upon successful assignment

---

## 4. Technical Architecture

### 4.1 Database Schema

#### 4.1.1 Core Tables
```sql
-- Product Templates (Master Templates)
product_templates:
- id (serial, primary key)
- product_id (text, unique, required)
- name (text, required)
- description (text)
- category_id (integer, foreign key to categories.id)
- provider_id (integer, references multiple entity types)
- provider_type (text: 'vendor', 'partner', 'other')
- provider_name (text)
- contract_start_date (date)
- contract_end_date (date)
- average_price (numeric, precision 12, scale 2)
- premium_value (numeric, precision 12, scale 2)
- premium_percentage (numeric, precision 5, scale 2)
- discount (numeric, precision 12, scale 2)
- discount_percentage (numeric, precision 5, scale 2)
- vendor_id (integer, legacy field)
- is_active (boolean, default true)
- notes (text)
- tags (text array)
- created_at (timestamp)
- updated_at (timestamp)

-- Categories (Hierarchical Organization)
categories:
- id (serial, primary key)
- name (text, required)
- color (text, default '#3B82F6')
- description (text)
- parent_id (integer, self-reference)
- level (integer, 1-3 for hierarchy depth)
- sort_order (integer, for custom ordering)
- is_active (boolean, default true)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 4.1.2 Relationship Tables
- **product_assignments**: Links templates to customers/partners/opportunities
- **template_attributes**: Custom attribute values per assignment
- **assignment_history**: Audit trail for all assignment changes

### 4.2 API Endpoints

#### 4.2.1 Product Templates API
```typescript
// Core CRUD operations
GET    /api/:envId/product-templates          // List all templates
POST   /api/:envId/product-templates          // Create new template
GET    /api/:envId/product-templates/:id      // Get specific template
PUT    /api/:envId/product-templates/:id      // Update template
DELETE /api/:envId/product-templates/:id      // Delete template

// Search and filtering
GET    /api/:envId/product-templates?search=:term
GET    /api/:envId/product-templates?category=:categoryId
GET    /api/:envId/product-templates?provider=:providerId
```

#### 4.2.2 Categories API
```typescript
// Hierarchy management
GET    /api/:envId/categories                 // Get full hierarchy
POST   /api/:envId/categories                 // Create category
PUT    /api/:envId/categories/:id             // Update category
DELETE /api/:envId/categories/:id             // Delete category (if no products)

// Hierarchy utilities
GET    /api/:envId/categories/roots           // Get root categories only
GET    /api/:envId/categories/:id/children    // Get direct children
GET    /api/:envId/categories/:id/descendants // Get all descendants
```

#### 4.2.3 Assignment API
```typescript
// Product assignments
POST   /api/:envId/assignments                // Create assignment
GET    /api/:envId/assignments/:entityType/:entityId  // Get entity assignments
PUT    /api/:envId/assignments/:id            // Update assignment
DELETE /api/:envId/assignments/:id            // Remove assignment
```

### 4.3 Frontend Architecture

#### 4.3.1 Component Structure
```typescript
ProductTemplates/
├── ProductTemplatesPage          // Main container with tab navigation
├── TemplatesTable               // Table view with search/filter
├── CategoryHierarchy            // Collapsible category tree
├── ProductTemplateForm          // Create/edit form dialog
├── CategoryManager              // Category CRUD interface
├── ProductAssignmentDialog      // Assignment workflow modal
└── BulkActions                  // Multi-select operations
```

#### 4.3.2 State Management
- **React Query**: API data fetching and caching
- **useState**: Local component state
- **useForm**: Form validation and submission
- **Context**: Global environment and user state

#### 4.3.3 UI/UX Framework
- **shadcn/ui**: Component library (Tables, Dialogs, Forms)
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon system
- **Google/Apple Design**: Clean, professional aesthetics

---

## 5. User Interface Specifications

### 5.1 Main Navigation
- **Tab Structure**: Two primary tabs - "Templates" and "Categories"
- **Consistent Header**: Page title with primary action button
- **Breadcrumb Navigation**: Clear path indication
- **Search Integration**: Global search bar with real-time filtering

### 5.2 Templates Tab Layout

#### 5.2.1 Toolbar Section
- **Search Bar**: Real-time template search (debounced input)
- **Category Filter**: Hierarchical dropdown with indented options
- **Clear Filter**: Button to reset filters (conditional visibility)
- **Add Product**: Primary action button (Qollabi brand color #5567E5)

#### 5.2.2 Table Structure
| Column | Type | Width | Sortable | Description |
|--------|------|-------|----------|-------------|
| Checkbox | Selection | 48px | No | Bulk selection control |
| Product ID | Text | 100px | Yes | Unique identifier |
| Name | Text | 200px | Yes | Product name |
| Description | Text | 250px | No | Truncated description |
| Category | Badge | 150px | Yes | Category assignment |
| Provider | Text | 120px | Yes | Provider name |
| Average Price | Currency | 100px | Yes | Formatted price (€) |
| Premium % | Percentage | 100px | Yes | Premium percentage |
| Discount % | Percentage | 100px | Yes | Discount percentage |
| Actions | Menu | 48px | No | Edit/Delete dropdown |

#### 5.2.3 Bulk Actions Bar
- **Selection Counter**: "X items selected"
- **Add to List**: Create/assign to saved lists
- **Clear Selection**: Reset all selections
- **Conditional Display**: Only visible when items selected

### 5.3 Categories Tab Layout

#### 5.3.1 Category Tree Structure
```
Life (Level 1 - Green family)
├─ Death Cover (Level 2)
│  ├─ Term Life (Level 3)
│  └─ Whole Life (Level 3)
├─ Branch 21 (Level 2)
└─ Group Insurance (Level 2)

Non-Life (Level 1 - Blue family)
├─ Auto Insurance (Level 2)
│  ├─ Comprehensive (Level 3)
│  └─ Third Party (Level 3)
├─ Health Insurance (Level 2)
└─ Property Insurance (Level 2)

Services (Level 1 - Purple family)
├─ Risk Assessment (Level 2)
└─ Claims Management (Level 2)
```

#### 5.3.2 Category Card Design
- **Collapsible Structure**: Chevron controls for expand/collapse
- **Color Indicators**: Visual dots showing category colors
- **Product Counts**: Badge showing number of products per category
- **Action Menus**: Three-dot menus for edit/delete operations
- **Hover Effects**: Subtle background changes and button reveals

### 5.4 Dialog Specifications

#### 5.4.1 Product Template Form Dialog
- **Size**: max-w-2xl (medium-large dialog)
- **Scroll**: Vertical overflow for long forms
- **Sections**: Organized field groups with visual separation
- **Validation**: Real-time validation with error messages
- **Actions**: Cancel and Save buttons with loading states

#### 5.4.2 Product Assignment Dialog
- **Size**: max-w-4xl (large dialog for complex workflow)
- **Layout**: Split-panel design (product selection + configuration)
- **Search**: Integrated search across products and categories
- **Hierarchy**: Visual category tree with indentation
- **Workflow**: Multi-step process with clear progress indication

---

## 6. Business Rules & Validation

### 6.1 Data Validation Rules

#### 6.1.1 Product Template Validation
- **Product ID**: Must be unique within environment, alphanumeric only
- **Name**: Required, 1-255 characters, no special characters in primary field
- **Category**: Must reference existing category in hierarchy
- **Financial Fields**: Must be positive numbers, percentage fields 0-100%
- **Dates**: Contract end date must be after start date
- **Provider**: If specified, must exist in respective entity table

#### 6.1.2 Category Validation
- **Name**: Required, unique within parent scope, 1-100 characters
- **Color**: Must be valid hex color code
- **Parent Relationship**: Cannot create circular references
- **Level Constraint**: Maximum 3 levels deep
- **Deletion**: Cannot delete categories with associated products

### 6.2 Business Logic Rules

#### 6.2.1 Template Management
- **Soft Delete**: Templates marked as inactive rather than physically deleted
- **Version Control**: Changes tracked with timestamps and user attribution
- **Duplicate Prevention**: System prevents duplicate assignments to same entity
- **Cascade Updates**: Category changes propagate to associated templates

#### 6.2.2 Assignment Logic
- **Entity Validation**: Target entity must exist and be active
- **Permission Checks**: User must have assignment rights to target entity
- **Conflict Resolution**: Duplicate assignments handled gracefully
- **Relationship Tracking**: Maintains bidirectional relationship references

---

## 7. Performance Requirements

### 7.1 Response Time Requirements
- **Template List Loading**: < 2 seconds for 1000+ templates
- **Category Hierarchy**: < 1 second for complete tree structure
- **Search Operations**: < 500ms for real-time search results
- **Assignment Operations**: < 3 seconds for assignment confirmation
- **Bulk Operations**: < 10 seconds for 100+ item operations

### 7.2 Scalability Requirements
- **Template Volume**: Support 10,000+ templates per environment
- **Category Depth**: Unlimited categories within 3-level constraint
- **Concurrent Users**: Handle 50+ simultaneous users
- **Assignment Volume**: Support 100,000+ entity-product relationships
- **Search Performance**: Maintain speed with growing data volume

### 7.3 Data Requirements
- **Database Size**: Optimized for 1GB+ product data per environment
- **Query Optimization**: Indexed searches on name, category, and provider fields
- **Caching Strategy**: 5-minute TTL for template data, 10-minute for categories
- **Backup Requirements**: Daily automated backups with point-in-time recovery

---

## 8. Security & Compliance

### 8.1 Access Control
- **Role-Based Permissions**: Different access levels for view/edit/delete operations
- **Environment Isolation**: Strict data separation between client environments
- **User Authentication**: Integration with existing SSO systems
- **Audit Logging**: Complete trail of all user actions and data changes

### 8.2 Data Protection
- **Field Encryption**: Sensitive financial data encrypted at rest
- **Input Sanitization**: All user inputs validated and sanitized
- **SQL Injection Prevention**: Parameterized queries and ORM protection
- **XSS Protection**: Output encoding and Content Security Policy

### 8.3 Compliance Requirements
- **GDPR Compliance**: Data processing transparency and deletion capabilities
- **Financial Regulations**: Audit trails for all financial data modifications
- **Insurance Compliance**: Regulatory reporting capabilities for product data
- **Data Retention**: Configurable retention policies per environment

---

## 9. Integration Requirements

### 9.1 Internal System Integration
- **CRM Integration**: Seamless data flow with customer management system
- **Opportunity Pipeline**: Integration with sales opportunity tracking
- **Partner Management**: Bidirectional sync with partner relationship data
- **Campaign System**: Product data available for marketing campaigns

### 9.2 External System Integration
- **Insurance Providers**: API connections for real-time product updates
- **Regulatory Databases**: Integration with compliance and regulatory systems
- **Financial Systems**: Connection to pricing and premium calculation engines
- **Document Management**: Integration with policy and contract storage

### 9.3 API Standards
- **RESTful Design**: Standard HTTP methods and status codes
- **JSON Format**: Consistent data exchange format
- **Rate Limiting**: API throttling to prevent abuse
- **Versioning**: Backward-compatible API version management

---

## 10. Testing Strategy

### 10.1 Functional Testing
- **Unit Tests**: 90%+ code coverage for business logic
- **Integration Tests**: API endpoint validation and database operations
- **End-to-End Tests**: Complete user workflows from UI to database
- **Regression Tests**: Automated testing for all core functionalities

### 10.2 Performance Testing
- **Load Testing**: Simulate 100+ concurrent users
- **Stress Testing**: Identify system breaking points
- **Database Testing**: Query performance under load
- **UI Responsiveness**: Frontend performance optimization

### 10.3 Security Testing
- **Penetration Testing**: External security assessment
- **Vulnerability Scanning**: Automated security scanning
- **Access Control Testing**: Permission and authorization validation
- **Data Validation Testing**: Input sanitization verification

---

## 11. Deployment & Operations

### 11.1 Deployment Strategy
- **Environment Promotion**: Development → Staging → Production pipeline
- **Database Migration**: Automated schema updates with rollback capability
- **Feature Flags**: Gradual feature rollout with toggle controls
- **Monitoring**: Application and database performance monitoring

### 11.2 Maintenance Requirements
- **Regular Updates**: Monthly feature releases and quarterly major updates
- **Database Maintenance**: Regular optimization and cleanup procedures
- **Security Updates**: Immediate deployment of security patches
- **Backup Verification**: Regular backup restoration testing

### 11.3 Support Requirements
- **User Training**: Comprehensive training materials and sessions
- **Documentation**: User guides, API documentation, and troubleshooting guides
- **Help Desk**: Dedicated support channel for user assistance
- **System Monitoring**: 24/7 monitoring with alerting for critical issues

---

## 12. Success Criteria & KPIs

### 12.1 Launch Criteria
- [ ] All functional requirements implemented and tested
- [ ] Security review completed and approved
- [ ] Performance benchmarks met under load testing
- [ ] User acceptance testing completed with 95%+ satisfaction
- [ ] Documentation completed and reviewed
- [ ] Support team trained and ready

### 12.2 Post-Launch KPIs

#### 12.2.1 Usage Metrics
- **Template Creation**: 50+ templates created within first month
- **Category Utilization**: 80%+ of categories have associated products
- **Assignment Volume**: 100+ product assignments per week
- **User Adoption**: 90%+ of eligible users actively using system

#### 12.2.2 Performance Metrics
- **System Uptime**: 99.5%+ availability
- **Response Times**: All operations within defined SLAs
- **Error Rates**: <1% error rate for all operations
- **User Satisfaction**: 4.5+ rating on user feedback surveys

#### 12.2.3 Business Impact Metrics
- **Time Savings**: 75% reduction in product setup time
- **Data Quality**: 95%+ accurate product categorization
- **Process Efficiency**: 50% reduction in assignment errors
- **User Productivity**: 40% increase in products managed per user

---

## 13. Risk Analysis & Mitigation

### 13.1 Technical Risks

#### High Risk: Database Performance Degradation
- **Impact**: Slow response times affecting user experience
- **Probability**: Medium
- **Mitigation**: Database indexing optimization, query performance monitoring, scalable infrastructure

#### Medium Risk: Integration Complexity
- **Impact**: Delayed delivery due to complex external integrations
- **Probability**: Medium
- **Mitigation**: Phased integration approach, mock services for testing, dedicated integration team

### 13.2 Business Risks

#### High Risk: User Adoption Resistance
- **Impact**: Low system utilization affecting ROI
- **Probability**: Low
- **Mitigation**: Comprehensive training program, change management support, user feedback incorporation

#### Medium Risk: Data Migration Challenges
- **Impact**: Extended downtime during transition
- **Probability**: Medium
- **Mitigation**: Extensive migration testing, rollback procedures, parallel system operation

### 13.3 Security Risks

#### High Risk: Data Breach
- **Impact**: Regulatory violations and reputation damage
- **Probability**: Low
- **Mitigation**: Multi-layer security controls, regular security audits, incident response plan

---

## 14. Future Roadmap

### 14.1 Phase 2 Enhancements (Q3 2025)
- **Advanced Analytics**: Product performance dashboards and insights
- **Workflow Automation**: Automated product assignments based on rules
- **Mobile Application**: Native mobile app for field users
- **Advanced Search**: AI-powered semantic search capabilities

### 14.2 Phase 3 Enhancements (Q4 2025)
- **Machine Learning**: Predictive product recommendations
- **Advanced Reporting**: Custom report builder with scheduling
- **Third-party Marketplace**: Integration with external product catalogs
- **API Ecosystem**: Public APIs for partner integrations

### 14.3 Long-term Vision (2026+)
- **AI Assistant**: Conversational interface for product management
- **Blockchain Integration**: Immutable audit trails for compliance
- **Global Expansion**: Multi-language and multi-currency support
- **Industry Standards**: Adoption of emerging insurance technology standards

---

## 15. Conclusion

The Product Templates system represents a comprehensive solution for modern insurance product management, combining hierarchical organization, robust relationship tracking, and intuitive user experience. This PRD provides the foundation for building a scalable, secure, and user-friendly system that will transform how insurance professionals manage their product portfolios.

The system's modular architecture, extensive validation rules, and comprehensive testing strategy ensure reliable operation while providing the flexibility needed for future enhancements. Success will be measured through user adoption, performance metrics, and business impact, with continuous improvement driven by user feedback and evolving business requirements.

---

**Document Status**: Final  
**Review Date**: June 26, 2025  
**Next Review**: July 26, 2025  
**Approval Required**: Product Management, Engineering, Security, Business Stakeholders