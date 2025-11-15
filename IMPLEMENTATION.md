# Implementation

As required in the spec for PM4 at https://github.com/CS3704-VT/Course/blob/main/Project/PM4.md,
we are including a IMPLEMENTATION.md file that explains the following:

- What feature you implemented
- An explanation of what the generated code does and if it does what you were expecting
- What AI tools were used, how, and why.
- Explain if any modifications were needed to the prompts/codes to get to the output.

## Suraj Vinti

### Feature Implemented
I worked on the user-facing structure of the frontend, including:
- Landing page (`page.tsx`)
- Sidebar with routing to main pages (Home, Dashboard, Goals, Insights, Settings, Login, Signup)
- Login and Signup UI shells with form fields and buttons
- Basic Settings and Insights page shells for navigation completeness

This provides the initial flow of the system and aligns with the design from PM3. The pages load correctly, routing works, and the UI structure is ready for future backend integration.

### AI Usage
I used ChatGPT for:
- Generating basic mock data to test component rendering since backend has not been connected fully yet.
- Minor TypeScript bug fixes (e.g., prop types or syntax issues).
- Minor formatting issues with charts/dates.

The AI-assisted code worked as intended with a few small tweaks

### Modifications After AI Assistance
I manually edited the mock data to fit our project fields and corrected any AI-suggested fixes to match our component structure and file organization.

## Alexander Peal

- I implemented the goals feature.
- The generated code does not work. This matches my expectations, as our project is a skeleton and
  doesn't support data persistence (i.e. we don't have a database set up yet.)
- I used Cursor, an AI-powered IDE, to work on this section. Sonnet 4.5 is the LLM I used with Cursor
  to help me understand the repository and generate the multiple functions required for this part of the assignment.
- The given prompts were sufficient for getting to the output. I didn't think any modifications were needed to get skeleton code I was satisfied with.
- For the next milestone, we'll use the black box test plan to get the goals feature closer to a functional state.

## Abhishek (Frontend-Backend Integration & Sync)

### Feature Implemented: Frontend-Backend API Integration

I implemented the complete integration between the frontend and backend, connecting all API endpoints and ensuring data synchronization. I also implemented the Abstract Factory pattern
we defined in PM3 for our backend.

Important Note About Login/Signup: ⚠️ Authentication is NOT implemented in this milestone.
We have not implemented user authentication yet. The login and signup pages are placeholders and currently do not perform any backend authentication.

👉 You can access the dashboard immediately by navigating to /dashboard after loading the home page, without needing to log in.

1. **API Utility Module** (`frontend/src/lib/api.ts`)

   - Created a centralized API client with type-safe interfaces
   - Implemented functions for all backend endpoints: transactions (GET, POST), goals (GET, POST, PUT), and health check
   - Added comprehensive error handling with proper error message extraction

2. **Transaction Provider Integration** (`frontend/src/components/transaction-provider.tsx`)

   - Replaced localStorage-only storage with backend API calls
   - Added automatic transaction fetching on component mount
   - Implemented schema conversion between frontend format (with `name` field) and backend format (with `source` field)
   - Added loading states, error handling, and fallback to localStorage if API fails

3. **Dashboard Page Updates** (`frontend/src/app/dashboard/page.tsx`)

   - Updated transaction creation to use async API calls
   - Added date input field to the transaction form
   - Fixed TypeScript errors related to form reset after async operations
   - Added date validation on frontend (max attribute prevents future dates)

4. **Goals Page Integration** (`frontend/src/app/goals/page.tsx`)

   - Replaced local state management with backend API integration
   - Implemented schema conversion between frontend format (`name`, `target`, `deadline`) and backend format (`category`, `targetAmount`, `startDate`, `endDate`)
   - Added deadline parsing function to convert user-friendly formats like "Dec 2026" to ISO date strings
   - Implemented goal progress calculation from transactions in the goal's category
   - Fixed React 19 type compatibility issues with lucide-react icon components

5. **Backend Date Validation** (`backend/app.js`)
   - Enhanced the transaction schema to validate date format
   - Added validation to prevent future dates (allows today and past dates only)
   - Provides clear error messages for invalid dates

### What the Generated Code Does

The AI-generated code successfully:

1. **API Module**: Creates a clean, type-safe interface for all backend communication with proper error handling. The code matches the backend API structure exactly and handles edge cases like network failures.

2. **Transaction Provider**: Converts the frontend from a localStorage-only application to a fully API-integrated system. It maintains backward compatibility by falling back to localStorage if the API is unavailable, ensuring the app doesn't break if the backend is down.

3. **Schema Conversion**: Handles the mismatch between frontend and backend data structures:

   - Frontend uses `name` for transaction display, but backend uses `category` - the code maps between these
   - Frontend goals use `name`, `target`, `deadline` but backend uses `category`, `targetAmount`, `startDate`, `endDate` - the code converts between these formats seamlessly

4. **Date Validation**: Both frontend and backend now validate dates:

   - Frontend prevents selecting future dates in the date picker
   - Backend validates date format and rejects future dates with clear error messages

5. **Error Handling**: Comprehensive error handling throughout:
   - API calls catch errors and display user-friendly messages
   - Form submissions handle async errors gracefully
   - Loading states provide user feedback during API operations

### Does It Work As Expected?

Yes, the code works as expected. The frontend and backend are now fully synchronized:

- ✅ Transactions can be created and fetched from the backend
- ✅ Goals can be created and fetched from the backend
- ✅ Data persists in backend memory (resets on server restart, as designed)
- ✅ Error handling works correctly with fallback mechanisms
- ✅ Date validation prevents future dates on both frontend and backend
- ✅ Schema conversions work correctly between frontend and backend formats

The only limitation is that data is stored in memory, so it resets when the backend restarts. This is expected behavior for the current milestone and will be addressed with database integration in future milestones.

### AI Tools Used

**Primary Tool**: Cursor AI Assistant (Auto/Cursor's built-in AI)

**How It Was Used**:

1. **Code Generation**: Used to generate the API utility module, transaction provider updates, and goals page integration
2. **Bug Fixes**: Used to fix TypeScript errors, React 19 type compatibility issues, and form handling problems
3. **Code Refactoring**: Used to update existing code to work with the new API integration
4. **Documentation**: Used to understand existing code structure and ensure proper integration

**Why It Was Used**:

- Speed up development of boilerplate API code
- Ensure type safety and proper error handling patterns
- Fix compatibility issues between React 19 and lucide-react components
- Maintain consistency with existing code patterns in the repository

### Modifications Made

Several modifications were necessary to get the code working properly:

1. **TypeScript Form Reset Error**: The original code had `e.currentTarget.reset()` which caused TypeScript errors after async operations. Fixed by storing `e.currentTarget` in a local variable before the async call.

2. **React 19 Type Compatibility**: lucide-react icon components weren't compatible with React 19's JSX types. Fixed by creating typed component variables using type assertions: `const Icon = Component as React.ComponentType<{ className?: string }>`.

3. **Schema Mismatch**: The frontend and backend had different field names. Added conversion functions to map between formats:

   - Transaction: `name` (frontend) ↔ `category` (backend)
   - Goals: `name/target/deadline` (frontend) ↔ `category/targetAmount/startDate/endDate` (backend)

4. **Date Field Missing**: The transaction form didn't have a date input. Added a date input field with validation to prevent future dates.

5. **Date Validation**: Enhanced backend validation to check both date format validity and prevent future dates. Added frontend validation using the `max` attribute on the date input.

6. **Error Handling**: Enhanced error messages to be more user-friendly and added proper error propagation from API calls to UI.

7. **Dependencies**: Had to run `npm install` in the frontend to ensure Next.js types were available, which fixed the `next/link` import error.
