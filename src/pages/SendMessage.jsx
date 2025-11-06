import { useState, useEffect, useRef } from 'react'
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
import { Html5Qrcode } from 'html5-qrcode'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

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
  const [qrScanner, setQrScanner] = useState(null)
  const qrCodeRef = useRef(null)

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

  // Cleanup QR scanner
  useEffect(() => {
    return () => {
      if (qrScanner) {
        qrScanner.stop().catch(() => {})
      }
    }
  }, [qrScanner])

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

  const handleAddPhone = async () => {
    if (!currentPhone.trim()) return

    const validation = validatePhoneNumber(currentPhone)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    // Check if already in temporary list
    if (phoneNumbers.some(p => p.number === validation.cleaned)) {
      alert('Este número ya está en la lista')
      return
    }

    // Check for daily duplicate
    const isDuplicate = await checkDuplicate(validation.cleaned)
    if (isDuplicate) {
      alert(`⚠️ El número ${validation.cleaned} ya tiene un mensaje de ${messageTypeInfo[type].label} enviado hoy.`)
      return
    }

    setPhoneNumbers([...phoneNumbers, {
      id: Date.now(),
      number: validation.cleaned,
      status: 'pending'
    }])
    setCurrentPhone('')
  }

  const handleRemovePhone = (id) => {
    setPhoneNumbers(phoneNumbers.filter(p => p.id !== id))
  }

  const startQRScanner = async () => {
    try {
      setShowQRScanner(true)

      const scanner = new Html5Qrcode('qr-reader')
      setQrScanner(scanner)

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        async (decodedText) => {
          // Stop scanner
          await scanner.stop()
          setShowQRScanner(false)
          setQrScanner(null)

          // Process scanned phone number
          const validation = validatePhoneNumber(decodedText)
          if (!validation.valid) {
            alert('El código QR no contiene un número válido')
            return
          }

          // Check duplicate
          const isDuplicate = await checkDuplicate(validation.cleaned)
          if (isDuplicate) {
            alert(`⚠️ El número ${validation.cleaned} ya tiene un mensaje de ${messageTypeInfo[type].label} enviado hoy.`)
            return
          }

          // Check if already in list
          if (phoneNumbers.some(p => p.number === validation.cleaned)) {
            alert('Este número ya está en la lista')
            return
          }

          // Add to list
          setPhoneNumbers([...phoneNumbers, {
            id: Date.now(),
            number: validation.cleaned,
            status: 'pending'
          }])
        },
        (errorMessage) => {
          // Scan error (ignore)
        }
      )
    } catch (error) {
      console.error('Error starting QR scanner:', error)
      alert('No se pudo acceder a la cámara. Por favor, verifica los permisos.')
      setShowQRScanner(false)
    }
  }

  const stopQRScanner = async () => {
    if (qrScanner) {
      try {
        await qrScanner.stop()
      } catch (error) {
        console.error('Error stopping scanner:', error)
      }
    }
    setShowQRScanner(false)
    setQrScanner(null)
  }

  const sendMessages = async () => {
    if (phoneNumbers.length === 0) {
      alert('No hay números en la lista')
      return
    }

    if (!customMessage.trim()) {
      alert('El mensaje no puede estar vacío')
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
      alert(`✅ ${successCount} de ${phoneNumbers.length} mensajes enviados exitosamente`)

      // Clear list after a delay
      setTimeout(() => {
        setPhoneNumbers([])
      }, 2000)

    } catch (error) {
      console.error('Error sending messages:', error)
      alert('Error al enviar los mensajes')
    } finally {
      setSending(false)
    }
  }

  const typeInfo = messageTypeInfo[type]
  if (!typeInfo) return null

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-luxury-white mb-2">
            {typeInfo.label}
          </h1>
          <p className="text-gray-400">
            {typeInfo.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Input & List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Phone Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-luxury"
            >
              <h2 className="text-xl font-display font-semibold text-luxury-white mb-4">
                Agregar Números
              </h2>

              <div className="space-y-4">
                <div className="flex space-x-3">
                  <div className="relative flex-1">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                      type="text"
                      value={currentPhone}
                      onChange={(e) => setCurrentPhone(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddPhone()}
                      className="input-luxury pl-12"
                      placeholder="+1234567890"
                    />
                  </div>
                  <button
                    onClick={handleAddPhone}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Agregar</span>
                  </button>
                </div>

                <button
                  onClick={startQRScanner}
                  className="btn-secondary w-full flex items-center justify-center space-x-2"
                >
                  <QrCode className="w-5 h-5" />
                  <span>Escanear Código QR</span>
                </button>
              </div>
            </motion.div>

            {/* Phone Numbers List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card-luxury"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-semibold text-luxury-white">
                  Lista de Envío ({phoneNumbers.length})
                </h2>
                {phoneNumbers.length > 0 && (
                  <button
                    onClick={() => setPhoneNumbers([])}
                    className="text-red-400 hover:text-red-300 text-sm flex items-center space-x-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Limpiar Todo</span>
                  </button>
                )}
              </div>

              {phoneNumbers.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No hay números en la lista
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  <AnimatePresence>
                    {phoneNumbers.map((phone) => (
                      <motion.div
                        key={phone.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center justify-between bg-luxury-gray rounded-lg p-4 border border-luxury-lightGray"
                      >
                        <div className="flex items-center space-x-3">
                          <Phone className="w-5 h-5 text-gray-400" />
                          <span className="text-luxury-white font-medium">
                            {phone.number}
                          </span>
                          {phone.status === 'sent' && (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          )}
                          {phone.status === 'failed' && (
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                        {phone.status === 'pending' && (
                          <button
                            onClick={() => handleRemovePhone(phone.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-5 h-5" />
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
                  className="btn-primary w-full mt-6 flex items-center justify-center space-x-2"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Enviar Lote de Mensajes</span>
                    </>
                  )}
                </button>
              )}
            </motion.div>
          </div>

          {/* Right Column - Message Template */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card-luxury"
            >
              <h2 className="text-xl font-display font-semibold text-luxury-white mb-4">
                Plantilla de Mensaje
              </h2>

              {templates.length > 0 ? (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Seleccionar Plantilla
                    </label>
                    <select
                      value={selectedTemplate?.id || ''}
                      onChange={(e) => {
                        const template = templates.find(t => t.id === e.target.value)
                        setSelectedTemplate(template)
                        setCustomMessage(template?.template_content || '')
                      }}
                      className="input-luxury"
                    >
                      {templates.map(template => (
                        <option key={template.id} value={template.id}>
                          {template.template_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Mensaje
                    </label>
                    <textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      className="input-luxury min-h-32"
                      rows={8}
                    />
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">
                    No tienes plantillas para este tipo de mensaje
                  </p>
                  <button
                    onClick={() => navigate('/templates')}
                    className="btn-primary"
                  >
                    Crear Plantilla
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

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
                className="bg-luxury-darkGray rounded-xl border border-luxury-gray max-w-lg w-full p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-display font-bold text-luxury-white">
                    Escanear Código QR
                  </h2>
                  <button
                    onClick={stopQRScanner}
                    className="text-gray-400 hover:text-luxury-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div id="qr-reader" ref={qrCodeRef} className="w-full rounded-lg overflow-hidden"></div>

                <p className="text-gray-400 text-sm text-center mt-4">
                  Apunta la cámara al código QR que contiene el número de teléfono
                </p>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </Layout>
  )
}
