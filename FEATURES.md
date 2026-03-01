# SME Toolkit - Complete Feature Guide

A modern, polished **Vite + React 18 + TypeScript** business management platform with Supabase, i18n (English/Tamil), PWA, and production-ready UI.

## 🎯 Latest Features

### Assessment Wizard (5-Step Quiz)
The Business Readiness Assessment helps users understand their operational maturity:

- **5 Steps**: Sales → Invoicing → Finance → HR → Comprehensive
- **20 Questions**: Each topic has 4 questions with weighted scoring (1-3 points)
- **Progress Bar**: Visual feedback on completion
- **0-100 Score**: Normalized to percentages
- **Recommendations**: Dynamic suggestions based on score
- **Feature Flags**: Unlock modules based on assessment results:
  - Score < 30: Invoicing (basics)
  - Score < 40: CRM
  - Score < 50: Inventory
  - Score < 60: HR
  - Score ≥ 70: Advanced Analytics
- **Profile Save**: Results stored in `user_profiles.assessment_score` and `feature_flags`

**Access**: Navigate to `/assessment` after login, or add Assessment option in settings.

### Onboarding Carousel (First-Login)
Introduce users to the platform with an interactive 4-slide carousel:

1. **Welcome**: Introduction to SME Toolkit
2. **Templates**: Pre-built and ready-to-use content
3. **Tamil Support**: Full localization info
4. **Get Started**: Confirmation before auto-creating sample data

**On Final Slide**:
- Automatically creates sample data:
  - 3 sample customers
  - 4 sample items (various categories)
  - 2 sample invoices
  - 3 sample tasks
  - 3 sample employees
  - 2 sample vendors
- Marks user as `onboarded: true` in DB
- Redirects to dashboard

**Access**: `/onboarding` (protected route)

---

## 📋 All Pages & Features

### Dashboard
- **6 KPI Cards**: Revenue, Pending Invoices, Low Stock, Active Tasks, New Leads, Employees
- **Animated Counters**: Framer Motion-driven numeric animations
- **Charts**: Sales Trend (Line), Stock Levels (Bar), Top Customers (Pie)
- **Recent Activity Timeline**: Latest events from tasks/invoices/reminders
- **Quick Actions**: "New Invoice" and "New Customer" buttons
- **Real-time Subscriptions**: Supabase realtime updates for invoices, items, tasks

### Invoices
- **DataTable**: Search, filter by status/customer/date, pagination
- **Columns**: #, Customer, Items Count, Total, Date, Status, Actions
- **Create/Edit Modal**: Multi-item form with tax calculation
- **PDF Export**: Dynamic import of `@react-pdf/renderer` with printable fallback
- **Bulk Actions**: Print/Send selected invoices
- **Mobile Swipe**: Swipe left to mark paid, right to delete
- **Real-time Updates**: Realtime Supabase subscription on invoice changes

### Items
- **DataTable**: Name, Price, Stock, Low-Stock Badge, Total Value
- **Add/Edit Modal**: Category dropdown, barcode, image upload to Supabase Storage
- **CSV Import**: Simple CSV parser (name, price, stock, category, barcode)
- **Stock Donut Chart**: Visual representation of stock levels
- **Real-time Sync**: Multi-user updates via Supabase realtime
- **Links**: Quick links to view invoices or vendors per item

### Customers / CRM
- **List Tab**: Name, Phone, Email, Total Sales, Last Invoice, Actions
- **Activity Tab**: Timeline of leads, reminders, customer events
- **Notes Tab**: Per-customer notes storage
- **CRM Tab**: 
  - **Kanban Leads**: Drag-drop status management (New → Contacted → Qualified → Won → Lost)
  - **Convert to Customer**: Lead → Customer auto-merge
  - **Reminders**: Upcoming follow-ups with calendar view
- **Real-time**: Supabase subscriptions on customers, leads, reminders

### Tasks
- **Kanban Board**: To Do, In Progress, Done columns
- **Drag-Drop**: Move tasks between statuses
- **Assignees & Due Dates**: Track ownership and deadlines
- **Add/Edit Modal**: Title, description, assignee, due date
- **Real-time Sync**: Supabase subscription on task changes

### Vendors
- **DataTable**: Name, Contact, Email, Phone, Rating, Actions
- **Add/Edit Modal**: Vendor management with star rating
- **PO Tab**: Purchase Orders linked to vendor
- **Real-time Updates**: Supabase subscription on vendor changes

### HR
- **Employees DataTable**: Name, Email, Role, Status, Actions
- **Punch In/Out**: Timeclock buttons create daily attendance records
- **Attendance Tab**: 
  - Recent punch logs (date, punch in, punch out times)
  - **Attendance Heatmap**: Weekly bar chart showing attendance count
- **Real-time Sync**: Supabase subscription on employee changes

### Settings
- **Theme Toggle**: Dark/light with localStorage persistence
- **Language Selection**: English / Tamil (RTL support)
- **Profile Settings**: User info, avatar, role
- **Feature Management**: Visible unlocked features based on assessment

---

## 🗄️ Database Setup

