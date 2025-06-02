# Product Requirements Document: Tag Filter - OKR Templates Page

## Overview
The Tag Filter system on the OKR Templates page enables users to filter and view OKR templates based on their assigned tags. This filtering mechanism provides efficient navigation through large template collections and supports multiple tag selection patterns.

## Core Objectives
- Enable quick filtering of OKR templates by tags
- Support multiple tag selection modes
- Maintain filter state during user sessions
- Provide clear visual feedback for active filters
- Integrate seamlessly with search and other filters

## System Architecture

### 1. Data Structure

#### 1.1 Tag Integration in OKR Templates
```typescript
interface OKRTemplate {
  id: number;
  title: string;
  description: string;
  type: string;
  tags: string[]; // Array of tag names
  // ... other template properties
}

interface Tag {
  id: number;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 1.2 Filter State Management
```typescript
interface TagFilterState {
  selectedTags: string[];
  filterMode: 'any' | 'all'; // Match any tag OR all tags
  isActive: boolean;
  availableTags: Tag[];
}
```

## User Interface Design

### 2.1 Filter Interface Location
**Position**: Above the OKR templates table, in the filters section
**Layout**: Horizontal filter bar with other filter controls
**Responsive**: Stacks vertically on mobile devices

### 2.2 Tag Filter Component Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Tags: [All Tags ▼] [Selected: Marketing plan × ] [Clear]   │
└─────────────────────────────────────────────────────────────┘
```

#### 2.2.1 Tag Selector Dropdown
**Trigger**: "All Tags" dropdown button
**Content**: Multi-select dropdown with all available tags
**Features**:
- Search within tags
- Color indicators for each tag
- Selection checkboxes
- "Select All" / "Clear All" options

#### 2.2.2 Selected Tags Display
**Format**: Badge-style pills with tag name and remove button
**Styling**: 
- Background color matches tag color (lighter shade)
- Text color: Dark for readability
- Remove button: × icon on hover
- Maximum width with text truncation

#### 2.2.3 Clear Filter Button
**Visibility**: Only shown when tags are selected
**Action**: Removes all selected tags
**Text**: "Clear" or "Clear All"

### 2.3 Dropdown Interface Design

#### 2.3.1 Tag List Structure
```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 Search tags...                                          │
├─────────────────────────────────────────────────────────────┤
│ □ All tags        □ Clear all                              │
├─────────────────────────────────────────────────────────────┤
│ ☑ ● Marketing plan                                         │
│ □ ● Product Innovation                                     │
│ □ ● Customer Experience                                    │
│ □ ● Revenue Growth                                         │
│ ... (scrollable list)                                     │
└─────────────────────────────────────────────────────────────┘
```

#### 2.3.2 Tag Item Design
**Components**:
- Checkbox for selection state
- Color indicator (small circle)
- Tag name
- Template count (optional)

**Interaction**:
- Click anywhere on item to toggle selection
- Keyboard navigation support
- Hover effects for better UX

## Filtering Logic and Behavior

### 3.1 Filter Modes

#### 3.1.1 Any Tag Mode (Default)
**Logic**: Show templates that have ANY of the selected tags
**Use Case**: Broad exploration, finding templates with specific themes
**SQL Equivalent**: `WHERE tag IN (selected_tags)`

#### 3.1.2 All Tags Mode (Advanced)
**Logic**: Show templates that have ALL selected tags
**Use Case**: Precise filtering, finding templates at tag intersections
**SQL Equivalent**: `WHERE template has all selected_tags`

#### 3.1.3 Mode Toggle Interface
**Location**: Within tag filter dropdown
**Design**: Radio buttons or toggle switch
**Labels**: "Any selected tags" / "All selected tags"

### 3.2 Real-time Filtering

#### 3.2.1 Filter Application
**Trigger**: Immediately on tag selection/deselection
**Performance**: Debounced to prevent excessive API calls
**Loading State**: Subtle loading indicator in table

#### 3.2.2 Combined Filtering
**Integration**: Works with search, timeframe, and other filters
**Logic**: AND operation between different filter types
**Priority**: All filters applied simultaneously

### 3.3 Filter Persistence

#### 3.3.1 Session Persistence
**Storage**: Browser sessionStorage
**Scope**: Current browser tab session
**Restoration**: Automatic on page reload

