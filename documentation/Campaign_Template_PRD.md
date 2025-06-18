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
**Requirements:**
- Drag-and-drop email sequence builder
- Support for multiple email follow-ups
- Conditional logic between emails (not clicked, not opened, always, custom)
- AI-powered content generation
- Dynamic data fetching capabilities
- Logo upload functionality (left and right placement)
- Real-time preview capabilities

**User Stories:**
- As a user, I want to build email sequences with conditional follow-ups
- As a user, I want AI assistance for content creation
- As a user, I want to include dynamic data relevant to my audience
- As a user, I want to customize email layouts with logos

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