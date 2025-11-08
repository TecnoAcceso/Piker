# Configuración de Supabase Edge Function para Envío de Correos

## Función Existente

El proyecto usa la función Edge Function existente: **`clever-endpoint`**

URL: `https://jsnctapwgxjjcagzccnt.supabase.co/functions/v1/clever-endpoint`

## Configuración Requerida

### Variables de Entorno en Supabase

La función `clever-endpoint` debe tener configurados los siguientes secrets:

En el dashboard de Supabase:
1. Ve a **Settings** → **Edge Functions** → **Secrets**
2. Verifica/Agrega los siguientes secrets:
   - `RESEND_API_KEY` = `re_6sJcaqw5_247Hx7uHEJvGCyQBA2a4Z5PN`
   - `FROM_EMAIL` = `onboarding@resend.dev`

## Formato de Datos Esperado

La función `clever-endpoint` debe aceptar el siguiente formato:

```json
{
  "to": "email@ejemplo.com",
  "subject": "Asunto del correo",
  "html": "<h1>Contenido HTML</h1>",
  "text": "Contenido de texto plano"
}
```

## Prueba Manual

Puedes probar la función desde el dashboard de Supabase:
1. Ve a **Edge Functions** → **clever-endpoint**
2. Click en **Invoke Function**
3. Usa este JSON de prueba:

```json
{
  "to": "tu-email@ejemplo.com",
  "subject": "Prueba",
  "html": "<h1>Hola</h1><p>Este es un correo de prueba</p>",
  "text": "Hola\n\nEste es un correo de prueba"
}
```

## Solución de Problemas

### Error: "Function not found"
- Verifica que la función `clever-endpoint` esté desplegada en Supabase
- Verifica que estés usando el project-ref correcto

### Error: "RESEND_API_KEY not found"
- Verifica que hayas agregado el secret en Supabase Dashboard
- Los secrets deben estar en **Settings** → **Edge Functions** → **Secrets**

### Error de CORS
- La función debe incluir headers CORS apropiados
- Verifica que la función esté desplegada correctamente

## Nota sobre la Función Existente

Si la función `clever-endpoint` no acepta el formato esperado o necesita modificaciones, puedes:
1. Actualizar la función en Supabase Dashboard
2. O crear una nueva función `send-email` usando el código en `supabase/functions/send-email/index.ts`

