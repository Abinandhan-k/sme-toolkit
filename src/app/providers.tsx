import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type { AuthContextType, AuthUser, SignInInput, SignUpInput, UserRole } from '@/types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [userPresence, setUserPresence] = useState<{ [key: string]: AuthUser & { lastSeen: string } }>({})

  // Online/Offline tracking
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Initialize auth & listen to changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        mapAuthToUser(session.user)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        mapAuthToUser(session.user)
        updateUserPresence()
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription?.unsubscribe()
  }, [])

  // Listen to user presence in real-time
  useEffect(() => {
    if (!session?.user) return

    const channel = supabase
      .channel('user_presence', {
        config: { broadcast: { ack: true } },
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const presenceMap: typeof userPresence = {}

        Object.entries(state).forEach(([userId, presences]) => {
          const presence = Array.isArray(presences) ? presences[0] : presences
          if (presence && 'user' in presence) {
            presenceMap[userId] = {
              ...presence.user,
              lastSeen: new Date().toISOString(),
            }
          }
        })

        setUserPresence(presenceMap)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: session.user.id,
            status: 'online',
            user: user,
            timestamp: new Date().toISOString(),
          })
        }
      })

    return () => {
      channel.unsubscribe()
    }
  }, [session?.user, user])

  const mapAuthToUser = (authUser: any) => {
    setUser({
      id: authUser.id,
      email: authUser.email || '',
      role: authUser.user_metadata?.role || 'storekeeper',
      isEmailVerified: authUser.email_confirmed_at ? true : false,
      user_metadata: authUser.user_metadata,
    })
  }

  const signUp = async ({ email, password, full_name, role }: SignUpInput) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            role,
          },
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
        },
      })
      if (error) throw error
      toast.success('Account created! Check your email to verify.')
    } catch (error: any) {
      toast.error(error.message || 'Sign up failed')
      throw error
    }
  }

  const signIn = async ({ email, password }: SignInInput) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      toast.success('Signed in successfully!')
      await updateUserPresence()
    } catch (error: any) {
      toast.error(error.message || 'Sign in failed')
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      if (error) throw error
    } catch (error: any) {
      toast.error(error.message || 'Google sign in failed')
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setUserPresence({})
      toast.success('Signed out successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Sign out failed')
      throw error
    }
  }

  const signInWithOTP = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      })
      if (error) throw error
      toast.success('OTP sent to your email!')
    } catch (error: any) {
      toast.error(error.message || 'OTP request failed')
      throw error
    }
  }

  const verifyOTP = async (email: string, token: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      })
      if (error) throw error
      toast.success('Email verified!')
      await updateUserPresence()
    } catch (error: any) {
      toast.error(error.message || 'OTP verification failed')
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
      toast.success('Password reset link sent to your email!')
    } catch (error: any) {
      toast.error(error.message || 'Password reset failed')
      throw error
    }
  }

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      toast.success('Password updated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Password update failed')
      throw error
    }
  }

  const sendVerificationEmail = async () => {
    try {
      const { error } = await supabase.auth.resendEnrollFactorChallenge('email', {
        email: user?.email || '',
      })
      if (error) throw error
      toast.success('Verification email sent!')
    } catch (error: any) {
      toast.error(error.message || 'Send verification failed')
      throw error
    }
  }

  const verifyEmail = async (token: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: session?.user?.email || '',
        token,
        type: 'email_change',
      })
      if (error) throw error
      toast.success('Email verified!')
      setUser(prev => prev ? { ...prev, isEmailVerified: true } : null)
    } catch (error: any) {
      toast.error(error.message || 'Email verification failed')
      throw error
    }
  }

  const updateProfile = async (data: { full_name?: string; avatar_url?: string }) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          ...session?.user?.user_metadata,
          ...data,
        },
      })
      if (error) throw error
      mapAuthToUser(session?.user)
      toast.success('Profile updated!')
    } catch (error: any) {
      toast.error(error.message || 'Profile update failed')
      throw error
    }
  }

  const updateRole = useCallback(async (role: UserRole) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          ...session?.user?.user_metadata,
          role,
        },
      })
      if (error) throw error
      setUser(prev => prev ? { ...prev, role } : null)
      toast.success('Role updated!')
    } catch (error: any) {
      toast.error(error.message || 'Role update failed')
      throw error
    }
  }, [session?.user?.user_metadata])

  const updateUserPresence = async () => {
    if (!user) return
    try {
      const channel = supabase.channel('user_presence')
      await channel.track({
        user_id: user.id,
        status: isOnline ? 'online' : 'offline',
        user,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Presence update failed:', error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isOnline,
        userPresence,
        signUp,
        signIn,
        signOut,
        signInWithOTP,
        verifyOTP,
        signInWithGoogle,
        resetPassword,
        updatePassword,
        sendVerificationEmail,
        verifyEmail,
        updateProfile,
        updateRole,
        updateUserPresence,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
