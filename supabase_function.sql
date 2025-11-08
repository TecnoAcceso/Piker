-- ============================================================================
-- Función SQL optimizada para crear usuario en Supabase
-- Ejecuta esto en el SQL Editor de tu proyecto Supabase
-- ============================================================================

-- Paso 1: Eliminar la foreign key constraint si existe (ejecuta esto primero)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Paso 2: Crear/actualizar la función optimizada
CREATE OR REPLACE FUNCTION create_user_with_profile(
  p_username TEXT,
  p_email TEXT,
  p_password_hash TEXT,
  p_full_name TEXT,
  p_role TEXT DEFAULT 'user'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id uuid;
  v_username_exists boolean;
  v_email_exists boolean;
BEGIN
  -- Validaciones de entrada
  IF p_username IS NULL OR TRIM(p_username) = '' THEN
    RAISE EXCEPTION 'El nombre de usuario es requerido';
  END IF;
  
  IF p_email IS NULL OR TRIM(p_email) = '' THEN
    RAISE EXCEPTION 'El email es requerido';
  END IF;
  
  IF p_password_hash IS NULL OR TRIM(p_password_hash) = '' THEN
    RAISE EXCEPTION 'La contraseña es requerida';
  END IF;
  
  IF p_full_name IS NULL OR TRIM(p_full_name) = '' THEN
    RAISE EXCEPTION 'El nombre completo es requerido';
  END IF;

  -- Verificar duplicados de manera eficiente (una sola consulta)
  SELECT 
    EXISTS(SELECT 1 FROM profiles WHERE username = TRIM(p_username)),
    EXISTS(SELECT 1 FROM profiles WHERE email = TRIM(LOWER(p_email)))
  INTO v_username_exists, v_email_exists;

  IF v_username_exists THEN
    RAISE EXCEPTION 'El nombre de usuario "%" ya existe', p_username;
  END IF;
  
  IF v_email_exists THEN
    RAISE EXCEPTION 'El email "%" ya está registrado', p_email;
  END IF;

  -- Generar nuevo UUID
  new_user_id := gen_random_uuid();

  -- Insertar en la tabla profiles con valores normalizados
  INSERT INTO profiles (id, username, email, password_hash, full_name, role, created_at)
  VALUES (
    new_user_id,
    TRIM(p_username),
    TRIM(LOWER(p_email)),
    p_password_hash,
    TRIM(p_full_name),
    COALESCE(p_role, 'user'),
    NOW()
  );

  -- Retornar el ID del nuevo usuario
  RETURN new_user_id;
  
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'El nombre de usuario o email ya existe';
  WHEN check_violation THEN
    RAISE EXCEPTION 'Los datos proporcionados no cumplen las restricciones de la base de datos';
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error al crear usuario: %', SQLERRM;
END;
$$;

-- Paso 3: Otorgar permisos necesarios
GRANT EXECUTE ON FUNCTION create_user_with_profile TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_with_profile TO anon;

-- Paso 4: Comentario de documentación
COMMENT ON FUNCTION create_user_with_profile IS 
'Crea un nuevo usuario en la tabla profiles con validaciones y manejo de errores optimizado. 
Requiere: username, email, password_hash, full_name. Opcional: role (default: user).
Retorna: UUID del usuario creado.';
