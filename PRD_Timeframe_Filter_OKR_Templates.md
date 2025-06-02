# Product Requirements Document: Advanced Timeframe Filter (Timeframe2) - OKR Templates Page

## Overview
The Timeframe Filter system on the OKR Templates page enables users to filter OKR templates based on their temporal scope and date ranges. This sophisticated filtering mechanism supports both predefined timeframe options and custom date range selection, providing users with powerful temporal navigation capabilities.

## Core Objectives
- Enable filtering of OKR templates by temporal characteristics
- Support both predefined and custom timeframe selection
- Provide intelligent date range calculations
- Integrate seamlessly with other filter systems
- Maintain filter state and provide clear visual feedback

## System Architecture

### 1. Data Structure

#### 1.1 Timeframe Integration in OKR Templates
```typescript
interface OKRTemplate {
  id: number;
  title: string;
  description: string;
  timeframe: string; // Predefined timeframe identifier
  startDate?: Date; // Custom start date
  endDate?: Date; // Custom end date
  milestoneFrequency: string; // Weekly, Monthly, Quarterly
  // ... other template properties
}

interface TimeframeOption {
  value: string;
  label: string;
  description: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  isRelative: boolean; // Dynamic vs fixed dates
}
```

#### 1.2 Filter State Management
```typescript
interface TimeframeFilterState {
  selectedTimeframe: string | null;
  customDateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  filterMode: 'predefined' | 'custom' | 'advanced';
  isActive: boolean;
  quickFilters: string[]; // Recently used timeframes
}
```

## Predefined Timeframe Options

### 2.1 Standard Timeframe Categories

#### 2.1.1 Current Period Options
**This Week**
- Range: Monday of current week to Sunday
- Use case: Short-term tactical OKRs
- Dynamic: Updates automatically

**This Month**
- Range: 1st to last day of current month
- Use case: Monthly objectives and targets
- Dynamic: Updates automatically

**This Quarter**
- Range: Q1 (Jan-Mar), Q2 (Apr-Jun), Q3 (Jul-Sep), Q4 (Oct-Dec)
- Use case: Quarterly business objectives
- Dynamic: Updates based on current quarter

**This Year**
- Range: January 1st to December 31st of current year
- Use case: Annual strategic objectives
- Dynamic: Updates automatically

#### 2.1.2 Historical Period Options
**Last Week**
- Range: Previous week Monday to Sunday
- Use case: Review completed short-term OKRs

**Last Month**
- Range: Previous month 1st to last day
- Use case: Review monthly performance

**Last Quarter**
- Range: Previous quarter dates
- Use case: Quarterly retrospectives

**Last Year**
- Range: Previous year January to December
- Use case: Annual performance analysis

#### 2.1.3 Future Period Options
**Next Week**
- Range: Upcoming week Monday to Sunday
- Use case: Planning short-term objectives

**Next Month**
- Range: Following month 1st to last day
- Use case: Monthly planning

**Next Quarter**
- Range: Upcoming quarter dates
- Use case: Quarterly planning

**Next Year**
- Range: Following year January to December
- Use case: Annual strategic planning

#### 2.1.4 Extended Range Options
**Last 30 Days**
- Range: 30 days back from today
- Use case: Rolling 30-day analysis
- Dynamic: Rolling window

**Last 90 Days**
- Range: 90 days back from today
- Use case: Quarterly rolling analysis
- Dynamic: Rolling window

**Last 6 Months**
- Range: 6 months back from today
- Use case: Semi-annual analysis
- Dynamic: Rolling window

**Last 12 Months**
- Range: 12 months back from today
- Use case: Annual rolling analysis
- Dynamic: Rolling window

**Year to Date (YTD)**
- Range: January 1st to today
- Use case: Current year progress tracking
- Dynamic: Extends daily

**Quarter to Date (QTD)**
- Range: Quarter start to today
- Use case: Current quarter progress tracking
- Dynamic: Extends daily

## User Interface Design

### 3.1 Filter Interface Layout

#### 3.1.1 Primary Filter Control
**Position**: In the main filter bar above OKR templates table
**Design**: Dropdown button with current selection display
**Default State**: "All Timeframes" when no filter active

