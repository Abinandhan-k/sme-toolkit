# 🔐 Authentication API Quick Reference

## Using the useAuth Hook

```tsx
import { useAuth } from '@/app/providers'

export function MyComponent() {
  const {
    user,              // Current user | null
    session,           // Supabase session
    loading,           // Auth state loading
    isOnline,          // Network status
    userPresence,      // All active users
    
    // Methods
    signUp,            // Register new user
    signIn,            // Login with password
    signInWithGoogle,  // OAuth login
    signOut,           // Logout
    signInWithOTP,     // Send OTP
    verifyOTP,         // Verify OTP
    resetPassword,     // Email reset
    updatePassword,    // Change password
    updateProfile,     // Update metadata
    updateRole,        // Update user role
    updateUserPresence, // Update status
  } = useAuth()

  return (
    <>
      {loading && <div>Loading...</div>}
      {user && <div>Welcome, {user.email}</div>}
    </>
  )
}
```

---

## Common Tasks

### 1. Sign Up with Role
```tsx
const { signUp } = useAuth()

await signUp({
  email: 'user@example.com',
  password: 'SecurePass123',
  full_name: 'John Doe',
  role: 'accountant' // 'owner' | 'accountant' | 'storekeeper'
})
```

### 2. Sign In with Password
```tsx
const { signIn } = useAuth()

await signIn({
  email: 'user@example.com',
  password: 'SecurePass123'
})
```

### 3. Sign In with Google OAuth
```tsx
const { signInWithGoogle } = useAuth()

await signInWithGoogle()
// Redirects to Google auth, returns to app automatically
```

### 4. OTP Login Flow
```tsx
const { signInWithOTP, verifyOTP } = useAuth()

// Step 1: Send OTP
await signInWithOTP('user@example.com')

// Step 2: Verify OTP (user sees in email)
await verifyOTP('user@example.com', '123456')
```

### 5. Password Reset
```tsx
const { resetPassword } = useAuth()

// Step 1: Request reset
await resetPassword('user@example.com')

// Step 2: User clicks link in email, enters new password
// (happens on /auth/reset-password page)

const { updatePassword } = useAuth()
await updatePassword('NewSecurePass456')
```

### 6. Update Profile
```tsx
const { updateProfile } = useAuth()

await updateProfile({
  full_name: 'Jane Doe',
  avatar_url: 'https://...'
})
```

### 7. Change User Role
```tsx
const { updateRole } = useAuth()

await updateRole('owner')
// Roles: 'owner' | 'accountant' | 'storekeeper' | 'admin'
```

### 8. Check User Status
```tsx
const { user, isOnline } = useAuth()

if (!user) {
  // Not logged in
}

if (user.role === 'owner') {
  // Show owner-only features
}

if (!user.isEmailVerified) {
  // Show verification prompt
}

if (isOnline) {
  // Can sync data
} else {
  // Offline mode
}
```

### 9. View Active Users (Presence)
```tsx
const { userPresence } = useAuth()

Object.entries(userPresence).forEach(([userId, userData]) => {
  console.log(`${userData.email} is ${userData.status}`)
  console.log(`Last seen: ${userData.lastSeen}`)
})
```

### 10. Logout
```tsx
const { signOut } = useAuth()

await signOut()
```

---

## User Object Structure

```tsx
interface AuthUser {
  id: string                    // User ID from Supabase
  email: string                 // User email
  role: UserRole               // 'owner' | 'accountant' | 'storekeeper' | 'admin'
  isEmailVerified: boolean      // Email verification status
  user_metadata?: {             // Custom metadata
    full_name?: string
    avatar_url?: string
    role?: UserRole
  }
}
```

---

## Error Handling

All auth methods throw errors that trigger Sonner toasts automatically:

```tsx
const { signIn } = useAuth()

try {
  await signIn({ email, password })
} catch (error) {
  // Toast already shown to user
  // error.message contains details
  console.error(error.message)
}
```

Common errors:
- "Invalid credentials" → Wrong password
- "Email not confirmed" → User hasn't verified email
- "User already exists" → Email in use
- "Invalid or expired reset link" → Token expired

---

