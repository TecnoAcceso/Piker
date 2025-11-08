# 🚀 Guía Rápida: Configurar Twilio en 5 Minutos

## ⚡ Pasos Rápidos

### 1️⃣ Crear Cuenta Twilio (2 min)

1. Ve a: **https://www.twilio.com/try-twilio**
2. Click en **"Sign Up"**
3. Completa el formulario y verifica tu teléfono
4. ✅ Listo - Ya tienes cuenta

---

### 2️⃣ Obtener Credenciales (1 min)

1. En el Dashboard de Twilio, busca la sección **"Account Info"**
2. Copia estos 3 valores:

```
Account SID: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (comienza con AC)
Auth Token: [tu token secreto] (click en el ojo para verlo)
```

3. Para WhatsApp Number:
   - **Sandbox (pruebas)**: Usa `+14155238886`
   - **Producción**: Tu número asignado por Twilio

---

### 3️⃣ Configurar WhatsApp Sandbox (1 min) - Solo para Pruebas

1. En Twilio Dashboard → **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Click en **"Get started with Twilio Sandbox"**
3. Envía el código que te muestran (ej: `join <código>`) al número: **+1 415 523 8886**
4. ✅ Ya puedes enviar mensajes a números verificados

---

### 4️⃣ Configurar en la Aplicación (1 min)

1. Inicia sesión en Piker como **System Admin**
2. Ve a **Licencias** → Click en **"Nueva Licencia"** o edita una existente
3. Completa la sección **"Configuración Twilio WhatsApp"**:

```
Account SID: [pega tu AC...]
Auth Token: [pega tu token]
WhatsApp Number: +14155238886 (para sandbox)
Messaging Service SID: [déjalo vacío si no lo tienes]
```

4. Click en **"Guardar"**
5. ✅ La licencia se activará automáticamente

---

## ✅ Verificación

- La licencia debe mostrar: **"ACTIVA"** en verde
- La configuración debe mostrar: **"API CONFIGURADA"** en verde

---

## 🆘 Si Algo Sale Mal

### No veo "Account Info"
- Ve a: https://console.twilio.com/us1/develop/console
- Debería estar en la parte superior del dashboard

### No encuentro WhatsApp
- Ve a: **Messaging** → **Try it out** → **Send a WhatsApp message**
- O busca "WhatsApp" en la barra de búsqueda

### La licencia sigue "PENDIENTE"
- Verifica que los 3 campos requeridos estén completos
- Asegúrate de guardar después de completar
- Refresca la página

---

## 📚 Guía Completa

Para más detalles, consulta: [TWILIO_SETUP_GUIDE.md](./TWILIO_SETUP_GUIDE.md)