```
┌─────────────────────────────────────────────────────────────┐
│ Timeframe: [This Quarter ▼] [📅 Custom Range] [Clear]      │
└─────────────────────────────────────────────────────────────┘
```

#### 3.1.2 Dropdown Structure
```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 Search timeframes...                                    │
├─────────────────────────────────────────────────────────────┤
│ CURRENT PERIODS                                             │
│ ○ This Week (Dec 2-8, 2024)                               │
│ ● This Quarter (Oct-Dec 2024)                             │
│ ○ This Year (2024)                                        │
├─────────────────────────────────────────────────────────────┤
│ HISTORICAL PERIODS                                          │
│ ○ Last Week (Nov 25-Dec 1)                                │
│ ○ Last Month (November 2024)                              │
│ ○ Last Quarter (Jul-Sep 2024)                             │
├─────────────────────────────────────────────────────────────┤
│ EXTENDED RANGES                                             │
│ ○ Last 30 Days                                            │
│ ○ Last 90 Days                                            │
│ ○ Year to Date                                            │
├─────────────────────────────────────────────────────────────┤
│ 📅 Custom Date Range...                                    │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Custom Date Range Interface

#### 3.2.1 Date Range Picker
**Trigger**: "Custom Date Range" option or 📅 button
**Interface**: Dual calendar picker or date input fields
**Validation**: End date must be after start date

#### 3.2.2 Quick Date Selection
**Presets**: Within custom range picker
- Last 7 days
- Last 14 days
- Last 30 days
- Last 3 months
- Last 6 months
- This fiscal year

#### 3.2.3 Advanced Options
**Relative Dates**: Support for rolling windows
**Recurring Periods**: Weekly, bi-weekly, monthly patterns
**Fiscal Year**: Custom fiscal year start dates

## Filtering Logic and Behavior

### 4.1 Template Matching Logic

#### 4.1.1 Timeframe-based Matching
```typescript
function matchesTimeframe(template: OKRTemplate, filter: TimeframeFilter): boolean {
  const filterRange = getDateRangeForTimeframe(filter.selectedTimeframe);
  const templateRange = getTemplateEffectiveDateRange(template);
  
  return doDateRangesOverlap(templateRange, filterRange);
}
```

#### 4.1.2 Overlap Detection Modes
**Complete Overlap**: Template dates fully within filter range
**Partial Overlap**: Any overlap between template and filter ranges
**Starts Within**: Template starts within filter range
**Ends Within**: Template ends within filter range

### 4.2 Dynamic Date Calculations

#### 4.2.1 Relative Timeframe Updates
**Frequency**: Daily at midnight for "current" timeframes
**Caching**: Cache calculations for performance
**User Notification**: Subtle indication when ranges update

#### 4.2.2 Timezone Handling
**User Timezone**: Respect user's local timezone
**UTC Storage**: Store dates in UTC, display in local time
**DST Transitions**: Handle daylight saving time changes

### 4.3 Multi-filter Integration

#### 4.3.1 Combined Filtering
**Logic**: Timeframe AND other filters (tags, search, etc.)
**Priority**: All filters applied simultaneously
**Performance**: Optimized query execution

#### 4.3.2 Filter Dependencies
**Milestone Frequency**: Correlate with timeframe selection
**Template Type**: Some types may have timeframe constraints
**Status Filters**: Active templates within timeframe

## Visual Design Specifications

### 5.1 Timeframe Filter Button

#### 5.1.1 Default State
**Text**: "All Timeframes"
**Icon**: Calendar icon
**Styling**: Standard filter button appearance

#### 5.1.2 Active State
**Text**: Selected timeframe name + date range
**Example**: "This Quarter (Oct-Dec 2024)"
**Color**: Blue accent to indicate active filter
**Clear Button**: × icon to remove filter

### 5.2 Dropdown Design

#### 5.2.1 Section Headers
**Styling**: 
- Font: 11px, uppercase, semibold
- Color: #6B7280 (gray-500)
- Spacing: 12px top margin, 4px bottom margin

#### 5.2.2 Timeframe Options
**Layout**: Radio button + label + date range
**Example**: "● This Quarter (Oct-Dec 2024)"
**Hover**: Light background highlight
**Selection**: Blue background for active option

#### 5.2.3 Date Range Display
**Format**: Context-appropriate formatting
- Days: "Dec 2-8, 2024"
- Months: "November 2024"
- Quarters: "Q4 2024" or "Oct-Dec 2024"
- Years: "2024"

### 5.3 Custom Date Range Picker

#### 5.3.1 Calendar Interface
**Library**: React Day Picker or similar
**Features**: Range selection, navigation, keyboard support
**Styling**: Consistent with platform design system

#### 5.3.2 Quick Presets
**Layout**: Sidebar with preset options
**Options**: Common ranges like "Last 30 days"
**Interaction**: Click to apply preset immediately

## Advanced Features

### 6.1 Smart Timeframe Suggestions

#### 6.1.1 Context-aware Recommendations
**Based on**: User's historical filter usage
**Display**: "Frequently used" section in dropdown
**Learning**: Adapt to user behavior patterns

#### 6.1.2 Template Distribution Analysis
**Show**: Number of templates in each timeframe
**Example**: "This Quarter (23 templates)"
**Benefits**: Help users understand data distribution

### 6.2 Timeframe Shortcuts

#### 6.2.1 Keyboard Shortcuts
**Implementation**: 
- `Ctrl + T`: Open timeframe filter
- `Ctrl + 1-9`: Select common timeframes
- `Ctrl + D`: Custom date range

#### 6.2.2 URL Integration
**Format**: `?timeframe=this-quarter&from=2024-10-01&to=2024-12-31`
**Benefits**: Shareable filtered views, bookmark support

### 6.3 Fiscal Year Support

#### 6.3.1 Configuration
**Setting**: Organization-level fiscal year start
**Default**: January 1st (calendar year)
**Options**: April, July, October starts common

#### 6.3.2 Fiscal Period Options
**Labels**: "Current Fiscal Year", "Last Fiscal Quarter"
**Calculations**: Based on configured fiscal calendar
**Display**: Clear indication of fiscal vs calendar periods

## Technical Implementation

### 7.1 Date Utility Functions

#### 7.1.1 Core Date Operations
```typescript
interface DateRange {
  start: Date;
  end: Date;
}

