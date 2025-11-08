import { supabase } from './supabase'

/**
 * Genera una contraseña temporal segura
 */
export const generateTemporaryPassword = () => {
  const length = 12
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  
  // Asegurar al menos un carácter de cada tipo
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
  password += '0123456789'[Math.floor(Math.random() * 10)]
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]
  
  // Completar el resto
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)]
  }
  
  // Mezclar los caracteres
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

/**
 * Envía correo usando Supabase Edge Function (que llama a Resend)
 */
const sendEmailViaResend = async (to, subject, htmlContent, textContent) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: to,
        subject: subject,
        html: htmlContent,
        text: textContent,
      },
    })

    if (error) {
      console.error('Error en Edge Function:', error)
      return { success: false, error: error.message || 'Error al enviar correo', useFallback: true }
    }

    if (data?.error) {
      console.error('Error de Resend:', data.error)
      return { success: false, error: data.error || 'Error al enviar correo', useFallback: true }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error en sendEmailViaResend:', error)
    return { success: false, error: error.message, useFallback: true }
  }
}

/**
 * Envía correo con el username al usuario
 */
export const sendUsernameEmail = async (email, username, fullName) => {
  try {
    const subject = 'Recuperación de Usuario - Piker'
    const name = fullName || 'Usuario'
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #E4003B 0%, #C7003A 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .info-box { background: white; border-left: 4px solid #E4003B; padding: 15px; margin: 20px 0; }
          .username { font-size: 24px; font-weight: bold; color: #E4003B; text-align: center; padding: 10px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Piker</h1>
            <p>Sistema de Mensajería</p>
          </div>
          <div class="content">
            <h2>Recuperación de Usuario</h2>
            <p>Hola <strong>${name}</strong>,</p>
            <p>Has solicitado recuperar tu nombre de usuario en Piker.</p>
            <div class="info-box">
              <p style="margin: 0; color: #666;">Tu nombre de usuario es:</p>
              <div class="username">${username}</div>
            </div>
            <p>Si no solicitaste esta recuperación, por favor ignora este mensaje.</p>
            <div class="footer">
              <p>© 2025 Piker. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
    
    const textContent = `Hola ${name},

Has solicitado recuperar tu nombre de usuario en Piker.

Tu nombre de usuario es: ${username}

Si no solicitaste esta recuperación, por favor ignora este mensaje.

Saludos,
Equipo Piker`

    const result = await sendEmailViaResend(email, subject, htmlContent, textContent)
    
    if (!result.success && result.useFallback) {
      return await sendEmailFallback(email, 'username_recovery', { username, fullName })
    }

    return result
  } catch (error) {
    console.error('Error en sendUsernameEmail:', error)
    return await sendEmailFallback(email, 'username_recovery', { username, fullName })
  }
}

/**
 * Envía correo con contraseña temporal
 */
export const sendTemporaryPasswordEmail = async (email, temporaryPassword, fullName) => {
  try {
    const subject = 'Contraseña Temporal - Piker'
    const name = fullName || 'Usuario'
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #E4003B 0%, #C7003A 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .warning-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .password-box { background: white; border: 2px solid #E4003B; padding: 20px; margin: 20px 0; text-align: center; }
          .password { font-size: 28px; font-weight: bold; color: #E4003B; letter-spacing: 2px; font-family: monospace; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Piker</h1>
            <p>Sistema de Mensajería</p>
          </div>
          <div class="content">
            <h2>Contraseña Temporal</h2>
            <p>Hola <strong>${name}</strong>,</p>
            <p>Se ha generado una contraseña temporal para tu cuenta en Piker.</p>
            <div class="password-box">
              <p style="margin: 0 0 10px 0; color: #666;">Tu contraseña temporal es:</p>
              <div class="password">${temporaryPassword}</div>
            </div>
            <div class="warning-box">
              <p style="margin: 0;"><strong>⚠️ IMPORTANTE:</strong> Por seguridad, cambia esta contraseña inmediatamente después de iniciar sesión.</p>
            </div>
            <p>Si no solicitaste esta recuperación, por favor contacta al administrador inmediatamente.</p>
            <div class="footer">
              <p>© 2025 Piker. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
    
    const textContent = `Hola ${name},

Se ha generado una contraseña temporal para tu cuenta en Piker:

Contraseña temporal: ${temporaryPassword}

IMPORTANTE: Por seguridad, cambia esta contraseña inmediatamente después de iniciar sesión.

Si no solicitaste esta recuperación, por favor contacta al administrador inmediatamente.

Saludos,
Equipo Piker`

    const result = await sendEmailViaResend(email, subject, htmlContent, textContent)
    
    if (!result.success && result.useFallback) {
      return await sendEmailFallback(email, 'password_recovery', { temporaryPassword, fullName })
    }

    return result
  } catch (error) {
    console.error('Error en sendTemporaryPasswordEmail:', error)
    return await sendEmailFallback(email, 'password_recovery', { temporaryPassword, fullName })
  }
}

/**
 * Método alternativo usando mailto (fallback)
 * Nota: Esto solo funciona si el usuario tiene un cliente de correo configurado
 */
const sendEmailFallback = async (email, type, data) => {
  try {
    let subject = ''
    let body = ''

    if (type === 'username_recovery') {
      subject = 'Recuperación de Usuario - Piker'
      body = `Hola ${data.fullName || 'Usuario'},

Tu nombre de usuario en Piker es: ${data.username}

Si no solicitaste esta recuperación, por favor ignora este mensaje.

Saludos,
Equipo Piker`
    } else if (type === 'password_recovery') {
      subject = 'Contraseña Temporal - Piker'
      body = `Hola ${data.fullName || 'Usuario'},

Se ha generado una contraseña temporal para tu cuenta en Piker:

Contraseña temporal: ${data.temporaryPassword}

IMPORTANTE: Por seguridad, cambia esta contraseña inmediatamente después de iniciar sesión.

Si no solicitaste esta recuperación, por favor contacta al administrador inmediatamente.

Saludos,
Equipo Piker`
    }

    // Crear enlace mailto como fallback
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    
    // Intentar abrir el cliente de correo
    window.open(mailtoLink)
    
    return { 
      success: true, 
      message: 'Se abrió tu cliente de correo. Por favor, envía el correo manualmente.',
      fallback: true,
      // Incluir datos importantes para mostrar en pantalla
      data: type === 'password_recovery' ? { temporaryPassword: data.temporaryPassword } : 
            type === 'username_recovery' ? { username: data.username } : null
    }
  } catch (error) {
    console.error('Error en sendEmailFallback:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Envía correo de confirmación de cambio de contraseña
 */
export const sendPasswordChangeConfirmation = async (email, fullName) => {
  try {
    const subject = 'Contraseña Actualizada - Piker'
    const name = fullName || 'Usuario'
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #E4003B 0%, #C7003A 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .success-box { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Piker</h1>
            <p>Sistema de Mensajería</p>
          </div>
          <div class="content">
            <h2>Contraseña Actualizada</h2>
            <p>Hola <strong>${name}</strong>,</p>
            <div class="success-box">
              <p style="margin: 0;"><strong>✓</strong> Tu contraseña ha sido actualizada exitosamente.</p>
            </div>
            <p>Si no realizaste este cambio, por favor contacta al administrador inmediatamente.</p>
            <div class="footer">
              <p>© 2025 Piker. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
    
    const textContent = `Hola ${name},

Tu contraseña ha sido actualizada exitosamente.

Si no realizaste este cambio, por favor contacta al administrador inmediatamente.

Saludos,
Equipo Piker`

    const result = await sendEmailViaResend(email, subject, htmlContent, textContent)
    
    // Si falla, no usamos fallback para confirmaciones (no es crítico)
    if (!result.success) {
      console.warn('No se pudo enviar correo de confirmación, pero la contraseña fue actualizada')
      return { success: false, error: result.error }
    }

    return result
  } catch (error) {
    console.error('Error en sendPasswordChangeConfirmation:', error)
    return { success: false, error: error.message }
  }
}

