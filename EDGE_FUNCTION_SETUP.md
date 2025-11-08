# Configuración de Supabase Edge Function para Envío de Correos

## Pasos para Desplegar la Edge Function

### 1. Instalar Supabase CLI (si no lo tienes)

```bash
# Windows (con Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# O con npm
npm install -g supabase
```

### 2. Inicializar Supabase en el proyecto (si no está inicializado)

```bash
supabase init
```

### 3. Login en Supabase

```bash
supabase login
```

### 4. Vincular tu proyecto

```bash
supabase link --project-ref tu-project-ref
```

Puedes encontrar tu project-ref en la URL de tu proyecto Supabase:
`https://supabase.com/dashboard/project/[PROJECT_REF]`

### 5. Configurar Variables de Entorno en Supabase

En el dashboard de Supabase:
1. Ve a **Settings** → **Edge Functions** → **Secrets**
2. Agrega los siguientes secrets:
   - `RESEND_API_KEY` = `re_6sJcaqw5_247Hx7uHEJvGCyQBA2a4Z5PN`
   - `FROM_EMAIL` = `onboarding@resend.dev`

### 6. Desplegar la Edge Function

```bash
supabase functions deploy send-email
```

### 7. Verificar el Deployment

Después del deploy, deberías ver un mensaje como:
```
Deployed Function send-email
```

## Estructura de Archivos

La Edge Function está en:
```
supabase/
└── functions/
    └── send-email/
        └── index.ts
```

## Prueba Manual

Puedes probar la función desde el dashboard de Supabase:
1. Ve a **Edge Functions** → **send-email**
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
- Asegúrate de haber desplegado la función: `supabase functions deploy send-email`
- Verifica que estés usando el project-ref correcto

### Error: "RESEND_API_KEY not found"
- Verifica que hayas agregado el secret en Supabase Dashboard
- Los secrets deben estar en **Settings** → **Edge Functions** → **Secrets**

### Error de CORS
- La Edge Function ya incluye headers CORS
- Si persiste, verifica que la función esté desplegada correctamente

## Alternativa: Usar Supabase Dashboard

Si prefieres no usar CLI, puedes:
1. Ve a **Edge Functions** en el dashboard de Supabase
2. Click en **Create Function**
3. Nombre: `send-email`
4. Copia el contenido de `supabase/functions/send-email/index.ts`
5. Agrega los secrets como se indica arriba

