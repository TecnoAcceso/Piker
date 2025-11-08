# Migración de Meta WhatsApp API a Twilio WhatsApp

## Resumen de Cambios Necesarios

### 1. Base de Datos
- ✅ Script SQL creado: `migrate_to_twilio.sql`
- Agregar columnas: `twilio_account_sid`, `twilio_auth_token`, `twilio_whatsapp_number`, `twilio_messaging_service_sid`

### 2. Servicio de Twilio
- ✅ Servicio creado: `src/lib/twilioService.js`
- Funciones: `sendTwilioWhatsApp()`, `validateTwilioConfig()`

### 3. Código a Actualizar

#### SendMessage.jsx
- Cambiar llamada de Meta API a Twilio API
- Actualizar validaciones de configuración

#### Licenses.jsx
- Cambiar campos de configuración de Meta a Twilio
- Actualizar labels y placeholders

#### AuthContext.jsx
- Actualizar validaciones de licencia para Twilio

### 4. Variables de Entorno
No se requieren variables de entorno globales - cada licencia tiene sus propias credenciales

## Credenciales Necesarias de Twilio

1. **Account SID**: Comienza con `AC...` (ej: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)
2. **Auth Token**: Token secreto de autenticación
3. **WhatsApp Number**: Número de WhatsApp de Twilio en formato E.164 (ej: `+1234567890` o `whatsapp:+1234567890`)
4. **Messaging Service SID** (opcional): Comienza con `MG...` - permite usar múltiples números

## Formato de Números

- **Entrada**: Acepta `+584245939950` o `04245939950` (se convierte automáticamente)
- **Twilio**: Requiere formato `whatsapp:+584245939950`
- El servicio maneja la conversión automáticamente

## Pasos para Completar la Migración

1. Ejecutar `migrate_to_twilio.sql` en Supabase
2. Actualizar `SendMessage.jsx` para usar Twilio
3. Actualizar `Licenses.jsx` para campos de Twilio
4. Actualizar `AuthContext.jsx` para validaciones de Twilio
5. Probar envío de mensajes
6. (Opcional) Eliminar columnas de Meta después de migración completa

