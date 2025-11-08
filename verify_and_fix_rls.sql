-- ============================================================================
-- Script para verificar y corregir RLS en message_batches
-- Ejecuta esto en el SQL Editor de Supabase
-- ============================================================================

-- Paso 1: Verificar el estado actual de RLS
SELECT 
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN 'RLS HABILITADO (necesita deshabilitarse)'
    ELSE 'RLS DESHABILITADO (correcto)'
  END as estado
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'message_batches';

-- Paso 2: Deshabilitar RLS explícitamente (ejecuta esto si RLS está habilitado)
ALTER TABLE message_batches DISABLE ROW LEVEL SECURITY;

-- Paso 3: Eliminar todas las políticas RLS si existen
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'message_batches') LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON message_batches';
  END LOOP;
END $$;

-- Paso 4: Verificar nuevamente que RLS está deshabilitado
SELECT 
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN '❌ RLS AÚN HABILITADO'
    ELSE '✅ RLS DESHABILITADO CORRECTAMENTE'
  END as estado_final
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'message_batches';

-- Paso 5: Verificar que no hay políticas RLS activas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'message_batches';

-- Si la consulta anterior no devuelve filas, significa que no hay políticas RLS (correcto)