function getDateRangeForTimeframe(timeframe: string): DateRange {
  const now = new Date();
  switch (timeframe) {
    case 'this-week':
      return getWeekRange(now);
    case 'this-quarter':
      return getQuarterRange(now);
    // ... additional cases
  }
}

function doDateRangesOverlap(range1: DateRange, range2: DateRange): boolean {
  return range1.start <= range2.end && range2.start <= range1.end;
}
```

#### 7.1.2 Timezone Management
```typescript
function toUserTimezone(date: Date, timezone: string): Date {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
  }).format(date);
}
```

### 7.2 Component Architecture

#### 7.2.1 Component Hierarchy
```
TimeframeFilter
├── TimeframeDropdown
│   ├── TimeframeSearch
│   ├── TimeframeSection[]
│   │   └── TimeframeOption[]
│   └── CustomDateRangeOption
├── CustomDateRangePicker
│   ├── DateRangeCalendar
│   ├── QuickPresets
│   └── AdvancedOptions
└── ActiveTimeframeDisplay
```

#### 7.2.2 State Management
```typescript
const useTimeframeFilter = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<string | null>(null);
  const [customRange, setCustomRange] = useState<DateRange | null>(null);
  const [isCustomMode, setIsCustomMode] = useState(false);
  
  // Filter logic and state management
};
```

### 7.3 API Integration

#### 7.3.1 Template Filtering Endpoint
```typescript
GET /api/okr-templates?timeframe=this-quarter
GET /api/okr-templates?from=2024-10-01&to=2024-12-31
```

#### 7.3.2 Caching Strategy
**Query Keys**: Include timeframe parameters
**Stale Time**: 5 minutes for relative timeframes
**Background Updates**: Refresh expired relative ranges

## Performance Considerations

### 8.1 Date Calculation Optimization

#### 8.1.1 Memoization
**Calculations**: Cache expensive date range calculations
**Dependencies**: Recalculate only when dates change
**Memory**: Limit cache size for long-running sessions

#### 8.1.2 Server-side Filtering
**Database**: Leverage database date functions
**Indexes**: Optimize date column indexes
**Queries**: Efficient date range queries

### 8.2 UI Performance

#### 8.2.1 Dropdown Rendering
**Virtualization**: For large timeframe lists
**Lazy Loading**: Load sections on demand
**Debouncing**: Search input debounced

#### 8.2.2 Calendar Performance
**Range Limiting**: Reasonable min/max dates
**Lazy Rendering**: Render visible months only
**Event Optimization**: Efficient date selection

## Accessibility Requirements

### 9.1 Keyboard Navigation

#### 9.1.1 Filter Control
**Tab**: Focus on timeframe dropdown
**Space/Enter**: Open dropdown
**Arrow Keys**: Navigate options
**Escape**: Close dropdown

#### 9.1.2 Date Picker Navigation
**Tab**: Navigate between calendar elements
**Arrow Keys**: Navigate calendar dates
**Page Up/Down**: Navigate months
**Home/End**: Navigate to month start/end

### 9.2 Screen Reader Support

#### 9.2.1 Announcements
**Filter Changes**: Announce selected timeframe
**Date Ranges**: Read out calculated date ranges
**Custom Ranges**: Announce selected custom dates

#### 9.2.2 Labels and Descriptions
**ARIA Labels**: Comprehensive labeling
**Descriptions**: Explain date range meanings
**Instructions**: Guide users through custom selection

## Error Handling

### 10.1 Date Validation

#### 10.1.1 Invalid Ranges
**Detection**: End date before start date
**Prevention**: UI constraints to prevent invalid selection
**Feedback**: Clear error messages with correction guidance

#### 10.1.2 Extreme Dates
**Limits**: Reasonable min/max date boundaries
**Validation**: Prevent selection beyond system limits
**Fallback**: Default to valid ranges when errors occur

### 10.2 Calculation Errors

#### 10.2.1 Timezone Issues
**Detection**: Monitor for timezone calculation errors
**Fallback**: Use UTC when timezone fails
**Recovery**: User notification with manual override option

#### 10.2.2 API Failures
**Retry**: Automatic retry for transient failures
**Fallback**: Client-side filtering when server unavailable
**Cache**: Use cached results during outages

## Success Metrics

### 11.1 Usage Analytics
- Timeframe filter usage frequency
- Most popular timeframe selections
- Custom date range vs predefined usage ratio
- Time spent with timeframe filters active

### 11.2 Performance Metrics
- Filter application speed (< 200ms)
- Date calculation performance (< 50ms)
- Calendar rendering speed (< 100ms)
- Memory usage with extended usage

## Acceptance Criteria

### 12.1 Core Functionality
- ✅ Users can select from predefined timeframe options
- ✅ Custom date range selection works correctly
- ✅ Dynamic timeframes update automatically
- ✅ Filter integrates with other filters seamlessly
- ✅ Date calculations handle edge cases properly

### 12.2 User Experience
- ✅ Dropdown shows relevant date ranges for each option
- ✅ Calendar interface intuitive and responsive
- ✅ Clear visual feedback for active filters
- ✅ Quick access to commonly used timeframes
- ✅ Search functionality within timeframe options

### 12.3 Performance
- ✅ Fast filter application regardless of dataset size
- ✅ Efficient date range calculations
- ✅ Smooth calendar navigation and selection
- ✅ No memory leaks with extended usage

### 12.4 Accessibility
- ✅ Full keyboard navigation support
- ✅ Screen reader compatibility
- ✅ Clear focus indicators
- ✅ Comprehensive ARIA labeling

## Dependencies
- Date manipulation library (date-fns)
- Calendar component library
- Timezone handling utilities
- OKR templates API with date filtering
- URL state management system

## Future Enhancements
- Recurring timeframe patterns
- Advanced fiscal calendar support
- Machine learning for timeframe suggestions
- Integration with calendar applications
- Bulk timeframe operations for templates