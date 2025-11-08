-- ============================================================================
-- Tabla para guardar reportes de listas de mensajes enviadas
-- Ejecuta esto en el SQL Editor de Supabase
-- ============================================================================

-- Crear tabla para reportes de envío de listas
CREATE TABLE IF NOT EXISTS message_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL CHECK (message_type IN ('received', 'reminder', 'return')),
  template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL,
  template_name TEXT,
  message_content TEXT NOT NULL,
  phone_numbers JSONB NOT NULL, -- Array de números de teléfono enviados
  total_sent INTEGER NOT NULL DEFAULT 0,
  total_failed INTEGER NOT NULL DEFAULT 0,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_message_batches_user_id ON message_batches(user_id);
CREATE INDEX IF NOT EXISTS idx_message_batches_sent_at ON message_batches(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_batches_message_type ON message_batches(message_type);
CREATE INDEX IF NOT EXISTS idx_message_batches_user_type ON message_batches(user_id, message_type);

-- Comentarios para documentación
COMMENT ON TABLE message_batches IS 'Almacena reportes completos de listas de mensajes enviadas';
COMMENT ON COLUMN message_batches.phone_numbers IS 'Array JSON con los números de teléfono enviados en formato WhatsApp';
COMMENT ON COLUMN message_batches.total_sent IS 'Cantidad de mensajes enviados exitosamente';
COMMENT ON COLUMN message_batches.total_failed IS 'Cantidad de mensajes que fallaron al enviar';

-- Permisos (RLS deshabilitado para autenticación personalizada)
ALTER TABLE message_batches DISABLE ROW LEVEL SECURITY;

-- Otorgar permisos a roles
GRANT ALL ON message_batches TO authenticated;
GRANT ALL ON message_batches TO anon;

-- Nota: Como el sistema usa autenticación personalizada (no auth.users de Supabase),
-- RLS está deshabilitado. La seguridad se maneja a nivel de aplicación verificando
-- que el user_id coincida con el usuario autenticado en el contexto de la aplicación.
