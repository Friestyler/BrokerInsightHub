# Product Requirements Document: Campaign Template Creator

## Overview

The Campaign Template Creator is a sophisticated multi-step interface that enables insurance professionals to build reusable, AI-powered email campaign templates for different audience types. This feature streamlines campaign creation by providing pre-configured templates that can be customized and deployed across various business scenarios.

## Problem Statement

Insurance professionals currently face challenges in:
- Creating personalized, effective email campaigns from scratch
- Maintaining consistency across different campaign types
- Efficiently targeting different audience segments (customers, partners, opportunities, internal teams)
- Leveraging AI capabilities for content generation and data integration
- Building complex email sequences with conditional logic

## Product Goals

### Primary Goals
- **Efficiency**: Reduce campaign creation time by 70% through reusable templates
- **Consistency**: Ensure brand and messaging consistency across all campaigns
- **Personalization**: Enable dynamic, AI-powered content generation
- **Scalability**: Support multiple audience types and use cases

### Secondary Goals
- **User Experience**: Provide intuitive, step-by-step template creation
- **Flexibility**: Allow customization while maintaining template structure
- **Intelligence**: Integrate AI for content generation and data fetching

## Target Users

### Primary Users
- **Account Managers**: Creating customer outreach campaigns
- **Partnership Managers**: Building broker and partner communications
- **Sales Teams**: Developing opportunity-focused campaigns
- **Marketing Teams**: Creating internal and external communications

### User Personas
- **Sarah, Account Manager**: Needs quick, personalized customer communications
- **Mike, Partnership Manager**: Requires professional broker outreach templates
- **Lisa, Sales Representative**: Wants opportunity-specific email sequences
- **David, Marketing Manager**: Creates company-wide communication templates

## Features & Requirements

### 1. Multi-Step Template Creation Flow

#### Step 1: Audience Selection
**Requirements:**
- Visual card-based selection interface
- Four primary audience types:
  - **Opportunities**: Business development prospects
  - **Customers**: Existing policy holders
  - **Partners**: Brokers and intermediaries
  - **Internal**: Company employees and stakeholders
- Color-coded visual indicators for each type
- Hover states and selection feedback
- Progress tracking

**User Stories:**
- As a user, I want to select my target audience type so the template is optimized for that segment
- As a user, I want visual cues to help me quickly identify the right audience type

#### Step 2: Template Configuration
**Requirements:**
- Template name input with dynamic placeholder suggestions
- Description field for template purpose documentation
- Objective field for campaign goals definition
- Icon selection from predefined library (8 options minimum)
- Visual confirmation of selections
- Form validation and error handling

**User Stories:**
- As a user, I want to name and describe my template for easy identification later
- As a user, I want to select an appropriate icon to visually represent my template
- As a user, I want to define the template's objective for clarity

#### Step 3: Email Flow Builder
**Overview:**
The Email Flow Builder is the core content creation engine that enables users to design sophisticated, multi-email sequences with AI-powered content generation and conditional logic. This step transforms template configurations into actionable email campaigns.

**Architecture Components:**

##### 3.1 Flow Management System
**Collapsed Flow View:**
- Visual email sequence overview showing all emails in template
- Email cards display: sequence number, subject line, block count, timing
- Click-to-expand functionality for individual email editing
- Drag-and-drop reordering of email sequence
- Add/remove email capabilities with confirmation dialogs

**Expanded Email Editor:**
- Full-screen email editing interface
- Real-time content preview with mobile/desktop views
- Collapsible editor with navigation breadcrumbs
- Auto-save functionality with change tracking
- Email header showing position in sequence and timing

##### 3.2 Email Configuration Panel
**Core Email Settings:**
- **Subject Line Input**: Dynamic placeholder suggestions based on audience type
- **Follow-up Timing**: Configurable delay in days for sequence emails
- **Email Metadata**: Internal naming and categorization
- **Preview Controls**: Toggle between edit and preview modes

**Logo Management:**
- **Dual Logo Upload**: Left and right header positioning
- **File Validation**: Image format, size, and resolution checking
- **Drag-and-drop Interface**: Visual upload with progress indicators
- **Logo Preview**: Real-time positioning and scaling preview

