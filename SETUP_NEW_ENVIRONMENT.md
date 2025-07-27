# Setup Instructions for New Replit Environment

Copy and paste this entire prompt into your **other Replit environment** to set up a separate database with identical functionality:

---

## Replit Agent Setup Prompt

I need to set up this Broker Copilot application with a separate PostgreSQL database while maintaining identical functionality to the main environment. This is a marketing campaign management system with comprehensive Partner Hub ecosystem visualization.

### Current Status:
- The codebase is already complete and functional
- I need to initialize a separate database for this environment
- All application logic should remain identical
- The system uses a `degoudse` schema for all environments

### Required Actions:

1. **Database Setup**:
   - Verify the DATABASE_URL environment variable is set (should be automatic if database was created)
   - Initialize the database schema using the existing Drizzle configuration
   - Run `npm run db:push` to create all tables and relationships

2. **Application Startup**:
   - Start the application with `npm run dev`
   - Verify the server starts successfully on port 5000
   - Confirm automatic schema creation and seeding occurs

3. **Verification Steps**:
   - Test that `/campaigns` page loads without errors
   - Verify environment switching works (De Goudse, NN, Baloise, Concordia, custom environments)
   - Confirm all main pages render correctly: Partners, Customers, Opportunities, Products
   - Test that the Partner Hub ecosystem visualization works

### Technical Details:
- **Frontend**: React with TypeScript, Vite, Shadcn/ui, Tailwind CSS
- **Backend**: Express.js with TypeScript, Drizzle ORM
- **Database**: PostgreSQL with `degoudse` schema (isolated from main environment)
- **Key Features**: Campaign management, Partner ecosystem visualization, Multi-environment support, OKR metrics, Smart cross-sell analysis

### Expected Behavior:
- All environments (degoudse, nn, baloise, concordia, custom) should work identically
- Campaign queries should use `/api/campaigns` endpoint consistently
- Environment context should not cause infinite loops or malformed URLs
- The system should maintain Apple/Google style UX/UI throughout

### Success Criteria:
- Application starts without errors
- Database schema is properly initialized
- All main navigation pages load correctly
- Environment switching works smoothly
- Campaign management functionality is operational

Please initialize this environment and confirm everything is working correctly. If there are any issues with database connections, schema creation, or application startup, please resolve them and provide status updates.

---

**Paste this entire prompt into your other Replit's chat to set up the separate environment.**