#### 3.3.2 URL State Management
**Implementation**: Query parameters in URL
**Format**: `?tags=marketing-plan,revenue-growth&mode=any`
**Benefits**: Shareable filtered views, browser history support

## Data Integration

### 4.1 Tag Data Source

#### 4.1.1 API Integration
**Endpoint**: `GET /api/tags`
**Caching**: React Query with 5-minute cache
**Real-time Updates**: Cache invalidation on tag changes

#### 4.1.2 Template Data Filtering
**Endpoint**: `GET /api/okr-templates?tags=tag1,tag2&mode=any`
**Server-side**: Database-level filtering for performance
**Client-side**: Fallback filtering if needed

### 4.2 Performance Optimization

#### 4.2.1 Tag Loading
**Strategy**: Load tags once, cache for session
**Updates**: Real-time updates via WebSocket or polling
**Fallback**: Graceful degradation if tags unavailable

#### 4.2.2 Template Filtering
**Debouncing**: 300ms delay after last tag selection
**Pagination**: Maintain current page when possible
**Caching**: Cache filtered results for quick navigation

## Visual Design Specifications

### 5.1 Tag Filter Bar Styling

#### 5.1.1 Layout
**Height**: 48px
**Padding**: 12px horizontal, 8px vertical
**Background**: White with light border
**Spacing**: 12px gap between elements

#### 5.1.2 Typography
**Label**: "Tags:" - 14px medium weight
**Dropdown**: 14px regular weight
**Selected tags**: 12px medium weight

### 5.2 Tag Badge Design

#### 5.2.1 Styling
**Height**: 28px
**Padding**: 6px 12px
**Border radius**: 14px (pill shape)
**Font size**: 12px
**Font weight**: 500 (medium)

#### 5.2.2 Color Mapping
```typescript
const tagColors = {
  blue: { bg: '#EBF8FF', text: '#2B6CB0', border: '#BEE3F8' },
  green: { bg: '#F0FDF4', text: '#166534', border: '#BBF7D0' },
  purple: { bg: '#FAF5FF', text: '#7C3AED', border: '#DDD6FE' },
  red: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  orange: { bg: '#FFF7ED', text: '#EA580C', border: '#FED7AA' },
  yellow: { bg: '#FEFCE8', text: '#CA8A04', border: '#FEF08A' },
  pink: { bg: '#FDF2F8', text: '#DB2777', border: '#FBCFE8' },
  gray: { bg: '#F9FAFB', text: '#374151', border: '#E5E7EB' }
};
```

### 5.3 Dropdown Design

#### 5.3.1 Container
**Width**: 320px minimum
**Max height**: 300px with scroll
**Shadow**: Elevated with subtle shadow
**Border**: 1px solid #E5E7EB
**Border radius**: 8px

#### 5.3.2 Search Input
**Height**: 36px
**Placeholder**: "Search tags..."
**Icon**: Magnifying glass on left
**Styling**: Minimal border, focus ring

## User Experience Flows

### 6.1 Filter Application Flow

#### 6.1.1 Single Tag Selection
1. User clicks tag filter dropdown
2. Dropdown opens with all available tags
3. User clicks on a tag to select it
4. Tag appears in selected tags area
5. Templates filter immediately
6. Dropdown remains open for additional selections

#### 6.1.2 Multiple Tag Selection
1. User selects first tag (as above)
2. User selects additional tags
3. Each selection adds to filter criteria
4. Templates update to show intersection/union
5. User can toggle between "any" and "all" modes

#### 6.1.3 Filter Removal
1. User clicks × on selected tag badge
2. Tag removes from selection
3. Templates update immediately
4. If last tag removed, filter clears completely

### 6.2 Search Integration

#### 6.2.1 Combined Search and Tag Filter
**Behavior**: Both filters active simultaneously
**Logic**: Search text AND tag criteria must match
**UI**: Both filter indicators visible
**Clearing**: Independent clear actions

### 6.3 Empty States

#### 6.3.1 No Tags Available
**Display**: "No tags available" in dropdown
**Action**: Link to tag management page
**Styling**: Muted text with helpful guidance

#### 6.3.2 No Matching Templates
**Display**: Empty table with message
**Content**: "No templates match the selected tags"
**Action**: Suggestions to modify filters
**Reset**: Quick link to clear tag filters

## Technical Implementation

### 7.1 Component Architecture

