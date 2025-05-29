# Product Requirements Document: OKR Templates - Coming Soon Tab

## Overview
The Coming Soon tab is a comprehensive OKR template management system that allows users to create, organize, filter, and manage hierarchical OKR templates with advanced functionality including bulk operations, filtering, grouping, and template creation.

## Core Components

### 1. OKR Template Data Structure
```typescript
interface OKRTemplate {
  id: number;
  title: string;
  description?: string;
  type: "Objective" | "Key Result" | "Activity" | "Subactivity";
  hierarchy: "objective" | "key-result" | "activity" | "subactivity";
  parent?: number;
  tags: string[];
  targetValue?: number;
  currentValue?: number;
  unit: "currency" | "percent" | "number" | "checkbox" | "traffic-light";
  status: "Not Started" | "In Progress" | "Completed" | "At Risk";
  owner?: string;
  dueDate?: Date;
  startDate?: Date;
  endDate?: Date;
  nestedCount: number;
  isExpanded: boolean;
  isStandalone?: boolean;
  level: number; // 0=Objective, 1=Activity, 2=Subactivity
}
```

### 2. Header Section
**Location**: Top of the page above filters
**Components**:
- Page title: "OKR Metrics"
- Action buttons (right-aligned):
  - "Manage Tags" button with tag icon
  - "Create Metric" button (primary, indigo background)

**Acceptance Criteria**:
- Header must be consistent with existing page headers
- Buttons must use proper shadcn styling
- Create button opens the OKR creation dialog

### 3. Search and Filter Section
**Location**: Below header, above bulk actions
**Layout**: White background card with rounded corners and shadow

#### 3.1 Search Bar
- Full-width search input with search icon
- Placeholder: "Search OKRs..."
- Real-time filtering as user types
- Searches through title and description fields

#### 3.2 Filter Controls
**Row 1 - Primary Filters**:
- **Tags Filter**: Multi-select dropdown showing all available tags
- **Measure Unit Filter**: Single select dropdown (Currency, Percent, Number, Checkbox, Traffic Light)
- **Target Range Filter**: Single select dropdown with predefined ranges
- **Date Range Filter**: Date picker component for start/end dates

**Row 2 - Organization Controls**:
- **Group By**: Dropdown (Tag, Owner, Status, Measure Unit, None)
- **Sort By**: Dropdown (Name A-Z, Name Z-A, Created Date, Due Date, Target Value)
- **View Options**: Toggle buttons for table density and display preferences

**Acceptance Criteria**:
- All filters work independently and in combination
- Filter state persists during session
- Clear all filters functionality
- Filter badges show active filters with remove option
- Responsive design that stacks on mobile

