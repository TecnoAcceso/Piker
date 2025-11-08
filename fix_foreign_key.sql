-- ============================================================================
-- Script para corregir la foreign key constraint en la tabla profiles
-- Ejecuta esto en el SQL Editor de Supabase ANTES de crear usuarios
-- ============================================================================

-- Paso 1: Verificar qué constraints existen en la tabla profiles
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass
ORDER BY conname;

-- Paso 2: Eliminar la foreign key constraint si existe y no es necesaria
-- (Solo ejecuta esto si tu sistema NO usa auth.users de Supabase)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Paso 3: Verificar que se eliminó correctamente
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass
ORDER BY conname;

-- Nota: Si tu sistema usa autenticación personalizada (no auth.users de Supabase),
-- entonces la foreign key constraint probablemente no es necesaria y debe ser eliminada.
-- Este script es seguro de ejecutar y solo eliminará constraints que realmente existen.

