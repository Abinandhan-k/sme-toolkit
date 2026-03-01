/**
 * Database Migration: Add Tier System & Subscription Management
 * 
 * Run this in your Supabase SQL Editor to set up the tier system
 */

-- Add tier-related columns to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK(subscription_tier IN ('free', 'pro', 'enterprise')),
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active' CHECK(subscription_status IN ('active', 'expired', 'cancelled')),
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days'),
ADD COLUMN IF NOT EXISTS last_renewed_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS renewal_notified BOOLEAN DEFAULT FALSE;

-- Create tier_features table for feature access control
CREATE TABLE IF NOT EXISTS public.tier_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier TEXT NOT NULL CHECK(tier IN ('free', 'pro', 'enterprise')),
  feature_name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  limit_value INT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tier, feature_name)
);

-- Seed tier features
INSERT INTO public.tier_features (tier, feature_name, enabled, limit_value)
VALUES
  -- Free tier: basic features only
  ('free', 'invoices', TRUE, 50),
  ('free', 'customers', TRUE, 20),
  ('free', 'items', TRUE, 100),
  ('free', 'tasks', TRUE, 50),
  ('free', 'reports', FALSE, NULL),
  ('free', 'export_data', FALSE, NULL),
  ('free', 'api_access', FALSE, NULL),
  ('free', 'team_members', FALSE, 0),
  
  -- Pro tier: advanced features
  ('pro', 'invoices', TRUE, NULL),
  ('pro', 'customers', TRUE, NULL),
  ('pro', 'items', TRUE, NULL),
  ('pro', 'tasks', TRUE, NULL),
  ('pro', 'reports', TRUE, NULL),
  ('pro', 'export_data', TRUE, NULL),
  ('pro', 'api_access', TRUE, 5),
  ('pro', 'team_members', TRUE, 5),
  
  -- Enterprise: unlimited
  ('enterprise', 'invoices', TRUE, NULL),
  ('enterprise', 'customers', TRUE, NULL),
  ('enterprise', 'items', TRUE, NULL),
  ('enterprise', 'tasks', TRUE, NULL),
  ('enterprise', 'reports', TRUE, NULL),
  ('enterprise', 'export_data', TRUE, NULL),
  ('enterprise', 'api_access', TRUE, 50),
  ('enterprise', 'team_members', TRUE, NULL)
ON CONFLICT DO NOTHING;

-- Create subscription_plans table for pricing
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier TEXT NOT NULL UNIQUE CHECK(tier IN ('free', 'pro', 'enterprise')),
  price_monthly DECIMAL(10, 2),
  price_yearly DECIMAL(10, 2),
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed subscription plans
INSERT INTO public.subscription_plans (tier, price_monthly, price_yearly, description, features)
VALUES
  ('free', 0, 0, 'For getting started', '["50 Invoices", "20 Customers", "100 Items", "Invoicing", "Basic Reports"]'),
  ('pro', 499, 4990, 'For small businesses', '["Unlimited Invoices", "Unlimited Customers", "Unlimited Items", "Advanced Reports", "Data Export", "API Access", "5 Team Members"]'),
  ('enterprise', 2999, 29990, 'For enterprises', '["Unlimited Everything", "Advanced Reporting", "Full API Access", "50 Team Members", "Dedicated Support", "Custom Training"]')
ON CONFLICT DO NOTHING;

-- Create subscription_payments table for payment tracking
CREATE TABLE IF NOT EXISTS public.subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_tier TEXT NOT NULL,
  amount DECIMAL(10, 2),
  currency TEXT DEFAULT 'INR',
  payment_method TEXT,
  payment_id TEXT UNIQUE,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'success', 'failed', 'refunded')),
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- Add RLS policies for tier_features
ALTER TABLE public.tier_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY tier_features_read ON public.tier_features
  FOR SELECT USING(TRUE);

-- Add index on tier_features for faster lookups
CREATE INDEX IF NOT EXISTS idx_tier_features_tier ON public.tier_features(tier);

-- Function to check if user can access feature
CREATE OR REPLACE FUNCTION can_access_feature(p_user_id UUID, p_feature_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_tier TEXT;
  v_feature_enabled BOOLEAN;
BEGIN
  -- Get user's current tier
  SELECT subscription_tier INTO v_tier
  FROM public.user_profiles
  WHERE id = p_user_id AND subscription_status = 'active';
  
  IF v_tier IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if feature is enabled for this tier
  SELECT enabled INTO v_feature_enabled
  FROM public.tier_features
  WHERE tier = v_tier AND feature_name = p_feature_name;
  
  RETURN COALESCE(v_feature_enabled, FALSE);
END;
$$ LANGUAGE plpgsql;

-- Verification queries (run after migration)
-- SELECT COUNT(*) FROM public.tier_features;
-- SELECT * FROM public.subscription_plans;
-- SELECT can_access_feature('your-user-id'::uuid, 'reports');
