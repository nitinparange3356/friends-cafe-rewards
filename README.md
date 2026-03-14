# Friends Cafe Rewards System

A modern web application for a coffee shop rewards program that allows users to sign up, earn points, place orders, and redeem rewards. Built with React, TypeScript, Supabase, and Vercel serverless functions.

**Live Demo**: [https://friends-cafe-six.vercel.app](https://friends-cafe-six.vercel.app)

## 🎯 Features

### User Features
- ✅ **User Authentication** - Email and password-based signup/login
- ✅ **Phone Number Login** - Login using phone number with automatic email lookup
- ✅ **Profile Management** - View and manage user profile information
- ✅ **Rewards System** - Earn points with every purchase
- ✅ **Order Management** - Place and track orders
- ✅ **Menu Browsing** - View complete menu with item filtering (Veg, Non-Veg, Eggs)
- ✅ **Shopping Cart** - Add items to cart and proceed to checkout
- ✅ **Email Verification** - Secure account setup with email confirmation

### Admin Features
- ✅ **Admin Dashboard** - Comprehensive admin panel
- ✅ **Order Management** - Approve/reject pending orders
- ✅ **Points Adjustment** - Manually adjust user reward points
- ✅ **User Management** - View all registered users and their details
- ✅ **Analytics** - Track orders and reward points distribution

## 🏗️ Project Structure

```
friends-cafe-rewards/
├── api/                          # Vercel serverless functions
│   ├── phone-lookup.ts          # Phone number to email lookup
│   ├── profile.ts               # User profile endpoint
│   ├── orders.ts                # Order management
│   ├── users.ts                 # User listing (admin only)
│   └── utils/
│       ├── supabase.ts          # Supabase client
│       └── auth.ts              # JWT token verification
│
├── src/
│   ├── components/              # Reusable React components
│   │   ├── Navbar.tsx          # Navigation bar
│   │   ├── MenuItemCard.tsx     # Menu item card component
│   │   ├── ImageUpload.tsx      # Image upload utility
│   │   └── ui/                  # shadcn/ui components
│   │
│   ├── context/
│   │   ├── AuthContext.tsx      # Authentication state & logic
│   │   └── CartContext.tsx      # Shopping cart state
│   │
│   ├── pages/                   # Page components
│   │   ├── Index.tsx            # Home page
│   │   ├── LoginPage.tsx        # Login/Signup page
│   │   ├── MenuPage.tsx         # Menu browsing
│   │   ├── CartPage.tsx         # Shopping cart
│   │   ├── AdminDashboard.tsx   # Admin panel
│   │   ├── DashboardPage.tsx    # User dashboard
│   │   ├── OffersPage.tsx       # Promotions
│   │   └── ConfirmEmailPage.tsx # Email verification
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useMenu.ts           # Menu data management
│   │   ├── useOffers.ts         # Offers management
│   │   └── use-toast.ts         # Toast notifications
│   │
│   ├── lib/                     # Utility functions
│   │   ├── api.ts               # API helper functions
│   │   └── utils.ts             # General utilities
│   │
│   └── App.tsx,main.tsx         # Application entry point
│
├── supabase/                    # Database configuration
│   ├── config.toml             # Supabase local config
│   └── migrations/             # Database migrations
│       ├── Initial schema setup
│       ├── Phone number column addition
│       └── Trigger functions for automation
│
├── public/                      # Static assets
│
├── vite.config.ts              # Vite build configuration
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS configuration
└── package.json                # Dependencies and scripts
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - High-quality UI components
- **React Router** - Client-side routing
- **Sonner** - Toast notifications
- **React Hook Form** - Form management

### Backend & Database
- **Supabase** - PostgreSQL database + authentication
- **Vercel Functions** - Serverless API endpoints
- **Node.js + Express** - Local development server

### Storage & Services
- **Supabase Auth** - User authentication
- **PostgreSQL** - Relational database
- **JWT** - Token-based authentication

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Git
- Supabase account (for database)
- Vercel account (for deployment)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/nitinparange3356/friends-cafe-rewards.git
cd friends-cafe-rewards

# 2. Install dependencies
npm install

# 3. Create .env.local file with your Supabase credentials
cp .env.example .env.local

# 4. Add your environment variables:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_anon_key
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Running Locally

```bash
# Development server (frontend only)
npm run dev

# Development with API server
npm run dev:all

# This starts:
# - Frontend on http://localhost:8082
# - API server on http://localhost:3002
```

## 📱 Phone Number Login System

A core feature of this system is the ability to login using phone numbers instead of email addresses.

### How It Works

**Signup Flow:**
1. User enters name, email, password, and phone number
2. Phone number is normalized (digits only, last 10 digits for Indian format)
3. Stored in Supabase auth metadata and user profile
4. Database trigger automatically extracts and saves phone number

**Login Flow:**
1. User enters phone number (format: `+91 9876543210`, `919876543210`, or `9876543210`)
2. Frontend detects it's a phone number using regex
3. Calls `/api/phone-lookup` backend endpoint
4. Backend queries profiles table for matching phone number
5. Returns associated email address
6. Frontend uses email to authenticate with Supabase
7. User is logged in

**Phone Number Normalization:**
- All phone numbers stored as digits only (e.g., `9876543210`)
- During signup: `+91 9876543210` → `9876543210` (last 10 digits)
- During login: supports any format, automatically normalized for lookup

### Related Files
- [Phone number migration](./supabase/migrations/20260314_fix_phone_number_on_signup.sql)
- [Backend lookup API](./api/phone-lookup.ts)
- [Frontend login logic](./src/context/AuthContext.tsx)

## 📊 Database Schema

### profiles table
```sql
- id (UUID, Primary Key)
- name (TEXT)
- email (TEXT, Unique)
- phone_number (TEXT, Unique, Nullable)
- reward_points (INTEGER)
- created_at (TIMESTAMP)
```

### orders table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → profiles.id)
- user_name (TEXT)
- email (TEXT)
- total_amount (INTEGER)
- status (TEXT: Pending/Approved/Rejected)
- points_earned (INTEGER)
- created_at (TIMESTAMP)
```

### order_items table
```sql
- id (UUID, Primary Key)
- order_id (UUID, Foreign Key → orders.id)
- item_name (TEXT)
- quantity (INTEGER)
- price (INTEGER)
```

### user_roles table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → profiles.id)
- role (TEXT: admin/user)
```

## 🔐 Authentication & Authorization

### User Authentication
- Email/Password signup and login via Supabase Auth
- Phone number login support
- Session persistence using local storage
- JWT token-based API authentication

### Role-Based Access Control
Users can have roles:
- `user` - Regular customer
- `admin` - Can access admin dashboard

Admin-only endpoints are protected by role verification on the backend.

## 📡 API Endpoints

### Public Endpoints
- `GET /` - Home page
- `GET /login` - Login/signup page
- `POST /api/phone-lookup` - Phone number to email lookup

### Protected Endpoints (Require Authentication)
- `POST /api/profile` - Get user profile
- `POST /api/orders` - Get user orders (or all if admin)
- `POST /api/users` - Get all users (admin only)

## 🚢 Deployment

### Deploy to Vercel

1. **Push code to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import project from GitHub
   - Select the repository

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add:
     - `SUPABASE_URL` - Your Supabase project URL
     - `SUPABASE_SERVICE_ROLE_KEY` - Service role key (from Supabase settings)

4. **Deploy**
   - Vercel auto-deploys on push to main branch
   - Check deployment status in Vercel dashboard

## 🧪 Development Commands

```bash
npm run dev          # Start frontend dev server
npm run dev:api      # Start API dev server only
npm run dev:all      # Start both frontend and API
npm run build        # Build for production
npm run lint         # Run ESLint
npm run test         # Run tests once
npm run test:watch   # Run tests in watch mode
npm run preview      # Preview production build
```

## 📝 Recent Updates

### Phone Number Login Implementation (v2.0)
- ✅ Added phone number field to user signup
- ✅ Implemented phone number normalization (digits only)
- ✅ Created `/api/phone-lookup` endpoint for secure phone-to-email lookup
- ✅ Updated database trigger to capture phone numbers during signup
- ✅ Full support for phone number login (format: +91 9876543210 or 9876543210)
- ✅ Fixed import paths for Vercel serverless compatibility

## 🐛 Troubleshooting

### Phone Login Returns "No Account Found"
1. Verify phone number format: `+91 9876543210` or `9876543210`
2. Check database: ensure `phone_number` column exists in `profiles` table
3. Confirm environment variables are set in Vercel

### API Endpoints Returning 500 Errors
1. Check Vercel function logs for actual error messages
2. Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
3. Check browser console for detailed error info

### User Not Authenticated After Login
1. Check if JWT token is valid in browser DevTools → Application → LocalStorage
2. Verify Supabase session in console: `supabase.auth.getSession()`
3. Check failed `/api/profile` request details in Network tab

## 📧 Contact & Support

For questions or issues, please open an issue on [GitHub](https://github.com/nitinparange3356/friends-cafe-rewards/issues).

## 📄 License

This project is private and proprietary.

---

**Last Updated**: March 14, 2026
**Version**: 2.0.0

- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
