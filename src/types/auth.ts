export type UserRole = 'owner' | 'accountant' | 'storekeeper' | 'admin'

export type AuthUser = {
  id: string
  email: string
  role: UserRole
  isEmailVerified: boolean
  user_metadata?: {
    full_name?: string
    avatar_url?: string
    role?: UserRole
  }
  lastSeen?: string
}

export type SignUpInput = {
  email: string
  password: string
  full_name: string
  role: UserRole
}

export type SignInInput = {
  email: string
  password: string
}

export type AuthContextType = {
  user: AuthUser | null
  session: any | null
  loading: boolean
  isOnline: boolean
  userPresence: { [key: string]: AuthUser & { lastSeen: string } }

  // Auth methods
  signUp: (input: SignUpInput) => Promise<void>
  signIn: (input: SignInInput) => Promise<void>
  signOut: () => Promise<void>

  // OTP methods
  signInWithOTP: (email: string) => Promise<void>
  verifyOTP: (email: string, token: string) => Promise<void>

  // Google OAuth
  signInWithGoogle: () => Promise<void>

  // Password reset
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>

  // Email verification
  sendVerificationEmail: () => Promise<void>
  verifyEmail: (token: string) => Promise<void>

  // User profile
  updateProfile: (data: { full_name?: string; avatar_url?: string }) => Promise<void>
  updateRole: (role: UserRole) => Promise<void>

  // Presence
  updateUserPresence: () => Promise<void>
}

export type UserPresenceEvent = {
  id: string
  user_id: string
  status: 'online' | 'offline'
  last_seen: string
  user: AuthUser
}
