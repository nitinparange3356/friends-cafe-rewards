# Email Confirmation Setup

## Step 1: Configure Supabase Redirect URL

1. Go to **Supabase Dashboard** → India project
2. Go to **Authentication → Email Templates**
3. Look for the **Confirm signup** email template
4. Find the confirmation link (should look like: `{{ .ConfirmationURL }}`)
5. It should redirect to: `{{ .SiteURL }}/auth/confirm`

## Step 2: Set Site URL

1. Go to **Authentication → URL Configuration**
2. In **Site URL**, set it to your app URL:
   - For local development: `http://localhost:8082`
   - For production: `https://your-domain.com`

3. In **Redirect URLs**, add:
   - `http://localhost:8082/auth/confirm`
   - `http://localhost:8082/login`
   - `https://your-domain.com/auth/confirm` (for production)

## Step 3: Keep Email Confirmation Enabled

1. Go to **Authentication → Providers → Email**
2. Make sure **"Require email confirmation"** is **ON** (enabled)
3. Save changes

## How It Works

1. User signs up
2. Supabase sends confirmation email with link to `/auth/confirm?token_hash=...&type=signup`
3. ConfirmEmailPage automatically verifies the email
4. User is redirected to dashboard
5. Now they can login!

## Testing Locally

Since you're in India and Supabase might have email delivery issues:

**Option A: Check Email Inbox**
- Sign up with your actual email
- Check inbox/spam folder for confirmation email
- Click the link

**Option B: Use Supabase Console**
If email doesn't arrive, manually confirm in SQL Editor:
```sql
UPDATE auth.users SET email_confirmed_at = now() WHERE email = 'user@example.com';
```

Then the user can login immediately.
