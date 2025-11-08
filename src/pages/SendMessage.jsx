import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Send,
  Trash2,
  AlertTriangle,
  CheckCircle,
  QrCode,
  X,
  Loader2,
  Phone
} from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import CustomAlert from '../components/CustomAlert'
import QRScanner from '../components/QRScanner'

const messageTypeInfo = {
  received: {
    label: 'Paquetes Recibidos',
    color: 'blue',
    description: 'Notificar al destinatario sobre paquetes recibidos'
  },
  reminder: {
    label: 'Recordatorios',
    color: 'yellow',
    description: 'Enviar recordatorios de recogida'
  },
  return: {
    label: 'Devoluciones',
    color: 'red',
    description: 'Notificar devoluciones al remitente'
  }
}

export default function SendMessage() {
  const { type } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [phoneNumbers, setPhoneNumbers] = useState([])
  const [currentPhone, setCurrentPhone] = useState('')
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [customMessage, setCustomMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [alert, setAlert] = useState({ isOpen: false, title: '', message: '', type: 'info' })

  const showAlert = (title, message, type = 'info') => {
    setAlert({ isOpen: true, title, message, type })
  }

  const closeAlert = () => {
    setAlert({ isOpen: false, title: '', message: '', type: 'info' })
  }

  // Validate type
  useEffect(() => {
    if (!['received', 'reminder', 'return'].includes(type)) {
      navigate('/dashboard')
    }
  }, [type, navigate])

  // Fetch templates
  useEffect(() => {
    fetchTemplates()
  }, [type])

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('user_id', profile.id)
        .eq('template_type', type)

      if (error) throw error
      setTemplates(data || [])
      if (data && data.length > 0) {
        setSelectedTemplate(data[0])
        setCustomMessage(data[0].template_content)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    }
  }

  const convertToWhatsAppFormat = (phone) => {
    if (!phone) return null
    
    // Remove all non-numeric characters first
    let cleaned = phone.replace(/\D/g, '')
    
    // If empty after cleaning, return null
    if (!cleaned) return null
    
    // Convert Venezuelan phone numbers to WhatsApp format (+58)
    // Venezuelan numbers typically:
    // - Start with 0: 04245939950 → +584245939950
    // - Or are 10 digits without 0: 4160454501 → +584160454501
    // - Already in format +58XXXXXXXXXX or 58XXXXXXXXXX
    
    // If it already starts with 58 (international format without +), keep it
    if (cleaned.startsWith('58')) {
      // Validate length: should be 12 digits (58 + 10 digits)
      if (cleaned.length === 12) {
        return '+' + cleaned
      }
      // If longer, might have extra digits, take first 12
      if (cleaned.length > 12) {
        return '+' + cleaned.substring(0, 12)
      }
    }
    // If it starts with 0 and has 11 digits (0 + 10 digits), remove 0 and add 58
    else if (cleaned.startsWith('0') && cleaned.length === 11) {
      cleaned = '58' + cleaned.substring(1)
      return '+' + cleaned
    }
    // If it's exactly 10 digits, assume it's Venezuelan and add 58
    else if (cleaned.length === 10) {
      cleaned = '58' + cleaned
      return '+' + cleaned
    }
    // If it's 11 digits but doesn't start with 0 or 58, might be malformed
    // Try to extract last 10 digits and add 58
    else if (cleaned.length === 11 && !cleaned.startsWith('0')) {
      cleaned = '58' + cleaned.substring(1)
      return '+' + cleaned
    }
    // If it's 9 digits, might be missing a digit, add 58 anyway
    else if (cleaned.length === 9) {
      cleaned = '58' + cleaned
      return '+' + cleaned
    }
    // For other lengths, try to normalize
    else if (cleaned.length >= 10 && cleaned.length <= 12) {
      // If it's 12 digits and doesn't start with 58, might be international format
      // Try to extract Venezuelan number
      if (cleaned.length === 12 && !cleaned.startsWith('58')) {
        // Might be a different country code, but assume Venezuelan for now
        cleaned = '58' + cleaned.substring(2)
        return '+' + cleaned
      }
      return '+' + cleaned
    }
    
    // If none of the above, return null (invalid)
    return null
  }

  const validatePhoneNumber = (phone) => {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '')

    // Check if it's a valid length (typically 10-15 digits for international numbers)
    if (cleaned.length < 10 || cleaned.length > 15) {
      return { valid: false, error: 'Número de teléfono inválido' }
    }

    return { valid: true, cleaned }
  }

  const checkDuplicate = async (phoneNumber) => {
    try {
      const { data, error } = await supabase
        .rpc('check_daily_duplicate', {
          p_user_id: profile.id,
          p_phone_number: phoneNumber,
          p_message_type: type
        })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error checking duplicate:', error)
      return false
    }
  }

  const extractSenderPhoneFromQR = (qrData) => {
    if (!qrData || typeof qrData !== 'string') {
      return null
    }

    // Split by semicolon - empty strings between ";;" will be preserved
    const fields = qrData.split(';')
    
    console.log('Campos del QR para remitente (total:', fields.length, '):', fields)
    
    // The sender phone number is typically in positions 5-7 (indices 4-6)
    // Structure varies:
    // - Position 5: sender phone (04127041323) - after sender name
    // - Position 6: might be email or phone
    // - Position 7: might be phone
    // Position 8 onwards usually contains recipient or other data
    // We'll check positions 5, 6, and 7 (indices 4, 5, 6) more strictly
    
    const positionsToTry = [4, 5, 6] // Positions 5, 6, 7 (0-indexed)
    
    for (const targetIndex of positionsToTry) {
      if (fields.length > targetIndex) {
        const phoneField = fields[targetIndex]?.trim()
        
        // Validate it looks like a phone number (9-11 digits, not a name, email, or very long ID)
        // Must be a valid Venezuelan phone number format
        // Exclude emails, names, IDs, and other non-phone data
        if (phoneField && 
            /^\d{9,11}$/.test(phoneField) && 
            !/^\d{4,5}$/.test(phoneField) &&
            !phoneField.includes('@') &&
            !phoneField.includes(' ') &&
            !phoneField.includes('-') &&
            !phoneField.includes('(') &&
            !phoneField.includes(')')) {
          console.log(`Número del remitente extraído de posición ${targetIndex + 1}:`, phoneField)
          // Convert to WhatsApp format before returning
          const whatsappFormat = convertToWhatsAppFormat(phoneField)
          console.log(`Número del remitente convertido a formato WhatsApp:`, whatsappFormat)
          return whatsappFormat
        }
      }
    }
    
    // Log what we found in positions 5-7 for debugging
    if (fields.length > 4) {
      console.warn('No se encontró número válido del remitente en posiciones 5-7')
      console.warn('Posición 5:', fields[4])
      if (fields.length > 5) {
        console.warn('Posición 6:', fields[5])
      }
      if (fields.length > 6) {
        console.warn('Posición 7:', fields[6])
      }
      // Check if there's an email instead (indicates remitente might not have phone)
      const hasEmail = fields.some((field, idx) => {
        return idx >= 4 && idx <= 6 && field && field.includes('@')
      })
      if (hasEmail) {
        console.warn('Se encontró un email en las posiciones del remitente. El remitente puede no tener número telefónico.')
      }
    } else {
      console.warn('QR no tiene suficientes campos. Total:', fields.length, 'Necesario: al menos 5')
    }

    // Don't use fallback - if remitente doesn't have phone in expected positions, return null
    // This prevents capturing numbers from other people (like recipients or intermediaries)
    console.warn('El remitente no tiene número telefónico en las posiciones esperadas')
    return null
  }

  const extractPhoneFromQR = (qrData) => {
    if (!qrData || typeof qrData !== 'string') {
      return null
    }

    // Split by semicolon - empty strings between ";;" will be preserved
    const fields = qrData.split(';')
    
    console.log('Campos del QR (total:', fields.length, '):', fields)
    
    // The recipient phone number is consistently at position 9 (index 8) when counting from 1
    // However, in some QRs, position 9 contains the recipient name and position 10 contains the phone
    // We'll check both positions 9 and 10 (indices 8 and 9) to handle both cases:
    // - Case 1: Position 9 = recipient name, Position 10 = recipient phone (04245939950, 4160454501)
    // - Case 2: Position 9 = recipient phone directly (if structure differs)
    
    const positionsToTry = [8, 9] // Positions 9 and 10 (0-indexed)
    
    for (const targetIndex of positionsToTry) {
      if (fields.length > targetIndex) {
        const phoneField = fields[targetIndex]?.trim()
        
        // Validate it looks like a phone number (9-11 digits, not a name or email)
        // Accepts numbers that start with 0 (Venezuela format like 04245939950) 
        // or other digits (like 4160454501)
        if (phoneField && /^\d{9,11}$/.test(phoneField) && !/^\d{4,5}$/.test(phoneField)) {
          console.log(`Número del destinatario extraído de posición ${targetIndex + 1}:`, phoneField)
          // Convert to WhatsApp format before returning
          const whatsappFormat = convertToWhatsAppFormat(phoneField)
          console.log(`Número convertido a formato WhatsApp:`, whatsappFormat)
          return whatsappFormat
        }
      }
    }
    
    // Log what we found in positions 9 and 10 for debugging
    if (fields.length > 8) {
      console.warn('No se encontró número válido en posiciones 9 o 10')
      console.warn('Posición 9:', fields[8])
      if (fields.length > 9) {
        console.warn('Posición 10:', fields[9])
      }
    } else {
      console.warn('QR no tiene suficientes campos. Total:', fields.length, 'Necesario: al menos 9')
    }

    // Fallback: try to find any phone number pattern in the QR data
    // Look for 9-11 digit numbers (excluding very short numbers like IDs)
    const phonePattern = /\b\d{9,11}\b/g
    const matches = qrData.match(phonePattern)
    
    if (matches && matches.length > 0) {
      // Filter out numbers that are too short or look like IDs
      const validPhones = matches.filter(m => {
        const num = m.trim()
        return /^\d{9,11}$/.test(num) && !/^\d{4,6}$/.test(num)
      })
      
      if (validPhones.length > 0) {
        // If multiple numbers found, prefer the second one (usually the recipient)
        // First is usually the sender
        const recipientPhone = validPhones.length > 1 ? validPhones[1] : validPhones[0]
        console.log('Número extraído (fallback):', recipientPhone)
        // Convert to WhatsApp format before returning
        const whatsappFormat = convertToWhatsAppFormat(recipientPhone)
        console.log('Número convertido a formato WhatsApp (fallback):', whatsappFormat)
        return whatsappFormat
      }
    }

    return null
  }

  const handleAddPhone = async () => {
    if (!currentPhone.trim()) return

    // Convert to WhatsApp format first
    const whatsappNumber = convertToWhatsAppFormat(currentPhone)
    
    if (!whatsappNumber) {
      showAlert('Número inválido', 'Por favor ingresa un número de teléfono válido', 'error')
      return
    }

    const validation = validatePhoneNumber(whatsappNumber)
    if (!validation.valid) {
      showAlert('Número inválido', validation.error, 'error')
      return
    }

    // Check if already in temporary list (compare WhatsApp format numbers)
    if (phoneNumbers.some(p => p.number === whatsappNumber)) {
      showAlert('Número duplicado', 'Este número ya está en la lista', 'warning')
      return
    }

    // Check for daily duplicate (use WhatsApp format)
    const isDuplicate = await checkDuplicate(whatsappNumber)
    if (isDuplicate) {
      showAlert('Mensaje ya enviado', `El número ${whatsappNumber} ya tiene un mensaje de ${messageTypeInfo[type].label} enviado hoy.`, 'warning')
      return
    }

    setPhoneNumbers([...phoneNumbers, {
      id: Date.now(),
      number: whatsappNumber, // Store in WhatsApp format (+58XXXXXXXXXX)
      status: 'pending'
    }])
    setCurrentPhone('')
  }

  const handleRemovePhone = (id) => {
    setPhoneNumbers(phoneNumbers.filter(p => p.id !== id))
  }

  const startQRScanner = () => {
    setShowQRScanner(true)
  }

  const handleQRScanSuccess = async (decodedText) => {
    if (!decodedText || decodedText.trim() === '') {
      return
    }

    console.log('QR escaneado - Datos completos:', decodedText)

    // Close scanner
    setShowQRScanner(false)

    let phoneNumber = null

    // For "received" and "reminder" types, extract recipient phone from QR data
    if (type === 'received' || type === 'reminder') {
      phoneNumber = extractPhoneFromQR(decodedText)
      console.log('Tipo:', type, '- Número del destinatario extraído:', phoneNumber)
      
      if (!phoneNumber) {
        showAlert('QR inválido', 'No se pudo extraer el número del destinatario del código QR', 'error')
        return
      }
      // Number is already in WhatsApp format from extractPhoneFromQR
    } else if (type === 'return') {
      // For "return" type, extract sender phone from QR data
      phoneNumber = extractSenderPhoneFromQR(decodedText)
      console.log('Tipo:', type, '- Número del remitente extraído:', phoneNumber)
      
      if (!phoneNumber) {
        showAlert(
          'Remitente sin número telefónico', 
          'El remitente de este paquete no tiene número telefónico registrado en el código QR. Por favor, ingresa el número manualmente o contacta al remitente por otro medio.', 
          'warning'
        )
        return
      }
      // Number is already in WhatsApp format from extractSenderPhoneFromQR
    } else {
      // For other types (if any), use the QR data directly as phone number
      const rawPhone = decodedText.trim()
      console.log('Tipo:', type, '- Usando QR directamente:', rawPhone)
      // Convert to WhatsApp format
      phoneNumber = convertToWhatsAppFormat(rawPhone)
      console.log('Número convertido a formato WhatsApp:', phoneNumber)
      
      if (!phoneNumber) {
        showAlert('QR inválido', 'El código QR no contiene un número válido', 'error')
        return
      }
    }

    // Process scanned phone number (phoneNumber is already in WhatsApp format)
    // Remove + for validation but keep it for storage
    const validation = validatePhoneNumber(phoneNumber)
    if (!validation.valid) {
      showAlert('QR inválido', 'El código QR no contiene un número válido', 'error')
      return
    }

    console.log('Número validado (formato WhatsApp):', phoneNumber)

    // Check duplicate (use WhatsApp format number)
    const isDuplicate = await checkDuplicate(phoneNumber)
    if (isDuplicate) {
      showAlert('Mensaje ya enviado', `El número ${phoneNumber} ya tiene un mensaje de ${messageTypeInfo[type].label} enviado hoy.`, 'warning')
      return
    }

    // Check if already in list (compare WhatsApp format numbers)
    if (phoneNumbers.some(p => p.number === phoneNumber)) {
      showAlert('Número duplicado', 'Este número ya está en la lista', 'warning')
      return
    }

    // Add to list (store in WhatsApp format)
    const newPhone = {
      id: Date.now(),
      number: phoneNumber, // Store in WhatsApp format (+58XXXXXXXXXX)
      status: 'pending'
    }
    
    console.log('Agregando número a la lista (formato WhatsApp):', newPhone)
    setPhoneNumbers([...phoneNumbers, newPhone])
    console.log('Lista actualizada. Total de números:', phoneNumbers.length + 1)

    showAlert('QR escaneado', `Número ${phoneNumber} agregado exitosamente`, 'success')
  }

  const handleQRScanError = (error) => {
    console.error('Error en escáner QR:', error)
    let errorMessage = 'Error al acceder a la cámara'
    
    if (error.message?.includes('permission') || error.message?.includes('Permission denied')) {
      errorMessage = 'Permisos de cámara denegados. Por favor, permite el acceso a la cámara en la configuración de tu navegador.'
    } else if (error.message?.includes('camera') || error.message?.includes('No camera')) {
      errorMessage = 'No se encontró ninguna cámara disponible.'
    } else if (error.message?.includes('in use')) {
      errorMessage = 'La cámara está siendo usada por otra aplicación.'
    }
    
    showAlert('Error de cámara', errorMessage, 'error')
    setShowQRScanner(false)
  }

  const sendMessages = async () => {
    if (phoneNumbers.length === 0) {
      showAlert('Lista vacía', 'No hay números en la lista', 'warning')
      return
    }

    if (!customMessage.trim()) {
      showAlert('Mensaje vacío', 'El mensaje no puede estar vacío', 'warning')
      return
    }

    setSending(true)

    try {
      // Simulate sending via WhatsApp API
      // In production, this would call the Meta WhatsApp Business API
      const results = await Promise.all(
        phoneNumbers.map(async (phone) => {
          try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 500))

            // Here you would call the actual WhatsApp API
            // const response = await fetch('https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages', {
            //   method: 'POST',
            //   headers: {
            //     'Authorization': `Bearer ${import.meta.env.VITE_META_API_TOKEN}`,
            //     'Content-Type': 'application/json'
            //   },
            //   body: JSON.stringify({
            //     messaging_product: 'whatsapp',
            //     to: phone.number,
            //     type: 'text',
            //     text: { body: customMessage }
            //   })
            // })

            // Log to database
            const { error } = await supabase
              .from('sent_log')
              .insert([{
                user_id: profile.id,
                phone_number: phone.number,
                message_type: type,
                message_content: customMessage,
                status: 'sent',
                sent_date: new Date().toISOString().split('T')[0]
              }])

            if (error) throw error

            return { id: phone.id, success: true }
          } catch (error) {
            console.error(`Error sending to ${phone.number}:`, error)
            return { id: phone.id, success: false, error: error.message }
          }
        })
      )

      // Update status
      const updatedPhones = phoneNumbers.map(phone => {
        const result = results.find(r => r.id === phone.id)
        return {
          ...phone,
          status: result.success ? 'sent' : 'failed'
        }
      })

      setPhoneNumbers(updatedPhones)

      // Show success message
      const successCount = results.filter(r => r.success).length
      showAlert('Mensajes enviados', `${successCount} de ${phoneNumbers.length} mensajes enviados exitosamente`, 'success')

      // Clear list after a delay
      setTimeout(() => {
        setPhoneNumbers([])
      }, 2000)

    } catch (error) {
      console.error('Error sending messages:', error)
      showAlert('Error', 'Error al enviar los mensajes', 'error')
    } finally {
      setSending(false)
    }
  }

  const typeInfo = messageTypeInfo[type]
  if (!typeInfo) return null

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-display font-bold text-luxury-white mb-1">
            {typeInfo.label}
          </h1>
          <p className="text-sm text-gray-400">
            {typeInfo.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Input & List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Add Phone Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-luxury p-4"
            >
              <h2 className="text-base font-display font-semibold text-luxury-white mb-3">
                Agregar Números
              </h2>

              <div className="space-y-3">
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input
                      type="tel"
                      value={currentPhone}
                      onChange={(e) => setCurrentPhone(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddPhone()}
                      className="w-full pl-10 pr-3 py-2 bg-luxury-gray border border-luxury-lightGray rounded-lg text-luxury-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 text-sm"
                      placeholder="+1234567890"
                    />
                  </div>
                  <button
                    onClick={handleAddPhone}
                    className="btn-primary flex items-center space-x-1 px-3 py-2 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar</span>
                  </button>
                </div>

                <button
                  onClick={startQRScanner}
                  className="btn-secondary w-full flex items-center justify-center space-x-2 py-2 text-sm"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Escanear Código QR</span>
                </button>
              </div>
            </motion.div>

            {/* Phone Numbers List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card-luxury p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-display font-semibold text-luxury-white">
                  Lista de Envío ({phoneNumbers.length})
                </h2>
                {phoneNumbers.length > 0 && (
                  <button
                    onClick={() => setPhoneNumbers([])}
                    className="text-red-400 hover:text-red-300 text-xs flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpiar</span>
                  </button>
                )}
              </div>

              {phoneNumbers.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-sm">
                  No hay números en la lista
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  <AnimatePresence>
                    {phoneNumbers.map((phone) => (
                      <motion.div
                        key={phone.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center justify-between bg-luxury-gray rounded-lg p-3 border border-luxury-lightGray"
                      >
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-luxury-white font-medium text-sm">
                            {phone.number}
                          </span>
                          {phone.status === 'sent' && (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          )}
                          {phone.status === 'failed' && (
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                        {phone.status === 'pending' && (
                          <button
                            onClick={() => handleRemovePhone(phone.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {phoneNumbers.length > 0 && (
                <button
                  onClick={sendMessages}
                  disabled={sending}
                  className="btn-primary w-full mt-4 flex items-center justify-center space-x-2 py-2 text-sm"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Enviar Mensajes</span>
                    </>
                  )}
                </button>
              )}
            </motion.div>
          </div>

          {/* Right Column - Message Template */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card-luxury p-4"
            >
              <h2 className="text-base font-display font-semibold text-luxury-white mb-3">
                Mensaje
              </h2>

              {templates.length > 0 ? (
                <>
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Plantilla
                    </label>
                    <select
                      value={selectedTemplate?.id || ''}
                      onChange={(e) => {
                        const template = templates.find(t => t.id === e.target.value)
                        setSelectedTemplate(template)
                        setCustomMessage(template?.template_content || '')
                      }}
                      className="w-full px-3 py-2 bg-luxury-gray border border-luxury-lightGray rounded-lg text-luxury-white focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 text-sm"
                    >
                      {templates.map(template => (
                        <option key={template.id} value={template.id}>
                          {template.template_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Contenido
                    </label>
                    <textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      className="w-full px-3 py-2 bg-luxury-gray border border-luxury-lightGray rounded-lg text-luxury-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 text-sm min-h-32"
                      rows={6}
                    />
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-400 mb-3 text-sm">
                    No tienes plantillas para este tipo
                  </p>
                  <button
                    onClick={() => navigate('/templates')}
                    className="btn-primary text-sm py-2"
                  >
                    Crear Plantilla
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Custom Alert */}
      <CustomAlert
        isOpen={alert.isOpen}
        onClose={closeAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {showQRScanner && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 z-50"
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-luxury-darkGray rounded-xl border border-luxury-gray max-w-lg w-full p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-display font-bold text-luxury-white">
                    Escanear QR
                  </h2>
                  <button
                    onClick={() => setShowQRScanner(false)}
                    className="text-gray-400 hover:text-luxury-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <QRScanner
                  onScanSuccess={handleQRScanSuccess}
                  onError={handleQRScanError}
                  onClose={() => setShowQRScanner(false)}
                />

                <p className="text-gray-400 text-xs text-center mt-3">
                  Apunta la cámara al código QR con el número
                </p>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </Layout>
  )
}
