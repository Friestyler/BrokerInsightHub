# Product Requirements Document: Bulk Actions System

## Overview
The Bulk Actions System provides users with the ability to perform operations on multiple items simultaneously across the My Qollabi platform. This system enhances productivity by reducing repetitive tasks and enables efficient management of large datasets.

## Core Objectives
- Enable multi-item selection across all list views
- Provide contextual bulk operations for each entity type
- Maintain consistent user experience across all pages
- Ensure data integrity during bulk operations
- Provide clear feedback and progress indication

## System Architecture

### 1. Universal Bulk Actions Interface

#### 1.1 Selection Mechanism
**Implementation**: Checkbox-based selection system
- Header checkbox for "select all" functionality
- Individual row checkboxes for item selection
- Visual indicators for selected state
- Selection counter display

#### 1.2 Bulk Actions Bar
**Positioning**: Fixed bottom of viewport when items selected
**Behavior**: Slides up from bottom with smooth animation
**Dismissal**: Automatic hide when no items selected

**Core Elements**:
```
[Selection Count] [Action Buttons...] [Cancel]
```

## OKR Templates Bulk Actions

### 2.1 OKR Templates Page Implementation

#### 2.1.1 Selection Interface
**Location**: `/templates/metrics`
**Table Enhancement**: Add checkbox column as first column

**Checkbox Behavior**:
- Header checkbox: Select/deselect all visible items
- Row checkboxes: Individual item selection
- Indeterminate state when partially selected
- Maintains selection during filtering/searching

**Acceptance Criteria**:
- Selection persists during search/filter operations
- Clear visual distinction for selected rows
- Accessible keyboard navigation support
- Selection count updates in real-time

#### 2.1.2 Available Bulk Actions

**Delete Templates**
- Action: Permanently remove selected OKR templates
- Confirmation: Multi-step confirmation dialog
- Requirements: Minimum 1 template selected
- Restrictions: Cannot delete templates currently in use

**Duplicate Templates**
- Action: Create copies of selected templates
- Naming: Appends " (Copy)" to template names
- Requirements: Minimum 1 template selected
- Behavior: Creates independent copies with new IDs

**Export Templates**
- Action: Download selected templates as JSON/CSV
- Format: Structured data export
- Requirements: Minimum 1 template selected
- File naming: "okr-templates-{date}.{format}"

**Bulk Tag Assignment**
- Action: Apply tags to multiple templates
- Interface: Tag selection dialog
- Requirements: Minimum 1 template selected
- Options: Add tags, replace tags, remove tags

**Status Update**
- Action: Change status for multiple templates
- Options: Active, Inactive, Draft, Archived
- Requirements: Minimum 1 template selected
- Validation: Prevent invalid status transitions

#### 2.1.3 Bulk Actions Bar Design
```
┌─────────────────────────────────────────────────────────────┐
│ [X] 3 templates selected                                    │
│                                                             │
│ [Delete] [Duplicate] [Export] [Add Tags] [Set Status] [✕]  │
└─────────────────────────────────────────────────────────────┘
```

**Styling**:
- Background: White with shadow
- Border: Light gray top border
- Padding: 16px
- Animation: Slide up from bottom (300ms ease)
- Z-index: High priority layer

### 2.2 Confirmation Dialogs

#### 2.2.1 Delete Confirmation
**Title**: "Delete Templates"
**Content**: 
```
Are you sure you want to delete {count} template(s)?

This action cannot be undone. The following templates will be permanently removed:
• {template1.name}
• {template2.name}
• ... (show first 5, then "and X more")
```

**Actions**: [Cancel] [Delete Templates]
**Validation**: Check for templates in active use

#### 2.2.2 Tag Assignment Dialog
**Interface**: Multi-select tag interface
**Options**:
- Add selected tags to all templates
- Replace existing tags with selected tags
- Remove selected tags from all templates

**Behavior**:
- Shows current tag distribution
- Previews changes before confirmation
- Validates tag assignments

## Universal Bulk Actions (All Pages)

### 3.1 Partners Page Bulk Actions

#### 3.1.1 Available Actions
**Delete Partners**
- Confirmation required
- Check for active opportunities/customers
- Cascade deletion options

**Export Partners**
- CSV/JSON export formats
- Include related data options
- Custom field selection

**Bulk Tag Assignment**
- Add/remove/replace tags
- Tag analytics preview

**Status Updates**
- Active, Inactive, Prospective, Archived
- Bulk status change validation

**Category Assignment**
- Change industry classification
- Update partner types
- Size category updates

