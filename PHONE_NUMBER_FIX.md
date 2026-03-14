# Phone Number Login Issue - Root Cause Fix

## Problem
Users could not login using their phone number during signup because the phone number was never stored in the database `profiles` table, even though it was being collected during the signup form.

## Root Cause
The database trigger function `handle_new_user()` in `supabase/setup-functions.sql` was only capturing `name` and `email` from the auth user metadata, but was ignoring the `phone_number` field. When a new user signed up:

1. Phone number was passed to Supabase auth in the user metadata
2. The trigger created a profile row but only copied `name` and `email`
3. Phone number was never transferred to the `profiles.phone_number` column
4. Login attempted to look up email by phone number but found nothing (NULL in database)

## Solution Implemented

### 1. Database Trigger Update
Updated the `handle_new_user()` trigger function to extract and store the `phone_number` from `raw_user_meta_data`:

**File: `supabase/migrations/20260314_fix_phone_number_on_signup.sql`** (New)
- Updates the trigger to capture phone_number during profile creation
- Includes migration to backfill phone_number for existing users who may have it in auth metadata

**File: `supabase/setup-functions.sql`** (Updated)
- Modified the `handle_new_user()` function to include phone_number in the INSERT statement

### 2. Simplified Signup Logic
**File: `src/context/AuthContext.tsx`** (Simplified)
- Removed manual database update/insert logic that was trying to update the profile after signup
- Removed hardcoded 500ms delay that was unreliable
- Now relies entirely on the database trigger to handle phone_number persistence
- Simplified error handling - single path for auth signup with metadata

## How It Works Now (Complete Flow)
1. **Signup Form** collects: name, email, password, phone number
2. **Frontend** passes phone_number in Supabase auth signUp metadata
3. **Database Trigger** automatically extracts phone_number from auth metadata and stores it in profiles table
4. **Login** can now successfully look up user by phone number in the profiles table

## Testing Steps
1. Create a new account with phone number: `+91 9876543210`
2. Sign out
3. Login using phone number: `+91 9876543210`
4. Should successfully login (previously would fail with "No account found with this phone number")

## Files Modified
- `supabase/migrations/20260314_fix_phone_number_on_signup.sql` - NEW
- `supabase/setup-functions.sql` - Updated trigger function
- `src/context/AuthContext.tsx` - Simplified signup function