##### 3.3 Content Block System
**Block Architecture:**
The flow builder uses a modular block system where each email consists of ordered, editable content blocks. Each block type serves specific content purposes and maintains its own properties and behavior.

**Available Block Types:**

1. **Text Block**
   - **Purpose**: Primary content paragraphs with personalization
   - **Features**: Rich text editing, dynamic field insertion ({{name}}, {{company}})
   - **Validation**: Character limits, spam filter compliance
   - **Properties**: Font styling, alignment, spacing controls

2. **Heading Block**
   - **Purpose**: Section titles and email headers
   - **Features**: Hierarchical heading levels (H1-H6), personalization support
   - **Styling**: Font weight, size, color customization
   - **SEO**: Semantic markup for email accessibility

3. **Quote Block**
   - **Purpose**: Testimonials, highlighted content, social proof
   - **Features**: Visual quotation styling, attribution fields
   - **Design**: Left border accent, italic formatting
   - **Sources**: Customer testimonials, case studies, endorsements

4. **Button Block**
   - **Purpose**: Call-to-action elements with tracking
   - **Features**: Custom text, URL linking, color theming
   - **Analytics**: Click tracking, conversion measurement
   - **Styling**: Responsive design, hover states, accessibility compliance

5. **Image Block**
   - **Purpose**: Visual content integration
   - **Features**: URL-based image insertion, alt text for accessibility
   - **Optimization**: Automatic resizing, format optimization
   - **Responsive**: Mobile-first scaling and positioning

6. **Divider Block**
   - **Purpose**: Visual section separation
   - **Features**: Horizontal rule with styling options
   - **Design**: Thickness, color, spacing customization
   - **Usage**: Content organization, visual hierarchy

7. **Spacer Block**
   - **Purpose**: Vertical spacing control
   - **Features**: Configurable pixel height (10-100px)
   - **Responsive**: Proportional scaling across devices
   - **Design**: Visual representation in editor mode

##### 3.4 AI Content Generation System
**AI Paragraph Generator:**
- **Input Method**: Natural language prompts describing desired content
- **Context Awareness**: Automatically incorporates audience type and template objective
- **Content Types**: Introductory paragraphs, product descriptions, value propositions
- **Refinement**: Iterative improvement based on user feedback
- **Brand Consistency**: Maintains company tone and messaging guidelines

**AI Data Fetching:**
- **Dynamic Queries**: Natural language requests for CRM data integration
- **Data Sources**: Customer records, opportunity status, partner information, product catalogs
- **Real-time Processing**: Live data retrieval and formatting
- **Personalization**: Individual recipient data integration
- **Error Handling**: Fallback content for missing or invalid data

**Advanced AI Features:**
- **Content Optimization**: A/B testing suggestions for improved performance
- **Sentiment Analysis**: Tone adjustment based on audience and context
- **Compliance Checking**: Regulatory requirement validation
- **Performance Prediction**: Open rate and engagement forecasting

##### 3.5 Conditional Logic Engine
**Logic Types:**

1. **Behavioral Triggers:**
   - **Not Clicked**: Send if recipient didn't interact with previous email links
   - **Not Opened**: Send if recipient didn't open previous email
   - **Time-based**: Always send after specified delay period
   - **Engagement Score**: Send based on cumulative interaction metrics

2. **Custom Logic System:**
   - **Natural Language Input**: Plain English condition descriptions
   - **AI Logic Translation**: Converts descriptions to executable rules
   - **Complex Conditions**: Multi-variable logic with AND/OR operators
   - **Preview Mode**: Logic simulation with test data

**Logic Configuration Interface:**
- **Visual Logic Builder**: Drag-and-drop condition creation
- **Logic Preview**: Real-time condition testing with sample data
- **Logic Validation**: Error checking and conflict resolution
- **Logic Templates**: Pre-built conditions for common scenarios

