/**
 * Database Migrations: Complete Tier & Assessment System
 * 
 * Run ALL three migration files in this order:
 * 1. TIER_SYSTEM_MIGRATION.sql (tier system & subscription)
 * 2. ASSESSMENT_MIGRATION.sql (this file - assessment functionality)
 * 
 * Instructions:
 * 1. Go to your Supabase project → SQL Editor
 * 2. Copy-paste each migration and run
 * 3. Verify tables are created (see verification queries at bottom)
 */

-- Create assessment_results table
CREATE TABLE IF NOT EXISTS public.assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK(language IN ('en', 'ta')),
  score INT NOT NULL CHECK(score >= 0 AND score <= 100),
  answers JSONB DEFAULT '[]'::jsonb,
  total_questions INT DEFAULT 10,
  completed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_assessment_results_user_id ON public.assessment_results(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_completed_at ON public.assessment_results(completed_at);

-- Enable RLS
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only see their own assessments
CREATE POLICY assessment_results_read ON public.assessment_results
  FOR SELECT USING(auth.uid() = user_id);

CREATE POLICY assessment_results_insert ON public.assessment_results
  FOR INSERT WITH CHECK(auth.uid() = user_id);

CREATE POLICY assessment_results_update ON public.assessment_results
  FOR UPDATE USING(auth.uid() = user_id);

-- Function to get user's latest assessment score
CREATE OR REPLACE FUNCTION get_latest_assessment_score(p_user_id UUID)
RETURNS INT AS $$
BEGIN
  RETURN (
    SELECT score
    FROM public.assessment_results
    WHERE user_id = p_user_id
    ORDER BY completed_at DESC
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get assessment history
CREATE OR REPLACE FUNCTION get_assessment_history(p_user_id UUID, p_limit INT DEFAULT 10)
RETURNS TABLE(
  id UUID,
  language TEXT,
  score INT,
  completed_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ar.id,
    ar.language,
    ar.score,
    ar.completed_at
  FROM public.assessment_results ar
  WHERE ar.user_id = p_user_id
  ORDER BY ar.completed_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update the `updated_at` timestamp
CREATE OR REPLACE FUNCTION update_assessment_results_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assessment_results_update_timestamp
BEFORE UPDATE ON public.assessment_results
FOR EACH ROW
EXECUTE FUNCTION update_assessment_results_timestamp();

-- Verification queries (run these to verify migration success)
/*
-- Check if tables exist
SELECT * FROM information_schema.tables WHERE table_name IN ('assessment_results', 'tier_features', 'subscription_plans', 'subscription_payments');

-- Check assessment results count
SELECT COUNT(*) as assessment_count FROM public.assessment_results;

-- Check tier features
SELECT COUNT(*) as tier_features_count FROM public.tier_features;

-- Test function: get latest assessment score for a user
SELECT get_latest_assessment_score('YOUR_USER_ID'::uuid);

-- Test RLS: this should work
SELECT * FROM public.assessment_results LIMIT 1;
*/
