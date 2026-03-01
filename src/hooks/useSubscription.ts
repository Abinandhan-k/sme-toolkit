import { useAuth } from '@/app/providers'
import { supabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'

interface SubscriptionInfo {
  tier: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'expired' | 'cancelled'
  startDate: string
  endDate: string
  daysRemaining: number
}

export function useSubscription() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }
    loadSubscription()
  }, [user?.id])

  const loadSubscription = async () => {
    if (!user?.id) return
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('subscription_tier, subscription_status, subscription_start_date, subscription_end_date')
        .eq('id', user.id)
        .single()

      if (error) throw error

      if (data) {
        const endDate = new Date(data.subscription_end_date)
        const now = new Date()
        const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        setSubscription({
          tier: data.subscription_tier || 'free',
          status: data.subscription_status || 'active',
          startDate: data.subscription_start_date,
          endDate: data.subscription_end_date,
          daysRemaining: Math.max(0, daysRemaining),
        })
      }
    } catch (error) {
      console.error('Failed to load subscription:', error)
      // Default to free tier
      setSubscription({
        tier: 'free',
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        daysRemaining: 30,
      })
    } finally {
      setLoading(false)
    }
  }

  const canAccessFeature = async (featureName: string): Promise<boolean> => {
    if (!user?.id) return false

    try {
      const { data, error } = await supabase.rpc('can_access_feature', {
        p_user_id: user.id,
        p_feature_name: featureName,
      })

      if (error) throw error
      return !!data
    } catch (error) {
      console.error('Feature check failed:', error)
      return false
    }
  }

  const upgrade = async (tier: 'pro' | 'enterprise') => {
    if (!user?.id) return
    try {
      const oneYearLater = new Date()
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1)

      const { error } = await supabase
        .from('user_profiles')
        .update({
          subscription_tier: tier,
          subscription_status: 'active',
          subscription_end_date: oneYearLater.toISOString(),
          last_renewed_date: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error
      await loadSubscription()
      return true
    } catch (error) {
      console.error('Upgrade failed:', error)
      return false
    }
  }

  return {
    subscription,
    loading,
    canAccessFeature,
    upgrade,
    refreshSubscription: loadSubscription,
  }
}
