-- ============================================
-- PIKER - MIGRATION SCRIPT
-- ============================================
-- This script updates the existing database to support username login
-- Execute this in your Supabase SQL Editor

-- ============================================
-- 1. ADD USERNAME COLUMN TO PROFILES
-- ============================================

-- Add username column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'username'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN username TEXT;
  END IF;
END $$;

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_username_key'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
  END IF;
END $$;

-- Set username to NOT NULL after populating existing records
-- First, update any NULL usernames with email prefix
UPDATE public.profiles
SET username = SPLIT_PART(email, '@', 1)
WHERE username IS NULL OR username = '';

-- Now make it NOT NULL
ALTER TABLE public.profiles ALTER COLUMN username SET NOT NULL;

-- ============================================
-- 2. UPDATE TRIGGER FUNCTION
-- ============================================

-- Update the handle_new_user function to include username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. CREATE HELPER FUNCTION FOR USERNAME LOGIN
-- ============================================

-- Function to get email from username (for login)
CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username TEXT)
RETURNS TEXT AS $$
DECLARE
  v_email TEXT;
BEGIN
  SELECT email INTO v_email
  FROM public.profiles
  WHERE username = p_username;

  RETURN v_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. CREATE SYSTEM ADMIN USER
-- ============================================

-- First, create the user in Supabase Dashboard:
-- Go to Authentication > Users > Add User
-- Email: tecnoacceso2025@gmail.com
-- Password: admin123

-- Then run this to update the profile:
-- Wait a few seconds after creating the user for the trigger to run

-- Update the profile with username and role
UPDATE public.profiles
SET
  username = 'admin_sistema',
  full_name = 'TecnoElectro',
  role = 'system_admin'
WHERE email = 'tecnoacceso2025@gmail.com';

-- ============================================
-- 5. VERIFY MIGRATION
-- ============================================

-- Check if username column exists and has data
SELECT
  COUNT(*) as total_users,
  COUNT(username) as users_with_username,
  COUNT(CASE WHEN username IS NULL OR username = '' THEN 1 END) as users_without_username
FROM public.profiles;

-- Check system admin user
SELECT id, username, email, full_name, role, created_at
FROM public.profiles
WHERE email = 'tecnoacceso2025@gmail.com';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- You can now:
-- 1. Login with username: admin_sistema
-- 2. Password: admin123
-- 3. All existing users will have their username set to their email prefix
-- 4. New users created by admin should include username field
