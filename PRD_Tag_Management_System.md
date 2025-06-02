# Product Requirements Document: Tag Management System

## Overview
The Tag Management System is a comprehensive tagging solution that enables users to create, organize, and manage tags across the entire My Qollabi platform. Tags provide a flexible way to categorize and filter OKRs, partners, opportunities, customers, and future entities like campaigns.

## Core Objectives
- Provide a centralized tag management interface
- Enable cross-platform tag usage and consistency
- Support real-time tag creation and management
- Maintain data integrity across all tagged entities

## System Architecture

### 1. Database Schema
```typescript
interface Tag {
  id: number;
  name: string;
  color: string; // 'blue', 'green', 'purple', 'red', 'orange', 'yellow', 'pink', 'gray'
  createdAt: Date;
  updatedAt: Date;
}

interface InsertTag {
  name: string;
  color: string;
}
```

### 2. API Endpoints
- `GET /api/tags` - Retrieve all tags
- `POST /api/tags` - Create new tag
- `PUT /api/tags/:id` - Update existing tag
- `DELETE /api/tags/:id` - Delete tag

## Features and Components

### 1. Tags Management Page

#### 1.1 Page Structure
**Location**: `/tags`
**Layout**: Matches OKR Templates page design with white background

**Components**:
- Header section with page title and actions
- Search and filter functionality
- Tags table with CRUD operations
- Empty state handling

#### 1.2 Header Section
**Elements**:
- Page title: "Tags"
- Subtitle: "Create and manage tags to organize items across the platform"
- Primary action: "Add new tag" button (blue background)

**Acceptance Criteria**:
- Header maintains consistent styling with other pages
- Button opens tag creation dialog
- Title and subtitle use Poppins font family

#### 1.3 Tags Table
**Columns**:
- Tag name with color indicator
- Color (visual representation)
- Created date
- Actions (Edit, Delete)

**Acceptance Criteria**:
- Table displays all tags from database
- Color indicators match tag color property
- Created date formatted consistently
- No pagination required (reasonable tag limit expected)
- Responsive design for mobile/tablet

#### 1.4 Empty State
**Display Conditions**: When no tags exist in database

**Content**:
- Tag icon (lucide-react tag icon)
- Heading: "No tags yet"
- Description: "Get started by creating your first tag. Tags help organize and categorize items across the platform."
- No action button (header button serves this purpose)

**Acceptance Criteria**:
- Empty state only appears when tags array is empty
- Uses consistent styling with other empty states
- No duplicate action buttons

### 2. Tag Creation and Editing

#### 2.1 Create Tag Dialog
**Trigger**: "Add new tag" button click

**Form Fields**:
- Tag name (required, text input)
- Color selection (required, 8 predefined colors)

