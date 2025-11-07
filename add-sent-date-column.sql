-- Add sent_date column to sent_log table
-- This column is needed for the dashboard statistics

ALTER TABLE public.sent_log
ADD COLUMN IF NOT EXISTS sent_date DATE DEFAULT CURRENT_DATE NOT NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_sent_log_sent_date
ON public.sent_log(sent_date);

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'sent_log'
  AND column_name = 'sent_date';
