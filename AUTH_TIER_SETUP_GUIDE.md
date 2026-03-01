# SME Toolkit - Auth & Tier System Setup Guide

## 🎯 What's New

✅ **Dark Mode & Language Persistence** - Settings now persist across sessions  
✅ **Login-First Flow** - Users must authenticate to access the app  
✅ **Free Tier by Default** - New users get free plan automatically  
✅ **Tier System** - Free (limited) / Pro (advanced) / Enterprise (unlimited)  
✅ **Multi-Language Assessment** - Assessment in English & Tamil with scoring  
✅ **Billing Dashboard** - View plans and upgrade subscription  

## 🚀 Quick Setup

### Step 1: Run Database Migrations

1. Go to your **Supabase Dashboard** → **SQL Editor**
2. Run migrations **in this exact order**:

```sql
-- First: Tier System
COPY & PASTE from: TIER_SYSTEM_MIGRATION.sql
-- Run & wait for success

-- Second: Assessment System
COPY & PASTE from: ASSESSMENT_MIGRATION.sql
-- Run & wait for success
```

3. **Verify** by running this query:
```sql
SELECT COUNT(*) FROM public.tier_features;
SELECT COUNT(*) FROM public.assessment_results;
```

### Step 2: Update TypeScript Hooks

New hooks added:
- `src/hooks/useSubscription.ts` - Check tier, canAccessFeature(), upgrade()
- `src/app/theme-context.tsx` - Theme persistence (dark/light mode)
- `src/app/language-context.tsx` - Language persistence (English/Tamil)

### Step 3: Test the Flow

1. **Start dev server:**
```bash
npm run dev
```

2. **Create a test account:**
   - Go to `/auth/signup`
   - Email: `testuser@example.com`
   - Password: `Test@1234`
   - A new user_profile is created automatically with free tier

3. **Test Dark Mode:**
   - Go to `/settings`
   - Toggle dark/light mode
   - Refresh page → theme persists ✅

4. **Test Language:**
   - Go to `/settings`
   - Select your language (English or தமிழ்)
   - Refresh page → language persists ✅

5. **Take Assessment:**
   - Go to `/assessment-multilang`
   - Select language
   - Answer 10 questions
   - Get score & recommendations

6. **Check Billing:**
   - Go to `/billing`
   - View plan details
   - Click "Upgrade to Pro" (for demo, this directly upgrades)

---

## 📋 User Tiers & Features

### Free Tier (Default)
```
✅ 50 Invoices max
✅ 20 Customers max
✅ 100 Items max
❌ Reports (disabled)
❌ Export data (disabled)
❌ API access (disabled)
❌ Team members (disabled)
```

### Pro Tier (₹499/month)
```
✅ Unlimited invoices
✅ Unlimited customers
✅ Unlimited items
✅ Advanced Reports
✅ CSV/JSON Export
✅ 5 API Keys
✅ 5 Team Members
```

### Enterprise Tier (₹2,999/month)
```
✅ Everything in Pro +
✅ Unlimited API Keys
✅ Unlimited Team Members
✅ Dedicated Support
✅ Custom Integrations
```

---

## 🔑 Important Features

### Theme Persistence
```typescript
import { useTheme } from '@/app/theme-context'

function MyComponent() {
  const { theme, setTheme, toggleTheme } = useTheme()
  return <button onClick={toggleTheme}>Toggle Theme</button>
}
```

### Language Persistence
```typescript
import { useLanguage } from '@/app/language-context'

function MyComponent() {
  const { language, setLanguage } = useLanguage()
  return <button onClick={() => setLanguage('ta')}>தமிழ்</button>
}
```

### Check Feature Access
```typescript
import { useSubscription } from '@/hooks/useSubscription'

function MyComponent() {
  const { subscription, canAccessFeature } = useSubscription()
  
  if (subscription?.tier === 'free') {
    return <p>Upgrade to Pro to access reports</p>
  }
}
```

### Upgrade User Tier
```typescript
const { upgrade } = useSubscription()

async function handleUpgrade() {
  const success = await upgrade('pro')
  if (success) console.log('Upgraded!')
}
```

---

## 🗄️ Database Schema (New Tables)

### user_profiles (updated)
```sql
- subscription_tier: 'free' | 'pro' | 'enterprise'
- subscription_status: 'active' | 'expired' | 'cancelled'
- subscription_start_date: timestamp
- subscription_end_date: timestamp
- last_renewed_date: timestamp
```

### tier_features
```sql
- tier: 'free' | 'pro' | 'enterprise'
- feature_name: string (e.g., 'reports', 'export_data')
- enabled: boolean
- limit_value: int (e.g., 50 for invoices limit)
```

### subscription_plans
```sql
- tier: string
- price_monthly: decimal
- price_yearly: decimal
- description: string
- features: jsonb array
```

### assessment_results (NEW)
```sql
- user_id: uuid
- language: 'en' | 'ta'
- score: int (0-100)
- answers: jsonb
- completed_at: timestamp
```

---

## 🔐 Row-Level Security (RLS)

All new tables have RLS enabled. Users can only:
- ✅ Read their own assessment results
- ✅ Insert their own assessment results
- ❌ See other users' data

---

## 🎨 UI Enhancements

### New Routes Added
- `/assessment-multilang` - Multi-language assessment
- `/billing` - Pricing & upgrade

### Updated Settings Page
- Dark/Light mode toggle (now persists!)
- Language selector (now persists!)

---

## ⚠️ Migration Checklist

- [ ] Backup existing Supabase data
- [ ] Run TIER_SYSTEM_MIGRATION.sql
- [ ] Run ASSESSMENT_MIGRATION.sql
- [ ] Verify tables with SELECT queries
- [ ] Test create new user (should get free tier)
- [ ] Test dark mode persistence
- [ ] Test language persistence
- [ ] Test assessment flow
- [ ] Test upgrade flow

---

## 🐛 Troubleshooting

### Dark mode not persisting?
- Check browser console for errors
- Verify `ThemeProvider` wraps the app in App.tsx
- Check localStorage: `localStorage.getItem('app-theme')`

### Language not persisting?
- Verify `LanguageProvider` wraps the app in App.tsx
- Check localStorage: `localStorage.getItem('app-language')`
- Check i18n initialization: `src/lib/i18n.ts`

### Migration fails?
- Check Supabase SQL Editor for error messages
- Ensure you're running as authenticated user
- Check table names (should match exactly)

### Assessment not saving?
- Verify assessment_results table exists
- Check RLS policies are created
- Verify user is authenticated

---

## 📞 Support

For issues, check:
1. Browser console (F12)
2. Supabase dashboard → Logs
3. Network tab → API responses

Need more help? Run migrations again from the SQL files above.
