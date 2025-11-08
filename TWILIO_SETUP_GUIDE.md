# Guía Completa: Configuración de Twilio WhatsApp

## Paso 1: Crear Cuenta en Twilio

### 1.1 Registrarse en Twilio

1. Ve a [https://www.twilio.com](https://www.twilio.com)
2. Click en **"Sign Up"** o **"Get Started"**
3. Completa el formulario de registro:
   - Email
   - Contraseña
   - Nombre completo
   - Número de teléfono (para verificación)
4. Verifica tu número de teléfono (recibirás un código por SMS)
5. Completa la información adicional si se solicita

### 1.2 Verificar tu Cuenta

- Twilio puede pedirte verificar tu identidad
- Sigue las instrucciones en pantalla
- Puede tomar unos minutos

---

## Paso 2: Obtener Credenciales de Twilio

### 2.1 Acceder al Dashboard

1. Una vez registrado, serás redirigido al **Dashboard** de Twilio
2. Si no estás en el dashboard, ve a [https://console.twilio.com](https://console.twilio.com)

### 2.2 Obtener Account SID y Auth Token

1. En el Dashboard, verás una sección llamada **"Account Info"** o **"Account"**
2. Ahí encontrarás:
   - **Account SID**: Comienza con `AC...` (ejemplo: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
   - **Auth Token**: Token secreto (haz click en el ícono del ojo para verlo)
3. **IMPORTANTE**: Copia ambos valores y guárdalos en un lugar seguro
   - El Auth Token solo se muestra una vez
   - Si lo pierdes, deberás generar uno nuevo

### 2.3 Configurar WhatsApp en Twilio

#### Opción A: Usar WhatsApp Sandbox (Para Pruebas)

1. En el Dashboard, ve a **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Click en **"Get started with Twilio Sandbox for WhatsApp"**
3. Sigue las instrucciones para unirte al Sandbox:
   - Envía el código que te muestran a un número de WhatsApp específico
   - Una vez unido, podrás enviar mensajes a números verificados
4. El número de WhatsApp será algo como: `whatsapp:+14155238886` (número de Twilio Sandbox)

#### Opción B: Configurar WhatsApp Business (Para Producción)

1. Ve a **Messaging** → **Settings** → **WhatsApp Senders**
2. Click en **"Request WhatsApp Access"**
3. Completa el formulario:
   - Nombre de tu negocio
   - Descripción del uso
   - Categoría de negocio
   - Etc.
4. Twilio revisará tu solicitud (puede tomar varios días)
5. Una vez aprobado, recibirás un número de WhatsApp Business

### 2.4 Obtener tu Número de WhatsApp

- **Para Sandbox**: Usa `whatsapp:+14155238886` (número de prueba)
- **Para Producción**: Usa el número que Twilio te asigne (formato: `+1234567890`)

### 2.5 (Opcional) Crear Messaging Service

1. Ve a **Messaging** → **Services**
2. Click en **"Create Messaging Service"**
3. Dale un nombre (ej: "Piker WhatsApp Service")
4. Una vez creado, obtendrás un **Messaging Service SID** (comienza con `MG...`)
5. Agrega tu número de WhatsApp al servicio

---

## Paso 3: Configurar en el Panel de Licencias

### 3.1 Acceder al Panel de Licencias

1. Inicia sesión en tu aplicación Piker
2. Asegúrate de tener rol **System Admin**
3. Ve al menú lateral y click en **"Licencias"**

### 3.2 Crear o Editar una Licencia

#### Para Crear una Nueva Licencia:

1. Click en el botón **"Nueva Licencia"** o **"+"**
2. Completa los datos básicos:
   - Selecciona el usuario
   - Tipo de plan
   - Límite de mensajes
   - Fecha de validez

#### Para Editar una Licencia Existente:

1. Busca la licencia en la lista
2. Click en el botón **"Editar"** o el ícono de lápiz
3. Ve a la sección **"Configuración Twilio WhatsApp"**

### 3.3 Completar Campos de Twilio

En la sección **"Configuración Twilio WhatsApp"**, completa:

1. **Account SID**:
   - Pega tu Account SID de Twilio (formato: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
   - Ejemplo: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

2. **Auth Token**:
   - Pega tu Auth Token de Twilio (token secreto)
   - Este campo es de tipo password (se oculta automáticamente)

3. **WhatsApp Number**:
   - Para Sandbox: `+14155238886` o `whatsapp:+14155238886`
   - Para Producción: Tu número asignado (ej: `+1234567890`)
   - Puedes incluir o no el prefijo `whatsapp:`

4. **Messaging Service SID** (Opcional):
   - Si creaste un Messaging Service, pega el SID aquí
   - Formato: `MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Si no lo tienes, déjalo vacío

### 3.4 Guardar la Configuración

1. Una vez completados los campos requeridos, verás un mensaje verde:
   - ✅ "Configuración completa. La licencia se activará automáticamente al guardar."

2. Click en **"Guardar"** o **"Actualizar"**

3. La licencia se activará automáticamente si tiene:
   - Account SID
   - Auth Token
   - WhatsApp Number

---

## Paso 4: Verificar la Configuración

### 4.1 Verificar en el Panel

1. Después de guardar, verifica que la licencia muestre:
   - Estado: **"ACTIVA"** (en verde)
   - Configuración API: **"API CONFIGURADA"** (en verde)

### 4.2 Probar Envío de Mensajes

1. Ve a **"Enviar Mensaje"** en la aplicación
2. Selecciona un tipo de mensaje (Recibidos, Recordatorios, o Devoluciones)
3. Agrega un número de teléfono
4. Escribe un mensaje de prueba
5. Click en **"Enviar"**

### 4.3 Verificar en Twilio

1. Ve al Dashboard de Twilio
2. Ve a **Monitor** → **Logs** → **Messaging**
3. Deberías ver los mensajes enviados con su estado

---

## Solución de Problemas

### Error: "Account SID inválido"
- Verifica que comience con `AC`
- Asegúrate de copiar el SID completo
- No debe tener espacios

### Error: "Auth Token inválido"
- Verifica que tengas el token correcto
- Si lo perdiste, genera uno nuevo en Twilio Dashboard
- El token debe tener al menos 30 caracteres

### Error: "Número inválido"
- Verifica el formato: debe ser `+1234567890` o `whatsapp:+1234567890`
- Asegúrate de incluir el código de país
- Para Sandbox, usa `+14155238886`

### Error: "No se puede enviar mensaje"
- Verifica que el número de destino esté verificado (en Sandbox)
- Para Sandbox, el destinatario debe enviar el código de unión primero
- Verifica que tu cuenta de Twilio tenga créditos

### La licencia sigue en "PENDIENTE API"
- Verifica que hayas completado los 3 campos requeridos:
  - Account SID
  - Auth Token
  - WhatsApp Number
- Guarda nuevamente la licencia
- Refresca la página

---

## Recursos Adicionales

- **Documentación de Twilio WhatsApp**: [https://www.twilio.com/docs/whatsapp](https://www.twilio.com/docs/whatsapp)
- **Twilio Console**: [https://console.twilio.com](https://console.twilio.com)
- **Twilio Support**: [https://support.twilio.com](https://support.twilio.com)

---

## Notas Importantes

⚠️ **Seguridad**:
- Nunca compartas tu Auth Token
- No lo subas a repositorios públicos
- Si lo comprometes, genera uno nuevo inmediatamente

💡 **Sandbox vs Producción**:
- **Sandbox**: Gratis, solo para pruebas, números limitados
- **Producción**: Requiere aprobación de Twilio, tiene costos por mensaje

📱 **Formato de Números**:
- El sistema convierte automáticamente los números al formato correcto
- Puedes ingresar: `04245939950`, `+584245939950`, o `whatsapp:+584245939950`
- El sistema los normaliza a `whatsapp:+584245939950`

