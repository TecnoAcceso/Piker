-- ============================================================================
-- Script para corregir la foreign key constraint en la tabla licenses
-- Ejecuta esto en el SQL Editor de Supabase
-- ============================================================================

-- Eliminar la foreign key constraint si existe
ALTER TABLE licenses DROP CONSTRAINT IF EXISTS licenses_user_id_fkey;

-- Verificar que se eliminó correctamente
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'licenses'::regclass
ORDER BY conname;

