/**
 * Servicio para enviar mensajes de WhatsApp usando Twilio API
 */

/**
 * Número de WhatsApp Sandbox de Twilio (por defecto)
 * Este es el número que Twilio proporciona para pruebas en Sandbox
 */
const TWILIO_SANDBOX_NUMBER = 'whatsapp:+14155238886'

/**
 * Detecta si un número es el número de Sandbox de Twilio
 */
const isSandboxNumber = (number) => {
  if (!number) return false
  const normalized = number.replace(/whatsapp:/gi, '').trim()
  return normalized === '+14155238886' || normalized === '14155238886'
}

/**
 * Obtiene el número "From" correcto según el modo (Sandbox o Producción)
 */
const getFromNumber = (fromNumber) => {
  if (!fromNumber) return TWILIO_SANDBOX_NUMBER
  
  // Si el número configurado es el de Sandbox, usarlo directamente
  if (isSandboxNumber(fromNumber)) {
    return TWILIO_SANDBOX_NUMBER
  }
  
  // Si ya tiene formato whatsapp:, usarlo tal cual
  if (fromNumber.startsWith('whatsapp:')) {
    return fromNumber
  }
  
  // Agregar formato whatsapp: si no lo tiene
  return `whatsapp:${fromNumber.startsWith('+') ? fromNumber : `+${fromNumber}`}`
}

/**
 * Envía un mensaje de WhatsApp usando Twilio
 * @param {Object} config - Configuración de Twilio
 * @param {string} config.accountSid - Account SID de Twilio
 * @param {string} config.authToken - Auth Token de Twilio
 * @param {string} config.fromNumber - Número de WhatsApp de Twilio (formato: whatsapp:+1234567890)
 * @param {string} config.toNumber - Número de destino (formato: whatsapp:+1234567890 o +1234567890)
 * @param {string} config.message - Mensaje a enviar
 * @param {string} [config.messagingServiceSid] - Messaging Service SID (opcional)
 * @returns {Promise<Object>} Resultado del envío
 */
export const sendTwilioWhatsApp = async ({
  accountSid,
  authToken,
  fromNumber,
  toNumber,
  message,
  messagingServiceSid
}) => {
  try {
    // Asegurar que el número de destino tenga el formato correcto
    const formattedTo = toNumber.startsWith('whatsapp:') 
      ? toNumber 
      : `whatsapp:${toNumber.startsWith('+') ? toNumber : `+${toNumber}`}`

    // Obtener el número "From" correcto (Sandbox o Producción)
    const formattedFrom = getFromNumber(fromNumber)
    
    // Detectar si estamos en modo Sandbox
    const isSandbox = isSandboxNumber(fromNumber)

    console.log('📤 Twilio - Preparando envío:', {
      from: formattedFrom,
      to: formattedTo,
      originalTo: toNumber,
      originalFrom: fromNumber,
      isSandbox: isSandbox,
      hasMessagingService: !!messagingServiceSid
    })

    // Crear FormData para la petición
    const formData = new URLSearchParams()
    
    // Si se proporciona Messaging Service SID, usarlo en lugar de From
    if (messagingServiceSid) {
      formData.append('MessagingServiceSid', messagingServiceSid)
      console.log('📤 Twilio - Usando Messaging Service SID:', messagingServiceSid)
    } else {
      formData.append('From', formattedFrom)
      console.log('📤 Twilio - Usando número From:', formattedFrom, isSandbox ? '(Sandbox)' : '(Producción)')
    }
    
    formData.append('To', formattedTo)
    formData.append('Body', message)

    console.log('📤 Twilio - Datos del formulario:', {
      To: formattedTo,
      From: messagingServiceSid ? 'MessagingService' : formattedFrom,
      BodyLength: message.length
    })

    // Crear credenciales Basic Auth
    const credentials = btoa(`${accountSid}:${authToken}`)

    // Realizar la petición a Twilio API
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      }
    )

    const responseData = await response.json()

    console.log('📥 Twilio - Respuesta completa:', {
      status: response.status,
      statusText: response.statusText,
      data: responseData
    })

    if (!response.ok) {
      console.error('❌ Error Twilio API:', responseData)
      
      // Detectar si es un error de Sandbox (número no verificado)
      const isSandboxError = responseData.code === 63007 || 
                            responseData.message?.toLowerCase().includes('sandbox') ||
                            responseData.message?.toLowerCase().includes('not registered') ||
                            responseData.message?.toLowerCase().includes('not verified')
      
      let errorMessage = responseData.message || 'Error al enviar mensaje'
      
      if (isSandboxError) {
        errorMessage = `Número no verificado en Twilio Sandbox: ${formattedTo}. Debes verificar este número primero enviando el código de Sandbox a WhatsApp.`
      }
      
      return {
        success: false,
        error: errorMessage,
        code: responseData.code,
        details: responseData,
        isSandboxError
      }
    }

    console.log('✅ Twilio - Mensaje enviado exitosamente:', {
      sid: responseData.sid,
      status: responseData.status,
      to: responseData.to,
      from: responseData.from
    })

    return {
      success: true,
      sid: responseData.sid,
      status: responseData.status,
      data: responseData
    }
  } catch (error) {
    console.error('❌ Error en sendTwilioWhatsApp:', error)
    return {
      success: false,
      error: error.message || 'Error al enviar mensaje',
      details: error
    }
  }
}

/**
 * Valida la configuración de Twilio
 * @param {Object} config - Configuración de Twilio
 * @returns {Object} Resultado de la validación
 */
export const validateTwilioConfig = (config) => {
  const errors = []

  if (!config.accountSid || !config.accountSid.startsWith('AC')) {
    errors.push('Account SID inválido. Debe comenzar con "AC"')
  }

  if (!config.authToken || config.authToken.length < 30) {
    errors.push('Auth Token inválido')
  }

  if (!config.fromNumber) {
    errors.push('Número de WhatsApp de Twilio requerido')
  } else if (!config.fromNumber.match(/^(whatsapp:)?\+?\d{10,15}$/)) {
    errors.push('Formato de número inválido. Debe ser: whatsapp:+1234567890 o +1234567890')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
