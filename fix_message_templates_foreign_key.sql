-- ============================================================================
-- Script para corregir la foreign key constraint en la tabla message_templates
-- Ejecuta esto en el SQL Editor de Supabase ANTES de crear plantillas
-- ============================================================================

-- Paso 1: Verificar qué constraints existen en la tabla message_templates
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'message_templates'::regclass
ORDER BY conname;

-- Paso 2: Eliminar la foreign key constraint incorrecta si existe
-- (La constraint probablemente apunta a 'users' en lugar de 'profiles')
ALTER TABLE message_templates DROP CONSTRAINT IF EXISTS message_templates_user_id_fkey;

-- Paso 3: Verificar que la tabla message_templates existe y tiene la estructura correcta
-- Si la tabla no existe, créala con la estructura correcta
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('received', 'reminder', 'return')),
  template_name TEXT NOT NULL,
  template_content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Paso 4: Agregar la foreign key constraint correcta apuntando a profiles
-- (Solo si no existe ya)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'message_templates'::regclass 
    AND conname = 'message_templates_user_id_fkey'
  ) THEN
    ALTER TABLE message_templates 
    ADD CONSTRAINT message_templates_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Paso 5: Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_message_templates_user_id ON message_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_message_templates_template_type ON message_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_message_templates_user_type ON message_templates(user_id, template_type);

-- Paso 6: Deshabilitar RLS (importante para autenticación personalizada)
ALTER TABLE message_templates DISABLE ROW LEVEL SECURITY;

-- Paso 7: Otorgar permisos explícitos
GRANT ALL ON message_templates TO authenticated;
GRANT ALL ON message_templates TO anon;
GRANT ALL ON message_templates TO service_role;

-- Paso 8: Verificar que se corrigió correctamente
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'message_templates'::regclass
ORDER BY conname;

-- Paso 9: Verificar permisos
SELECT 
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND table_name = 'message_templates';

-- Nota: Si tu sistema usa autenticación personalizada (no auth.users de Supabase),
-- entonces la foreign key constraint debe apuntar a 'profiles', no a 'users'.
-- Este script es seguro de ejecutar y corregirá la constraint incorrecta.

