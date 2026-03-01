import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSubscription } from '@/hooks/useSubscription'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Check, Zap, Crown, Star } from 'lucide-react'

type PricingTier = 'free' | 'pro' | 'enterprise'

interface PricingPlan {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  icon: JSX.Element
  cta: string
  color: string
  highlighted?: boolean
}

const PRICING_PLANS: Record<PricingTier, PricingPlan> = {
  free: {
    name: 'Free Plan',
    price: '₹0',
    period: 'Forever free',
    description: 'Perfect for getting started',
    features: [
      '50 Invoices',
      '20 Customers',
      '100 Items',
      'Basic Invoicing',
      'Task Management',
      '1 User',
    ],
    icon: <Zap size={24} />,
    cta: 'Current Plan',
    color: 'border-white/20',
  },
  pro: {
    name: 'Pro Plan',
    price: '₹499',
    period: 'per month',
    description: 'For growing businesses',
    features: [
      'Unlimited Invoices',
      'Unlimited Customers',
      'Unlimited Items',
      'Advanced Reports',
      'Data Export (CSV/JSON)',
      'API Access (5 keys)',
      'Team Members (5 users)',
      'Priority Support',
    ],
    icon: <Star size={24} />,
    cta: 'Upgrade to Pro',
    color: 'border-blue-500',
    highlighted: true,
  },
  enterprise: {
    name: 'Enterprise Plan',
    price: '₹2,999',
    period: 'per month',
    description: 'For large enterprises',
    features: [
      'Everything in Pro +',
      'Unlimited API Keys',
      'Unlimited Team Members',
      'Advanced Analytics',
      'Custom Integrations',
      'Dedicated Account Manager',
      'SSO & Advanced Security',
      'SLA & 24/7 Support',
    ],
    icon: <Crown size={24} />,
    cta: 'Contact Sales',
    color: 'border-amber-500',
  },
}

export default function BillingPage() {
  const { t } = useTranslation()
  const { subscription, upgrade } = useSubscription()
  const [upgradingTo, setUpgradingTo] = useState<PricingTier | null>(null)

  const handleUpgrade = async (tier: PricingTier) => {
    if (!tier || tier === 'free') {
      toast.info('Already on this plan')
      return
    }

    setUpgradingTo(tier)

    try {
      // For demo: directly upgrade user
      // In production: redirect to Razorpay/Stripe payment gateway
      const success = await upgrade(tier as 'pro' | 'enterprise')

      if (success) {
        toast.success(`Successfully upgraded to ${tier.toUpperCase()} plan!`)
      } else {
        toast.error('Upgrade failed. Please try again.')
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      toast.error('An error occurred during upgrade')
    } finally {
      setUpgradingTo(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-6xl"
    >
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Billing & Plans</h1>
        <p className="text-white/70">
          {subscription && `Current Plan: ${subscription.tier.toUpperCase()} - ${subscription.daysRemaining} days remaining`}
        </p>
      </div>

      {/* Current Subscription Status */}
      {subscription && subscription.tier !== 'free' && (
        <Card className="border border-green-500/30 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Active Subscription</p>
                <p className="text-2xl font-bold text-white">
                  {subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)} Plan
                </p>
                <p className="text-sm text-white/70 mt-1">
                  Expires in {subscription.daysRemaining} days
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/70">Renewal Date</p>
                <p className="text-lg font-semibold text-white">
                  {new Date(subscription.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {(Object.entries(PRICING_PLANS) as [PricingTier, typeof PRICING_PLANS['free']][]).map(
          ([tier, plan]) => (
            <motion.div
              key={tier}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8 }}
            >
              <Card
                className={`h-full border-2 transition-all ${
                  plan.highlighted ? `${plan.color} bg-white/5` : `${plan.color}`
                } ${subscription?.tier === tier ? 'ring-2 ring-green-500' : ''}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-white/70">{plan.icon}</div>
                    {plan.highlighted && (
                      <span className="text-xs font-semibold bg-blue-500 text-white px-3 py-1 rounded-full">
                        RECOMMENDED
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="text-4xl font-bold text-white">{plan.price}</div>
                    <div className="text-sm text-white/60">{plan.period}</div>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-white/80">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleUpgrade(tier)}
                    disabled={upgradingTo === tier || subscription?.tier === tier}
                    variant={
                      subscription?.tier === tier
                        ? 'outline'
                        : plan.highlighted
                          ? 'default'
                          : 'ghost'
                    }
                    className="w-full"
                  >
                    {upgradingTo === tier ? 'Processing...' : plan.cta}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )
        )}
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-white mb-2">Can I upgrade or downgrade anytime?</h4>
            <p className="text-white/70 text-sm">
              Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Do you offer refunds?</h4>
            <p className="text-white/70 text-sm">
              We offer a 7-day money-back guarantee for all annual plans. Contact support for details.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">What payment methods do you accept?</h4>
            <p className="text-white/70 text-sm">
              We accept all major credit cards, UPI, and bank transfers through Razorpay.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
