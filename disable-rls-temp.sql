-- ============================================
-- TEMPORARY FIX - Disable RLS on profiles
-- ============================================
-- This will allow the app to work while we fix the policies properly
-- ONLY USE THIS IN DEVELOPMENT!

-- Disable RLS temporarily
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'profiles';
