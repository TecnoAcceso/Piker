-- ============================================
-- VERIFICATION AND FIX SCRIPT
-- ============================================
-- Run this entire script to verify and fix all database issues

-- 1. Check if sent_log table exists
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'sent_log';

-- 2. Check all columns in sent_log
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'sent_log'
ORDER BY ordinal_position;

-- 3. Add sent_date column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'sent_log'
        AND column_name = 'sent_date'
    ) THEN
        ALTER TABLE public.sent_log ADD COLUMN sent_date DATE DEFAULT CURRENT_DATE NOT NULL;
        RAISE NOTICE 'Column sent_date added successfully';
    ELSE
        RAISE NOTICE 'Column sent_date already exists';
    END IF;
END $$;

-- 4. Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_sent_log_sent_date ON public.sent_log(sent_date);

-- 5. Verify RLS is disabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 6. Check if get_user_stats function exists
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name = 'get_user_stats';

-- 7. Recreate get_user_stats function (in case it's outdated)
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
    COALESCE(COUNT(*), 0)::INTEGER as total_sent,
    COALESCE(COUNT(*) FILTER (WHERE sent_date = CURRENT_DATE), 0)::INTEGER as sent_today,
    COALESCE(COUNT(*) FILTER (WHERE sent_date >= CURRENT_DATE - INTERVAL '7 days'), 0)::INTEGER as sent_this_week,
    COALESCE(COUNT(*) FILTER (WHERE sent_date >= DATE_TRUNC('month', CURRENT_DATE)), 0)::INTEGER as sent_this_month,
    COALESCE(
      jsonb_object_agg(message_type, count),
      '{}'::jsonb
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

-- 8. Verify the function works
SELECT * FROM public.get_user_stats(
  (SELECT id FROM auth.users WHERE email = 'tecnoacceso2025@gmail.com')
);

-- 9. Final verification - show all columns again
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'sent_log'
ORDER BY ordinal_position;

-- SUCCESS MESSAGE
DO $$
BEGIN
  RAISE NOTICE '✅ Database verification and fixes completed!';
  RAISE NOTICE 'If you still see errors, please send me the output of this script.';
END $$;