### 4. Bulk Actions Bar
**Visibility**: Only appears when OKRs are selected
**Design**: Blue background (#EBF4FF) with blue border, rounded corners
**Position**: Between filters and content area

**Components**:
- Selection counter: "X OKR(s) selected"
- Action buttons:
  - "Assign to entity" (calendar icon)
  - "Duplicate" (copy icon)
  - "Delete" (red background, trash icon)
- Close button (X icon, right-aligned)

**Acceptance Criteria**:
- Shows exact count of selected items
- Actions are contextually appropriate
- Delete action requires confirmation
- Bar slides in/out smoothly
- All actions work with multiple selections

### 5. Content Area - Grouped Display

#### 5.1 Group Headers
**Design**: 
- White background sections with group identifier badges
- Tag-based groups show colored tag badges
- "No Tag" groups show dashed gray badges
- Status/Owner groups show simple gray badges

#### 5.2 Data Table Structure
**Table Headers** (styled with Poppins font, #696C8C color):
- Checkbox column (12px width)
- Name (300px min-width)
- Timeframe (120px min-width) 
- Milestone Frequency (150px min-width)
- Target (120px min-width, right-aligned)
- Actions (80px min-width, right-aligned)

**Row Behavior**:
- Hover state: #F5F6FA background
- Border color: #E6E7F1
- Checkboxes appear on hover (except when selected)
- Expand/collapse arrows for items with children

#### 5.3 Hierarchical Display
**Indentation System**:
- Level 0 (Objectives): No indentation, bold font
- Level 1 (Activities): Arrow icon indentation
- Level 2 (Subactivities): Double indentation with circle icon

**Expand/Collapse**:
- Arrow buttons for parent items
- Smooth animation for expanding/collapsing
- State persistence during session
- Visual indicators for nested content

### 6. Individual Row Components

#### 6.1 Name Column
- **Title**: Truncated at 35 characters with tooltip for full text
- **Hierarchy indicators**: Visual icons based on level
- **Description tooltip**: Info icon when description exists
- **Font weight**: Bold for objectives, medium for activities, normal for subactivities

#### 6.2 Timeframe Column
- **Format**: "MMM DD - MMM DD YYYY" or "MMM DD YYYY"
- **Fallbacks**: Show available date or "Not set"
- **Color coding**: Gray for missing dates

#### 6.3 Target Column
- **Format**: Currency (€X,XXX), Percent (XX%), Number (XXX#), Checkbox (✓), Traffic Light (●)
- **Unit display**: Small gray text below value
- **Right-aligned**: For better numerical scanning

#### 6.4 Actions Column
- **Edit button**: Pencil icon
- **Delete button**: Trash icon (red on hover)
- **Size**: 8x8 with padding
- **Visibility**: Always visible, hover for emphasis

### 7. OKR Template Creation Dialog

#### 7.1 Dialog Structure
- **Title**: "Create New OKR Template"
- **Size**: Large modal (800px max width)
- **Sections**: Progressive disclosure based on selections

#### 7.2 Essential Fields Section
**OKR Type Selection**:
- Radio buttons for: Objective, Key Result, Activity, Subactivity
- Visual icons for each type
- Description text for each option

**Hierarchy Relationship** (if not Objective):
- Dropdown to select parent OKR
- Filtered based on selected type
- Shows inherited tag information

**Name Field**:
- Required field with asterisk
- Placeholder: "e.g., Increase Annual Revenue"
- Character limit: 100 characters

**Description Field**:
- Optional textarea
- Placeholder: "Add a description to provide context..."
- Rows: 3, non-resizable

#### 7.3 Measurement Type Section
**Type Selection**:
- Radio buttons: Currency (€), Percentage (%), Number (#), Checkbox (✓), Traffic Light (●)
- Help text for each type
- Dynamic preview of format

**Configuration Options**:
- Traffic lights toggle (auto-enabled for traffic light type)
- Milestone tracking options
- Cumulative vs. snapshot measurement

#### 7.4 Target & Measurement Section
**Show only for**: Non-checkbox and non-traffic-light types
**Target Toggle**:
- Checkbox: "Set target value for this template"
- Help text about template vs. instance targets

**Target Value Input** (when enabled):
- Currency: € prefix, number input
- Percentage: % suffix, number input
- Number: # suffix, number input
- Tooltips explaining format

#### 7.5 Timeline Section
**Start/End Dates**:
- Date picker inputs
- Optional but recommended badge
- Validation: End date after start date

**Review Frequency**:
- Dropdown: Weekly, Monthly, Quarterly, Annually
- Context-sensitive labels (Milestone vs. Review frequency)
- Help text explaining purpose

#### 7.6 Tags and Categorization
**Tag Selection**:
- Multi-select component
- Create new tags inline
- Color preview for existing tags
- Maximum 5 tags per template

**Owner Assignment**:
- Optional dropdown
- Searchable user list
- Default to current user option

#### 7.7 Action Buttons
- **Cancel**: Secondary button, closes dialog
- **Save as Draft**: Tertiary button, saves without publishing
- **Create Template**: Primary button, validates and saves

### 8. Data Operations

#### 8.1 Filtering Logic
**Search**: Case-insensitive, searches title and description
**Tags**: AND logic for multiple tag selection
**Measure Unit**: Exact match filtering
**Target Range**: Numeric range matching with format parsing
**Date Range**: Overlap detection with OKR date ranges

#### 8.2 Grouping Logic
**Tag Grouping**: Primary tag determines group, "No Tag" for untagged
**Owner Grouping**: Group by assigned owner, "No Owner" for unassigned
**Status Grouping**: Standard status categories
**None**: Flat list display

#### 8.3 Hierarchy Management
**Parent-Child Relationships**: Enforced through parent field
**Expansion State**: Tracked in component state
**Bulk Selection**: Includes/excludes children based on context

### 9. Acceptance Criteria Summary

#### 9.1 Functional Requirements
- ✅ All filters work independently and in combination
- ✅ Search performs real-time filtering
- ✅ Bulk actions work on multiple selections
- ✅ Hierarchy expansion/collapse works smoothly
- ✅ Template creation dialog validates all inputs
- ✅ Data persists correctly to storage layer
- ✅ Grouping reorganizes display correctly

#### 9.2 UI/UX Requirements
- ✅ Responsive design works on mobile, tablet, desktop
- ✅ Hover states provide clear feedback
- ✅ Loading states shown during operations
- ✅ Error messages are clear and actionable
- ✅ Color scheme consistent with design system
- ✅ Typography uses specified fonts (Poppins for headers)

#### 9.3 Performance Requirements
- ✅ Filtering responds within 100ms
- ✅ Hierarchy expansion animates smoothly
- ✅ Large datasets (1000+ templates) perform adequately
- ✅ Dialog opens/closes within 200ms

#### 9.4 Accessibility Requirements
- ✅ Keyboard navigation for all interactive elements
- ✅ Screen reader compatible labels and descriptions
- ✅ Color contrast meets WCAG guidelines
- ✅ Focus indicators clearly visible

### 10. Technical Implementation Notes

#### 10.1 State Management
- Use React useState for component-level state
- Consider useReducer for complex filter combinations
- Persist filter state in sessionStorage
- Manage hierarchy expansion state separately

#### 10.2 Data Flow
- Integrate with existing storage interface
- Use TanStack Query for data fetching
- Implement optimistic updates for quick actions
- Cache frequently accessed data

#### 10.3 Component Architecture
- Break dialog into logical sub-components
- Reuse existing shadcn components where possible
- Create custom components for hierarchy display
- Ensure components are testable in isolation

#### 10.4 Integration Points
- Connect to partner assignment system
- Integrate with existing tag management
- Link to user management for owner assignment
- Coordinate with metrics tracking system

This PRD provides comprehensive guidance for implementing the Coming Soon tab functionality with exact specifications for another developer to follow.