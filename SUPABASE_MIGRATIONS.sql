-- SME Toolkit Supabase SQL Migrations
-- Run these in your Supabase SQL Editor to set up the database schema

-- 1. User Profiles (extend auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  theme TEXT DEFAULT 'dark',
  language TEXT DEFAULT 'en',
  status TEXT DEFAULT 'active',
  role TEXT DEFAULT 'owner',
  onboarded BOOLEAN DEFAULT FALSE,
  assessment_score INTEGER,
  recommendations JSONB,
  feature_flags JSONB DEFAULT '{"invoicing": true, "crm": false, "inventory": false, "hr": false, "analytics": false}'::jsonb,
  app_name TEXT DEFAULT 'SME Toolkit',
  company_name TEXT,
  subscription_plan TEXT DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add columns to user_profiles if they don't exist (migration safety)
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS app_name TEXT DEFAULT 'SME Toolkit';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free';

-- 2. Customers
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  country TEXT DEFAULT 'India',
  total_sales DECIMAL(15,2) DEFAULT 0,
  last_invoice_date TIMESTAMP,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Items/Inventory
CREATE TABLE IF NOT EXISTS public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT UNIQUE,
  barcode TEXT,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  cost_price DECIMAL(12,2),
  stock INTEGER DEFAULT 0,
  reorder_level INTEGER DEFAULT 10,
  category TEXT,
  image_url TEXT,
  tax_applicable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id),
  customer_name TEXT,
  invoice_number TEXT UNIQUE,
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  payment_method TEXT DEFAULT 'credit',
  status TEXT DEFAULT 'pending',
  items JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  due_date TIMESTAMP,
  paid_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'medium',
  assignee TEXT,
  assignee_id UUID,
  due_date TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Reminders
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id),
  title TEXT NOT NULL,
  notes TEXT,
  reminder_type TEXT DEFAULT 'followup',
  due_date TIMESTAMP NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. Leads
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  company TEXT,
  email TEXT,
  phone TEXT,
  source TEXT,
  status TEXT DEFAULT 'new',
  owner TEXT,
  value DECIMAL(15,2),
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. Vendors/Suppliers
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  rating DECIMAL(2,1) DEFAULT 0,
  payment_terms TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 9. Purchase Orders
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.vendors(id),
  po_number TEXT UNIQUE,
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  items JSONB DEFAULT '[]'::jsonb,
  expected_delivery TIMESTAMP,
  actual_delivery TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 10. Employees
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  role TEXT,
  department TEXT,
  salary DECIMAL(12,2),
  status TEXT DEFAULT 'active',
  joining_date TIMESTAMP,
  birth_date TIMESTAMP,
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 11. Attendance
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id),
  date DATE NOT NULL,
  punch_in TIMESTAMP,
  punch_out TIMESTAMP,
  hours_worked DECIMAL(5,2),
  status TEXT DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- 12. Presence (Real-time user presence)
CREATE TABLE IF NOT EXISTS public.presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 13. API Keys
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_items_user_id ON public.items(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON public.invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON public.employees(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON public.attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON public.api_keys(key);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Customers Policies
CREATE POLICY "Users can view own customers" ON public.customers
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own customers" ON public.customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own customers" ON public.customers
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own customers" ON public.customers
  FOR DELETE USING (auth.uid() = user_id);

-- Items Policies
CREATE POLICY "Users can view own items" ON public.items
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own items" ON public.items
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own items" ON public.items
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own items" ON public.items
  FOR DELETE USING (auth.uid() = user_id);

-- Invoices Policies
CREATE POLICY "Users can view own invoices" ON public.invoices
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own invoices" ON public.invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own invoices" ON public.invoices
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own invoices" ON public.invoices
  FOR DELETE USING (auth.uid() = user_id);

-- Tasks Policies
CREATE POLICY "Users can view own tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Employees Policies
CREATE POLICY "Users can view own employees" ON public.employees
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own employees" ON public.employees
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own employees" ON public.employees
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own employees" ON public.employees
  FOR DELETE USING (auth.uid() = user_id);

-- Attendance Policies
CREATE POLICY "Users can view own attendance" ON public.attendance
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own attendance" ON public.attendance
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own attendance" ON public.attendance
  FOR UPDATE USING (auth.uid() = user_id);

-- Presence Policies
CREATE POLICY "Users can view own presence" ON public.presence
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own presence" ON public.presence
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own presence" ON public.presence
  FOR UPDATE USING (auth.uid() = user_id);

-- API Keys Policies
CREATE POLICY "Users can view own API keys" ON public.api_keys
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own API keys" ON public.api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own API keys" ON public.api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- Storage configuration (for items images)
-- Run these commands in Supabase Storage settings or via API:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('items', 'items', true);
-- INSERT INTO storage.objects (bucket_id, name, owner_id, metadata) VALUES ('items', 'public', auth.uid(), '{}');
