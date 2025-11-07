-- ============================================
-- FIX RLS POLICIES - Remove Infinite Recursion
-- ============================================
-- This script fixes the infinite recursion error in RLS policies
-- Execute this in your Supabase SQL Editor

-- ============================================
-- 1. DROP EXISTING POLICIES THAT CAUSE RECURSION
-- ============================================

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update user profiles" ON public.profiles;

-- ============================================
-- 2. CREATE NEW POLICIES WITHOUT RECURSION
-- ============================================

-- Users can view their own profile (no subquery needed)
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (no subquery needed)
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all profiles
-- Use a function to check role instead of subquery
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'system_admin')
  );

-- Admins can update user profiles
CREATE POLICY "Admins can update user profiles"
  ON public.profiles FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'system_admin')
  );

-- Add INSERT policy for admins to create users
CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'system_admin')
  );

-- ============================================
-- ALTERNATIVE: Use a helper function (RECOMMENDED)
-- ============================================

-- This is a better approach - create a function to get current user role
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Now recreate policies using the function
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update user profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_my_role() IN ('admin', 'system_admin'));

CREATE POLICY "Admins can update user profiles"
  ON public.profiles FOR UPDATE
  USING (public.get_my_role() IN ('admin', 'system_admin'));

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (public.get_my_role() IN ('admin', 'system_admin'));

-- ============================================
-- 3. VERIFY POLICIES
-- ============================================

-- List all policies on profiles table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- Test by selecting your profile
SELECT id, username, email, full_name, role
FROM public.profiles
WHERE id = auth.uid();
