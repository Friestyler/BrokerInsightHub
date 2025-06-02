# Product Requirements Document: Advanced Timeframe Filter (Timeframe2) - OKR Templates Page

## Overview
The Advanced Timeframe Filter (Timeframe2) is a sophisticated dual-pane filtering interface that combines preset timeframe options with an integrated calendar picker. This component provides users with precise temporal filtering capabilities through both quick preset selections and custom date range selection with visual calendar interaction.

## Core Objectives
- Provide comprehensive timeframe filtering with preset and custom options
- Offer intuitive dual-pane interface (presets + calendar)
- Support complex date range scenarios including "Since" filtering
- Maintain consistent state management and visual feedback
- Enable precise temporal navigation for OKR templates

## System Architecture

### 1. Component Structure

#### 1.1 Advanced Timeframe Filter Interface
```typescript
interface AdvancedTimeframeFilterProps {
  value?: string;
  onValueChange?: (value: string, dateRange?: DateRange) => void;
  placeholder?: string;
  dateRange?: DateRange;
  onDateRangeChange?: (dateRange: DateRange) => void;
  className?: string;
}

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}
```

#### 1.2 Filter State Management
```typescript
interface AdvancedTimeframeState {
  selectedPreset: string;
  customDateRange: DateRange;
  isOpen: boolean;
  filterMode: 'preset' | 'custom' | 'since';
}
```

## User Interface Design

### 2.1 Primary Filter Button

#### 2.1.1 Default State
**Appearance**: Outlined button with calendar icon
**Text**: "Select timeframe 2" (placeholder)
**Icon**: Calendar icon (CalendarIcon from lucide-react)
**Styling**: Standard outline button with hover effects

