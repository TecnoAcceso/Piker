-- ============================================================================
-- Función SQL para obtener estadísticas de mensajes del usuario
-- Ejecuta esto en el SQL Editor de Supabase
-- ============================================================================

-- Paso 1: Eliminar la función existente si existe (con cualquier firma)
DROP FUNCTION IF EXISTS get_user_stats(UUID);
DROP FUNCTION IF EXISTS get_user_stats(uuid);

-- Paso 2: Crear la función que retorna una tabla (más compatible con Supabase RPC)
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS TABLE (
  total_sent INTEGER,
  sent_today INTEGER,
  sent_this_week INTEGER,
  sent_this_month INTEGER,
  by_type JSON
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_sent INTEGER := 0;
  v_sent_today INTEGER := 0;
  v_sent_this_week INTEGER := 0;
  v_sent_this_month INTEGER := 0;
  v_by_type JSON := '{}'::JSON;
BEGIN
  -- Total de mensajes enviados (solo con status 'sent')
  SELECT COUNT(*) INTO v_total_sent
  FROM sent_log
  WHERE user_id = p_user_id
    AND status = 'sent';

  -- Mensajes enviados hoy
  SELECT COUNT(*) INTO v_sent_today
  FROM sent_log
  WHERE user_id = p_user_id
    AND status = 'sent'
    AND DATE(sent_at) = CURRENT_DATE;

  -- Mensajes enviados esta semana (desde el lunes de la semana actual)
  SELECT COUNT(*) INTO v_sent_this_week
  FROM sent_log
  WHERE user_id = p_user_id
    AND status = 'sent'
    AND sent_at >= DATE_TRUNC('week', CURRENT_DATE);

  -- Mensajes enviados este mes
  SELECT COUNT(*) INTO v_sent_this_month
  FROM sent_log
  WHERE user_id = p_user_id
    AND status = 'sent'
    AND DATE_TRUNC('month', sent_at) = DATE_TRUNC('month', CURRENT_DATE);

  -- Agrupar por tipo de mensaje usando subconsulta para evitar anidamiento
  SELECT COALESCE(
    (SELECT json_object_agg(message_type, count)
     FROM (
       SELECT message_type, COUNT(*) as count
       FROM sent_log
       WHERE user_id = p_user_id
         AND status = 'sent'
       GROUP BY message_type
     ) subquery),
    '{}'::JSON
  ) INTO v_by_type;

  -- Retornar como tabla con una sola fila
  RETURN QUERY SELECT 
    v_total_sent,
    v_sent_today,
    v_sent_this_week,
    v_sent_this_month,
    v_by_type;
END;
$$;

-- Paso 3: Otorgar permisos
GRANT EXECUTE ON FUNCTION get_user_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_stats(UUID) TO anon;

-- Paso 4: Comentario de documentación
COMMENT ON FUNCTION get_user_stats IS 
'Calcula estadísticas de mensajes enviados para un usuario específico.
Retorna una tabla con: total_sent, sent_today, sent_this_week, sent_this_month, by_type (JSON con conteos por tipo).
Requiere: p_user_id (UUID del usuario).';
