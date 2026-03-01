# Global Features & Enhancements Documentation

## Overview
This document covers all the global utilities, hooks, and features added to the SME Toolkit for enhanced functionality and user experience.

---

## Settings Page Enhancements

### New Features Added

#### 1. **App Settings**
- Set custom app name and company name
- Settings are persisted to Supabase `user_profiles` table
- Auto-loaded on component mount

```tsx
// Usage in components
const [appName, setAppName] = useState('SME Toolkit')
const [companyName, setCompanyName] = useState('')

const handleSaveAppSettings = async () => {
  // Saves to Supabase user_profiles
}
```

#### 2. **Subscription Plan Display**
- Shows current plan (Free, Pro, Enterprise)
- Visual display of available plans
- Plan information stored in `subscription_plan` field

```tsx
// Plans available
- 'free' - Free Plan (Basic features)
- 'pro' - Pro Plan (Advanced features)
- 'enterprise' - Enterprise Plan (All features)
```

#### 3. **API Key Management**
- Generate new API keys for integrations
- Display and manage API keys
- Copy keys to clipboard
- Delete keys securely
- Track creation date and last used timestamp

```tsx
// API Keys Table Structure
CREATE TABLE api_keys (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP,
  last_used TIMESTAMP
)

// Generate key in code
const handleGenerateApiKey = async () => {
  const newKey = 'sk_' + randomString() // Format: sk_xxxxx
  // Store in Supabase
}
```

#### 4. **Data Export**
- Export data as CSV or JSON
- Exports customers, items, invoices, tasks, leads
- File downloads automatically with timestamp

```tsx
// Usage
const handleExportData = async (format: 'csv' | 'json') => {
  // Exports all user data in selected format
}

// Files exported as
export-2024-01-15.csv
export-2024-01-15.json
```

---

## Global Hooks & Utilities

### 1. **useInfiniteScroll Hook**

Automatically load more data as user scrolls to bottom of list.

```tsx
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'

// Usage
const { observerTarget, isLoading } = useInfiniteScroll({
  threshold: 200, // pixels before end to trigger
  onLoadMore: () => {
    // Fetch more data
  },
})

return (
  <>
    {/* Your data */}
    <div ref={observerTarget} />
  </>
)
```

### 2. **useHotkeys Hook**

Bind keyboard shortcuts to actions globally.

```tsx
import { useHotkeys, COMMON_HOTKEYS } from '@/hooks/useHotkeys'

// Usage
useHotkeys({
  [COMMON_HOTKEYS.NEW]: (e) => createNewInvoice(),
  [COMMON_HOTKEYS.SAVE]: (e) => saveForm(),
  'escape': (e) => closeModal(),
})

// Predefined hotkeys
- ctrl+n: Create new
- ctrl+s: Save
- ctrl+f: Find/Search
- escape: Cancel/Close
- enter: Submit
- delete: Delete
```

### 3. **Offline Sync Utility**

Automatically queue and sync requests when offline, process on reconnect.

```tsx
import { useOfflineSync, initializeOfflineSync, offlineQueue } from '@/lib/offlineSync'

// Initialize on app start (already done in App.tsx)
initializeOfflineSync()

// In components
const { addToQueue, processQueue, getQueueSize } = useOfflineSync()

// Add to queue when offline
addToQueue('insert', 'customers', { name: 'New Customer' })

// Process all queued requests on reconnect (automatic)
processQueue() // Returns number of processed items

// Get queue status
const size = getQueueSize() // Number of pending requests
```

**Features:**
- Automatic offline detection
- Queue persistence in localStorage
- Auto-retry with max 3 attempts
- Processes on reconnect
- Graceful fallback if requests fail

---

## Components

### 1. **ErrorBoundary**

Catches React errors and displays error UI with recovery options.

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Usage
<ErrorBoundary
  fallback={<CustomErrorUI />}
  onError={(error, info) => {
    // Report to Sentry or logging service
  }}
