# Configuración del Servicio de Correo Electrónico

Este proyecto usa **Resend** para enviar correos electrónicos de forma segura.

## Pasos para Configurar Resend

### 1. Crear cuenta en Resend

1. Ve a [https://resend.com](https://resend.com)
2. Crea una cuenta gratuita (incluye 3,000 emails/mes gratis)
3. Verifica tu email

### 2. Obtener API Key

1. Ve a [https://resend.com/api-keys](https://resend.com/api-keys)
2. Crea una nueva API Key
3. Copia la clave (empieza con `re_`)

### 3. Verificar dominio (opcional pero recomendado)

1. Ve a [https://resend.com/domains](https://resend.com/domains)
2. Agrega tu dominio
3. Configura los registros DNS según las instrucciones
4. Una vez verificado, puedes usar emails como `noreply@tudominio.com`

### 4. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con:

```env
# Supabase Configuration (ya deberías tenerlas)
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anon_de_supabase

# Resend Email Service Configuration
VITE_RESEND_API_KEY=re_tu_api_key_de_resend

# Email sender address
# Si no tienes dominio verificado, usa el email de prueba de Resend
VITE_FROM_EMAIL=noreply@piker.app
# O si tienes dominio verificado:
# VITE_FROM_EMAIL=noreply@tudominio.com
```

### 5. Email de Prueba (sin dominio verificado)

Si aún no has verificado un dominio, Resend te proporciona un email de prueba:
- Formato: `onboarding@resend.dev`
- Solo funciona para desarrollo/pruebas
- Límite de 100 emails/día

### 6. Reiniciar el servidor de desarrollo

Después de agregar las variables de entorno, reinicia Vite:

```bash
npm run dev
```

## Fallback Automático

Si Resend no está configurado o falla, el sistema automáticamente:
- Abrirá el cliente de correo del usuario (mailto)
- Mostrará un mensaje indicando que debe enviar el correo manualmente

## Tipos de Correos Enviados

1. **Recuperación de Usuario**: Envía el username al email del usuario
2. **Recuperación de Contraseña**: Genera y envía una contraseña temporal
3. **Confirmación de Cambio**: Confirma cuando el usuario cambia su contraseña

## Seguridad

- Las contraseñas temporales son generadas de forma segura (12 caracteres, múltiples tipos)
- Las contraseñas se hashean con bcrypt antes de guardarse
- Los correos incluyen advertencias de seguridad
- Se recomienda cambiar la contraseña temporal inmediatamente después del login

