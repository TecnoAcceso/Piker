-- Función SQL para crear usuario en Supabase
-- Ejecuta esto en el SQL Editor de tu proyecto Supabase

CREATE OR REPLACE FUNCTION create_user_with_profile(
  p_username TEXT,
  p_email TEXT,
  p_password_hash TEXT,
  p_full_name TEXT,
  p_role TEXT
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Generar nuevo UUID
  new_user_id := gen_random_uuid();

  -- Insertar en la tabla profiles
  INSERT INTO profiles (id, username, email, password_hash, full_name, role)
  VALUES (new_user_id, p_username, p_email, p_password_hash, p_full_name, p_role);

  -- Retornar el ID del nuevo usuario
  RETURN new_user_id;
END;
$$;
