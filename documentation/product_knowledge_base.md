# Qollabi Platform - Product Knowledge Base

## Product Mission
Qollabi is a SaaS platform built to streamline collaboration between two companies—typically a provider (e.g., insurer) and a partner (e.g., broker or advisor). The platform helps uncover and act on cross-sell and upsell opportunities in a joint, data-driven way, enhancing broker efficiency, improving client relationships, and driving business growth through collaborative decision making.

## Target Users
- Insurance companies (providers)
- Insurance brokers (partners)
- Financial advisors
- Partnership networks
- Broker agencies

## Core Value Proposition
- Streamline collaboration between insurers and brokers
- Uncover and act on cross-sell/upsell opportunities with data-driven insights
- Reduce administrative workload through AI-powered automation
- Enable joint campaign execution with shared metrics
- Maintain clear boundaries between private and shared data

## Core Components

### 1. Partner Copilot (Homepage)
- Central inbox for users (insurers or brokers)
- Displays shared updates, mentions, campaign invites, and shared workspaces
- Acts as the action center for collaborative workflows
- Multi-environment support with isolated data (My Qollabi, ACME CO, etc.)

### 2. Lists
- Houses key entities:
  - Partners (e.g., brokers)
  - Customers (end clients)
  - Opportunities
  - Projects (optional, similar to opportunities but more implementation-focused)
- Each list can:
  - Be filtered and saved as smart views
  - Be shared with permissions (view/edit)
  - Include dynamic segmentations based on entity attributes
  - Be used collaboratively with other stakeholders

### 3. Campaigns
- Split into:
  - My Campaigns (created by user)
  - Shared Campaigns (shared with user)
  - New Campaign (created from scratch or from template)
- Campaign setup flow:
  1. Select a list (e.g., customers or opportunities)
  2. Compose email (AI-assisted, optional logo upload, form links)
  3. Select recipients (linked contacts per customer)
  4. Configure follow-up cadence (e.g., day 1, day 7)
  5. Set sender settings (user's email or via Qollabi domain)
  6. Launch (save or send)
- Note: This feature is disabled in the ACME CO environment

### 4. Smart List Wizard
- Import customer data from known formats (e.g., Portima, BrokerCloud)
- Automatically detect products owned/missing
- Suggest cross- or upsell opportunities
- Allow brokers to:
  - Confirm suggested opportunities
  - Save selections as reusable smart views
  - Export or act upon the data

### 5. OKR Component (Objectives & Key Results)
- Used to define and track collaborative goals across entities
- Key Features:
  - Can be simple (e.g., a to-do) or nested (hierarchical OKRs)
  - Attributes:
    - Title, description
    - Target & realized values (currency, number, % or checkbox)
    - Responsible person
    - Timeframe & frequency (monthly/quarterly)
    - Attachments, comments, links, due date
    - Progress bar & traffic light indicators
- Templates:
  - OKRs can be grouped into templates and assigned to any entity
  - Grouping via tags
  - Templates can be partially selected when applied
  - Aggregated views possible (e.g., partner performance dashboards)

## Entities & Relationships

### Main Entities
- Partner: Name, address, segment, attributes
- Customer: Linked to a partner, owns multiple products
- Opportunity: A potential cross-sell or upsell moment
- Project (optional): Implementation-oriented variation of an opportunity
- Contact: Associated with either partner or customer

### Relationships
- One insurer has many partners
- Each partner has many customers
- Each customer can have many opportunities
- Opportunities can belong to multiple partners/customers

## Partner Experience
- Partners can:
  - Create their own Qollabi account via email invite
  - Access similar UI to insurers (Copilot, Lists, Campaigns)
  - Upload customer data (e.g., from BrokerCloud or Portima)
  - Use a Smart List Wizard to identify cross-sell/upsell opportunities
  - Launch their own campaigns or participate in insurer-provided ones
  - Maintain private and shared environments

## Access & Permissions
- Entities and views can be shared with permission control (view/edit)
- Users can:
  - Collaborate live on the same list or OKR page
  - Filter which parts of templates to include
  - Maintain visibility boundaries

## Technical Architecture

### Multi-Environment Architecture
- Complete isolation between environments (My Qollabi, ACME CO, etc.)
- Environment-specific databases with isolated data storage
- Customized UI/UX elements per environment
- Role-based access control within each environment

### Data Storage
- PostgreSQL database with environment-specific schemas
- Isolated data access patterns to prevent cross-environment contamination
- Secure credential management

### UI Framework
- React-based frontend with shadcn component library
- Environment-aware routing with guards
- Tailwind CSS styling with Qollabi design system

### API Security
- Environment-specific API endpoints
- Context-aware data access validation
- Input sanitization and validation

## Feature Availability Matrix

| Feature                     | My Qollabi | ACME CO | Globex | Oceanic |
|-----------------------------|------------|---------|--------|---------|
| Partner Copilot             | ✅         | ✅      | ✅     | ✅      |
| Lists & Smart Views         | ✅         | ✅      | ✅     | ✅      |
| Campaigns                   | ✅         | ❌      | ✅     | ✅      |
| Smart List Wizard           | ✅         | ✅      | ✅     | ✅      |
| OKR Component               | ✅         | ✅      | ✅     | ✅      |
| Latest Insurance News       | ✅         | ✅      | ✅     | ✅      |
| Document Comparison         | ✅         | ✅      | ✅     | ✅      |
| Customer Management         | ✅         | ✅      | ✅     | ✅      |
| Opportunities Tracking      | ✅         | ✅      | ✅     | ✅      |
| Partner Management          | ✅         | ✅      | ✅     | ✅      |

## Design Guidelines

### Color Palette
- Primary: #5567E5 (indigo) - Used for buttons, tags, and highlights
- Text: #62647C (gray) - Used for standard text and lines
- Success: #4CAF50 (green) - Used for success states
- Warning: #FF9800 (orange) - Used for warning states
- Error: #F44336 (red) - Used for error states

### Typography
- Primary Font: Poppins
- Headings: Poppins Semi-Bold
- Body: Poppins Regular
- Interactive Elements: Poppins Medium

### Component Styling
- Buttons: Rounded corners (0.375rem), consistent padding
- Cards: Light shadow, subtle border, rounded corners
- Interactive elements: Consistent hover state (light indigo background)
- Responsive layout with collapsible sidebar navigation
- Fixed top and side navigation with scrollable content area

## Future Roadmap Considerations
- Integration with AI assistants like Claude
- Mobile application development
- Advanced analytics dashboard
- Enhanced document comparison capabilities
- Automated document generation
- Multi-language support
- Deeper integrations with broker management systems

## Non-Goals
- Consumer-facing insurance purchasing platform
- Replacing human broker expertise
- Full policy administration system
- Claims processing functionality
- Direct carrier integration