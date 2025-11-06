-- ============================================
-- PIKER - DATABASE SCHEMA
-- ============================================
-- This file contains the complete database schema for the Piker application
-- Execute this in your Supabase SQL Editor

-- ============================================
-- 1. PROFILES TABLE (User management with roles)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'system_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'system_admin')
    )
  );

CREATE POLICY "Admins can update user profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'system_admin')
    )
  );

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 2. MESSAGE TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.message_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('received', 'reminder', 'return')),
  template_name TEXT NOT NULL,
  template_content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb, -- Array of variable names used in template
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on message_templates
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

-- Message templates policies
CREATE POLICY "Users can view their own templates"
  ON public.message_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own templates"
  ON public.message_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
  ON public.message_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
  ON public.message_templates FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for templates updated_at
CREATE TRIGGER templates_updated_at
  BEFORE UPDATE ON public.message_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 3. SENT MESSAGES LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.sent_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  phone_number TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('received', 'reminder', 'return')),
  message_content TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  sent_date DATE DEFAULT CURRENT_DATE NOT NULL, -- For daily duplicate validation
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on sent_log
ALTER TABLE public.sent_log ENABLE ROW LEVEL SECURITY;

-- Sent log policies
CREATE POLICY "Users can view their own sent messages"
  ON public.sent_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sent messages"
  ON public.sent_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all sent messages"
  ON public.sent_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'system_admin')
    )
  );

-- Index for fast duplicate checking (daily validation)
CREATE INDEX IF NOT EXISTS idx_sent_log_user_phone_type_date
  ON public.sent_log(user_id, phone_number, message_type, sent_date);

-- Index for fast queries by user
CREATE INDEX IF NOT EXISTS idx_sent_log_user_id
  ON public.sent_log(user_id);

-- Index for date range queries
CREATE INDEX IF NOT EXISTS idx_sent_log_sent_at
  ON public.sent_log(sent_at);

-- ============================================
-- 4. PHONE NUMBERS TABLE (Optional - for managing contacts)
-- ============================================
CREATE TABLE IF NOT EXISTS public.phone_numbers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  phone_number TEXT NOT NULL,
  contact_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, phone_number)
);

-- Enable RLS on phone_numbers
ALTER TABLE public.phone_numbers ENABLE ROW LEVEL SECURITY;

-- Phone numbers policies
CREATE POLICY "Users can view their own phone numbers"
  ON public.phone_numbers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own phone numbers"
  ON public.phone_numbers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own phone numbers"
  ON public.phone_numbers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own phone numbers"
  ON public.phone_numbers FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for phone_numbers updated_at
CREATE TRIGGER phone_numbers_updated_at
  BEFORE UPDATE ON public.phone_numbers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 5. LICENSES TABLE (System Admin only)
-- ============================================
CREATE TABLE IF NOT EXISTS public.licenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  license_key TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('basic', 'pro', 'enterprise')),
  message_limit INTEGER NOT NULL DEFAULT 1000,
  messages_used INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  meta_api_token TEXT, -- WhatsApp Business API token
  meta_phone_number_id TEXT, -- WhatsApp Business phone number ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on licenses
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

-- Licenses policies (System Admin only)
CREATE POLICY "System admins can view all licenses"
  ON public.licenses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

CREATE POLICY "System admins can insert licenses"
  ON public.licenses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

CREATE POLICY "System admins can update licenses"
  ON public.licenses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

CREATE POLICY "System admins can delete licenses"
  ON public.licenses FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

CREATE POLICY "Users can view their own license"
  ON public.licenses FOR SELECT
  USING (auth.uid() = user_id);

-- Trigger for licenses updated_at
CREATE TRIGGER licenses_updated_at
  BEFORE UPDATE ON public.licenses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 6. HELPER FUNCTIONS
-- ============================================

-- Function to check if a message was sent today
CREATE OR REPLACE FUNCTION public.check_daily_duplicate(
  p_user_id UUID,
  p_phone_number TEXT,
  p_message_type TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.sent_log
    WHERE user_id = p_user_id
      AND phone_number = p_phone_number
      AND message_type = p_message_type
      AND sent_date = CURRENT_DATE
      AND status = 'sent'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user statistics
CREATE OR REPLACE FUNCTION public.get_user_stats(p_user_id UUID)
RETURNS TABLE (
  total_sent INTEGER,
  sent_today INTEGER,
  sent_this_week INTEGER,
  sent_this_month INTEGER,
  by_type JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_sent,
    COUNT(*) FILTER (WHERE sent_date = CURRENT_DATE)::INTEGER as sent_today,
    COUNT(*) FILTER (WHERE sent_date >= CURRENT_DATE - INTERVAL '7 days')::INTEGER as sent_this_week,
    COUNT(*) FILTER (WHERE sent_date >= DATE_TRUNC('month', CURRENT_DATE))::INTEGER as sent_this_month,
    jsonb_object_agg(
      message_type,
      count
    ) as by_type
  FROM (
    SELECT
      message_type,
      COUNT(*)::INTEGER as count
    FROM public.sent_log
    WHERE user_id = p_user_id AND status = 'sent'
    GROUP BY message_type
  ) subquery;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. DEFAULT DATA
-- ============================================

-- Insert default templates (optional - users can create their own)
-- This is just an example, you can modify or remove this

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- After running this script:
-- 1. Go to Authentication > Providers and enable Email provider
-- 2. Configure your email templates if needed
-- 3. Test by creating a user and checking if profile is auto-created
-- 4. Create a system admin user manually:
--    UPDATE public.profiles SET role = 'system_admin' WHERE email = 'your-admin@email.com';