>
  <YourComponent />
</ErrorBoundary>

// Features
- Catches unhandled React errors
- Displays error UI with Try Again button
- Development mode shows error details
- Can integrate with error reporting (Sentry)
```

### 2. **Skeleton Loaders**

Show loading placeholders while data fetches.

```tsx
import {
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  SkeletonAvatar,
  SkeletonText,
} from '@/components/Skeleton'

// Basic usage
<Skeleton height="h-6" width="w-3/4" count={3} />

// Predefined patterns
<SkeletonCard /> // Card loading state
<SkeletonTable /> // Table loading state
<SkeletonAvatar /> // Avatar loading state
<SkeletonText /> // Text block loading state

// Features
- Shimmer animation
- Customizable size, count, shape
- Circle option for avatars
```

Example in data-fetching component:
```tsx
const { data, isLoading } = useQuery(...)

return isLoading ? <SkeletonTable /> : <DataTable data={data} />
```

---

## Utilities

### 1. **Export Utilities**

Export data in multiple formats.

```tsx
import {
  exportToCSV,
  exportToJSON,
  exportToPDF,
  getExportFilename,
} from '@/lib/exportUtils'

// CSV Export
exportToCSV(data, {
  filename: 'customers.csv'
})

// JSON Export
exportToJSON(data, {
  filename: 'customers.json'
})

// PDF Export (requires @react-pdf/renderer)
await exportToPDF(data, {
  filename: 'report.pdf'
})

// Get filename with timestamp
const filename = getExportFilename('csv', true)
// Returns: export-2024-01-15.csv
```

**Data Format:**
```tsx
// CSV: Properly escaped with quoted fields containing commas
// JSON: Pretty-printed with 2-space indent
// PDF: Table layout with headers and data rows
```

### 2. **Sentry Integration**

Error tracking and monitoring (optional).

```tsx
import {
  initializeSentry,
  captureException,
  captureMessage,
  setSentryUser,
  clearSentryUser,
  addSentryBreadcrumb,
} from '@/lib/sentry'

// Initialize on app start (already done in App.tsx)
await initializeSentry()

// Track exceptions
try {
  // code
} catch (error) {
  captureException(error, 'error', { context: 'invoice_creation' })
}

// Track messages
captureMessage('User completed onboarding', 'info')

// Set user context
setSentryUser(userId, email, username)

// Add breadcrumb (for debugging)
addSentryBreadcrumb('User clicked save button', 'user-action')

// Clear user on logout
clearSentryUser()
```

**Setup:**
1. Install: `npm install @sentry/react @sentry/tracing`
2. Add to `.env.local`: `VITE_SENTRY_DSN=your_sentry_dsn`
3. Already initialized in App.tsx

---

## Animation & Hover Effects

### 1. **HoverLift Component**

Lift element on hover with smooth animation.

```tsx
import { HoverLift } from '@/lib/animations'

<HoverLift scale={1.05} y={-8} duration={0.3}>
  <Card>Content</Card>
</HoverLift>
```

### 2. **Framer Motion Variants**

Pre-built animation variants for common patterns.

```tsx
import {
  fadeInVariants,
  slideInVariants,
  scaleInVariants,
  staggerContainerVariants,
  staggerItemVariants,
  SPRING_CONFIG,
  applyHoverEffect,
} from '@/lib/animations'

// Usage
<motion.div
  variants={fadeInVariants}
  initial="hidden"
  animate="visible"  
  exit="exit"
>
  Content
</motion.div>

// Stagger animation
<motion.div
  variants={staggerContainerVariants}
  initial="hidden"
  animate="visible"
