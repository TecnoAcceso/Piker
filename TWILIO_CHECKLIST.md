# ✅ Checklist: Configuración de Twilio WhatsApp

Usa este checklist para asegurarte de completar todos los pasos:

## 📋 Paso 1: Cuenta de Twilio

- [ ] Crear cuenta en https://www.twilio.com
- [ ] Verificar número de teléfono
- [ ] Acceder al Dashboard de Twilio
- [ ] Ubicar la sección "Account Info"

## 📋 Paso 2: Obtener Credenciales

- [ ] Copiar **Account SID** (comienza con `AC...`)
  - Ubicación: Dashboard → Account Info → Account SID
  - Formato: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
  
- [ ] Copiar **Auth Token** (token secreto)
  - Ubicación: Dashboard → Account Info → Auth Token
  - Click en el ícono del ojo para verlo
  - ⚠️ Guárdalo bien, solo se muestra una vez
  
- [ ] Obtener **WhatsApp Number**
  - Opción A (Sandbox/Pruebas): `+14155238886`
  - Opción B (Producción): Número asignado por Twilio

## 📋 Paso 3: Configurar WhatsApp Sandbox (Solo para Pruebas)

- [ ] Ir a: Messaging → Try it out → Send a WhatsApp message
- [ ] Click en "Get started with Twilio Sandbox"
- [ ] Enviar código de unión al número: +1 415 523 8886
- [ ] Recibir confirmación de unión al Sandbox

## 📋 Paso 4: Ejecutar Script SQL en Supabase

- [ ] Abrir Supabase Dashboard
- [ ] Ir a SQL Editor
- [ ] Abrir archivo `migrate_to_twilio.sql`
- [ ] Copiar y pegar el contenido
- [ ] Ejecutar el script (botón "Run")
- [ ] Verificar que las columnas se agregaron correctamente

## 📋 Paso 5: Configurar en la Aplicación

- [ ] Iniciar sesión en Piker como System Admin
- [ ] Ir a la sección "Licencias"
- [ ] Crear nueva licencia o editar existente
- [ ] Completar datos básicos (usuario, plan, límite, fecha)
- [ ] Ir a sección "Configuración Twilio WhatsApp"
- [ ] Pegar **Account SID** en el campo correspondiente
- [ ] Pegar **Auth Token** en el campo correspondiente
- [ ] Pegar **WhatsApp Number** en el campo correspondiente
- [ ] (Opcional) Pegar **Messaging Service SID** si lo tienes
- [ ] Verificar que aparece mensaje verde: "Configuración completa"
- [ ] Click en "Guardar" o "Actualizar"

## 📋 Paso 6: Verificar Configuración

- [ ] Verificar que la licencia muestra estado "ACTIVA" (verde)
- [ ] Verificar que muestra "API CONFIGURADA" (verde)
- [ ] Ir a "Enviar Mensaje" en la aplicación
- [ ] Agregar un número de teléfono de prueba
- [ ] Escribir un mensaje de prueba
- [ ] Click en "Enviar"
- [ ] Verificar en Twilio Dashboard → Monitor → Logs → Messaging que el mensaje se envió

## 🎉 ¡Listo!

Si todos los checkboxes están marcados, tu configuración está completa.

---

## 📝 Notas Rápidas

### Dónde encontrar cada cosa:

**Account SID y Auth Token:**
- Twilio Dashboard → Parte superior → "Account Info"
- O: https://console.twilio.com/us1/develop/console

**WhatsApp Sandbox:**
- Twilio Dashboard → Messaging → Try it out → Send a WhatsApp message

**Panel de Licencias:**
- Aplicación Piker → Menú lateral → "Licencias"

---

## 🆘 Ayuda Rápida

| Problema | Solución |
|----------|----------|
| No veo Account SID | Ve a console.twilio.com y busca "Account Info" |
| Perdí mi Auth Token | Genera uno nuevo en Twilio Dashboard → Account → Auth Tokens |
| La licencia sigue "PENDIENTE" | Verifica que los 3 campos requeridos estén completos y guarda |
| Error al enviar mensaje | Verifica que el número esté verificado (Sandbox) o que tengas créditos |

---

Para más detalles, consulta:
- **Guía Rápida**: [TWILIO_QUICK_START.md](./TWILIO_QUICK_START.md)
- **Guía Completa**: [TWILIO_SETUP_GUIDE.md](./TWILIO_SETUP_GUIDE.md)

