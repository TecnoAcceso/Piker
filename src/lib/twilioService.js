/**
 * Servicio para enviar mensajes de WhatsApp usando Twilio API
 */

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

    // Asegurar que el número de origen tenga el formato correcto
    const formattedFrom = fromNumber.startsWith('whatsapp:')
      ? fromNumber
      : `whatsapp:${fromNumber.startsWith('+') ? fromNumber : `+${fromNumber}`}`

    // Crear FormData para la petición
    const formData = new URLSearchParams()
    
    // Si se proporciona Messaging Service SID, usarlo en lugar de From
    if (messagingServiceSid) {
      formData.append('MessagingServiceSid', messagingServiceSid)
    } else {
      formData.append('From', formattedFrom)
    }
    
    formData.append('To', formattedTo)
    formData.append('Body', message)

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

    if (!response.ok) {
      console.error('Error Twilio API:', responseData)
      return {
        success: false,
        error: responseData.message || 'Error al enviar mensaje',
        code: responseData.code,
        details: responseData
      }
    }

    return {
      success: true,
      sid: responseData.sid,
      status: responseData.status,
      data: responseData
    }
  } catch (error) {
    console.error('Error en sendTwilioWhatsApp:', error)
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