#### 2.1.2 Active State
**Background**: Light blue background (#E6E7F1)
**Text Color**: Dark blue (#51536C)
**Content**: Shows selected preset name or formatted date range
**Hover**: Darker blue background (#D5D7E5)

#### 2.1.3 Display Formats
**Preset Selection**: Shows preset label (e.g., "Last 30 days")
**Custom Range**: "MMM dd, y - MMM dd, y" (e.g., "Dec 01, 2024 - Dec 31, 2024")
**Single Date**: "MMM dd, y" for "Since" mode
**No Selection**: Default placeholder text

### 2.2 Dual-Pane Popover Interface

#### 2.2.1 Layout Structure
```
┌─────────────────┬─────────────────────────────────────────────┐
│ PRESET OPTIONS  │ CALENDAR & DATE INPUTS                     │
│                 │ (Only visible for custom/since modes)      │
│ □ Quick         │                                             │
│ ☑ Last 7 days   │ [Start Date Input] [End Date Input]        │
│ □ Last 14 days  │                                             │
│                 │ [Calendar Component - 2 months]            │
│ □ Months        │                                             │
│ □ This month    │                                             │
│                 │ [Cancel] [Apply]                            │
│ □ Custom        │                                             │
└─────────────────┴─────────────────────────────────────────────┘
```

#### 2.2.2 Left Pane: Preset Options
**Width**: 224px (w-56)
**Sections**: Categorized preset groups
**Styling**: Border-right separator, scrollable content
**Max Height**: 384px (max-h-96) with overflow scroll

#### 2.2.3 Right Pane: Calendar Interface
**Width**: Minimum 600px for dual calendar
**Visibility**: Only shown for 'custom' and 'since' presets
**Components**: Date inputs, dual-month calendar, action buttons

## Preset Categories and Options

### 3.1 Quick Timeframes
**Purpose**: Immediate, commonly-used date ranges
**Options**:
- Today
- Yesterday  
- Last 7 days
- Last 14 days
- Last 30 days
- Last 60 days
- Last 90 days

### 3.2 Monthly Timeframes
**Purpose**: Month-based filtering options
**Options**:
- Last month
- This month
- Next month
- Last 3 months
- Last 6 months

### 3.3 Quarterly Timeframes
**Purpose**: Business quarter-based filtering
**Options**:
- Last quarter
- This quarter
- Next quarter

### 3.4 Yearly Timeframes
**Purpose**: Annual and year-to-date filtering
**Options**:
- Last year
- This year
- Next year
- Year to date

### 3.5 Future Timeframes
**Purpose**: Forward-looking date ranges
**Options**:
- Next 7 days
- Next 14 days
- Next 30 days
- Next 60 days

### 3.6 Special Options
**Purpose**: Advanced filtering modes
**Options**:
- All time (no date filtering)
- Since (open-ended from date)
- Custom (specific date range)

## Advanced Features

### 4.1 Custom Date Range Mode

#### 4.1.1 Date Input Fields
**Start Date Input**:
- Label: "Start date"
- Format: "MMM dd, yyyy" display
- Read-only input with calendar interaction
- Clear button for resetting

**End Date Input**:
- Label: "End date"  
- Format: "MMM dd, yyyy" display
- Read-only input with calendar interaction
- Clear button for resetting

#### 4.1.2 Dual Calendar Interface
**Implementation**: React Day Picker with range mode
**Display**: Two-month view for easy range selection
**Navigation**: Month navigation arrows
**Selection**: Click and drag for range selection
**Validation**: End date must be after start date

### 4.2 Since Date Mode

#### 4.2.1 Single Date Selection
**Purpose**: Filter for items from a specific date onwards
**Interface**: Single date input with calendar
**Label**: "Since date" instead of "Start date"
**Behavior**: Open-ended range (no end date)

#### 4.2.2 Use Cases
- View templates created since specific date
- Filter by implementation start date
- Track progress from milestone date

### 4.3 State Management

#### 4.3.1 Selection Persistence
**Local State**: Maintains selection during session
**Reset Behavior**: Clear selection resets to default
**Mode Switching**: Preserves custom dates when switching modes

#### 4.3.2 Apply/Cancel Actions
**Apply**: Commits selection and closes popover
**Cancel**: Reverts to previous state and closes popover
**Immediate Feedback**: Preset selections apply immediately
**Deferred Feedback**: Custom/since selections require Apply button

## Visual Design Specifications

### 5.1 Preset Options Styling

#### 5.1.1 Section Headers
**Typography**: 
- Size: 12px (text-xs)
- Weight: Medium (font-medium)
- Color: #6B7280 (text-gray-500)
- Transform: Uppercase
- Spacing: 8px bottom margin

#### 5.1.2 Preset Items
**Default State**:
- Padding: 12px horizontal, 8px vertical
- Background: Transparent
- Text: #374151 (text-gray-700)
- Hover: #F3F4F6 (hover:bg-gray-100)

**Selected State**:
- Background: #EFF6FF (bg-blue-50)
- Text: #2563EB (text-blue-600)
- Icon: Checkmark (16px, blue)

#### 5.1.3 Interactive Elements
**Click Area**: Full width button
**Keyboard Navigation**: Arrow key support
**Focus Indicators**: Standard focus ring styling

### 5.2 Calendar Interface Styling

#### 5.2.1 Date Input Styling
**Height**: 40px
**Border**: 1px solid #D1D5DB
**Background**: #F9FAFB (light gray for read-only)
**Border Radius**: 6px (rounded-md)
**Icon**: Clear button positioned absolute right

#### 5.2.2 Calendar Component
**Border**: 1px border with rounded corners
**Navigation**: Month/year navigation arrows
**Day Selection**: Blue highlight for selected dates
**Range Selection**: Blue background for date ranges
**Today Indicator**: Subtle highlight for current date

### 5.3 Action Buttons

#### 5.3.1 Cancel Button
**Style**: Outline variant
**Text**: "Cancel"
**Color**: Default gray outline
**Action**: Revert and close

#### 5.3.2 Apply Button
**Style**: Solid blue background
**Text**: "Apply"
**Color**: #2563EB background, white text
**Hover**: #1D4ED8 (darker blue)
**Action**: Commit selection and close

## Technical Implementation

### 6.1 Date Calculation Functions

#### 6.1.1 Preset Date Range Calculation
```typescript
function calculatePresetDateRange(preset: string): DateRange {
  const now = new Date();
  switch (preset) {
    case 'today':
      return { from: startOfDay(now), to: endOfDay(now) };
    case 'last-7-days':
      return { from: subDays(now, 7), to: now };
    case 'this-month':
      return { from: startOfMonth(now), to: endOfMonth(now) };
    // ... additional preset calculations
  }
}
```

#### 6.1.2 Custom Range Validation
```typescript
function validateDateRange(range: DateRange): boolean {
  if (!range.from) return false;
  if (range.to && range.from > range.to) return false;
  return true;
}
```

### 6.2 Component State Management

#### 6.2.1 Internal State
```typescript
const [isOpen, setIsOpen] = useState(false);
const [selectedPreset, setSelectedPreset] = useState(value || '');
const [customDateRange, setCustomDateRange] = useState<DateRange>({
  from: undefined,
  to: undefined,
});
```

#### 6.2.2 Event Handlers
```typescript
const handlePresetSelect = (preset: string) => {
  setSelectedPreset(preset);
  if (preset !== 'custom' && preset !== 'since') {
    setCustomDateRange({ from: undefined, to: undefined });
    onValueChange?.(preset);
  }
};

const handleApply = () => {
  if (selectedPreset === 'custom' || selectedPreset === 'since') {
    onValueChange?.(selectedPreset, customDateRange);
  } else {
    onValueChange?.(selectedPreset);
  }
  setIsOpen(false);
};
```

### 6.3 Integration with Filter System

#### 6.3.1 OKR Templates Filtering
```typescript
function filterTemplatesByAdvancedTimeframe(
  templates: OKRTemplate[],
  preset: string,
  customRange?: DateRange
): OKRTemplate[] {
  const filterRange = preset === 'custom' || preset === 'since' 
    ? customRange 
    : calculatePresetDateRange(preset);
    
  return templates.filter(template => 
    templateMatchesDateRange(template, filterRange)
  );
}
```

#### 6.3.2 Multi-filter Coordination
**Integration**: Works alongside tag filters, search, and other filters
**State Management**: Independent filter state with combined results
**Performance**: Optimized filtering order for best performance

## User Experience Flows

### 7.1 Preset Selection Flow

#### 7.1.1 Quick Preset Selection
1. User clicks timeframe2 filter button
2. Popover opens showing preset categories
3. User clicks on desired preset (e.g., "Last 30 days")
4. Selection highlights immediately
5. Filter applies automatically
6. Popover closes
7. Button shows selected preset name

#### 7.1.2 Category Navigation
1. User scrolls through categorized presets
2. Section headers provide clear organization
3. Recently used presets could be highlighted
4. Search functionality within presets (future enhancement)

### 7.2 Custom Date Range Flow

#### 7.2.1 Custom Range Selection
1. User clicks timeframe2 filter button
2. User selects "Custom" from preset list
3. Right pane appears with calendar interface
4. User selects start date from calendar
5. User selects end date from calendar
6. Date inputs update automatically
7. User clicks "Apply" to confirm
8. Filter applies with custom range
9. Button shows formatted date range

#### 7.2.2 Since Date Selection
1. User selects "Since" from preset list
2. Right pane shows single date selection
3. User selects date from calendar
4. Only start date input populated
5. User clicks "Apply" to confirm
6. Filter applies for dates from selection onwards

### 7.3 Error Handling Flows

#### 7.3.1 Invalid Date Range
**Scenario**: End date selected before start date
**Handling**: Visual validation prevents invalid selection
**Feedback**: Calendar grays out invalid end dates
**Recovery**: User must select valid end date to proceed

#### 7.3.2 Incomplete Selection
**Scenario**: User clicks Apply without selecting dates
**Handling**: Apply button disabled until valid selection
**Feedback**: Clear visual indicators for required fields
**Recovery**: User completes selection to enable Apply

## Performance Considerations

### 8.1 Calendar Rendering

#### 8.1.1 Optimization Strategies
**Lazy Loading**: Calendar months loaded on demand
**Virtual Scrolling**: For large date ranges (future)
**Memoization**: Cache calendar calculations
**Event Debouncing**: Debounce rapid date selections

#### 8.1.2 Memory Management
**Component Cleanup**: Proper event listener cleanup
**State Optimization**: Minimal re-renders on state changes
**Date Object Handling**: Efficient date object creation/disposal

### 8.2 Filter Integration Performance

#### 8.2.1 Query Optimization
**Database Filtering**: Server-side date range queries
**Index Usage**: Optimized date column indexes
**Batch Operations**: Efficient multi-filter processing

#### 8.2.2 UI Responsiveness
**Non-blocking**: Calendar interactions don't block UI
**Progressive Loading**: Show results as they're computed
**Smooth Animations**: 60fps popover open/close animations

## Accessibility Requirements

### 9.1 Keyboard Navigation

#### 9.1.1 Popover Navigation
**Tab Order**: Logical tab sequence through interface
**Arrow Keys**: Navigate preset options
**Enter/Space**: Select preset options
**Escape**: Close popover without applying

#### 9.1.2 Calendar Navigation
**Arrow Keys**: Navigate calendar dates
**Page Up/Down**: Navigate months
**Home/End**: Go to month start/end
**Enter**: Select date

### 9.2 Screen Reader Support

#### 9.2.1 ARIA Labels
**Button**: "Open advanced timeframe filter"
**Presets**: "Select [preset name] timeframe"
**Calendar**: "Select date range"
**Date Inputs**: "Start date: [date]" / "End date: [date]"

#### 9.2.2 Announcements
**Selection Changes**: Announce selected timeframes
**Date Changes**: Announce selected dates
**Validation**: Announce validation errors
**State Changes**: Announce filter application

## Error Handling and Edge Cases

### 10.1 Date Validation

#### 10.1.1 Invalid Date Ranges
**Detection**: End date before start date
**Prevention**: Calendar UI prevents invalid selection
**Recovery**: Clear invalid selections, guide user

#### 10.1.2 Extreme Dates
**Boundaries**: Reasonable min/max date limits
**Validation**: Prevent dates outside system limits
**Feedback**: Clear messaging for boundary violations

### 10.2 System Integration Errors

#### 10.2.1 API Failures
**Template Loading**: Graceful handling of failed template queries
**Fallback**: Client-side filtering when server unavailable
**Recovery**: Retry mechanisms with user feedback

#### 10.2.2 Browser Compatibility
**Date Handling**: Cross-browser date compatibility
**Calendar Support**: Fallback for unsupported browsers
**Touch Support**: Mobile-friendly calendar interaction

## Success Metrics

### 11.1 Usage Analytics
- Advanced timeframe filter adoption rate
- Preset vs custom selection ratio
- Most popular preset selections
- Average time spent in filter interface
- Error rate during date selection

### 11.2 Performance Metrics
- Popover open time (< 100ms)
- Calendar rendering time (< 200ms)
- Filter application time (< 300ms)
- Memory usage during extended sessions

## Acceptance Criteria

### 12.1 Core Functionality
- ✅ Users can select from categorized preset timeframes
- ✅ Custom date range selection works with dual calendar
- ✅ Since date mode functions for open-ended filtering
- ✅ Apply/Cancel actions work correctly
- ✅ Filter integrates seamlessly with other filters

### 12.2 User Interface
- ✅ Dual-pane popover opens smoothly and positions correctly
- ✅ Preset categories organize options clearly
- ✅ Calendar interface intuitive and responsive
- ✅ Date inputs display formatted dates correctly
- ✅ Button shows appropriate active state and selection

### 12.3 Visual Design
- ✅ Consistent styling with platform design system
- ✅ Clear visual hierarchy in preset list
- ✅ Proper selected state indicators
- ✅ Responsive layout for different screen sizes
- ✅ Smooth animations and transitions

### 12.4 Performance
- ✅ Fast calendar rendering and interaction
- ✅ Efficient date range calculations
- ✅ No memory leaks during extended usage
- ✅ Smooth integration with template filtering

### 12.5 Accessibility
- ✅ Complete keyboard navigation support
- ✅ Screen reader compatibility
- ✅ Clear focus indicators
- ✅ Proper ARIA labeling

## Dependencies
- React Day Picker calendar component
- date-fns for date manipulation and formatting
- Radix UI Popover for popover functionality
- Lucide React for calendar icons
- OKR templates API with date range filtering support

## Future Enhancements
- Saved custom date range presets
- Relative date expressions ("2 weeks ago")
- Fiscal year calendar support
- Time-of-day filtering for intraday precision
- Recurring date pattern support
- Integration with external calendar applications