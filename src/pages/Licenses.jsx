import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Key, Save, X, Shield, RefreshCw, CheckCircle, XCircle, Clock, Calendar, AlertCircle } from 'lucide-react'
import { MdAddModerator } from "react-icons/md"
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'

const planTypes = [
  { value: 'basic', label: 'Básico', limit: 1000 },
  { value: 'pro', label: 'Pro', limit: 5000 },
  { value: 'enterprise', label: 'Enterprise', limit: 20000 }
]

export default function Licenses() {
  const [licenses, setLicenses] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showRenewModal, setShowRenewModal] = useState(false)
  const [renewingLicense, setRenewingLicense] = useState(null)
  const [renewFormData, setRenewFormData] = useState({
    valid_until: ''
  })
  const [editingLicense, setEditingLicense] = useState(null)
  const [formData, setFormData] = useState({
    license_key: '',
    user_id: '',
    plan_type: 'basic',
    message_limit: 1000,
    valid_until: ''
  })

  useEffect(() => {
    fetchLicenses()
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [editingLicense]) // Re-fetch usuarios cuando cambia editingLicense

  const fetchLicenses = async () => {
    try {
      const { data, error } = await supabase
        .from('licenses')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Cargar perfiles manualmente
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(l => l.user_id))]
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', userIds)

        const licensesWithProfiles = data.map(license => ({
          ...license,
          profiles: profiles?.find(p => p.id === license.user_id) || null
        }))

        setLicenses(licensesWithProfiles)
      } else {
        setLicenses([])
      }
    } catch (error) {
      console.error('Error fetching licenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      // Obtener todos los usuarios
      const { data: allUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('full_name')

      if (usersError) throw usersError

      // Si estamos editando una licencia, mostrar todos los usuarios
      // Si estamos creando una nueva, filtrar usuarios que ya tienen licencia activa
      if (!editingLicense) {
        // Obtener usuarios con licencias activas y válidas
        const { data: activeLicenses, error: licensesError } = await supabase
          .from('licenses')
          .select('user_id')
          .eq('is_active', true)
          .gte('valid_until', new Date().toISOString())

        if (licensesError) {
          console.error('Error obteniendo licencias activas:', licensesError)
          // En caso de error, mostrar todos los usuarios
          setUsers(allUsers || [])
          return
        }

        // Filtrar usuarios que NO tienen licencia activa
        const usersWithLicenseIds = new Set(activeLicenses?.map(l => l.user_id) || [])
        const usersWithoutLicense = allUsers?.filter(user => !usersWithLicenseIds.has(user.id)) || []

        console.log('👥 Usuarios sin licencia activa:', usersWithoutLicense.length, 'de', allUsers?.length)
        setUsers(usersWithoutLicense)
      } else {
        // Al editar, mostrar todos los usuarios
        setUsers(allUsers || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
    }
  }

  const generateLicenseKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const segments = 4
    const segmentLength = 4
    let key = ''

    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < segmentLength; j++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      if (i < segments - 1) key += '-'
    }

    return key
  }

  const handleSave = async () => {
    try {
      // Validar campos requeridos
      if (!formData.license_key) {
        alert('Por favor ingresa una clave de licencia')
        return
      }
      if (!formData.user_id) {
        alert('Por favor selecciona un usuario')
        return
      }
      if (!formData.valid_until) {
        alert('Por favor selecciona una fecha de validez')
        return
      }

      if (editingLicense) {
        // Verificar si tiene configuración de WhatsApp completa
        const hasConfig = formData.whatsapp_access_token && formData.whatsapp_phone_number_id
        
        // Update existing license
        const { error } = await supabase
          .from('licenses')
          .update({
            user_id: formData.user_id,
            plan_type: formData.plan_type,
            message_limit: formData.message_limit,
            valid_until: formData.valid_until,
            whatsapp_access_token: formData.whatsapp_access_token || null,
            whatsapp_phone_number_id: formData.whatsapp_phone_number_id || null,
            whatsapp_business_account_id: formData.whatsapp_business_account_id || null,
            is_active: hasConfig // Solo activa si tiene configuración de WhatsApp
          })
          .eq('id', editingLicense.id)

        if (error) {
          console.error('Error updating license:', error)
          if (error.code === '23503') {
            alert('Error: El usuario seleccionado no existe. Por favor ejecuta el script SQL para corregir la base de datos.')
          } else {
            throw error
          }
          return
        }
      } else {
        // Verificar si tiene configuración de WhatsApp completa
        const hasConfig = formData.whatsapp_access_token && formData.whatsapp_phone_number_id
        
        // Create new license
        const { error } = await supabase
          .from('licenses')
          .insert([{
            license_key: formData.license_key,
            user_id: formData.user_id,
            plan_type: formData.plan_type,
            message_limit: formData.message_limit,
            valid_until: formData.valid_until,
            whatsapp_access_token: formData.whatsapp_access_token || null,
            whatsapp_phone_number_id: formData.whatsapp_phone_number_id || null,
            whatsapp_business_account_id: formData.whatsapp_business_account_id || null,
            is_active: hasConfig // Solo activa si tiene configuración de WhatsApp
          }])

        if (error) {
          console.error('Error creating license:', error)
          if (error.code === '23503') {
            alert('Error: El usuario seleccionado no existe. Por favor ejecuta el script SQL para corregir la base de datos.')
          } else if (error.code === '23505') {
            alert('Error: La clave de licencia ya existe')
          } else {
            throw error
          }
          return
        }
      }

      fetchLicenses()
      await fetchUsers() // Refrescar usuarios después de guardar
      handleCloseModal()
    } catch (error) {
      console.error('Error saving license:', error)
      alert('Error al guardar la licencia: ' + (error.message || 'Error desconocido'))
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta licencia?')) return

    try {
      const { error } = await supabase
        .from('licenses')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchLicenses()
      await fetchUsers() // Refrescar usuarios después de eliminar
    } catch (error) {
      console.error('Error deleting license:', error)
      alert('Error al eliminar la licencia')
    }
  }

  const handleEdit = (license) => {
    setEditingLicense(license)
    setFormData({
      license_key: license.license_key,
      user_id: license.user_id || '',
      plan_type: license.plan_type,
      message_limit: license.message_limit,
      valid_until: license.valid_until ? license.valid_until.split('T')[0] : '',
      whatsapp_access_token: license.whatsapp_access_token || '',
      whatsapp_phone_number_id: license.whatsapp_phone_number_id || '',
      whatsapp_business_account_id: license.whatsapp_business_account_id || ''
    })
    setShowModal(true)
  }

  const handleCloseModal = async () => {
    setShowModal(false)
    setEditingLicense(null)
    setFormData({
      license_key: '',
      user_id: '',
      plan_type: 'basic',
      message_limit: 1000,
      valid_until: '',
      whatsapp_access_token: '',
      whatsapp_phone_number_id: '',
      whatsapp_business_account_id: ''
    })
    // Refrescar usuarios cuando se cierra el modal
    await fetchUsers()
  }

  // Función para agregar meses a la fecha actual
  const addMonthsToDate = (months) => {
    const date = new Date()
    date.setMonth(date.getMonth() + months)
    return date.toISOString().split('T')[0]
  }

  const setQuickDate = (months) => {
    const date = addMonthsToDate(months)
    setFormData({ ...formData, valid_until: date })
  }

  const handleNewLicense = async () => {
    setEditingLicense(null) // Asegurar que no estamos editando
    setFormData({
      license_key: generateLicenseKey(),
      user_id: '',
      plan_type: 'basic',
      message_limit: 1000,
      valid_until: '',
      whatsapp_access_token: '',
      whatsapp_phone_number_id: '',
      whatsapp_business_account_id: ''
    })
    // Refrescar usuarios para mostrar solo los que no tienen licencia
    await fetchUsers()
    setShowModal(true)
  }

  const getPlanColor = (plan) => {
    const colors = {
      basic: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      pro: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      enterprise: 'bg-luxury-gold/20 text-luxury-gold border-luxury-gold/30'
    }
    return colors[plan] || colors.basic
  }

  // Función para calcular días restantes
  const getDaysRemaining = (validUntil) => {
    if (!validUntil) return null
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expiryDate = new Date(validUntil)
    expiryDate.setHours(0, 0, 0, 0)
    
    const diffTime = expiryDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  }

  // Función para obtener el estado real de la licencia
  const getLicenseStatus = (license) => {
    // Si no tiene configuración de WhatsApp, está pendiente
    if (!hasWhatsAppConfig(license)) {
      return { status: 'pending_api', label: 'PENDIENTE API', color: 'yellow', days: null }
    }

    if (!license.is_active) {
      return { status: 'inactive', label: 'INACTIVA', color: 'red', days: null }
    }

    const daysRemaining = getDaysRemaining(license.valid_until)
    
    if (daysRemaining === null) {
      return { status: 'active', label: 'ACTIVA', color: 'green', days: null }
    }

    if (daysRemaining < 0) {
      return { status: 'expired', label: 'EXPIRADA', color: 'red', days: daysRemaining }
    }

    if (daysRemaining === 0) {
      return { status: 'expiring', label: 'EXPIRA HOY', color: 'yellow', days: 0 }
    }

    if (daysRemaining <= 7) {
      return { status: 'expiring', label: 'POR EXPIRAR', color: 'yellow', days: daysRemaining }
    }

    return { status: 'active', label: 'ACTIVA', color: 'green', days: daysRemaining }
  }

  // Función para verificar si la licencia tiene configuración completa de WhatsApp
  const hasWhatsAppConfig = (license) => {
    return !!(license.whatsapp_access_token && license.whatsapp_phone_number_id)
  }

  // Función para obtener el estado de configuración de WhatsApp
  const getWhatsAppStatus = (license) => {
    if (!hasWhatsAppConfig(license)) {
      return { status: 'pending', label: 'PENDIENTE API', color: 'yellow' }
    }
    return { status: 'configured', label: 'API CONFIGURADA', color: 'green' }
  }

  const handleRenew = (license) => {
    setRenewingLicense(license)
    setRenewFormData({
      valid_until: license.valid_until ? license.valid_until.split('T')[0] : ''
    })
    setShowRenewModal(true)
  }

  const handleRenewSave = async () => {
    if (!renewFormData.valid_until) {
      alert('Por favor selecciona una fecha de validez')
      return
    }

    try {
      const { error } = await supabase
        .from('licenses')
        .update({
          valid_until: renewFormData.valid_until,
          is_active: true
        })
        .eq('id', renewingLicense.id)

      if (error) throw error

      fetchLicenses()
      setShowRenewModal(false)
      setRenewingLicense(null)
      setRenewFormData({ valid_until: '' })
    } catch (error) {
      console.error('Error renewing license:', error)
      alert('Error al renovar la licencia: ' + (error.message || 'Error desconocido'))
    }
  }

  const handleCloseRenewModal = () => {
    setShowRenewModal(false)
    setRenewingLicense(null)
    setRenewFormData({ valid_until: '' })
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-luxury-white mb-0.5 tracking-tight">
              Gestión de Licencias
            </h1>
            <p className="text-xs text-gray-400">
              Administra las licencias del sistema y API tokens
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNewLicense}
            className="relative px-3.5 py-2 rounded-lg flex items-center gap-1.5 overflow-hidden group"
            style={{
              background: 'linear-gradient(135deg, #E4003B 0%, #C7003A 50%, #E4003B 100%)',
              backgroundSize: '200% 100%',
              boxShadow: '0 4px 20px rgba(228, 0, 59, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset, 0 1px 0 0 rgba(255, 255, 255, 0.2) inset',
            }}
          >
            {/* Efecto de brillo superior */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent opacity-50"></div>

            {/* Efecto shimmer animado */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{
                x: ['-100%', '200%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut"
              }}
            />

            {/* Resplandor hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-luxury-raspberryLight/0 via-luxury-raspberryLight/20 to-luxury-raspberryLight/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Contenido */}
            <div className="relative z-10 flex items-center gap-1.5">
              <MdAddModerator className="w-4 h-4 text-white" />
              <span className="text-xs font-bold text-white tracking-wide uppercase" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                Nueva Licencia
              </span>
            </div>
          </motion.button>
        </div>

        {/* Licenses Grid */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-gray-400">
              Cargando licencias...
            </div>
          ) : licenses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-luxury text-center py-12"
            >
              <Key className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No hay licencias
              </h3>
              <p className="text-gray-500 mb-6">
                Crea la primera licencia para comenzar
              </p>
              <button onClick={handleNewLicense} className="btn-primary">
                Crear Licencia
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {licenses.map((license, index) => (
                <motion.div
                  key={license.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card-luxury p-3 hover:shadow-glow-raspberry transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(51, 65, 85, 0.5) 100%)',
                    borderColor: license.is_active ? 'rgba(228, 0, 59, 0.3)' : 'rgba(100, 100, 100, 0.3)'
                  }}
                >
                  {/* Fila 1: License Key | Plan | Estado/Días */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <code className="text-[10px] font-mono font-bold text-luxury-raspberry truncate flex-1 min-w-0">
                        {license.license_key}
                      </code>
                      <span className={`inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold ${getPlanColor(license.plan_type)} whitespace-nowrap`}>
                        {planTypes.find(p => p.value === license.plan_type)?.label}
                      </span>
                      {(() => {
                        const licenseStatus = getLicenseStatus(license)
                        return (
                          <div className="flex items-center gap-1.5 whitespace-nowrap">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              licenseStatus.color === 'green'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : licenseStatus.color === 'yellow'
                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {licenseStatus.label}
                            </span>
                            {licenseStatus.days !== null && (
                              <span className={`text-[9px] font-semibold ${
                                licenseStatus.color === 'green'
                                  ? 'text-green-400'
                                  : licenseStatus.color === 'yellow'
                                  ? 'text-yellow-400'
                                  : 'text-red-400'
                              }`}>
                                {licenseStatus.days < 0 
                                  ? `${Math.abs(licenseStatus.days)}d vencidos`
                                  : licenseStatus.days === 0
                                  ? 'Hoy'
                                  : `${licenseStatus.days}d`
                                }
                              </span>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  </div>

                  {/* Fila 2: Usuario | Mensajes | Acciones */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {license.profiles ? (
                        <div>
                          <p className="text-xs font-semibold text-white truncate">{license.profiles.full_name}</p>
                          <p className="text-[9px] text-gray-400 truncate">{license.profiles.email}</p>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-500">Sin asignar</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Mensajes compacto */}
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 bg-gray-800 rounded-full h-1">
                          <div
                            className="h-1 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min((license.messages_used / license.message_limit) * 100, 100)}%`,
                              background: 'linear-gradient(90deg, #E4003B 0%, #FF1744 100%)'
                            }}
                          />
                        </div>
                        <span className="text-[9px] text-gray-400 font-medium whitespace-nowrap">
                          {license.messages_used.toLocaleString()}/{license.message_limit.toLocaleString()}
                        </span>
                      </div>
                      {/* Acciones */}
                      <div className="flex items-center gap-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRenew(license)}
                          className="p-1.5 rounded-lg transition-all duration-200"
                          style={{
                            background: 'rgba(251, 191, 36, 0.1)',
                            border: '1px solid rgba(251, 191, 36, 0.3)',
                            color: '#fbbf24'
                          }}
                          title="Renovar licencia"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(license)}
                          className="p-1.5 rounded-lg transition-all duration-200"
                          style={{
                            background: 'rgba(228, 0, 59, 0.1)',
                            border: '1px solid rgba(228, 0, 59, 0.3)',
                            color: '#E4003B'
                          }}
                        >
                          <Edit2 className="w-3 h-3" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(license.id)}
                          className="p-1.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-all duration-200"
                        >
                          <Trash2 className="w-3 h-3" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-black/70 z-50"
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-luxury-darkGray rounded-xl border border-luxury-gray max-w-2xl w-full p-6 my-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-heading font-bold text-luxury-white">
                    {editingLicense ? 'Editar Licencia' : 'Nueva Licencia'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-luxury-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* License Key */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Clave de Licencia
                    </label>
                    <input
                      type="text"
                      value={formData.license_key}
                      onChange={(e) => setFormData({ ...formData, license_key: e.target.value })}
                      className="input-luxury font-mono"
                      readOnly={!!editingLicense}
                    />
                  </div>

                  {/* User */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Asignar a Usuario <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.user_id}
                      onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                      className="input-luxury"
                      required
                    >
                      <option value="">Selecciona un usuario</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.full_name} - {user.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Plan Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tipo de Plan
                    </label>
                    <select
                      value={formData.plan_type}
                      onChange={(e) => {
                        const plan = planTypes.find(p => p.value === e.target.value)
                        setFormData({
                          ...formData,
                          plan_type: e.target.value,
                          message_limit: plan.limit
                        })
                      }}
                      className="input-luxury"
                    >
                      {planTypes.map(plan => (
                        <option key={plan.value} value={plan.value}>
                          {plan.label} - {plan.limit.toLocaleString()} mensajes
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message Limit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Límite de Mensajes
                    </label>
                    <input
                      type="number"
                      value={formData.message_limit}
                      onChange={(e) => setFormData({ ...formData, message_limit: parseInt(e.target.value) })}
                      className="input-luxury"
                    />
                  </div>

                  {/* Valid Until */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Válida Hasta <span className="text-red-400">*</span>
                    </label>
                    <div className="space-y-2">
                      {/* Botones rápidos */}
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setQuickDate(1)}
                          className="px-3 py-1.5 text-xs font-medium bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/30 rounded-lg hover:bg-luxury-gold/20 transition-colors"
                        >
                          1 Mes
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuickDate(3)}
                          className="px-3 py-1.5 text-xs font-medium bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/30 rounded-lg hover:bg-luxury-gold/20 transition-colors"
                        >
                          3 Meses
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuickDate(12)}
                          className="px-3 py-1.5 text-xs font-medium bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/30 rounded-lg hover:bg-luxury-gold/20 transition-colors"
                        >
                          1 Año
                        </button>
                      </div>
                      <input
                        type="date"
                        value={formData.valid_until}
                        onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                        className="input-luxury"
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  {/* Separador para WhatsApp API */}
                  <div className="border-t border-gray-700 pt-4 mt-4">
                    <h3 className="text-sm font-semibold text-luxury-white mb-3">
                      Configuración WhatsApp Business API
                    </h3>
                    <p className="text-xs text-gray-400 mb-4">
                      La licencia quedará en estado "Pendiente conexión API" hasta que se configuren estos datos. El usuario no podrá usar la app hasta que se complete la configuración.
                    </p>

                    {/* WhatsApp Access Token */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Access Token
                        <span className="text-gray-500 text-xs ml-1">(Opcional - se puede agregar después)</span>
                      </label>
                      <input
                        type="password"
                        value={formData.whatsapp_access_token}
                        onChange={(e) => setFormData({ ...formData, whatsapp_access_token: e.target.value })}
                        className="input-luxury font-mono text-sm"
                        placeholder="EAAxxxxxxxxxxxxx"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Token de acceso de Meta Business Suite → App → WhatsApp → API Setup
                      </p>
                    </div>

                    {/* WhatsApp Phone Number ID */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number ID
                        <span className="text-gray-500 text-xs ml-1">(Opcional - se puede agregar después)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.whatsapp_phone_number_id}
                        onChange={(e) => setFormData({ ...formData, whatsapp_phone_number_id: e.target.value })}
                        className="input-luxury font-mono text-sm"
                        placeholder="123456789012345"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        ID del número de teléfono en Meta Business Suite → WhatsApp → API Setup
                      </p>
                    </div>

                    {/* WhatsApp Business Account ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        WhatsApp Business Account ID (WABA ID)
                        <span className="text-gray-500 text-xs ml-1">(Opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.whatsapp_business_account_id}
                        onChange={(e) => setFormData({ ...formData, whatsapp_business_account_id: e.target.value })}
                        className="input-luxury font-mono text-sm"
                        placeholder="123456789012345"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        ID de la cuenta de negocio de WhatsApp (opcional pero recomendado)
                      </p>
                    </div>

                    {/* Estado de configuración */}
                    {formData.whatsapp_access_token && formData.whatsapp_phone_number_id ? (
                      <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <p className="text-xs text-green-400 font-medium">
                            Configuración completa. La licencia se activará automáticamente al guardar.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-yellow-400" />
                          <p className="text-xs text-yellow-400 font-medium">
                            Pendiente configuración API. La licencia quedará inactiva hasta completar Access Token y Phone Number ID.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button onClick={handleCloseModal} className="btn-ghost">
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!formData.license_key || !formData.user_id || !formData.valid_until}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-5 h-5" />
                    <span>{editingLicense ? 'Actualizar' : 'Crear'}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de Renovación */}
      <AnimatePresence>
        {showRenewModal && renewingLicense && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseRenewModal}
              className="fixed inset-0 bg-black/70 z-50"
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-luxury-darkGray rounded-xl border border-luxury-gray max-w-md w-full p-6 my-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-luxury-gold/10">
                      <RefreshCw className="w-6 h-6 text-luxury-gold" />
                    </div>
                    <h2 className="text-2xl font-heading font-bold text-luxury-white">
                      Renovar Licencia
                    </h2>
                  </div>
                  <button
                    onClick={handleCloseRenewModal}
                    className="text-gray-400 hover:text-luxury-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Información de la licencia */}
                <div className="mb-6 p-4 rounded-lg bg-luxury-gray/30 border border-luxury-lightGray/30">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Clave de Licencia</span>
                      <code className="text-xs font-mono font-bold text-luxury-raspberry">
                        {renewingLicense.license_key}
                      </code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Usuario</span>
                      <span className="text-sm font-semibold text-luxury-white">
                        {renewingLicense.profiles?.full_name || 'Sin asignar'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Fecha Actual</span>
                      <span className="text-sm text-gray-300">
                        {renewingLicense.valid_until 
                          ? new Date(renewingLicense.valid_until).toLocaleDateString('es-VE')
                          : 'Sin fecha'
                        }
                      </span>
                    </div>
                    {(() => {
                      const status = getLicenseStatus(renewingLicense)
                      return (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Estado</span>
                          <span className={`text-xs font-semibold ${
                            status.color === 'green' ? 'text-green-400' :
                            status.color === 'yellow' ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {status.label}
                            {status.days !== null && ` (${status.days < 0 ? Math.abs(status.days) + ' días vencidos' : status.days + ' días restantes'})`}
                          </span>
                        </div>
                      )
                    })()}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Valid Until */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nueva Fecha de Validez <span className="text-red-400">*</span>
                    </label>
                    <div className="space-y-2">
                      {/* Botones rápidos */}
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            const date = addMonthsToDate(1)
                            setRenewFormData({ ...renewFormData, valid_until: date })
                          }}
                          className="px-3 py-1.5 text-xs font-medium bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/30 rounded-lg hover:bg-luxury-gold/20 transition-colors"
                        >
                          1 Mes
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const date = addMonthsToDate(3)
                            setRenewFormData({ ...renewFormData, valid_until: date })
                          }}
                          className="px-3 py-1.5 text-xs font-medium bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/30 rounded-lg hover:bg-luxury-gold/20 transition-colors"
                        >
                          3 Meses
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const date = addMonthsToDate(12)
                            setRenewFormData({ ...renewFormData, valid_until: date })
                          }}
                          className="px-3 py-1.5 text-xs font-medium bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/30 rounded-lg hover:bg-luxury-gold/20 transition-colors"
                        >
                          1 Año
                        </button>
                      </div>
                      <input
                        type="date"
                        value={renewFormData.valid_until}
                        onChange={(e) => setRenewFormData({ ...renewFormData, valid_until: e.target.value })}
                        className="input-luxury"
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button onClick={handleCloseRenewModal} className="btn-ghost">
                    Cancelar
                  </button>
                  <button
                    onClick={handleRenewSave}
                    disabled={!renewFormData.valid_until}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>Renovar</span>
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </Layout>
  )
}