##### 3.6 Content Block Management
**Block Operations:**
- **Add Blocks**: Sidebar selection with instant insertion
- **Reorder Blocks**: Drag-and-drop with visual feedback
- **Duplicate Blocks**: One-click copying with content preservation
- **Delete Blocks**: Confirmation dialogs with undo capability
- **Block Validation**: Real-time error checking and suggestions

**Block Properties Panel:**
- **Content Editing**: In-line text editing with rich formatting
- **Style Customization**: Typography, colors, spacing, alignment
- **Responsive Settings**: Mobile optimization controls
- **Advanced Properties**: Block-specific configuration options

##### 3.7 Template Integration
**Email Sequence Coordination:**
- **Template Inheritance**: Email settings inherit from template configuration
- **Audience Targeting**: Content adaptation based on selected entity type
- **Brand Consistency**: Automatic application of company styling
- **Variable Management**: Template-wide dynamic field definitions

**Validation System:**
- **Content Validation**: Spam filter compliance, character limits
- **Logic Validation**: Conditional logic error checking
- **Template Completeness**: Required field verification
- **Preview Generation**: Full template rendering with test data

##### 3.8 User Experience Features
**Real-time Collaboration:**
- **Auto-save**: Continuous background saving with conflict resolution
- **Version History**: Change tracking with rollback capabilities
- **Comments System**: Collaborative review and approval workflow
- **Template Sharing**: Team access controls and permissions

**Performance Optimization:**
- **Lazy Loading**: Content blocks load as needed for large templates
- **Caching Strategy**: Frequent content and AI responses cached locally
- **Responsive Design**: Optimized for all device types and screen sizes
- **Accessibility**: Full keyboard navigation and screen reader support

**User Assistance:**
- **Contextual Help**: Tooltips and guidance for each feature
- **Template Suggestions**: AI-powered recommendations based on usage patterns
- **Error Prevention**: Real-time validation with helpful error messages
- **Progress Indicators**: Clear feedback during save and generation operations

### 2. Email Flow Builder Components

#### Content Blocks
**Available Block Types:**
- **Text**: Paragraphs with dynamic field support ({{name}}, {{company}})
- **Heading**: Title sections with personalization
- **Quote**: Testimonials and highlighted content
- **Button**: Call-to-action with customizable links
- **Image**: Visual content with alt text
- **Divider**: Section separators
- **Spacer**: Vertical spacing control
- **AI Paragraph**: AI-generated content based on prompts
- **AI Data Fetch**: Dynamic data integration

#### AI Integration
**Requirements:**
- Natural language prompts for content generation
- Context-aware responses based on audience type
- Data fetching from CRM systems
- Preview of generated content before insertion
- Iterative content refinement

### 3. Template Management

#### Save & Edit Functionality
**Requirements:**
- Save templates for future use
- Edit existing templates
- Version control considerations
- Template sharing capabilities
- Usage analytics tracking

#### Template Application
**Requirements:**
- One-click template application to new campaigns
- Customization of pre-filled content
- Recipient selection integration
- Campaign scheduling capabilities

## Technical Specifications

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with custom components
- **State Management**: React hooks with form validation
- **UI Components**: Shadcn/ui component library
- **Icons**: Lucide React icon library

### Backend Integration
- **API Endpoints**: RESTful API for template CRUD operations
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI API for content generation
- **File Upload**: Multer for logo/image handling

### Data Models

#### Campaign Template Schema
```typescript
interface CampaignTemplate {
  id: number
  name: string
  description: string
  objective: string
  entity: 'opportunities' | 'customers' | 'partners' | 'internal'
  icon: string
  emails: EmailTemplate[]
  created_by_id: number
  created_at: Date
  updated_at: Date
}

interface EmailTemplate {
  id: string
  subject: string
  blocks: EmailBlock[]
  followUpDays: number
  condition?: ConditionalLogic
  leftLogo?: string
  rightLogo?: string
}

interface EmailBlock {
  id: string
  type: 'text' | 'heading' | 'quote' | 'button' | 'image' | 'divider' | 'spacer' | 'ai'
  content: string
  properties?: Record<string, any>
}
```

## User Experience Design

