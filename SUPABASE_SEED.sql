/**
 * Database Seed Script for SME Toolkit
 * 
 * This script creates sample data for testing and demo purposes.
 * Run from Supabase SQL Editor or via API
 * 
 * Usage:
 * 1. Create a test user in Supabase auth
 * 2. Get the user ID
 * 3. Replace YOUR_USER_ID in the script
 * 4. Run in Supabase SQL Editor
 */

-- Replace with your actual user ID
DO $$
DECLARE
  v_user_id UUID := 'YOUR_USER_ID_HERE'::UUID;
  v_customer1_id UUID;
  v_customer2_id UUID;
  v_customer3_id UUID;
  v_item1_id UUID;
  v_item2_id UUID;
  v_item3_id UUID;
  v_item4_id UUID;
BEGIN
  -- Seed Customers
  INSERT INTO public.customers (user_id, name, email, phone, company, city, state, country, status)
  VALUES 
    (v_user_id, 'Acme Corporation', 'contact@acme.com', '+91-9876543210', 'Acme Corp', 'Mumbai', 'MH', 'India', 'active'),
    (v_user_id, 'Tech Solutions Ltd', 'info@techsol.com', '+91-9876543211', 'Tech Sol', 'Bangalore', 'KA', 'India', 'active'),
    (v_user_id, 'Global Trade Co', 'sales@globaltrade.com', '+91-9876543212', 'Global Trade', 'Delhi', 'DL', 'India', 'active')
  RETURNING id INTO v_customer1_id, v_customer2_id, v_customer3_id;

  -- Seed Items/Inventory
  INSERT INTO public.items (user_id, name, description, sku, price, quantity, category, status)
  VALUES 
    (v_user_id, 'Premium Widget', 'High quality widget for industrial use', 'PW-001', 299.99, 150, 'Widgets', 'active'),
    (v_user_id, 'Standard Gadget', 'Standard gadget for everyday use', 'SG-002', 149.99, 200, 'Gadgets', 'active'),
    (v_user_id, 'Professional Tool', 'Professional grade tool for construction', 'PT-003', 999.99, 50, 'Tools', 'active'),
    (v_user_id, 'Office Supply Bundle', 'Complete office supply bundle', 'OS-004', 499.99, 100, 'Supplies', 'active')
  RETURNING id INTO v_item1_id, v_item2_id, v_item3_id, v_item4_id;

  -- Seed Invoices
  INSERT INTO public.invoices (user_id, customer_id, invoice_number, amount, tax, total, status, due_date)
  VALUES
    (v_user_id, v_customer1_id, 'INV-2026-001', 5999.80, 1079.96, 7079.76, 'paid', NOW() + INTERVAL '30 days'),
    (v_user_id, v_customer2_id, 'INV-2026-002', 3999.80, 719.96, 4719.76, 'pending', NOW() + INTERVAL '30 days'),
    (v_user_id, v_customer3_id, 'INV-2026-003', 7499.80, 1349.96, 8849.76, 'draft', NOW() + INTERVAL '30 days');

  -- Seed Tasks
  INSERT INTO public.tasks (user_id, title, description, status, priority, due_date)
  VALUES
    (v_user_id, 'Follow up with Acme Corp', 'Check on INV-2026-001 payment status', 'in-progress', 'high', NOW() + INTERVAL '2 days'),
    (v_user_id, 'Prepare Q1 Report', 'Compile sales and inventory reports', 'pending', 'medium', NOW() + INTERVAL '7 days'),
    (v_user_id, 'Stock Replenishment', 'Order 200 units of Premium Widget', 'pending', 'high', NOW() + INTERVAL '3 days'),
    (v_user_id, 'Customer Meeting', 'Video call with Tech Solutions Ltd team', 'completed', 'medium', NOW() - INTERVAL '1 day');

  -- Seed Reminders
  INSERT INTO public.reminders (user_id, title, description, due_date, priority, status)
  VALUES
    (v_user_id, 'Monthly Reconciliation', 'Reconcile accounts for January 2026', NOW() + INTERVAL '5 days', 'high', 'pending'),
    (v_user_id, 'Tax Filing Deadline', 'GST return filing for previous quarter', NOW() + INTERVAL '10 days', 'high', 'pending'),
    (v_user_id, 'Inventory Audit', 'Physical inventory count and verification', NOW() + INTERVAL '15 days', 'medium', 'pending');

  -- Seed Leads (CRM)
  INSERT INTO public.leads (user_id, name, email, phone, company, source, status, notes)
  VALUES
    (v_user_id, 'Rajesh Kumar', 'rajesh@newbiz.com', '+91-9876543220', 'New Business Ltd', 'referral', 'qualified', 'High-potential lead, interested in bulk orders'),
    (v_user_id, 'Priya Sharma', 'priya@startup.io', '+91-9876543221', 'StartUp Inc', 'linkedin', 'contacted', 'Tech-savvy, evaluating our products'),
    (v_user_id, 'Amit Patel', 'amit@enterprise.co', '+91-9876543222', 'Enterprise Solutions', 'trade-show', 'meeting-scheduled', 'Large enterprise, needs custom solution');

  -- Seed Vendors
  INSERT INTO public.vendors (user_id, name, email, phone, company, city, status, payment_terms)
  VALUES
    (v_user_id, 'Manufacturing Hub', 'supply@mfghub.com', '+91-8765432100', 'Mfg Hub India', 'Pune', 'active', 'Net 30'),
    (v_user_id, 'Global Supplies', 'order@globalsupply.in', '+91-8765432101', 'Global Supply Co', 'Chennai', 'active', 'Net 45'),
    (v_user_id, 'Tech Distributors', 'sales@techdist.com', '+91-8765432102', 'Tech Dist Ltd', 'Hyderabad', 'active', 'Net 15');

  -- Seed Purchase Orders
  INSERT INTO public.purchase_orders (user_id, vendor_id, po_number, amount, status, expected_delivery)
  VALUES
    (v_user_id, (SELECT id FROM public.vendors WHERE user_id = v_user_id LIMIT 1), 'PO-2026-001', 29999.00, 'completed', NOW() - INTERVAL '5 days'),
    (v_user_id, (SELECT id FROM public.vendors WHERE user_id = v_user_id LIMIT 1 OFFSET 1), 'PO-2026-002', 49999.00, 'pending', NOW() + INTERVAL '10 days');

  -- Seed Employees
  INSERT INTO public.employees (user_id, name, email, phone, role, department, salary, joining_date, status)
  VALUES
    (v_user_id, 'John Manager', 'john@smekit.com', '+91-9876543230', 'Manager', 'Operations', 50000.00, NOW() - INTERVAL '2 years', 'active'),
    (v_user_id, 'Sarah Sales', 'sarah@smekit.com', '+91-9876543231', 'Sales Executive', 'Sales', 35000.00, NOW() - INTERVAL '1 year', 'active'),
    (v_user_id, 'Mike Finance', 'mike@smekit.com', '+91-9876543232', 'Accountant', 'Finance', 40000.00, NOW() - INTERVAL '6 months', 'active');

  -- Seed Attendance Records
  INSERT INTO public.attendance (user_id, employee_id, date, punch_in, punch_out, status)
  SELECT
    v_user_id,
    e.id,
    d.date,
    d.date + INTERVAL '9 hours',
    d.date + INTERVAL '17 hours',
    'present'
  FROM
    public.employees e,
    (SELECT DATE(NOW() - (interval '1 day' * generate_series(0, 19))) as date) d
  WHERE e.user_id = v_user_id;

  -- Update user profile
  UPDATE public.user_profiles
  SET
    app_name = 'SME Toolkit Demo',
    company_name = 'Demo Company Ltd',
    subscription_plan = 'pro',
    onboarded = TRUE,
    assessment_score = 85,
    feature_flags = '{"invoicing": true, "crm": true, "inventory": true, "hr": true, "analytics": true}'::jsonb
  WHERE user_id = v_user_id;

  RAISE NOTICE 'Seed data created successfully for user %', v_user_id;
END $$;

-- Manual verification queries (run after seed)
-- SELECT COUNT(*) as customers FROM public.customers WHERE user_id = 'YOUR_USER_ID_HERE'::UUID;
-- SELECT COUNT(*) as items FROM public.items WHERE user_id = 'YOUR_USER_ID_HERE'::UUID;
-- SELECT COUNT(*) as invoices FROM public.invoices WHERE user_id = 'YOUR_USER_ID_HERE'::UUID;
-- SELECT COUNT(*) as tasks FROM public.tasks WHERE user_id = 'YOUR_USER_ID_HERE'::UUID;
-- SELECT COUNT(*) as leads FROM public.leads WHERE user_id = 'YOUR_USER_ID_HERE'::UUID;