### 1. Create Supabase Project
- Go to [Supabase](https://supabase.com) and create a new project
- Note your **Project URL** and **Anon Key**

### 2. Run Migrations
1. In Supabase Studio, go to **SQL Editor**
2. Create a new query and paste the entire contents of `SUPABASE_MIGRATIONS.sql`
3. Execute all migrations
4. This creates all tables, indexes, and RLS policies

### 3. Storage Setup (for item images)
1. Go to **Storage** in Supabase
2. Create a new bucket named `items` (make it public)
3. Update `src/lib/supabase.ts` if needed with correct bucket name

### 4. Environment Configuration
Create `.env.local` in project root:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+ (or use nvm)
- npm / pnpm
- Git

### Setup
```bash
# Install dependencies
npm install --legacy-peer-deps

# Create .env.local with Supabase keys
echo "VITE_SUPABASE_URL=https://your-project.supabase.co" > .env.local
echo "VITE_SUPABASE_ANON_KEY=your_anon_key" >> .env.local

# Start dev server
npm run dev
```

The app will be available at `http://localhost:5173` (or next available port).

### Build for Production
```bash
npm run build
npm run preview  # Preview production build locally
```

---

## 🔍 Feature Flags & Assessment

Feature flags control which modules are visible:

```typescript
// Default flags (in assessment.ts)
{
  invoicing: pct >= 30,
  crm: pct >= 40,
  inventory: pct >= 50,
  hr: pct >= 60,
  analytics: pct >= 70,
}
```

After assessment, flags are saved in `user_profiles.feature_flags` JSONB column.

To manually unlock features (for testing), update the user's profile in Supabase:
```sql
UPDATE user_profiles 
SET feature_flags = jsonb_set(feature_flags, '{invoicing}', 'true') 
WHERE user_id = 'your-user-id';
```

---

## 📱 Mobile Features

- **Responsive Grid**: All pages scale from mobile to desktop
- **Swipe Actions**: Invoices support swipe-left (mark paid), swipe-right (delete)
- **Touch-friendly Buttons**: Large tap targets on mobile
- **Full RTL Support**: Tamil language fully localized with RTL layout

---

## 🌍 Internationalization (i18n)

Currently supported:
- **English**: Full content
- **Tamil**: Full translations with RTL layout

Switch language in **Settings** → select Tamil. All UI elements, nav, forms follow the selection.

Add more languages by:
1. Updating `src/lib/i18n.ts` with new language resource
2. Adding language option to settings dropdown

---

## 🔐 Authentication

- **Supabase Auth**: Email/password + OTP + Google OAuth (if configured)
- **Profile Metadata**: User roles (owner/accountant/storekeeper) stored in Supabase
- **Protected Routes**: All app pages require login via `ProtectedRoute` HOC
- **Real-time Presence**: Optional user presence tracking via Supabase channels

---

## 🎨 Design System

- **Tailwind CSS**: Utility-first styling
- **Glassmorphism Cards**: Frosted glass UI components
- **Framer Motion**: Smooth animations on page transitions, counters, modals
- **Recharts**: Lightweight charting for dashboards and analytics
- **shadcn/ui Primitives**: Accessible base components (Button, Card, Badge, etc.)

---

## 📊 Realtime Data Flow

All major pages listen to Supabase realtime changes:

- Dashboard: invoices, items, tasks
- Invoices: invoice status changes
- Items: stock updates
- Customers: leads, customer updates
- Tasks: status/assignee changes
- HR: attendance/employee changes

Changes sync automatically across all connected clients.

---

## 🧪 Sample Data

**Auto-Created on First Onboarding**:
- 3 Customers (Acme, Beta, Gamma)
- 4 Items (Widget, Gadget, Service Pack, Raw Material)
- 2 Invoices (sample with items)
- 3 Tasks (various statuses and assignees)
- 3 Employees (Sales, Finance, HR)
- 2 Vendors (Supplier Co, Bulk Foods)

Use these to explore features without manually creating records.

---

## 🐛 Troubleshooting

### "Supabase connection error"
- Check `.env.local` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Verify Supabase project is active

### "Table does not exist"
- Confirm all SQL migrations from `SUPABASE_MIGRATIONS.sql` were executed
- Check for any error messages in Supabase SQL Editor

### "RLS policy error"
- Ensure user is logged in
- Check RLS policies are correctly configured (should allow `auth.uid() = user_id` for own data)

### Charts not rendering
- Verify `recharts` is installed: `npm ls recharts`
- Check browser console for errors

---

## 📝 Next Steps & Roadmap

Potential enhancements:
- [ ] **Invoice Email Sending**: Integrate with SendGrid or similar
- [ ] **Attendance Mobile App**: Dedicated punch-in/out app
- [ ] **Advanced Reporting**: Custom reports, data export
- [ ] **API Integration**: Razorpay, Shiprocket, GST APIs
- [ ] **WhatsApp Notifications**: Customer updates via WhatsApp
- [ ] **Multi-user Collaboration**: Team workspaces
- [ ] **Offline Support**: PWA offline mode for core features

---

## 📞 Support & Contribution

For issues or feature requests, create an issue on GitHub.

Contributions welcome!

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Built with**: Vite, React 18, TypeScript, Supabase, Tailwind, Framer Motion
