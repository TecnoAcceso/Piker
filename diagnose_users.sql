-- ============================================================================
-- Script de diagnóstico: Verificar usuarios existentes en la base de datos
-- Ejecuta esto en el SQL Editor de Supabase para ver qué usuarios existen
-- ============================================================================

-- Ver todos los usuarios con sus datos básicos (EJECUTA ESTO PRIMERO)
SELECT 
    id,
    username,
    email,
    full_name,
    role,
    created_at,
    -- Información de diagnóstico
    LENGTH(username) as username_length,
    LOWER(username) as username_lowercase,
    TRIM(username) as username_trimmed,
    username != TRIM(username) as has_leading_trailing_spaces,
    username != LOWER(username) as has_uppercase_letters
FROM profiles
ORDER BY created_at DESC;

-- Buscar un usuario específico (reemplaza 'mrw18000' con el username que buscas)
SELECT 
    id,
    username,
    email,
    full_name,
    role,
    created_at,
    LENGTH(username) as username_length,
    LOWER(username) as username_lowercase,
    TRIM(username) as username_trimmed
FROM profiles
WHERE 
    LOWER(TRIM(username)) = LOWER(TRIM('mrw18000'))
    OR username ILIKE '%mrw18000%'
ORDER BY created_at DESC;

-- Verificar si hay problemas con espacios o mayúsculas en los usernames
SELECT 
    username,
    LENGTH(username) as length,
    LENGTH(TRIM(username)) as trimmed_length,
    username != TRIM(username) as has_spaces,
    username != LOWER(username) as has_uppercase
FROM profiles
WHERE username ILIKE '%mrw%'
ORDER BY created_at DESC;

-- Contar usuarios totales
SELECT COUNT(*) as total_usuarios FROM profiles;

