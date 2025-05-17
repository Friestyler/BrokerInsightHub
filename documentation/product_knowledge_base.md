# Broker Copilot - Product Knowledge Base

## Product Mission
Broker Copilot is a comprehensive AI-powered platform designed to revolutionize how insurance brokers work by providing intelligent tools, market insights, and operational workflow automation. The platform aims to enhance broker efficiency, improve client relationships, and drive business growth through data-driven decision making.

## Target Users
- Independent insurance brokers
- Brokerage firms
- Insurance agencies
- Partnership networks

## Core Value Proposition
- Reduce administrative workload through AI-powered automation
- Deliver actionable insights for cross-selling and upselling opportunities
- Streamline document comparison and client communication
- Provide real-time market intelligence with minimal effort

## Key Features

### 1. Multi-Environment Architecture
- Complete isolation between environments (My Qollabi, ACME CO, etc.)
- Environment-specific databases with isolated data storage
- Customized UI/UX elements per environment
- Role-based access control within each environment

### 2. Latest Insurance News
- Aggregated insurance industry news specific to Belgium
- AI-powered categorization and relevance filtering
- Ability to save and share important articles
- Trending topics visualization

### 3. Document Comparison & Email Creation
- Intelligent policy document comparison
- Template completion checking
- Multi-policy comparison capabilities
- Automated professional email generation based on comparison results
- Detection of coverage gaps and optimization opportunities

### 4. Cross & Upsell Campaigns (My Qollabi Environment Only)
- AI-driven identification of cross-sell and upsell opportunities
- Client data import and mapping workflow
- Automated campaign generation based on customer data
- ROI tracking and campaign performance metrics
- Note: This feature is disabled in the ACME CO environment

### 5. Customer & Relationship Management
- Comprehensive customer data management
- Team member and partner tracking
- Opportunity pipeline visualization
- Historical activity logging

### 6. Intelligent UI/UX
- Responsive layout with collapsible sidebar navigation
- Consistent hover behavior with light indigo background
- Fixed top and side navigation with scrollable content area
- Environment-aware component rendering

## Technical Boundaries

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
| Latest Insurance News       | ✅         | ✅      | ✅     | ✅      |
| Document Comparison         | ✅         | ✅      | ✅     | ✅      |
| Cross & Upsell Campaigns    | ✅         | ❌      | ✅     | ✅      |
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

## Future Roadmap Considerations
- Integration with AI assistants like Claude
- Mobile application development
- Advanced analytics dashboard
- Client portal functionality
- Automated document generation
- Multi-language support

## Non-Goals
- Consumer-facing insurance purchasing platform
- Replacing human broker expertise
- Full policy administration system
- Claims processing functionality
- Direct carrier integration