#### 7.1.1 Component Hierarchy
```
TagFilter
├── TagFilterDropdown
│   ├── TagSearch
│   ├── TagList
│   │   └── TagItem[]
│   └── FilterModeToggle
├── SelectedTagsList
│   └── TagBadge[]
└── ClearFiltersButton
```

#### 7.1.2 State Management
**Local State**: Dropdown open/closed, search term
**Global State**: Selected tags, filter mode
**Persistence**: URL state and sessionStorage

### 7.2 API Integration

#### 7.2.1 Tag Fetching
```typescript
const { data: tags } = useQuery({
  queryKey: ['/api/tags'],
  queryFn: () => fetch('/api/tags').then(res => res.json()),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

#### 7.2.2 Template Filtering
```typescript
const { data: templates, isLoading } = useQuery({
  queryKey: ['/api/okr-templates', { tags: selectedTags, mode: filterMode }],
  queryFn: () => fetchTemplatesWithFilters({ tags: selectedTags, mode: filterMode }),
  enabled: !!selectedTags.length,
});
```

### 7.3 Performance Considerations

#### 7.3.1 Debouncing
**Implementation**: 300ms debounce on tag selection
**Benefit**: Reduces API calls during rapid selections
**User feedback**: Immediate UI updates, delayed data fetch

#### 7.3.2 Virtualization
**Trigger**: Tag lists > 100 items
**Implementation**: Virtual scrolling in dropdown
**Benefit**: Maintains performance with large tag datasets

## Accessibility Requirements

### 8.1 Keyboard Navigation

#### 8.1.1 Dropdown Navigation
**Tab**: Open dropdown, navigate between elements
**Space/Enter**: Select/deselect tags
**Escape**: Close dropdown
**Arrow keys**: Navigate tag list

#### 8.1.2 Screen Reader Support
**Labels**: Clear aria-labels for all interactive elements
**Announcements**: Selection state changes announced
**Descriptions**: Filter results count announced

### 8.2 Focus Management

#### 8.2.1 Focus Indicators
**Visible**: High contrast focus rings
**Logical**: Tab order follows visual layout
**Preservation**: Focus returns to trigger after dropdown closes

## Error Handling

### 9.1 API Failures

#### 9.1.1 Tag Loading Failure
**Fallback**: Show cached tags if available
**Message**: "Unable to load tags" with retry option
**Graceful**: Don't break existing functionality

#### 9.1.2 Filter Application Failure
**Retry**: Automatic retry with exponential backoff
**Feedback**: Loading state during retry attempts
**Fallback**: Client-side filtering if server fails

### 9.2 Data Validation

#### 9.2.1 Invalid Tag References
**Detection**: Tags selected but no longer exist
**Handling**: Remove invalid tags from selection
**Notification**: Inform user of automatic cleanup

## Success Metrics

### 10.1 Usage Analytics
- Tag filter usage frequency
- Most commonly filtered tags
- Filter mode preference (any vs all)
- Time spent with filters active

### 10.2 Performance Metrics
- Filter application speed (< 200ms)
- Dropdown opening speed (< 100ms)
- Search responsiveness (< 150ms)
- Memory usage with large tag sets

## Acceptance Criteria

### 11.1 Core Functionality
- ✅ Users can select multiple tags from dropdown
- ✅ Templates filter immediately upon tag selection
- ✅ Selected tags display as removable badges
- ✅ Filter integrates with search and other filters
- ✅ Filter state persists during session

### 11.2 User Experience
- ✅ Dropdown opens smoothly with tag list
- ✅ Search within tags works correctly
- ✅ Color indicators match tag colors
- ✅ Clear actions work as expected
- ✅ Loading states provide feedback

### 11.3 Performance
- ✅ Tag selection debounced appropriately
- ✅ Large tag lists handle efficiently
- ✅ No memory leaks with frequent usage
- ✅ Responsive on all device sizes

### 11.4 Accessibility
- ✅ Keyboard navigation fully functional
- ✅ Screen readers announce state changes
- ✅ Focus management works correctly
- ✅ Color contrast meets WCAG standards

## Dependencies
- Tag management system and API
- OKR templates database with tag relationships
- React Query for data fetching and caching
- URL state management library
- Accessibility testing tools

## Future Enhancements
- Saved filter presets
- Tag popularity indicators
- Advanced tag search with autocomplete
- Tag hierarchy support
- Bulk tag operations from filter interface