**Color Options**:
- Blue (#3B82F6)
- Green (#10B981)
- Purple (#8B5CF6)
- Red (#EF4444)
- Orange (#F97316)
- Yellow (#EAB308)
- Pink (#EC4899)
- Gray (#6B7280)

**Acceptance Criteria**:
- Form validation prevents empty tag names
- Color selection is required (defaults to blue)
- Duplicate tag names are prevented
- Success message displays after creation
- Dialog closes automatically on success
- Tags table updates immediately (React Query cache invalidation)

#### 2.2 Edit Tag Dialog
**Trigger**: Edit button click in tags table

**Behavior**:
- Pre-populates form with existing tag data
- Allows modification of name and color
- Validates for duplicate names (excluding current tag)

**Acceptance Criteria**:
- Form loads with current tag values
- Validation prevents conflicts with other tags
- Updates reflect immediately in UI
- Success notification displayed

#### 2.3 Delete Tag
**Trigger**: Delete button click in tags table

**Behavior**:
- Shows confirmation dialog
- Permanently removes tag from database
- Updates UI immediately

**Acceptance Criteria**:
- Confirmation dialog prevents accidental deletion
- Hard delete from database (no soft delete)
- Immediate UI update via cache invalidation

### 3. Tag Integration in OKR Templates

#### 3.1 Tag Selection Interface
**Location**: OKR Template creation dialog, Tag field

**Functionality**:
- Dropdown shows all available tags
- Each tag displays with color indicator
- "Create new tag" option at bottom of list
- Optional field (can be left blank)

**Acceptance Criteria**:
- Real-time data from tags API
- Color indicators match tag colors
- Dropdown updates when new tags are created
- Tags sorted alphabetically

#### 3.2 Inline Tag Creation
**Trigger**: Selecting "Create new tag" from dropdown

**Interface**:
- Inline form within dialog (no separate popup)
- Tag name input field
- Color selection (8 color buttons)
- Create and Cancel buttons

**Behavior**:
- Creates tag via API
- Automatically selects new tag in OKR form
- Returns to normal dropdown view
- Shows success notification

**Acceptance Criteria**:
- Form appears inline without modal
- Tag creation doesn't close parent dialog
- New tag immediately available in dropdown
- Automatic selection of created tag
- Form validation matches main tag creation

#### 3.3 Tag Display in OKR Templates
**Format**: Badge with colored background and tag name
**Colors**: Match tag color property
**Positioning**: Displayed in tag column/field

## Data Integrity and Consistency

### 4.1 Real-time Updates
**Mechanism**: React Query with cache invalidation

**Behavior**:
- Tag creation invalidates `/api/tags` cache
- Tag updates invalidate `/api/tags` cache
- Tag deletion invalidates `/api/tags` cache
- All components using tags refresh automatically

**Acceptance Criteria**:
- No manual refresh required
- Changes visible across all platform areas
- Consistent data between components

### 4.2 Error Handling
**Scenarios**:
- Network failures
- Duplicate tag names
- Invalid color values
- Database connection issues

**User Experience**:
- Clear error messages via toast notifications
- Form validation prevents submission
- Graceful degradation when API unavailable

**Acceptance Criteria**:
- Error messages are user-friendly
- No data loss during errors
- Retry mechanisms where appropriate

## Future Extensibility

### 5.1 Cross-Platform Usage
**Planned Integration**:
- Partners management
- Opportunities tracking
- Customer management
- Campaign organization

**Requirements**:
- Tag schema supports multiple entity types
- Consistent tag display across platforms
- Unified tag selection interface

### 5.2 Advanced Features (Future)
**Potential Enhancements**:
- Tag hierarchies/categories
- Custom color definitions
- Tag usage analytics
- Bulk tag operations
- Tag templates

## Technical Requirements

### 6.1 Performance
- Tags list loads within 200ms
- Tag creation completes within 500ms
- UI updates appear within 100ms of API response

### 6.2 Data Validation
- Tag names: 1-50 characters, alphanumeric and spaces
- Colors: Must match predefined color values
- Uniqueness: Case-insensitive tag name validation

### 6.3 Security
- Input sanitization for tag names
- SQL injection prevention
- XSS protection for tag display

## Acceptance Criteria Summary

### Core Functionality
- ✅ Users can create tags with name and color
- ✅ Users can edit existing tags
- ✅ Users can delete tags with confirmation
- ✅ Tags display in searchable/filterable table
- ✅ Empty state shows when no tags exist

### OKR Integration
- ✅ Tag dropdown shows real database tags
- ✅ Users can select existing tags in OKR creation
- ✅ Users can create new tags inline during OKR creation
- ✅ New tags automatically selected after creation
- ✅ Tag colors display consistently

### Data Integrity
- ✅ Real-time updates across all components
- ✅ No duplicate tag names allowed
- ✅ Database persistence for all operations
- ✅ Proper error handling and user feedback

### User Experience
- ✅ Consistent design with platform standards
- ✅ Responsive layout for all device sizes
- ✅ Intuitive navigation and interaction patterns
- ✅ Clear success/error feedback

## Success Metrics
- Tag creation completion rate > 95%
- User adoption of tagging features > 80%
- Cross-platform tag consistency 100%
- Page load performance < 200ms
- Zero data integrity issues

## Dependencies
- PostgreSQL database with tags table
- React Query for state management
- Shadcn/ui component library
- Drizzle ORM for database operations
- Express.js API backend

## Deployment Notes
- Database migration required for tags table
- API endpoints must be deployed before frontend
- Cache invalidation strategies must be tested
- Monitor tag creation/deletion rates post-deployment