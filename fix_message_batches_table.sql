-- ============================================================================
-- Script para crear/corregir la tabla message_batches
-- Ejecuta esto en el SQL Editor de Supabase
-- ============================================================================

-- Paso 1: Eliminar políticas RLS existentes si las hay
DROP POLICY IF EXISTS "Users can view their own message batches" ON message_batches;
DROP POLICY IF EXISTS "Users can insert their own message batches" ON message_batches;

-- Paso 2: Crear la tabla si no existe
CREATE TABLE IF NOT EXISTS message_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL CHECK (message_type IN ('received', 'reminder', 'return')),
  template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL,
  template_name TEXT,
  message_content TEXT NOT NULL,
  phone_numbers JSONB NOT NULL,
  total_sent INTEGER NOT NULL DEFAULT 0,
  total_failed INTEGER NOT NULL DEFAULT 0,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Paso 3: Deshabilitar RLS (importante para autenticación personalizada)
ALTER TABLE message_batches DISABLE ROW LEVEL SECURITY;

-- Paso 4: Otorgar permisos explícitos
GRANT ALL ON message_batches TO authenticated;
GRANT ALL ON message_batches TO anon;
GRANT ALL ON message_batches TO service_role;

-- Paso 5: Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_message_batches_user_id ON message_batches(user_id);
CREATE INDEX IF NOT EXISTS idx_message_batches_sent_at ON message_batches(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_batches_message_type ON message_batches(message_type);
CREATE INDEX IF NOT EXISTS idx_message_batches_user_type ON message_batches(user_id, message_type);

-- Paso 6: Verificar que la tabla existe y tiene los permisos correctos
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'message_batches';

-- Paso 7: Verificar permisos
SELECT 
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND table_name = 'message_batches';