>
  {items.map((item) => (
    <motion.div key={item.id} variants={staggerItemVariants}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

### 3. **Tailwind Hover Classes**

Apply hover effects with utility classes.

```tsx
// Individual effects
className={HOVER_LIFT_CLASSES} // Scale up on hover
className={HOVER_SCALE_CLASSES} // Scale with smooth transition
className={HOVER_GLOW_CLASSES} // Blue glow on hover
className={HOVER_CARD_CLASSES} // Combined card effect (recommended)
className={HOVER_BUTTON_CLASSES} // Button with active state

// Or programmatic
className={applyHoverEffect('card')} // 'lift' | 'scale' | 'glow' | 'card' | 'button'
```

---

## Integration Guide

### Adding Infinite Scroll to DataTable

```tsx
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'

function DataTable({ items, loadMore }) {
  const { observerTarget, isLoading } = useInfiniteScroll({
    onLoadMore: loadMore,
  })

  return (
    <>
      <table>
        {/* rows */}
      </table>
      {isLoading && <Skeleton count={5} />}
      <div ref={observerTarget} className="p-4 text-center text-white/50">
        Loading more...
      </div>
    </>
  )
}
```

### Adding Hotkeys to Form

```tsx
import { useHotkeys, COMMON_HOTKEYS } from '@/hooks/useHotkeys'

function Form() {
  const handleSubmit = () => { /* save */ }
  const handleCancel = () => { /* close */ }

  useHotkeys({
    [COMMON_HOTKEYS.SAVE]: handleSubmit,
    [COMMON_HOTKEYS.ESCAPE]: handleCancel,
  })

  return (
    <form onSubmit={handleSubmit}>
      {/* fields */}
    </form>
  )
}
```

### Adding Data Export Button

```tsx
import { exportToCSV, exportToJSON } from '@/lib/exportUtils'

function DataTable({ data }) {
  return (
    <>
      <table>{/* data */}</table>
      <div className="flex gap-2">
        <Button onClick={() => exportToCSV(data)}>Export CSV</Button>
        <Button onClick={() => exportToJSON(data)}>Export JSON</Button>
      </div>
    </>
  )
}
```

---

## Database Migrations

Run these SQL commands in Supabase to set up new tables:

```sql
-- Add API Keys table
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used TIMESTAMP
);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own keys" ON api_keys
  FOR ALL USING (auth.uid() = user_id);

-- Add user_profiles columns (if not exists)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS app_name TEXT DEFAULT 'SME Toolkit';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free';
```

All migrations are included in `SUPABASE_MIGRATIONS.sql`.

---

## Environment Variables

Add to `.env.local` for optional features:

```env
# Sentry (error tracking)
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# API Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=5000
```

---

## Best Practices

1. **Error Handling**: Always wrap error-prone code in try-catch and use ErrorBoundary
2. **Offline Support**: Use useOfflineSync for all mutations that should work offline
3. **Performance**: Use Skeleton loaders while fetching, useInfiniteScroll for large lists
4. **Animations**: Use predefined variants for consistency, avoid excessive animations
5. **Exports**: Always specify filename and test with actual data
6. **Monitoring**: Set up Sentry for production error tracking

---

## Troubleshooting

### Sentry not capturing errors
- Check VITE_SENTRY_DSN is set in .env.local
- Verify error is not filtered by beforeSend function
- Check browser console for Sentry initialization logs

### Offline sync not working
- Check localStorage isn't disabled
- Verify Supabase RLS policies allow writes
- Check browser's Application > Storage for offline_queue

### Skeleton loaders not animating
- Verify Framer Motion is installed
- Check TailwindCSS classes are applied
- Use SkeletonCard, SkeletonTable presets for common patterns

### Hotkeys not responding
- Ensure useHotkeys hook is called at component level
- Check key code matches (case sensitive)
- Verify input element isn't capturing keys (contentEditable, input fields)

---

## Future Enhancements

- [ ] Advanced export with filtering options
- [ ] Scheduled exports to email
- [ ] API rate limiting and quotas
- [ ] Webhook support for integrations
- [ ] Advanced analytics dashboard
- [ ] Custom report builder