#### 3.1.2 Bulk Actions Bar
```
┌─────────────────────────────────────────────────────────────┐
│ [X] 7 partners selected                                     │
│                                                             │
│ [Delete] [Export] [Add Tags] [Set Status] [Category] [✕]   │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Opportunities Page Bulk Actions

#### 3.2.1 Available Actions
**Status Updates**
- Lead, Qualified, Proposal, Negotiation, Closed Won, Closed Lost
- Validation for status transitions
- Automatic date tracking

**Assignment Changes**
- Bulk reassign opportunities
- Change ownership
- Update responsible teams

**Delete Opportunities**
- Confirmation with impact assessment
- Related data handling

**Export Opportunities**
- Filtered data export
- Custom date ranges
- Related entity inclusion

**Priority Updates**
- High, Medium, Low priority
- Bulk priority assignment
- Notification triggers

### 3.3 Customers Page Bulk Actions

#### 3.3.1 Available Actions
**Category Updates**
- Customer type changes
- Segment reassignment
- Classification updates

**Status Management**
- Active, Inactive, Churned, Prospective
- Lifecycle stage updates
- Automated workflows

**Communication Actions**
- Bulk email campaigns
- Notification sending
- Alert configuration

**Export Customers**
- GDPR-compliant exports
- Custom field selection
- Relationship data inclusion

## Technical Implementation

### 4.1 State Management

#### 4.1.1 Selection State
```typescript
interface BulkSelectionState {
  selectedItems: Set<number>;
  isSelectAllActive: boolean;
  isPartialSelection: boolean;
  totalCount: number;
  visibleCount: number;
}
```

#### 4.1.2 Bulk Actions Context
```typescript
interface BulkActionsContext {
  selection: BulkSelectionState;
  actions: BulkAction[];
  isVisible: boolean;
  isLoading: boolean;
  toggleSelection: (id: number) => void;
  toggleSelectAll: () => void;
  clearSelection: () => void;
  executeBulkAction: (action: string, params?: any) => Promise<void>;
}
```

### 4.2 API Endpoints

#### 4.2.1 Bulk Operations API
```
POST /api/bulk/delete
POST /api/bulk/update
POST /api/bulk/export
POST /api/bulk/tags/assign
POST /api/bulk/tags/remove
```

#### 4.2.2 Request Format
```typescript
interface BulkActionRequest {
  action: string;
  entityType: 'okr-template' | 'partner' | 'opportunity' | 'customer';
  entityIds: number[];
  parameters?: Record<string, any>;
}
```

### 4.3 Progress Indication

#### 4.3.1 Loading States
- Action button shows spinner during execution
- Progress bar for operations affecting many items
- Real-time status updates
- Cancel operation support

#### 4.3.2 Result Feedback
- Success notification with counts
- Error handling with detailed messages
- Partial success scenarios
- Retry mechanisms

## User Experience Guidelines

### 5.1 Interaction Patterns

#### 5.1.1 Selection Feedback
- Selected rows: Light blue background (#F0F9FF)
- Checkbox states: Clear checked/unchecked/indeterminate
- Selection counter: "X items selected"
- Visual hierarchy: Selected items stand out

#### 5.1.2 Progressive Disclosure
- Actions appear contextually based on selection
- Disabled states for invalid actions
- Tooltips explain action requirements
- Smart defaults for action parameters

### 5.2 Accessibility

#### 5.2.1 Keyboard Navigation
- Tab navigation through checkboxes
- Space bar to toggle selection
- Arrow keys for navigation
- Enter to execute primary action

#### 5.2.2 Screen Reader Support
- Proper ARIA labels for selection state
- Announced selection counts
- Action button descriptions
- Progress updates

## Error Handling and Validation

### 6.1 Pre-action Validation

#### 6.1.1 Business Rule Validation
- Check entity relationships before deletion
- Validate status transition rules
- Verify user permissions
- Resource availability checks

#### 6.1.2 Data Integrity Checks
- Prevent orphaned records
- Maintain referential integrity
- Validate required fields
- Check for duplicates

### 6.2 Error Recovery

#### 6.2.1 Partial Failures
- Continue processing valid items
- Report failed items with reasons
- Offer retry for failed operations
- Rollback options where applicable

#### 6.2.2 Network Issues
- Retry failed requests automatically
- Cache operations for offline retry
- Progress preservation
- Clear error messaging

## Performance Considerations

### 7.1 Optimization Strategies

#### 7.1.1 Database Operations
- Batch operations for efficiency
- Transaction management
- Query optimization
- Index utilization

#### 7.1.2 UI Performance
- Virtual scrolling for large lists
- Debounced selection updates
- Efficient re-rendering
- Memory management

### 7.2 Scalability

#### 7.2.1 Large Dataset Handling
- Pagination-aware selection
- Server-side processing
- Progress chunking
- Resource limits

#### 7.2.2 Concurrent Operations
- Operation queuing
- Resource locking
- User conflict resolution
- Status synchronization

## Security and Permissions

### 8.1 Authorization

#### 8.1.1 Action-Level Permissions
- Role-based action availability
- Entity-specific permissions
- Bulk operation restrictions
- Audit trail requirements

#### 8.1.2 Data Protection
- GDPR compliance for exports
- Sensitive data handling
- User consent tracking
- Data retention policies

## Success Metrics

### 9.1 User Adoption
- Bulk action usage frequency
- Time saved vs individual operations
- User satisfaction scores
- Feature discovery rates

### 9.2 Performance Metrics
- Operation completion times
- Error rates
- System load impact
- User workflow efficiency

## Acceptance Criteria

### 10.1 Core Functionality
- ✅ Users can select multiple items across all list pages
- ✅ Bulk actions bar appears when items selected
- ✅ Actions execute successfully with proper validation
- ✅ Progress feedback provided for long operations
- ✅ Error handling graceful and informative

### 10.2 OKR Templates Specific
- ✅ Delete, duplicate, export, tag assignment, status update
- ✅ Confirmation dialogs prevent accidental operations
- ✅ Selection persists during filtering
- ✅ Templates in use cannot be bulk deleted

### 10.3 Cross-Platform Consistency
- ✅ Consistent selection interface across all pages
- ✅ Similar bulk actions bar design and behavior
- ✅ Unified confirmation dialog patterns
- ✅ Standardized error messaging

### 10.4 Performance
- ✅ Bulk operations complete within 5 seconds for <100 items
- ✅ Progress indication for operations >2 seconds
- ✅ No UI blocking during background operations
- ✅ Graceful handling of large datasets

## Dependencies
- Database transaction support
- Background job processing system
- File export/download capabilities
- Email notification system
- Audit logging infrastructure

## Future Enhancements
- Saved bulk action templates
- Scheduled bulk operations
- Advanced filtering before bulk actions
- Bulk action history and undo
- API integrations for external bulk operations