### Design Principles
- **Progressive Disclosure**: Show only relevant options at each step
- **Visual Hierarchy**: Clear information architecture with consistent spacing
- **Feedback Systems**: Immediate visual confirmation of user actions
- **Accessibility**: WCAG compliant interface design
- **Responsive**: Mobile-tablet-desktop optimization

### Visual Design
- **Color Scheme**: Professional palette with entity-specific accent colors
- **Typography**: Clean, readable font hierarchy
- **Spacing**: Consistent 8px grid system
- **Borders**: Subtle borders (#E6E7F1) for section separation
- **Interactive States**: Hover, focus, and selection feedback

### Navigation Flow
1. **Entry**: Access from campaigns dashboard
2. **Step Progression**: Linear flow with ability to navigate between completed steps
3. **Save Points**: Ability to save progress at any step
4. **Exit Options**: Clear back navigation and cancel options

## Success Metrics

### Primary KPIs
- **Template Usage Rate**: % of campaigns created using templates vs. from scratch
- **Time to Campaign Creation**: Average time reduction using templates
- **Template Adoption**: Number of templates created per user per month
- **Campaign Performance**: Open rates and click-through rates for template-based campaigns

### Secondary KPIs
- **AI Feature Usage**: % of templates using AI-generated content
- **Template Sharing**: Number of templates shared between team members
- **User Satisfaction**: NPS scores for template creation experience
- **Error Rates**: Template creation completion rates

## Implementation Phases

### Phase 1: Core Template Creation (Current)
- Multi-step template builder
- Basic content blocks
- Audience type selection
- Template save/edit functionality

### Phase 2: Advanced AI Features
- Enhanced AI content generation
- Smart data fetching
- Template recommendations
- Content optimization suggestions

### Phase 3: Collaboration & Analytics
- Template sharing and permissions
- Usage analytics dashboard
- A/B testing capabilities
- Performance insights

### Phase 4: Enterprise Features
- Template approval workflows
- Brand compliance checking
- Advanced personalization
- Integration with external CRM systems

## Risk Assessment

### Technical Risks
- **AI API Rate Limits**: Implement proper throttling and fallback mechanisms
- **File Upload Security**: Secure image handling and storage
- **Data Consistency**: Ensure template integrity across edits

### User Experience Risks
- **Complexity Overload**: Balance feature richness with usability
- **Learning Curve**: Provide adequate onboarding and documentation
- **Performance**: Optimize for large template libraries

### Business Risks
- **Adoption**: Ensure templates provide clear value over manual creation
- **Maintenance**: Plan for ongoing template library curation
- **Compliance**: Ensure templates meet regulatory requirements

## Dependencies

### External Dependencies
- OpenAI API for content generation
- File storage service for logos/images
- Email delivery service integration
- CRM system APIs for data fetching

### Internal Dependencies
- User authentication and permissions system
- Campaign management infrastructure
- Database optimization for template storage
- Analytics and reporting framework

## Acceptance Criteria

### Must Have
- [ ] Users can create templates for all four audience types
- [ ] Multi-step wizard completes successfully
- [ ] AI content generation works reliably
- [ ] Templates can be saved and edited
- [ ] Email sequences support conditional logic
- [ ] Responsive design across devices

### Should Have
- [ ] Template preview functionality
- [ ] Bulk template operations
- [ ] Template usage analytics
- [ ] Advanced AI prompting
- [ ] Template sharing capabilities

### Nice to Have
- [ ] Template marketplace
- [ ] Advanced conditional logic
- [ ] Integration with external design tools
- [ ] Automated template optimization
- [ ] Multi-language support

## Conclusion

The Campaign Template Creator represents a significant advancement in campaign management efficiency for insurance professionals. By combining intuitive design, AI-powered content generation, and flexible customization options, this feature will enable users to create more effective, personalized campaigns in significantly less time.

The phased implementation approach ensures rapid value delivery while building toward more sophisticated capabilities. Success will be measured through adoption rates, time savings, and improved campaign performance metrics.

---

**Document Version**: 1.0  
**Last Updated**: June 18, 2025  
**Status**: Implementation Complete - Phase 1  
**Next Review**: Q3 2025