## Type Definitions

```tsx
type UserRole = 'owner' | 'accountant' | 'storekeeper' | 'admin'

interface SignUpInput {
  email: string
  password: string
  full_name: string
  role: UserRole
}

interface SignInInput {
  email: string
  password: string
}

interface UserPresenceEvent {
  id: string
  user_id: string
  status: 'online' | 'offline'
  user: AuthUser
  timestamp: string
  lastSeen: string
}

interface AuthContextType {
  // State
  user: AuthUser | null
  session: any
  loading: boolean
  isOnline: boolean
  userPresence: { [key: string]: AuthUser & { lastSeen: string } }
  
  // Methods (all async)
  signUp: (data: SignUpInput) => Promise<void>
  signIn: (data: SignInInput) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  signInWithOTP: (email: string) => Promise<void>
  verifyOTP: (email: string, token: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  sendVerificationEmail: () => Promise<void>
  verifyEmail: (token: string) => Promise<void>
  updateProfile: (data: { full_name?: string; avatar_url?: string }) => Promise<void>
  updateRole: (role: UserRole) => Promise<void>
  updateUserPresence: () => Promise<void>
}
```

---

## Protected Routes

Components automatically wrapped in ProtectedRoute:
```tsx
// ✅ These require authentication
/                   // Dashboard (redirects to /auth/signin if not logged in)
/customers
/invoices
/items
/crm
/analytics
/settings

// ✅ These don't require authentication
/auth/signin
/auth/signup
/auth/forgot-password
/auth/reset-password
```

---

## Interceptors & Middleware

Auth provider automatically:
- ✅ Refreshes expired sessions
- ✅ Listens for auth state changes
- ✅ Tracks user presence in real-time
- ✅ Shows toast notifications
- ✅ Handles network offline/online
- ✅ Persists session data
- ✅ Redirects to login if session expires

---

## Best Practices

### 1. Check loading state
```tsx
if (loading) return <LoadingSkeleton />
if (!user) return <Navigate to="/auth/signin" />
```

### 2. Verify role before render
```tsx
if (user?.role !== 'owner') {
  return <AccessDenied />
}
```

### 3. Handle role guard with HOC
```tsx
function OwnerOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  
  if (loading) return <Skeleton />
  if (user?.role !== 'owner') return <Forbidden />
  
  return <>{children}</>
}

// Usage
<OwnerOnly>
  <AdminPanel />
</OwnerOnly>
```

### 4. Track presence updates
```tsx
useEffect(() => {
  updateUserPresence()
  
  const interval = setInterval(updateUserPresence, 30000) // Every 30 sec
  return () => clearInterval(interval)
}, [updateUserPresence])
```

### 5. Graceful offline handling
```tsx
const { isOnline } = useAuth()

useEffect(() => {
  if (!isOnline) {
    toast.info('You are offline. Some features may be limited.')
  }
}, [isOnline])
```

---

## Debugging

### Enable Auth Logs
```tsx
// In src/lib/supabase.ts, add:
const supabase = createClient(url, key, {
  auth: {
    debug: true  // Logs auth events to console
  }
})
```

### Check Current User
In browser console:
```js
// Get from AuthContext
const user = JSON.parse(localStorage.getItem('supabase.auth.token'))
```

### Test Presence
```tsx
const { userPresence } = useAuth()
console.log('Active users:', Object.keys(userPresence).length)
```

---

## Migration from Old Auth

If upgrading from basic auth:

```tsx
// ❌ OLD
const user = session?.user
const email = user.email

// ✅ NEW
const { user } = useAuth()
const email = user?.email
const role = user?.role
const verified = user?.isEmailVerified
```

---

## Support & Troubleshooting

**Issue:** Infinite loading state  
**Solution:** Check if AuthProvider wraps whole app in App.tsx

**Issue:** Toast notifications not showing  
**Solution:** Verify Toaster component mounted in returned JSX

**Issue:** Google OAuth not working  
**Solution:** Configure OAuth provider in Supabase dashboard

**Issue:** Presence not updating  
**Solution:** Check browser console for channel errors; verify user online status

---

**Last Updated:** 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅

