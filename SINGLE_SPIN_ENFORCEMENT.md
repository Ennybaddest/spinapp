# Single-Spin Limit Enforcement

This document outlines the comprehensive enforcement of the single-spin limit across all layers of the Deliciosa Spin & Win application.

## 1. Database Layer

### Unique Constraint
- **Location**: `user_spins.phone` column
- **Type**: UNIQUE constraint
- **Effect**: Prevents duplicate phone numbers at the database level
- **Enforcement**: Any attempt to insert a duplicate phone number will fail with error code 23505

### Schema
```sql
CREATE TABLE user_spins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text UNIQUE NOT NULL,  -- Unique constraint enforces single-spin
  name text NOT NULL,
  prize text NOT NULL,
  spun_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
```

## 2. Row-Level Security (RLS)

### Read Policy
- **Policy Name**: "Read-only access for checking spin status"
- **Type**: SELECT
- **Access**: `anon, authenticated`
- **Effect**: Clients can read any spin to verify status

### Write Policies
- **INSERT Policy**: "Service role only for inserts"
  - Blocks: `authenticated` users
  - Allows: Service role (via Edge Function)
  
- **UPDATE Policy**: "Service role only for updates"
  - Blocks: `authenticated` users
  - Prevents: Any modifications to existing spins

- **DELETE Policy**: "Service role only for deletes"
  - Blocks: `authenticated` users
  - Prevents: Any deletions of spin records

## 3. Edge Function Validation (Server-Side)

### Input Validation
1. **Required Fields Check**
   - Validates presence of `phoneNumber`, `name`, `prize`
   - Returns 400 Bad Request if missing

2. **String Validation**
   - Trims all inputs
   - Validates non-empty strings
   - Returns 400 Bad Request if empty

3. **Phone Number Format Validation**
   - Pattern: `/^0\d{10}$/` (11 digits starting with 0)
   - Returns 400 Bad Request if invalid

4. **Name Length Validation**
   - Maximum 100 characters
   - Returns 400 Bad Request if exceeded

### Spin History Check
1. **Query Before Insert**
   - Queries `user_spins` table for existing phone number
   - Uses service role key for access

2. **Conflict Detection**
   - If record exists: Returns 409 Conflict with existing prize
   - Response includes `existingPrize` field

3. **Race Condition Handling**
   - Handles database-level unique constraint violation (error code 23505)
   - Fetches and returns the conflicting prize
   - Returns 409 Conflict

### Successful Recording
1. **Insert with Verification**
   - Inserts new spin record
   - Uses `.select()` to verify insertion succeeded
   - Returns 201 Created with success message

2. **Error Handling**
   - Comprehensive error logging
   - Returns appropriate HTTP status codes
   - Never exposes sensitive information

## 4. Client-Side Validation

### Form Validation
1. **Name Validation**
   - Required field
   - 1-100 characters
   - Error display on invalid input

2. **Phone Number Validation**
   - Required field
   - Pattern: 11 digits starting with 0
   - Real-time feedback
   - Error display on invalid input

### State Management (`useSpinLogic` Hook)
1. **Check Phase**
   - Calls `getUserSpinStatus()` before showing wheel
   - Stores result in hook state: `{ hasSpun, lastPrize }`

2. **Record Phase**
   - Calls `recordSpinViaAPI()` only after wheel spin
   - Handles API responses with error checking
   - Prevents multiple simultaneous requests

### UI Logic
1. **Conditional Rendering**
   - Shows "Already Spun" message if `hasSpun === true`
   - Shows wheel only if `hasSpun === false`
   - Displays previous prize when applicable
   - Shows errors when API calls fail

## 5. API Integration

### recordSpinViaAPI Flow
```typescript
1. Client validates form inputs
2. Calls Edge Function at: /functions/v1/recordSpin
3. Sends: { phoneNumber, name, prize }
4. Edge Function validates inputs
5. Edge Function checks database
6. Edge Function inserts record
7. Returns: { success, prize } or { error, existingPrize, statusCode }
8. Client handles response
```

### Error Responses
- **400**: Invalid input
- **409**: Phone already has a spin
- **500**: Server error
- **201**: Success

## 6. Race Condition Prevention

### Multiple Layers
1. **Database Level**: Unique constraint prevents duplicate inserts
2. **Application Level**: Check-before-insert pattern
3. **API Level**: Handles unique constraint violations with retry logic
4. **UI Level**: Disables form while checking/submitting

### Retry Logic
- If unique constraint violated after check: Fetches existing prize
- Returns 409 Conflict to client
- Client shows "Already Spun" message

## 7. Security Summary

### What is Protected Against
✓ Multiple spins from the same phone number  
✓ Direct database manipulation via RLS  
✓ Bypassing validation via API calls  
✓ Race conditions during simultaneous requests  
✓ Invalid data entry (format, length)  
✓ Client-side manipulation of spin records  

### Defense Mechanisms
- 7 separate validation layers
- Database constraints + RLS policies
- Service role authentication
- Comprehensive error handling
- Client-side UI locks
- Server-side idempotency

< ! ---- Update ---- ! >
