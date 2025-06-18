# Product Requirements Document: Customers and Opportunities Columns in Partners Page

## Overview
The Customers and Opportunities columns in the Partners page provide interactive access to relationship data, allowing users to quickly navigate to detailed views of related entities for each partner organization.

## Features

### Customers Column
**Purpose:** Displays the count of customers associated with each partner and provides direct navigation to customer details.

**Functionality:**
- Shows numerical count of customers linked to the partner
- Click-through navigation to partner detail page with customers tab pre-selected
- Data sourced from database relationship counts via opportunities table
- Real-time updates when customer-partner relationships change

**User Experience:**
- Numerical display: Shows count (e.g., "5", "12", "0")
- Interactive link: Blue text with hover effects
- Navigation target: `/lists/partners/{partnerId}?tab=customers`
- Loading state: Shows while data fetches
- Zero state: Displays "0" when no customers linked

**Data Source:**
```sql
COUNT(DISTINCT client_id) as customer_count
FROM degoudse.opportunities 
WHERE partner_id IS NOT NULL AND id > 16
GROUP BY partner_id
```

### Opportunities Column
**Purpose:** Displays the count of opportunities associated with each partner and provides direct navigation to opportunity details.

**Functionality:**
- Shows numerical count of opportunities linked to the partner
- Click-through navigation to partner detail page with opportunities tab pre-selected
- Data sourced from database relationship counts via opportunities table
- Real-time updates when opportunity-partner relationships change
- Excludes seed data (IDs 1-16) for data integrity

**User Experience:**
- Numerical display: Shows count (e.g., "8", "23", "0")
- Interactive link: Blue text with hover effects
- Navigation target: `/lists/partners/{partnerId}?tab=opportunities`
- Loading state: Shows while data fetches
- Zero state: Displays "0" when no opportunities linked

**Data Source:**
```sql
COUNT(*) as opportunity_count
FROM degoudse.opportunities 
WHERE partner_id IS NOT NULL AND id > 16
GROUP BY partner_id
```

## Technical Implementation

### Backend Data Processing
1. **Database Query:** Single optimized query joins partners with relationship counts
2. **Data Transformation:** Raw counts converted to integer values with null handling
3. **Response Format:** JSON object with standardized field names
4. **Caching:** Results cached for performance optimization

### Frontend Display Logic
1. **Column Rendering:** Sortable table headers with click handlers
2. **Link Generation:** Dynamic URL construction with partner ID and tab parameter
3. **State Management:** React Query for data fetching and caching
4. **Error Handling:** Graceful fallback to zero when data unavailable

### Navigation Behavior
1. **Tab Pre-selection:** URL parameter automatically opens correct tab
2. **History Management:** Browser back/forward navigation supported
3. **Deep Linking:** Direct URLs to specific partner tabs work correctly

## Business Logic

### Data Filtering Rules
- **Opportunity Exclusions:** Original seed records (IDs 1-16) excluded from counts
- **Partner Scope:** Only active partners included in relationship calculations
- **Relationship Validation:** Null partner IDs filtered out of counts

### Access Control
- **Broker Restrictions:** Brokers see only opportunities from shared lists
- **Admin Access:** Full data visibility for administrative users
- **Data Isolation:** Environment-specific data separation maintained

## User Workflows

### Primary Use Cases
1. **Quick Assessment:** Users scan columns to identify partners with most relationships
2. **Detail Navigation:** Users click counts to explore specific customer or opportunity details
3. **Relationship Analysis:** Users compare partner engagement levels across portfolio

### Secondary Use Cases
1. **Data Validation:** Users verify relationship counts match expectations
2. **Performance Tracking:** Users monitor partner relationship growth over time
3. **List Building:** Users identify partners for inclusion in custom lists based on relationship counts

## Performance Considerations

### Optimization Strategies
- **Single Query:** Relationship counts calculated in one database operation
- **Efficient Joins:** Optimized SQL joins minimize database load
- **Result Caching:** Frequently accessed data cached for faster response times
- **Lazy Loading:** Data fetched only when needed

### Scalability Factors
- **Index Usage:** Database indexes on partner_id and client_id fields
- **Query Limits:** Reasonable result set sizes maintained
- **Memory Management:** Efficient data structures for large partner lists

## Error Handling

### Data Scenarios
- **Missing Relationships:** Displays "0" when no relationships exist
- **Database Errors:** Graceful fallback with user notification
- **Network Issues:** Loading states and retry mechanisms
- **Invalid Partner IDs:** Error boundary prevents application crashes

### User Feedback
- **Loading Indicators:** Visual feedback during data fetching
- **Error Messages:** Clear communication when issues occur
- **Retry Options:** Users can refresh data manually

## Future Enhancements

### Potential Improvements
1. **Trend Indicators:** Show relationship count changes over time
2. **Value Metrics:** Display total opportunity value alongside counts
3. **Filter Integration:** Enable filtering partners by relationship counts
4. **Export Options:** Allow data export with relationship metrics
5. **Real-time Updates:** Live data synchronization across user sessions

### Technical Debt
1. **Query Optimization:** Further database performance improvements
2. **Type Safety:** Enhanced TypeScript definitions for better development experience
3. **Testing Coverage:** Comprehensive unit and integration tests
4. **Documentation:** Detailed API documentation for relationship endpoints