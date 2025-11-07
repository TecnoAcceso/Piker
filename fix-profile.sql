-- Verificar el perfil del usuario admin_sistema
SELECT id, email, username, full_name, role
FROM public.profiles
WHERE username = 'admin_sistema';

-- Si no existe, necesitas ejecutar esto (reemplaza YOUR_USER_ID con el ID del auth.users):
-- Primero verifica el ID del usuario en auth.users:
SELECT id, email
FROM auth.users
WHERE email = 'tecnoacceso2025@gmail.com';

-- Luego, si el perfil no existe, créalo (REEMPLAZA 'tu-user-id-aqui' con el ID real):
/*
INSERT INTO public.profiles (id, email, username, full_name, role, created_at)
VALUES (
  'tu-user-id-aqui',
  'tecnoacceso2025@gmail.com',
  'admin_sistema',
  'TecnoElectro',
  'system_admin',
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET
  username = 'admin_sistema',
  full_name = 'TecnoElectro',
  role = 'system_admin';
*/
