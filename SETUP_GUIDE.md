# Friends Cafe Rewards - Setup Guide

## 1. ✅ Environment Variables
Your `.env` file is already configured:
```
VITE_SUPABASE_PROJECT_ID=umlqofhdkmsusxvsubqr
VITE_SUPABASE_PUBLISHABLE_KEY=[your anon key]
VITE_SUPABASE_URL=https://umlqofhdkmsusxvsubqr.supabase.co
```

**Verify these match your actual Supabase project in Dashboard → Settings → API**

## 2. 🔴 CRITICAL: Apply Database Migrations

Your Supabase database needs the migrations applied. Follow these steps:

### Step A: Go to Supabase SQL Editor
1. Open https://app.supabase.com
2. Select your project
3. Go to **SQL Editor** (left sidebar)

### Step B: Apply First Migration
1. Click **New Query**
2. Copy everything from: `supabase/migrations/20260308074411_4e3f0a07-a8da-412e-9192-d9d41ff2eef0.sql`
3. Paste it in the SQL editor
4. Click **Run**

### Step C: Apply Second Migration
1. Click **New Query** 
2. Copy everything from: `supabase/migrations/20260309101816_af78429b-cc59-45bd-866a-218f97301040.sql`
3. Paste it in the SQL editor
4. Click **Run**

**You should see no errors.** If you get errors about tables already existing, that's OK (means they're there).

### Step D: Verify Tables Created
Go to **Database → Tables** and verify these tables exist:
- ✅ profiles
- ✅ user_roles
- ✅ categories
- ✅ menu_items
- ✅ orders
- ✅ order_items
- ✅ offers

### Step E: Verify Storage Bucket
1. Go to **Storage** (left sidebar)
2. Verify `menu-images` bucket exists
3. Check if it's set to **Public**

## 3. 🔓 Setup Admin Account

After signing up through the app:

1. Go to **Supabase Dashboard → SQL Editor**
2. Create a new query and run:
```sql
INSERT INTO public.user_roles (user_id, role) 
VALUES ('[YOUR_USER_ID]', 'admin');
```

To get `YOUR_USER_ID`:
- Go to **Authentication → Users**
- Copy the UUID of your user

## 4. ✅ Test the App

1. Visit `http://localhost:8081/`
2. Try to **Sign Up** with an email and password
3. If signup works → proceed to create an admin account
4. Visit `/admin-dashboard` (secret route)
5. Login with your admin credentials
6. Add a menu item to test the full flow

## 5. ❌ Troubleshooting

### Error: "Failed to fetch"
- Check your `.env` file Supabase URL and key
- Verify migrations were applied
- Check browser console for exact error message

### Error: "Not an admin"
- You haven't run the SQL INSERT statement to add admin role
- Verify the user_id is correct

### Images won't upload
- Check Storage bucket exists and is public
- Verify you're logged in with an admin account

## 6. 📝 Full User Flow Test

1. **Signup**: Create a new user account
2. **Browse Menu**: View items (should show seeded menu items)
3. **Add to Cart**: Add 2-3 items
4. **Place Order**: Click "Place Order" from cart
5. **Admin Approve**: Login as admin → go to `/admin-dashboard` → approve the order
6. **Check Points**: User should see reward points in dashboard
7. **Verify Calculation**: ₹2 spent = 1 point

## Questions?
If you get stuck, take a screenshot of the error and share it!
